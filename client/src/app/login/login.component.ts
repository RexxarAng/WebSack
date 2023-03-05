import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SignaturepadComponent } from '../signaturepad/signaturepad.component'
import { Buffer } from 'buffer';
import { createHash } from 'crypto-browserify';
import { eddsa, utils } from 'elliptic';
import { BN } from 'bn.js';
import { GotchaService } from '@websack/gotcha';
import * as crypto from 'crypto';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  @Output() closeModalEvent = new EventEmitter<void>();

  @ViewChild('signatureModal') signatureModal!: ElementRef;
  

  loginError = false;
  signInData: any = {};
  signatureDataUrl: string = "";
  imgVfierHash: string = "";
  imgKey: string = "";

  constructor(
    private router: Router,
    private authService: AuthService,
    private modalService: NgbModal,
    private gService: GotchaService
  ) {}

  showSignatureModal(event: Event) {
    event.preventDefault();
    this.modalService.open(this.signatureModal);
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  handleGotchaData(gotchaData: any) {
    this.signatureDataUrl = gotchaData.dataUrl;
    this.imgVfierHash = gotchaData.imgVfier;
    this.imgKey = gotchaData.imgKey;
    // do something with the dataURL, such as sending it to the backend
  }

  

  // onSubmit(form: NgForm) {
  //   if (form.valid) {
  //     this.loginError = false
  //     console.log(this.signInData);
  //     let signInCredentials = {
  //       username: this.signInData.username,
  //       password: this.signInData.password,
  //       dataUrl: this.signatureDataUrl,
  //       imgVerifier: this.imgVfierHash
  //     }

  //     this.authService.authenticate(signInCredentials).subscribe((data: any) => {
  //         if (!data.success) {
  //           this.loginError = true;
  //         } else {
  //           this.loginError = false;
  //           this.authService.storeUserToken(data.token, data.user);
  //           console.log(this.authService.tokenGetter());
  //           this.router.navigate(['/profile']);
  //         }
  //     });
  //   }
  // }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.loginError = false

      // Gotcha
      const uKey = this.gService.uKeyPrep(this.imgKey)
      var eImgVfier = "";
      let findUsername = { username: this.signInData.username, }
      this.authService.verifyUserImg(findUsername).subscribe((response: any) => {
        if (!response.success || !(this.gService.vHashVerify(response.vImgVerifier,this.imgVfierHash, uKey))) {
          this.loginError = true;
        } else {
          eImgVfier = response.vImgVerifier;

          // ##START OF aPAKE!!##
          console.log(this.signInData);
          let signInCredentials = {
            username: this.signInData.username,
            dataUrl: this.signatureDataUrl,
            imgVerifier: eImgVfier
          }
          this.authService.startAuthenticate(signInCredentials).subscribe((response: any) => {
            console.log(response);
            if (!response.success) {
              this.loginError = true;
            } else {
              const curve = new eddsa('ed25519');
              const hashedPassword = createHash('sha256').update(this.signInData.password).digest();
              const hashedPasswordBuffer = Buffer.from(hashedPassword);
              const oprfKeyBuffer = Buffer.from(response.oprfKey, 'hex');
              const passwordPoint = curve.curve.pointFromX(hashedPasswordBuffer, true);
              const scalar = new BN(oprfKeyBuffer);
              const oprfOutput = passwordPoint.mul(scalar).encode('hex', false);
              console.log(`oprfOutput: ${oprfOutput}`);
              

              //generate key from oprfoutput
              const keyLegnth = 32; //256 bits
              const salt = Buffer.from('my-salt');
              const iterations = 10000;
              const hashAlgorithm = 'sha256';
              const KeyBuffer = crypto.pbkdf2Sync(oprfOutput,salt, iterations,keyLegnth,hashAlgorithm);
              //key.toString('hex');
              const key = Buffer.from(KeyBuffer.toString('hex'),'hex')

              //private public key gen for user (registration for a service)
              const keyPair = curve.keyFromSecret(crypto.randomBytes(16));
              const privateUKey = keyPair.getSecret('hex');
              const publicUKey = keyPair.getPublic('hex');
              

              //256bit private key size, 512 bit public key size
              //total if using the same curve will lead to an 768 bit concat or 96 hex length 
              //hexa sizes PrivUkey = 32 hexa  + PubSKey = 64 hexa need to split them in decode
              //check for lulz

              //considered as registration start?
              //encrypt from key generated before
              //have to code SKey with reponse ... reasons unknown
              const plaintext = privateUKey + response.publicSKey; //input Public Key of server + private key of user here 
              //const plaintext = '';
              const iv = crypto.randomBytes(12); // do i need to store this hmmmmmmmmmmm probably yes so send to server?
              const cipher = crypto.createCipheriv('aes-256-gcm',key,iv);
              let ciphertext = cipher.update(plaintext,'utf8');
              ciphertext = Buffer.concat([ciphertext,cipher.final()]);
              const tag = cipher.getAuthTag(); // what is the auth tag used for? need to send this back to user so probably need to store hmm interesting
              //Auth = Galios MAC == based off ciphertext, iv , and any other authenticated data included


              //toServer and back to client: Ciphertext + IV + Auth + public key

              //reverse for login process put here first lel
              const decipher = crypto.createDecipheriv('aes-256-gcm',key,iv);
              decipher.setAuthTag(tag);
              let decrypted = decipher.update(ciphertext);
              decrypted = Buffer.concat([decrypted, decipher.final()]);
              console.log(`Decrypted plaintext: ${decrypted.toString('utf8')}`);
              const dPlainText = decrypted.toString('utf8');

              //probably should not do here but so be it it essentially is the same as above just put here so can run and check 1st
              const PrivUkey = dPlainText.substring(0,31);
              const PubSKey = dPlainText.substring(31);
              

              //from here on AKE? How and what and why lel GLHF next 

              let credentials = {
                username: this.signInData.username,
                passwordVerifier: oprfOutput, // can dont send cuz server dont need to know this
                dataUrl: this.signatureDataUrl,
                imgVerifier: eImgVfier
              }

              this.authService.authenticateUser(credentials).subscribe((data: any) => {
                if (data.success) {
                  this.loginError = false;
                  this.authService.storeUserToken(data.token, data.user);
                  console.log(this.authService.tokenGetter());
                  this.router.navigate(['/profile']);
                } else {
                  this.loginError = true;
                }
              });
              
            }
          });
        }
      });

      
    }
  }


}
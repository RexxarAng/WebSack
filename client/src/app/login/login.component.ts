import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SignaturepadComponent } from '../signaturepad/signaturepad.component'
import * as opaque from '../opaque/opaque';
// import * as opaque from '../opaque/opaque-obfuscated.js';

import { GotchaService } from '@websack/gotcha';

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

  // onSubmit(form: NgForm) {
  //   if (form.valid) {
  //     this.loginError = false
  //     console.log(this.signInData);
  //     let signInCredentials = {
  //       username: this.signInData.username,
  //       dataUrl: this.signatureDataUrl,
  //       imgVerifier: this.imgVfierHash
  //     }

  //     this.authService.startAuthenticate(signInCredentials).subscribe((response: any) => {
  //       console.log(response);
  //       if (!response.success) {
  //         this.loginError = true;
  //       } else {
  //         const curve = new eddsa('ed25519');
  //         const hashedPassword = createHash('sha256').update(this.signInData.password).digest();
  //         const hashedPasswordBuffer = Buffer.from(hashedPassword);
  //         const oprfKeyBuffer = Buffer.from(response.oprfKey, 'hex');
  //         const passwordPoint = curve.curve.pointFromX(hashedPasswordBuffer, true);
  //         const scalar = new BN(oprfKeyBuffer);
  //         const oprfOutput = passwordPoint.mul(scalar).encode('hex', false);
  //         console.log(`oprfOutput: ${oprfOutput}`);
  //         let credentials = {
  //           username: this.signInData.username,
  //           passwordVerifier: oprfOutput,
  //           dataUrl: this.signatureDataUrl,
  //           imgVerifier: this.imgVfierHash
  //         }
  //         this.authService.authenticateUser(credentials).subscribe((data: any) => {
  //           if (data.success) {
  //             this.loginError = false;
  //             this.authService.storeUserToken(data.token, data.user);
  //             console.log(this.authService.tokenGetter());
  //             this.router.navigate(['/profile']);
  //           } else {
  //             this.loginError = true;
  //           }
  //         });
          
  //       }
  //     });
  //   }
  // }

  async onSubmit(form: NgForm) {
    if (form.valid) {
       // Gotcha
      this.loginError = false;
      const uKey = this.gService.uKeyPrep(this.imgKey)
      var eImgVfier = "";
      let findUsername = { username: this.signInData.username }
      try {
        const response: any = await this.authService.verifyUserImg(findUsername).toPromise();
        if (!response.success || !(this.gService.vHashVerify(response.vImgVerifier,this.imgVfierHash, uKey))) {
          this.loginError = true;
        } else {
          eImgVfier = response.vImgVerifier;
        }
      } catch (error) {
        this.loginError = true;
        console.log(error);
      }
      let signInCredentials = {
        username: this.signInData.username,
        dataUrl: this.signatureDataUrl,
        imgVerifier: eImgVfier
      }
      try {
        const response: any = await this.authService.startAuthenticate(signInCredentials).toPromise();
        console.log(response);
        if (!response.success) {
          this.loginError = true;
        } else {
          const encryptedData = await opaque.handleAuthentication(this.signInData.password, response.oprfKey, response.encryptedEnvelope, response.authTag, this.imgVfierHash);
          // const rwdKey = opaque.oprfOutput(this.signInData.password, response.oprfKey)
          // console.log(`rwdKey: ${rwdKey}`)
          // console.log(`EncryptedEnvelope: ${response.encryptedEnvelope}`);
          // const envelope = opaque.decryptEnvelope(response.encryptedEnvelope, response.authTag, rwdKey);
          // console.log(`Envelope: ${envelope.serverPublicKey}`);
          // const currentTime = new Date().toISOString();
          // console.log(currentTime);
          // const signedTimeObject = await opaque.signData(currentTime, envelope.clientPrivateKey);
          // console.log(signedTimeObject);
          // const encryptedData = await opaque.encryptData(JSON.stringify(signedTimeObject), envelope.serverPublicKey);
          // console.log(`rwdKey: ${rwdKey}`);
          // console.log(`encryptedData: ${encryptedData}`);
  
          let credentials = {
            username: this.signInData.username,
            answer: encryptedData,
            dataUrl: this.signatureDataUrl,
            imgVerifier: eImgVfier
          }
          const data: any = await this.authService.authenticateUser(credentials).toPromise();
          if (data.success) {
            this.loginError = false;
            this.authService.storeUserToken(data.token, data.user);
            console.log(this.authService.tokenGetter());
            this.router.navigate(['/profile']);
          } else {
            this.loginError = true;
          }
        }
      } catch (error) {
        this.loginError = true;
      }
    }
  }
}
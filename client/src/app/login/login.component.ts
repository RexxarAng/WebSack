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

  constructor(
    private router: Router,
    private authService: AuthService,
    private modalService: NgbModal,
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
      console.log(this.signInData);
      let signInCredentials = {
        username: this.signInData.username,
        dataUrl: this.signatureDataUrl,
        imgVerifier: this.imgVfierHash
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
          let credentials = {
            username: this.signInData.username,
            passwordVerifier: oprfOutput,
            dataUrl: this.signatureDataUrl,
            imgVerifier: this.imgVfierHash
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
  }


}
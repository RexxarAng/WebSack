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

  async onSubmit(form: NgForm) {
    if (form.valid) {
      this.loginError = false;

      let signInCredentials = {
        username: this.signInData.username,
      }
      try {
        const response: any = await this.authService.startAuthenticate(signInCredentials).toPromise();
        console.log(response);
        if (!response.success) {
          this.loginError = true;
        } else {
          const encryptedData = await opaque.handleAuthentication(this.signInData.password, response.oprfKey, response.encryptedEnvelope, response.authTag, response.salt);
          let credentials = {
            username: this.signInData.username,
            answer: encryptedData
          }
          const data: any = await this.authService.authenticateUser(credentials).toPromise();
          console.log(data);
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
        console.log(error);
        this.loginError = true;
      }
    }
  }
}
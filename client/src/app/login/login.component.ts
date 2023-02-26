import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SignaturepadComponent } from '../signaturepad/signaturepad.component'

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
  ) {}

  showSignatureModal(event: Event) {
    event.preventDefault();
    this.modalService.open(this.signatureModal);
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  handleSignatureDataUrl(dataUrl: string) {
    this.signatureDataUrl = dataUrl;
    console.log(this.signatureDataUrl); // log the dataURL in the console
    // do something with the dataURL, such as sending it to the backend
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.loginError = false
      console.log(this.signInData);
      let signInCredentials = {
        username: this.signInData.username,
        password: this.signInData.password,
        dataUrl: this.signatureDataUrl
      }

      this.authService.authenticateUser(signInCredentials).subscribe((data: any) => {
          if (!data.success) {
            this.loginError = true;
          } else {
            this.loginError = false;
            this.authService.storeUserToken(data.token, data.user);
            console.log(this.authService.tokenGetter());
            this.router.navigate(['/profile']);
          }
      });
    }
  }
}
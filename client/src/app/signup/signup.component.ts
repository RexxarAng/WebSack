import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms'
import { UserService } from '../services/user.service'
import { Router } from '@angular/router'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { GotchaComponent } from '@websack/gotcha';
import { SignaturepadComponent } from '../signaturepad/signaturepad.component'

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  @Output() closeModalEvent = new EventEmitter<void>();

  @ViewChild('signupSuccessModal') signupSuccessModal!: ElementRef;
  @ViewChild('signupFailureModal') signupFailureModal!: ElementRef;
  @ViewChild('signatureModal') signatureModal!: ElementRef;


  constructor(
    private userService: UserService, 
    private router: Router,
    private modalService: NgbModal,
  ) {  }

  showSignaturePad = true;
  signatureDataUrl: string = "";

  formData: any = {};
  isNameValid: boolean = true;
  isEmailValid: boolean = true;
  isPasswordValid: boolean = true;
  message: string = "";

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
      console.log(this.formData);
      var userData = {
        username: this.formData.username,
        email: this.formData.email,
        password: this.formData.password,
        dataUrl: this.signatureDataUrl
      };
      this.userService.signUp(userData)
      .subscribe((response: any) => {
        console.log(response)
        if (response.success) {
          this.modalService.open(this.signupSuccessModal);
          setTimeout(() => {
            this.modalService.dismissAll();
            this.router.navigate(['login']);
          }, 5000);  //5s
        } else {
          this.message = response.msg;
          this.modalService.open(this.signupFailureModal);
        }
      });
    }
  }


}
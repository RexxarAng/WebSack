import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms'
import { AuthService } from '../services/auth.service'
import { Router } from '@angular/router'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SignaturepadComponent } from '../signaturepad/signaturepad.component';
import { saveAs } from 'file-saver';
import { GotchaService } from '@websack/gotcha';
import { UserService } from '../services/user.service';
import * as opaque from '../opaque/opaque';
// import * as opaque from '../opaque/opaque.js';

global.Buffer = Buffer;

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
    private authService: AuthService, 
    private router: Router,
    private modalService: NgbModal,
    private gService: GotchaService,
    private userService: UserService
  ) {  }

  showSignaturePad = true;
  signatureDataUrl: string = "";
  imgVfierHash: string = "";
  imgKey: string = "";

  formData: any = {};
  isNameValid: boolean = true;
  isEmailValid: boolean = true;
  isPasswordValid: boolean = true;
  message: string = "";
  downloaded: boolean = false;

  publicKey!: CryptoKey;
  privateKey!: CryptoKey;
  pemString: string = "";
  clientProof: string = "";
  serverProof: string = "";
  
  showSignatureModal(event: Event) {
    event.preventDefault();
    this.modalService.open(this.signatureModal);
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  handleGatchaData(gotchaData: any) {
    this.signatureDataUrl = gotchaData.dataUrl;
    this.imgVfierHash = gotchaData.imgVfier;
    this.imgKey = gotchaData.imgKey;
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      
      var identifier = {
        username: this.formData.username,
        email: this.formData.email
      }
      // Get OPRF Key
      this.authService.startSignup(identifier).subscribe((response: any) => {
        console.log(response);
        if(response.success) {
          try {
            const output = opaque.generateEncryptedEnvelopeAndKeyPair(this.formData.password, response.oprfKey, response.serverPublicKey, response.salt);
             // Send the registration data to the server
            var userData = {
              username: this.formData.username,
              email: this.formData.email,
              encryptedEnvelope: output.encryptedEnvelope,
              authTag: output.authTag,
              clientPublicKey: output.clientPublicKey
            };
            this.authService.completeSignup(userData)
            .subscribe((response: any) => {
              console.log(response)
              if (response.success) {
                this.serverProof = response.serverProof;
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
          } catch(err) {
            this.message = "Invalid password. Please try another password";
            this.modalService.open(this.signupFailureModal);
          }
        } else {
          this.message = response.msg;
          this.modalService.open(this.signupFailureModal);
        }
      });
     
    }
  }
}
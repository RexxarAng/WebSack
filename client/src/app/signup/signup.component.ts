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
    // do something with the dataURL, such as sending it to the backend
  }

  // onSubmit(form: NgForm) {
  //   if (form.valid) {
  //       // Send the registration data to the server
  //       var userData = {
  //         username: this.formData.username,
  //         email: this.formData.email,
  //         password: this.formData.password,
  //         dataUrl: this.signatureDataUrl
  //       };
  //       this.authService.signup(userData)
  //       .subscribe((response: any) => {
  //         console.log(response)
  //         if (response.success) {
  //           this.modalService.open(this.signupSuccessModal);
  //           setTimeout(() => {
  //             this.modalService.dismissAll();
  //             this.router.navigate(['login']);
  //           }, 5000);  //5s
  //         } else {
  //           this.message = response.msg;
  //           this.modalService.open(this.signupFailureModal);
  //         }
  //       });
  //   }
  // }

  // onSubmit(form: NgForm) {
  //   if (form.valid) {
  //     // const uKey = this.gService.uKeyPrep(this.imgKey);
  //     // const eImgVfier = this.gService.vHashEncrypt(this.formData.imgVfierHash ,uKey);
  //     // console.log("encImgVfier:"+eImgVfier);
  //     var username = {
  //       username: this.formData.username
  //     }
  //     // Get OPRF Key
  //     this.authService.startSignup(username).subscribe((response: any) => {
  //       console.log(response);
  //       if(response.success) {
  //         const oprfOutput = opaque.oprfOutput(this.formData.password, response.oprfKey);
  //         console.log(`oprfOutput: ${oprfOutput}`);
  //         // Send the registration data to the server
  //         var userData = {
  //           username: this.formData.username,
  //           email: this.formData.email,
  //           oprfOutput: oprfOutput,
  //           dataUrl: this.signatureDataUrl,
  //           imgVerifier: this.imgVfierHash,
  //           oprfKey: response.oprfKey
  //         };
  //         this.authService.completeSignup(userData)
  //         .subscribe((response: any) => {
  //           console.log(response)
  //           if (response.success) {
  //             this.serverProof = response.serverProof;
  //             this.modalService.open(this.signupSuccessModal);
  //             setTimeout(() => {
  //               this.modalService.dismissAll();
  //               this.router.navigate(['login']);
  //             }, 5000);  //5s
  //           } else {
  //             this.message = response.msg;
  //             this.modalService.open(this.signupFailureModal);
  //           }
  //         });
  //       }
  //     });
     
  //   }
  // }


  onSubmit(form: NgForm) {
    if (form.valid) {
      const uKey = this.gService.uKeyPrep(this.imgKey);
      // const eImgVfier = this.gService.vHashEncrypt(this.imgVfierHash ,uKey, this.formData.password);
      const eImgVfier = this.gService.veHashEncrypt(this.imgVfierHash ,uKey);
      
      var username = {
        username: this.formData.username
      }
      // Get OPRF Key
      this.authService.startSignup(username).subscribe((response: any) => {
        console.log(response);
        if(response.success) {
          const rwdKey = opaque.oprfOutput(this.formData.password, response.oprfKey);
          const keyPair = opaque.generateKeyPair();
          const envelope = {
            clientPrivateKey: keyPair.privateKey,
            serverPublicKey: response.serverPublicKey,
          }
          const encryptedOutput = opaque.encryptWithRWDKey(envelope, rwdKey);
          console.log(`encryptedEnvelope: ${encryptedOutput.encryptedEnvelope}`);

          console.log(`rwdKey: ${rwdKey}`);

          const decryptEnvelope = opaque.decryptEnvelope(encryptedOutput.encryptedEnvelope, encryptedOutput.authTag, rwdKey);
          console.log(`envelope: ${decryptEnvelope}`);
          // Send the registration data to the server
          var userData = {
            username: this.formData.username,
            email: this.formData.email,
            encryptedEnvelope: encryptedOutput.encryptedEnvelope,
            authTag: encryptedOutput.authTag,
            clientPublicKey: keyPair.publicKey,
            dataUrl: this.signatureDataUrl,
            imgVerifier: eImgVfier,
            oprfKey: response.oprfKey
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
        }
      });
     
    }
  }
}
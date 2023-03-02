import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms'
import { UserService } from '../services/user.service'
import { Router } from '@angular/router'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { GotchaComponent } from '@websack/gotcha';
import { SignaturepadComponent } from '../signaturepad/signaturepad.component'
import { saveAs } from 'file-saver';
import { Buffer } from 'buffer';

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
  downloaded: boolean = false;

  publicKey!: CryptoKey;
  privateKey!: CryptoKey;
  pemString: string = "";
  clientProof: string = "";
  serverProof: string = "";


  // Convert an ArrayBuffer to a Base64-encoded string
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  generateAndDownloadPrivateKey(event: Event) {
    event.preventDefault();
    window.crypto.subtle.generateKey(
      {
        name: 'RSA-PSS',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: 'SHA-256'
      },
      true,
      ['sign', 'verify']
    )
    .then(keyPair => {
      this.publicKey = keyPair.publicKey;
      this.privateKey = keyPair.privateKey;
      // Export the private key as a PEM-encoded string
      window.crypto.subtle.exportKey('pkcs8', this.privateKey)
        .then(keyData => {
          const pem = this.arrayBufferToBase64(keyData);
          this.pemString = `-----BEGIN PRIVATE KEY-----\n${pem}\n-----END PRIVATE KEY-----\n`;

          // Create a blob with the PEM-encoded private key
          const blob = new Blob([this.pemString], { type: 'text/plain' });
      
          // Save the private key as a file
          saveAs(blob, 'private_key.pem');
          this.downloaded = true;
        });
    });
  }

  
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

  // onSubmit(form: NgForm) {
  //   if (form.valid) {
  //       // Send the registration data to the server
  //       var userData = {
  //         username: this.formData.username,
  //         email: this.formData.email,
  //         password: this.formData.password,
  //         dataUrl: this.signatureDataUrl
  //       };
  //       this.userService.signUp(userData)
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

  onSubmit(form: NgForm) {
    if (form.valid) {
      // Compute the client proof
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const passwordBuffer = new TextEncoder().encode(this.formData.password);
      const saltAndPassword = new Uint8Array(salt.length + passwordBuffer.length);
      saltAndPassword.set(salt);
      saltAndPassword.set(passwordBuffer, salt.length);
      crypto.subtle.digest('SHA-256', saltAndPassword).then(hashedPassword => {
        const rsaParams = {
          name: "RSA-PSS",
          saltLength: salt.length,
        };
        window.crypto.subtle.sign(rsaParams, this.privateKey, hashedPassword)
          .then(signature => {
            this.clientProof = this.arrayBufferToBase64(signature);
            console.log(this.clientProof);
            console.log(`Username: ${this.formData.username}`);
            console.log(`Salt: ${this.arrayBufferToBase64(salt)}`);
            console.log(`Client proof: ${this.clientProof}`);
          });
        // Send the registration data to the server
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

      });
    }
  }
}
import { Component, ElementRef, ViewChild, Output, EventEmitter,} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as opaque from '../opaque/opaque';
// import * as opaque from '../opaque/opaque-obfuscated.js';

import { GotchaService } from '@websack/gotcha';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css'],
})
export class ResetComponent {
  @Output() closeModalEvent = new EventEmitter<void>();

  @ViewChild('signatureModal') signatureModal!: ElementRef;

  resetError = false;
  resetData: any = {};
  signatureDataUrl: string = '';
  imgVfierHash: string = '';
  imgKey: string = '';

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
  }

  async onSubmit(form: NgForm) {
    if (form.valid) {
       // Gotcha
      const uKey = this.gService.uKeyPrep(this.imgKey)
      var eImgVfier = "";
      let findUsername = { username: this.resetData.username }
      try {
        const response: any = await this.authService.verifyUserImg(findUsername).toPromise();
        if (!response.success || !(this.gService.vHashVerify(response.vImgVerifier,this.imgVfierHash, uKey))) {
          this.resetError = true;
        } else {
          eImgVfier = response.vImgVerifier;
          // Get email, send email reset link?
        }
      } catch (error) {
        this.resetError = true;
        console.log(error);
      }
    }
  }
}


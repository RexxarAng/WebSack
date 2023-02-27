import { Component, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import SignaturePad from 'signature_pad';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-signature-pad',
  templateUrl: `./gotcha.component.html`,
  styles: []
})
export class GotchaComponent implements AfterViewInit {
  @ViewChild('signaturePadCanvas', { static: true }) canvas!: ElementRef;
  @Output() signatureDataUrlEmitter = new EventEmitter<string>();
  @Output() ansKeyEmitter = new EventEmitter<string>();
  @Output() closeModalEvent = new EventEmitter<void>();

  gotchaData: any = {};
  signaturePad!: SignaturePad;
  signatureDataUrl: string = ""; 

  ngAfterViewInit() {
    if (this.canvas) {
      this.signaturePad = new SignaturePad(this.canvas.nativeElement);
    }
  }

  clearSignature(): void {
    this.signaturePad.clear();
  }

  saveSignature(): void {
    // Do something with the signature data, like send it to a server.
    this.signatureDataUrl = this.signaturePad.toDataURL(); // get the signature data URL
    this.signatureDataUrlEmitter.emit(this.signatureDataUrl); // emit the dataURL as an event
    this.closeModalEvent.emit();
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.signatureDataUrl = this.signaturePad.toDataURL(); // get the signature data URL
      this.signatureDataUrlEmitter.emit(this.signatureDataUrl); // emit the dataURL as an event
      this.ansKeyEmitter.emit(this.gotchaData.ansKey);
      this.closeModalEvent.emit();
    }
   
  }
}


import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import SignaturePad from 'signature_pad';


@Component({
  selector: 'app-signaturepad',
  templateUrl: './signaturepad.component.html',
  styleUrls: ['./signaturepad.component.css']
})
export class SignaturepadComponent {
  @ViewChild('signaturePadCanvas', { static: true }) canvas!: ElementRef;
  signaturePad!: SignaturePad;

  @Output() signatureDataUrlEmitter = new EventEmitter<string>();
  @Output() closeModalEvent = new EventEmitter<void>();


  signatureDataUrl: string = ""; 

  ngAfterViewInit() {
    const canvas = this.canvas.nativeElement;
    console.log(this.canvas.nativeElement);
    this.signaturePad = new SignaturePad(canvas);

  }

  clearSignature() {
    this.signaturePad.clear();
  }
  
  saveSignature() {
    this.signatureDataUrl = this.signaturePad.toDataURL(); // get the signature data URL
    this.signatureDataUrlEmitter.emit(this.signatureDataUrl); // emit the dataURL as an event
    this.closeModalEvent.emit();
  }

}

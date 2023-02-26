import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-signature-pad',
  templateUrl: `./gotcha.component.html`,
  styles: []
})
export class GotchaComponent implements OnInit {
  @ViewChild('signaturePadCanvas', { static: true }) canvas!: ElementRef;

  signaturePad!: SignaturePad;

  // ngAfterViewInit(): void {
  //   this.signaturePad = new SignaturePad(this.canvas.nativeElement);
  // }
  ngOnInit() {
    this.signaturePad = new SignaturePad(this.canvas.nativeElement);
  }

  clearSignature(): void {
    this.signaturePad.clear();
  }

  saveSignature(): void {
    const signatureData = this.signaturePad.toDataURL();
    // Do something with the signature data, like send it to a server.
  }
}


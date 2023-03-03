import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import SignaturePad from 'signature_pad';
import * as forge from 'node-forge';

@Component({
  selector: 'app-gotchapad-login',
  templateUrl: './gotcha-login.component.html',
  styleUrls: ['./gotcha-login.component.css']
})
export class GotchaLoginComponent implements AfterViewInit {
  @ViewChild('signaturePadCanvas', { static: true }) canvas!: ElementRef;

  gotchaData: any = {};
  signaturePad!: SignaturePad;
  signatureDataUrl: string = ""; 
  vImageFile!: Blob;
  vImageName: string = "";
  vImageFileHash: string = "";
  imgSelected: Boolean = false;

  ngAfterViewInit() {
    if (this.canvas) {
      this.signaturePad = new SignaturePad(this.canvas.nativeElement);
    }
  }

  selectImage(): void {
    const inputElement = document.getElementById('vImageFile') as HTMLInputElement;
    inputElement.click();
  }
  
  onFileSelected(event: any): void {
    // Logic to handle when an image is selected
    this.vImageFile = event.target.files[0];
    this.vImageName = this.vImageFile.name;
    this.imgSelected = true;
  }

  clearSignature() {
    this.signaturePad.clear();
  }
}

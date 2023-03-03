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

  vFieldsFilled(): Boolean {
    if (this.vImageName == "" || this.gotchaData.vAnsKey == "") {
      console.log("test failed");
      return false
    }
    console.log(this.vImageName);
    console.log(this.gotchaData.vAnsKey);
    return true
  }

  getSigDataUrl(): string {
    this.signatureDataUrl = this.signaturePad.toDataURL();  // get the signature data URL
    return this.signatureDataUrl;
  }
 

  getVImageHash() {
    const reader = new FileReader();                        // create a new FileReader object

    // set the onload event handler for the FileReader
    reader.onload = (e: any) => {                 
      const fileContent = e.target.result;                           // get the file content as a data URL
      const md = forge.md.sha256.create();
      md.update(fileContent + this.gotchaData.vAnsKey, 'utf8');     // calculate the SHA256 hash of the file content
      const hash = md.digest().toHex();
      this.vImageFileHash = hash;                                   // save the hash as a string
      return this.vImageFileHash;
    }
    // read the selected file as a data URL
    reader.readAsDataURL(this.vImageFile);
  }
}

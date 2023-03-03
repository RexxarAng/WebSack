import { Component, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import SignaturePad from 'signature_pad';
import { NgForm } from '@angular/forms';
import * as forge from 'node-forge';

@Component({
  selector: 'app-gotchapad-register',
  templateUrl: `./gotcha.component.html`,
  styles: []
})
export class GotchaComponent implements AfterViewInit {
  @ViewChild('signaturePadCanvas', { static: true }) canvas!: ElementRef;
  @Output() gotchaDataEmitter = new EventEmitter<{dataUrl:string, imgVfier:string}>();
  @Output() closeModalEvent = new EventEmitter<void>();

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

  onSubmit(form: NgForm) {
    if (form.valid && this.imgSelected) {
      this.signatureDataUrl = this.signaturePad.toDataURL();  // get the signature data URL
      const reader = new FileReader();                        // create a new FileReader object
    
      // set the onload event handler for the FileReader
      reader.onload = (e: any) => {                 
        const fileContent = e.target.result;                           // get the file content as a data URL
        const md = forge.md.sha256.create();
        md.update(fileContent + this.gotchaData.vAnsKey, 'utf8');     // calculate the SHA256 hash of the file content
        const hash = md.digest().toHex();
        this.vImageFileHash = hash;                                   // save the hash as a string

        // emit the gotcha data as an event
        this.gotchaDataEmitter.emit({dataUrl:this.signatureDataUrl, imgVfier:this.vImageFileHash}); 
        this.closeModalEvent.emit();
      };
      // read the selected file as a data URL
      reader.readAsDataURL(this.vImageFile);  
    }
   
  }
}


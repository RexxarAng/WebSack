export * from './client.component';
import { ElementRef, OnInit } from '@angular/core';
import SignaturePad from 'signature_pad';
export class SignaturePadComponent implements OnInit {
    canvas: ElementRef;
    signaturePad: SignaturePad;
    ngOnInit(): void;
    clearSignature(): void;
    saveSignature(): void;
}

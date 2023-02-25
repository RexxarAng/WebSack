import { ElementRef, EventEmitter } from '@angular/core';
import SignaturePad from 'signature_pad';
export declare class SignaturepadComponent {
    canvas: ElementRef;
    signaturePad: SignaturePad;
    signatureDataUrlEmitter: EventEmitter<string>;
    signatureDataUrl: string;
    ngAfterViewInit(): void;
    clearSignature(): void;
    saveSignature(): void;
}

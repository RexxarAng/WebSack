var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import SignaturePad from 'signature_pad';
var SignaturepadComponent = /** @class */ (function () {
    function SignaturepadComponent() {
        this.signatureDataUrlEmitter = new EventEmitter();
        this.signatureDataUrl = "";
    }
    SignaturepadComponent.prototype.ngAfterViewInit = function () {
        var canvas = this.canvas.nativeElement;
        console.log(this.canvas.nativeElement);
        this.signaturePad = new SignaturePad(canvas);
    };
    SignaturepadComponent.prototype.clearSignature = function () {
        this.signaturePad.clear();
    };
    SignaturepadComponent.prototype.saveSignature = function () {
        this.signatureDataUrl = this.signaturePad.toDataURL(); // get the signature data URL
        this.signatureDataUrlEmitter.emit(this.signatureDataUrl); // emit the dataURL as an event
    };
    __decorate([
        ViewChild('signaturePadCanvas', { static: true })
    ], SignaturepadComponent.prototype, "canvas", void 0);
    __decorate([
        Output()
    ], SignaturepadComponent.prototype, "signatureDataUrlEmitter", void 0);
    SignaturepadComponent = __decorate([
        Component({
            selector: 'app-signaturepad',
            templateUrl: './signaturepad.component.html',
            styleUrls: ['./signaturepad.component.css']
        })
    ], SignaturepadComponent);
    return SignaturepadComponent;
}());
export { SignaturepadComponent };

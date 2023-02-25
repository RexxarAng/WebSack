var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
export * from './client.component';
import { Component, ViewChild } from '@angular/core';
import SignaturePad from 'signature_pad';
var SignaturePadComponent = /** @class */ (function () {
    function SignaturePadComponent() {
    }
    // ngAfterViewInit(): void {
    //   this.signaturePad = new SignaturePad(this.canvas.nativeElement);
    // }
    SignaturePadComponent.prototype.ngOnInit = function () {
        this.signaturePad = new SignaturePad(this.canvas.nativeElement);
    };
    SignaturePadComponent.prototype.clearSignature = function () {
        this.signaturePad.clear();
    };
    SignaturePadComponent.prototype.saveSignature = function () {
        var signatureData = this.signaturePad.toDataURL();
        // Do something with the signature data, like send it to a server.
    };
    __decorate([
        ViewChild('signaturePadCanvas', { static: true })
    ], SignaturePadComponent.prototype, "canvas", void 0);
    SignaturePadComponent = __decorate([
        Component({
            selector: 'app-signature-pad',
            templateUrl: "./client.component.html",
            styles: []
        })
    ], SignaturePadComponent);
    return SignaturePadComponent;
}());
export { SignaturePadComponent };

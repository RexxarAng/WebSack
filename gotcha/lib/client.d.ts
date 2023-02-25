export declare const hello: (name: string) => string;
import { MatDialogRef, MatDialog } from "@angular/material/dialog";
import { SignaturepadComponent } from "./signaturepad/signaturepad.component";
export declare class YourComponent {
    private dialog?;
    signaturePadComponent: SignaturepadComponent;
    constructor(dialog?: MatDialog | undefined);
    openPopup(): void;
}
export declare class DialogComponent {
    dialogRef: MatDialogRef<DialogComponent>;
    data: {
        signaturePadComponent: SignaturepadComponent;
    };
    constructor(dialogRef: MatDialogRef<DialogComponent>, data: {
        signaturePadComponent: SignaturepadComponent;
    });
    onNoClick(): void;
}

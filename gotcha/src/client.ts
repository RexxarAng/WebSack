// Global variables
// import { SignaturepadComponent } from './signaturepad/signaturepad.component';

// let cw = 600;
// let ch = 800;

// /**
//  * Initialize Pop-up window for Gotcha.
//  * @param {Int} cw : Number specifying canvas width
//  * @param {Int} ch : Number specifyng canvas height
//  * @returns {Window}
//  */
// function initPopUpWindow(cw, ch) {
//   const popUpWindow = window.open(
//     "",
//     "Gotcha Window",
//     `width=${cw + 100}, height=${ch}`
//   );
//   return popUpWindow;
// }
// /**
//  * Initialize containers for window.
//  * @param {Window} win : Number specifying canvas width
//  * @returns {HTMLDivElement}
//  */
// function initContainer(win) {
//   const container = win.document.createElement("div");
//   container.style.display = "flex";
//   container.style.flexDirection = "row";
//   container.style.alignItems = "center";
//   return container;
// }
// /**
//  * Initialize registration of user Gotcha.
//  */
// function initRegister() {
//   // Create a new window with the specified dimensions
//   const gotchaWindow = initPopUpWindow(cw, ch);

//   // Create container divs for the text and canvas input
//   const textcontainer = initContainer(gotchaWindow);
//   const canvacontainer = initContainer(gotchaWindow);

//   // Create a canvas element and set its width and height
//   const canvas = gotchaWindow.document.createElement("canvas");
//   canvas.width = cw;
//   canvas.height = ch;

//   // Add CSS styles to make the canvas a white rounded canvas with black borders
//   canvas.style.backgroundColor = "beige";
//   canvas.style.border = "5px";
//   canvas.style.borderRadius = "10px";
//   canvas.style.borderStyle = "ridge";

//   // Set the canvas background to a texture image
//   // canvas.style.background = `url(input-background.png)`;

//   // Get the Boundaries, Transform Coord and 2D context of the canvas
//   const context = canvas.getContext("2d");
//   const transform = context.getTransform();

//   // Set the initial drawing state
//   context.strokeStyle = "black";
//   context.lineWidth = 2;

//   // Keep track of the mouse position and drawing state
//   let isDrawing = false;
//   let lastMouse = { x: 0, y: 0 };

//   // Add the canvas element to the page
//   canvacontainer.appendChild(canvas);

//   /**
//    * ! START OF CONTAINER
//    */

//   // Create a text input element for editing
//   const aP = gotchaWindow.document.createElement("input");
//   aP.type = "text";
//   aP.style.margin = "20px 0px";
//   aP.style.flex = "1";
//   aP.style.padding = "10px";
//   aP.style.fontSize = "20px";
//   aP.style.border = "2px solid #ddd";
//   aP.placeholder = "Type your answer here";

//   // Add the text input element to the container
//   textcontainer.appendChild(aP);

//   // Create a submit button
//   const submitButton = gotchaWindow.document.createElement("button");
//   submitButton.textContent = "Submit";
//   submitButton.style.padding = "10px";
//   submitButton.style.fontSize = "20px";
//   submitButton.style.color = "#fff";
//   submitButton.style.backgroundColor = "#2196f3";
//   submitButton.style.border = "none";
//   submitButton.style.borderRadius = "5px";
//   submitButton.style.cursor = "pointer";

//   // Add an event listener for the submit button
//   submitButton.addEventListener("click", function () {
//     // Get the contents of the text input and display an alert
//     var text = aP.value;
//     var imageData = canvas.toDataURL();
//     fetch("/rg", {
//       method: "POST",
//       body: JSON.stringify({ image: imageData, answer: text }),
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   });

//   // Add the submit button to the container
//   textcontainer.appendChild(submitButton);

//   // Create a clear button
//   const clearButton = gotchaWindow.document.createElement("button");
//   clearButton.textContent = "Clear";
//   clearButton.style.display = "block";
//   clearButton.style.float = "left";
//   clearButton.style.margin = "8px 8px 0 0";
//   clearButton.style.width = "64px";
//   clearButton.style.height = "29px";
//   clearButton.style.border = "none";
//   clearButton.style.borderBottom = "1px solid #BBB";
//   clearButton.style.borderRadius = "6px";
//   clearButton.style.backgroundColor = "#EEE";
//   clearButton.style.backgroundRepeat = "repeat-x";
//   clearButton.style.padding = "6px 0 0 8px";
//   clearButton.style.color = "#999";
//   clearButton.style.fontWeight = "bold";
//   clearButton.style.textShadow = "0px 1px 1px #fff";

//   // Add an event listener for the clear button
//   clearButton.addEventListener("click", function () {
//     // Clear the canvas
//     context.clearRect(0, 0, canvas.width, canvas.height);
//   });

//   // Add the clear button to the container
//   canvacontainer.appendChild(clearButton);

//   // Add the container element to the new window
//   gotchaWindow.document.body.appendChild(canvacontainer);
//   gotchaWindow.document.body.appendChild(textcontainer);

//   /**
//    * ! END OF CONTAINER
//    */

//   // Add event listeners for mouse movement
//   canvas.addEventListener("mousedown", function (event) {
//     // check for left mouse button depress, shift cursor and start draw
//     if (event.button === 0) {
//       isDrawing = true;
//       lastMouse = {
//         x: event.offsetX - transform.e,
//         y: event.offsetY - transform.f,
//       };
//     }
//     // Clear the canvas when the user clicks the right mouse button
//     if (event.button === 2) {
//       context.clearRect(0, 0, canvas.width, canvas.height);
//     }
//   });

//   canvas.addEventListener("mousemove", function (event) {
//     if (isDrawing && event.buttons === 1) {
//       // check for left mouse button
//       const currentMouse = {
//         x: event.offsetX - transform.e,
//         y: event.offsetY - transform.f,
//       };
//       context.beginPath();
//       context.moveTo(lastMouse.x, lastMouse.y);
//       context.lineTo(currentMouse.x, currentMouse.y);
//       context.stroke();
//       lastMouse = currentMouse;
//     }
//   });

//   canvas.addEventListener("mouseup", function (event) {
//     if (event.button === 0) {
//       // check for left mouse button
//       isDrawing = false;
//     }
//   });

//   canvas.addEventListener("mouseleave", function (event) {
//     if (event.button === 0) {
//       // check for left mouse button
//       isDrawing = false;
//     }
//   });
// }

// /**
//  * Initialize validation of current user Gotcha.
//  * @param {string} gcVImage
//  * @param {string} gcVAns
//  */
// function initValidation(gcVImage, gcVAns) {
//   // Retrieve corresponding image and prompt from server's DB

//   // Create a new window with the specified dimensions
//   const gotchaWindow = initPopUpWindow(cw, ch);

//   // Create container divs for the text and canvas input
//   const textcontainer = initContainer(gotchaWindow);
//   const canvacontainer = initContainer(gotchaWindow);

//   /**
//    * ! START OF CONTAINER
//    */

//   const img = gotchaWindow.document.createElement("img");
//   img.src = gcVImage;
//   img.style.width = "100%";
//   img.style.height = "auto";
//   // Add the img input element to the container
//   canvacontainer.appendChild(img);

//   // Create a text input element for editing
//   const aP = gotchaWindow.document.createElement("input");
//   aP.type = "text";
//   aP.style.margin = "20px 0px";
//   aP.style.flex = "1";
//   aP.style.padding = "10px";
//   aP.style.fontSize = "20px";
//   aP.style.border = "2px solid #ddd";
//   aP.placeholder = "Type your answer here";
//   // Add the text input element to the container
//   textcontainer.appendChild(aP);

//   // Create a submit button
//   const submitButton = gotchaWindow.document.createElement("button");
//   submitButton.textContent = "Submit";
//   submitButton.style.padding = "10px";
//   submitButton.style.fontSize = "20px";
//   submitButton.style.color = "#fff";
//   submitButton.style.backgroundColor = "#2196f3";
//   submitButton.style.border = "none";
//   submitButton.style.borderRadius = "5px";
//   submitButton.style.cursor = "pointer";

//   // Add an event listener for the submit button
//   submitButton.addEventListener("click", function () {
//     // Get the contents of the text input and display an alert
//     var text = aP.value;
//     fetch("/vg", {
//       method: "POST",
//       body: JSON.stringify({ answer: text }),
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   });

//   // Add the submit button to the container
//   textcontainer.appendChild(submitButton);

//   // Add the container element to the new window
//   gotchaWindow.document.body.style.textAlign = "center";
//   gotchaWindow.document.body.appendChild(canvacontainer);
//   gotchaWindow.document.body.appendChild(textcontainer);

//   /**
//    * ! END OF CONTAINER
//    */
// }

// function validateForm() {}

export const hello = (name: string): string => "Hello, " + name + "!";

import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Inject,
} from "@angular/core";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import { SignaturepadComponent } from "./signaturepad/signaturepad.component";

@Component({
  selector: "app-signaturepad",
  templateUrl: "./signaturepad/signaturepad.component.html",
  styleUrls: ["./signaturepad/signaturepad.component.css"],
  template: ` <button (click)="openPopup()">Open Signature Pad</button> `,
  providers: [MatDialog]
})
export class YourComponent {
  signaturePadComponent: SignaturepadComponent = new SignaturepadComponent();

  constructor(private dialog?: MatDialog) {}

  openPopup() {
    if (!this.dialog) {
      throw new Error("Dialog is not provided");
    }
    const dialogRef = this.dialog.open(DialogComponent, {
      width: "500px",
      data: { signaturePadComponent: this.signaturePadComponent },
    });
  }
}

export class DialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { signaturePadComponent: SignaturepadComponent }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

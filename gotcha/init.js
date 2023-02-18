const cw = 600;
const ch = 800;

/**
 * Initialize Pop-up window for Gotcha.
 * @param {*} cw : Number specifying canvas width
 * @param {*} ch : Number specifyng canvas height
 */
function initPopUpWindow(cw, ch) {
  const popUpWindow = window.open(
    "",
    "Gotcha Window",
    `width=${cw + 100}, height=${ch}`
  );
  return popUpWindow
}

/**
 * Initialize registration of user Gotcha.
 */
function initRegister() {
  // Create a new window with the specified dimensions
  const gotchaWindow = initPopUpWindow(cw, ch)

  // Create a container div for the text input
  const textcontainer = gotchaWindow.document.createElement("div");
  textcontainer.style.display = "flex";
  textcontainer.style.flexDirection = "row";
  textcontainer.style.alignItems = "center";

  // Create a container div for the canvas input
  const canvacontainer = gotchaWindow.document.createElement("div");
  canvacontainer.style.display = "flex";
  canvacontainer.style.flexDirection = "row";
  canvacontainer.style.alignItems = "center";

  // Create a canvas element and set its width and height
  const canvas = gotchaWindow.document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;

  // Add CSS styles to make the canvas a white rounded canvas with black borders
  canvas.style.backgroundColor = "beige";
  canvas.style.border = "5px";
  canvas.style.borderRadius = "10px";
  canvas.style.borderStyle = "ridge";

  // Set the canvas background to a texture image
  // canvas.style.background = `url(input-background.png)`;

  // Get the Boundaries, Transform Coord and 2D context of the canvas
  const context = canvas.getContext("2d");
  const transform = context.getTransform();

  // Set the initial drawing state
  context.strokeStyle = "black";
  context.lineWidth = 2;

  // Keep track of the mouse position and drawing state
  let isDrawing = false;
  let lastMouse = { x: 0, y: 0 };

  // Add the canvas element to the page
  canvacontainer.appendChild(canvas);

  /**
   * ! START OF CONTAINER
   */

  // Create a text input element for editing
  const aP = gotchaWindow.document.createElement("input");
  aP.type = "text";
  aP.style.marginLeft = "10px";
  aP.style.marginRight = "10px";
  aP.style.flex = "1";
  aP.style.padding = "10px";
  aP.style.fontSize = "20px";
  aP.style.border = "2px solid black";

  // Add the text input element to the container
  textcontainer.appendChild(aP);

  // Create a submit button
  const submitButton = gotchaWindow.document.createElement("button");
  submitButton.textContent = "Submit";
  submitButton.style.padding = "10px";
  submitButton.style.fontSize = "20px";
  submitButton.style.border = "2px solid black";

  // Add an event listener for the submit button
  submitButton.addEventListener("click", function () {
    // Get the contents of the text input and display an alert
    var text = aP.value;
    var imageData = canvas.toDataURL();
    registerGotcha(imageData,text)
    alert(`Submitted: ${imageData}`);
  });

  // Add the submit button to the container
  textcontainer.appendChild(submitButton);

  // Create a clear button
  const clearButton = gotchaWindow.document.createElement("button");
  clearButton.textContent = "Clear";
  clearButton.style.display = "block";
  clearButton.style.float = "left";
  clearButton.style.margin = "8px 8px 0 0";
  clearButton.style.width = "64px";
  clearButton.style.height = "29px";
  clearButton.style.border = "none";
  clearButton.style.borderBottom = "1px solid #BBB";
  clearButton.style.borderRadius = "6px";
  clearButton.style.backgroundColor = "#EEE";
  clearButton.style.backgroundRepeat = "repeat-x";
  clearButton.style.padding = "6px 0 0 8px";
  clearButton.style.color = "#999";
  clearButton.style.fontWeight = "bold";
  clearButton.style.textShadow = "0px 1px 1px #fff";

  // Add an event listener for the clear button
  clearButton.addEventListener("click", function () {
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
  });

  // Add the clear button to the container
  canvacontainer.appendChild(clearButton);

  // Add the container element to the new window
  gotchaWindow.document.body.appendChild(canvacontainer);
  gotchaWindow.document.body.appendChild(textcontainer);

  /**
   * ! END OF CONTAINER
   */

  // Add event listeners for mouse movement
  canvas.addEventListener("mousedown", function (event) {
    // check for left mouse button depress, shift cursor and start draw
    if (event.button === 0) {
      isDrawing = true;
      lastMouse = {
        x: event.offsetX - transform.e,
        y: event.offsetY - transform.f,
      };
    }
    // Clear the canvas when the user clicks the right mouse button
    if (event.button === 2) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  });

  canvas.addEventListener("mousemove", function (event) {
    if (isDrawing && event.buttons === 1) {
      // check for left mouse button
      const currentMouse = {
        x: event.offsetX - transform.e,
        y: event.offsetY - transform.f,
      };
      context.beginPath();
      context.moveTo(lastMouse.x, lastMouse.y);
      context.lineTo(currentMouse.x, currentMouse.y);
      context.stroke();
      lastMouse = currentMouse;
    }
  });

  canvas.addEventListener("mouseup", function (event) {
    if (event.button === 0) {
      // check for left mouse button
      isDrawing = false;
    }
  });

  canvas.addEventListener("mouseleave", function (event) {
    if (event.button === 0) {
      // check for left mouse button
      isDrawing = false;
    }
  });
}

function registerGotcha(imageData, promptText) {
  initDB();
}
function initValidation() {
  // Create a new window with the specified dimensions
  const gotchaWindow = initPopUpWindow(cw, ch)
  
}
function validateGotcha() {

}
function initDB() {}

function validateForm() {}



// function createGotcha() {
//     const activeCaptcha = document.getElementById("captcha");
//     for (q = 0; q < 6; q++) {
//       if (q % 2 == 0) {
//         captcha[q] = String.fromCharCode(Math.floor(Math.random() * 26 + 65));
//       } else {
//         captcha[q] = Math.floor(Math.random() * 10 + 0);
//       }
//     }
//     theCaptcha = captcha.join("");
//     activeCaptcha.innerHTML = `${theCaptcha}`;
//   }
//   function validateGotcha() {
//     const errCaptcha = document.getElementById("errCaptcha");
//     const reCaptcha = document.getElementById("reCaptcha");
//     recaptcha = reCaptcha.value;
//     let validateCaptcha = 0;
//     for (var z = 0; z < 6; z++) {
//       if (recaptcha.charAt(z) != captcha[z]) {
//         validateCaptcha++;
//       }
//     }
//     if (recaptcha == "") {
//       errCaptcha.innerHTML = "Re-Captcha must be filled";
//     } else if (validateCaptcha > 0 || recaptcha.length > 6) {
//       errCaptcha.innerHTML = "Wrong captcha";
//     } else {
//       errCaptcha.innerHTML = "Done";
//     }
//   }

let captcha = new Array();


/**
 * 
 * @param {*} cw : Number specifying canvas width
 * @param {*} ch : Number specifyng canvas height
 */
function initCanvas(cw, ch) {
  // Create a canvas element and set its width and height
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;

  // Get the 2D context of the canvas
  const context = canvas.getContext('2d');

  // Set the initial drawing state
  context.strokeStyle = 'black';
  context.lineWidth = 2;

  // Keep track of the mouse position and drawing state
  let isDrawing = false;
  let lastMouse = { x: 0, y: 0 };

  // Add the canvas element to the page
  document.body.appendChild(canvas);

  // Add event listeners for mouse movement
  canvas.addEventListener('click', function(event) {
    if (event.button === 0) { // check for left mouse button
      isDrawing = true;
      lastMouse = { x: event.clientX, y: event.clientY };
    }
  });
  
  canvas.addEventListener('mousemove', function(event) {
    if (isDrawing) {
      const currentMouse = { x: event.clientX, y: event.clientY };
      context.beginPath();
      context.moveTo(lastMouse.x, lastMouse.y);
      context.lineTo(currentMouse.x, currentMouse.y);
      context.stroke();
      lastMouse = currentMouse;
    }
  });
  // Release mouse click
  canvas.addEventListener('mouseup', function(event) {
    if (event.button === 0) { // check for left mouse button
      isDrawing = false;
    }
  });
  // Leaves canvas area
  canvas.addEventListener('mouseleave', function(event) {
    if (event.button === 0) { // check for left mouse button
      isDrawing = false;
    }
  });

  // Clear the canvas when the user clicks the right mouse button
  canvas.addEventListener('mousedown', function(event) {
    if (event.button === 2) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  });
}




function createCaptcha() {
    const activeCaptcha = document.getElementById("captcha");
    for (q = 0; q < 6; q++) {
      if (q % 2 == 0) {
        captcha[q] = String.fromCharCode(Math.floor(Math.random() * 26 + 65));
      } else {
        captcha[q] = Math.floor(Math.random() * 10 + 0);
      }
    }
    theCaptcha = captcha.join("");
    activeCaptcha.innerHTML = `${theCaptcha}`;
  }

  function validateCaptcha() {
    const errCaptcha = document.getElementById("errCaptcha");
    const reCaptcha = document.getElementById("reCaptcha");
    recaptcha = reCaptcha.value;
    let validateCaptcha = 0;
    for (var z = 0; z < 6; z++) {
      if (recaptcha.charAt(z) != captcha[z]) {
        validateCaptcha++;
      }
    }
    if (recaptcha == "") {
      errCaptcha.innerHTML = "Re-Captcha must be filled";
    } else if (validateCaptcha > 0 || recaptcha.length > 6) {
      errCaptcha.innerHTML = "Wrong captcha";
    } else {
      errCaptcha.innerHTML = "Done";
    }
  }
// // Import the required modules
// const http = require("http");
// // const fs = require("fs");

// // Create the HTTP server
// //function createTestServer() {
//     const server = http.createServer((req, res) => {
//         registerGotcha(req, res)
//     });
    
//     // Start the server on port 3000
//     server.listen(3000, () => {
//       console.log("Server started on port 3000.");
//     });
    
// // }
// /**
//  *
//  * @param {*} req
//  * @param {*} res
//  */
// function registerGotcha(req, res) {
//   // Check if the request is for saving the drawing
//   if (req.method === "POST") {
//     if (req.url === "/rg") {
//       let body = "";
//       req.on("data", (chunk) => {
//         body += chunk.toString();
//       });
//       req.on("end", () => {
//         const data = JSON.parse(body);
//         console.log(`Received image data: ${data.image}`);
//         console.log(`Received answer: ${data.answer}`);
//         // Save the image data to a file
//         // fs.writeFile(
//         //   "drawing.png",
//         //   data.image.split(";base64,").pop(),
//         //   "base64",
//         //   (err) => {
//         //     if (err) throw err;
//         //     console.log("Drawing saved successfully.");
//         //   }
//         // );
//         res.end("Drawing saved successfully.");
//       });
//     } else if (req.url === "/vg") {
//       let body = "";
//       req.on("data", function (chunk) {
//         body += chunk.toString();
//       });
//       req.on("end", function () {
//         const data = JSON.parse(body);
//         // Process the data as needed
//         // console.log(`Received image data: ${data.imageData}`);
//         console.log(`Received answer: ${data.answer}`);
//         // Send a response back to the client
//         res.writeHead(200, { "Content-Type": "text/plain" });
//         res.end("Data processed successfully");
//       });
//     } else {
//       res.writeHead(404, { "Content-Type": "text/plain" });
//       res.end("404 Not Found");
//     }
//   } 
// }
// /**
//  * Validate Gotcha challenge response from user.
//  * @param {string} gcVAns
//  * @param {string} gcVInput
//  * @returns {boolean}
//  */
// function validateGotcha(gcVAns, gcVInput) {
//   if (gcVAns == gcVInput) {
//     return true;
//   }
//   return false;
// }

// module.exports = {
//     // createTestServer: createTestServer,
//     registerGotcha: registerGotcha,
//     validateGotcha: validateGotcha
//   };
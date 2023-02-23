const express = require('express');
const cors = require('cors');
const sslify = require('express-sslify');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
// const helmet = require('helmet');
const crypto = require('crypto');
const apiRoute = require('./routes/apiRoute');

const app = express();

// app.use(helmet());
app.use(cors());

//Body Parser MiddeWare
//Parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sslify.HTTPS({ trustProtoHeader: true }));

// Prevent nosql injection
app.use(mongoSanitize({
  replaceWith: '_'
}));

// app.use((req, res, next) => {
//   res.setHeader("Content-Security-Policy", "default-src 'self'");
//   next();
// });

const certPath = '/etc/letsencrypt/live/websack.eloquent-jennings.cloud/fullchain.pem';
const keyPath = '/etc/letsencrypt/live/websack.eloquent-jennings.cloud/privkey.pem';

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
  };

mongoose.set('strictQuery', false);
// Connect to MongoDB
mongoose.connect('mongodb://localhost/WebSack', { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

app.get('/', function(req, res) {
  res.redirect("/WebSack");
})

// Angular routes
app.use("/WebSack", express.static(path.join(__dirname , '/client/dist')));

app.use("/WebSack/*", function(req, res) {
  res.sendFile(__dirname + '/client/dist/index.html');
});

// API Routes
app.use("/api/", apiRoute);

// Start the Express app
https.createServer(options, app).listen(443, () => {
  console.log('Listening on port 443');
});






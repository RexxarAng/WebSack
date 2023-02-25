const express = require('express');
const cors = require('cors');
const sslify = require('express-sslify');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const crypto = require('crypto');
const apiRoute = require('./routes/apiRoute');

const app = express();

// app.use(helmet());
app.use(cors());

// Body Parser MiddeWare
// Parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Prevent nosql injection
app.use(mongoSanitize({replaceWith: '_'}));

mongoose.set('strictQuery', false);
// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/WebSack', {useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

app.get('/', function(req, res) {
  res.redirect('/WebSack');
})

// Angular routes
app.use('/WebSack', express.static(path.join(__dirname, '/client/dist')));

app.use('/WebSack/*', function(req, res) {
  res.sendFile(__dirname + '/client/dist/index.html');
});

// API Routes
app.use('/api/', apiRoute);

// Host locally webserver
const port = 3200;
app.listen(port, () => {console.log(`Example app listening on port ${port}`)})
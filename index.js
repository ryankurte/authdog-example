'use strict';

const path = require('path');
const fs = require('fs');
const https = require('https');

const express = require('express');
const expressSession = require('express-session');
const bodyParser = require('body-parser');
const u2f2 = require('u2f');
const u2f = require('authdog');


var port = process.env.PORT || 9000;
var appId = 'https://localhost:' + port;

// Create App
const app = express();

// Bind middlewares
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(expressSession({secret: 'I am a very poor secret', resave: true, saveUninitialized: true }));

var tokens = [];

// Test route
app.get('/test', function (req, res) {
  res.send('Test GET\n');
});

app.get('/register', function(req, res) {
    var tokens = req.session.tokens || [];

    var registrationRequest = u2f2.requestRegistration(appId, tokens);

    req.session.registrationRequest = registrationRequest;

    res.json(registrationRequest);

/*
    u2f.startRegistration(appId, tokens)
    .then(function(registrationRequest) {
      // Save registration request to session for later use
      req.session.registrationRequest = registrationRequest;

      // Send registration request to client
      res.json(registrationRequest);

    }, function(error) {
      // Handle registration request error
      res.status(500).json(error);
    });
*/
});

app.post('/register', function(req, res) {
    var request = req.session.registrationRequest;

    var registrationStatus = u2f2.checkRegistration(request, req.body);

    if(registrationStatus.successful === true) {
      var meta = {
        keyHandle: registrationStatus.keyHandle, 
        publicKey: registrationStatus.publicKey,
        certificate: registrationStatus.certificate
      }
      
      if(!req.session.tokens) {
        req.session.tokens = [];
      }

      // Save newly registered token
      req.session.tokens.push(meta);

      res.json(registrationStatus);

      console.log("A: ");
      console.log(registrationStatus);

    } else {
      res.status(401).json(registrationStatus);
    }


    // Process registration response
    u2f.finishRegistration(request, req.body)
    .then(function(registrationStatus) {
      // Save device meta structure for future authentication use
      var meta = {
        keyHandle: registrationStatus.keyHandle, 
        publicKey: registrationStatus.publicKey,
        certificate: registrationStatus.certificate
      }
      
      if(!req.session.tokens) {
        req.session.tokens = [];
      }
      console.log("B: ");
      console.log(registrationStatus);

      // Save newly registered token
      //req.session.tokens.push(meta);

      // Respond to user
      //res.json(meta);

    }, function(error) {
      // Handle registration error
      res.status(500).json(error);
    });

});

app.get('/sign', function(req, res) {
    var tokens = req.session.tokens;

    var keyHandles = [];
    for(var i in tokens) {
      keyHandles.push(tokens[i].keyHandle);
    }

    var authenticationRequest = u2f2.requestSignature(appId, keyHandles);

    req.session.authenticationRequest = authenticationRequest;

    res.json(authenticationRequest);
/*
    u2f.requestSignature(appId, tokens)
    .then(function(authenticationRequest) {
      // Save registration request to session for later use
      req.session.authenticationRequest = authenticationRequest;

      // Send registration request to client
      res.json(authenticationRequest);

    }, function(error) {
      // Handle registration request error
      res.status(500).json(error);
    });
*/
});

app.post('/sign', function(req, res) {
    var request = req.session.authenticationRequest;
    var tokens = req.session.tokens || [];

    var authStatus = u2f2.checkSignature(request, req.body, tokens[0].publicKey);

    if(authStatus.successful === true) {
      res.json(authStatus);
    } else {
      res.status(401).json(authStatus);
    }

/*
    // Process registration response
    u2f.checkSignature(request, req.body, tokens)
    .then(function(authenticationStatus) {
      // Respond to user
      res.json(authenticationStatus);

    }, function(error) {
      // Handle registration error
      res.status(500).json(error);
    });
*/
});


// Static hosting
app.use(express.static(path.join(__dirname, './static')));

// Generate with `./gencerts.sh fakeCA fakeName fakeOrg certs/`
var privateKey = fs.readFileSync(__dirname + '/certs/fakeName.key');
var certificate = fs.readFileSync(__dirname + '/certs/fakeName.crt');

// Start listening
var server = https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(port);

console.log('Running on ' + appId);








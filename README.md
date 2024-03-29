# WebSack

## Table of contents
* [Introduction](#introduction)
* [Technologies](#technologies)
* [Setup](#setup)

## Introduction

Sending a password over the network in plaintext or hashed, which can be intercepted and stolen by attackers, is a common practice in traditional password authentication schemes.

The proposed solution PEARL (Privacy-Enhanced Authentication with randomized OPRF Login) includes OPAQUE Cryptography which uses a variety of cryptographic algorithms to mask the password and safeguard it during the authentication process to mitigate this problem.

Click the image below to watch our video demonstration for this project.

[![PEARL Demonstration Video](http://img.youtube.com/vi/lFynKTts62c/0.jpg)](https://www.youtube.com/watch?v=lFynKTts62c&ab_channel=YeongJingKang)

## Technologies
Project is created with:
* MongoDB
* Express
* Angular
* Nodejs


## Setup

Ensure that node is installed (https://nodejs.org/en/download) before running this project

Ensure that mongoDB is installed (https://www.mongodb.com/try/download/community) 
- Follow the steps at https://hevodata.com/learn/windows-mongodb-shell/ to setup MongoDB on Windows

To build the frontend:

```
$ cd ../WebSack/client
$ npm install
$ npm run watch
```

To run the webserver locally:

```
$ cd ../WebSack
$ npm install
$ node server_local.js
```






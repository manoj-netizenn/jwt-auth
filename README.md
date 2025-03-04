

# JSON Web Token (JWT) Authentication in Express using node.js

## Description
JSON Web Token (JWT) is a secure and stateless authentication method that allows users to authenticate using a signed token instead of traditional session-based authentication. This document provides a detailed overview of how JWT authentication works in an Express.js application.

---

## How JWT Authentication Works
1. **User Login:** The client sends a login request with valid credentials (username and password).
2. **Token Generation:** If authentication is successful, the server generates a JWT token, signs it with a secret key, and returns it to the client.
3. **Token Storage:** The client stores the token in html-cookie
4. **Sending Requests:** For each protected request, the client includes the JWT in the `Authorization` header.
5. **Token Verification:** The server verifies the token using the secret key and grants access if it's valid.
6. **Accessing Protected Routes:** The user can now access restricted endpoints until the token expires.

---

## Setting Up JWT Authentication in Express.js

- make sure you have node and npm installed

```bash
  git clone https://github.com/manoj-netizenn/jwt-auth
```

```bash
cd "project directory"
```
## Install Required Packages

```bash
npm install
```

```bash
npm install express jsonwebtoken ejs mongoose cookie-parser bcrypt
```


- if any dependency goes missing run

```bash
npm i dependency-name -D
```

# Mongoose Setup Guide

## Installation

- First, install Mongoose in your project:

```bash
npm install mongoose
```

## Basic Connection Setup

## 1. Import Mongoose
```javascript
const mongoose = require('mongoose');
```

## 2. Connection String Format
The basic MongoDB connection string format is:
```javascript
const url="mongodb://localhost:27017/your_database"
mongoose.connect("url").then().catch()
//replace this with your local database or connection string from mongodb account

```

## [+] Usage

```bash
node server.js
```
- or

```bash
npm run server
```

project is now running on <a href ="http://localhost:3000">localhost:3000</a>
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// -- key -- //
const pvtKey = fs.readFileSync(
  path.resolve(__dirname, process.env.PRIVATE_KEY))
const pubKey = fs.readFileSync(
  path.resolve(__dirname, process.env.PUBLIC_KEY))

module.exports = {
  sign: (payload, app) => {
    let signOptions = {
      issuer: app,
      expiresIn: "12h",
      algorithm: "RS256"
    };
    return jwt.sign(payload, pvtKey, signOptions);
  },

  verify: (token, app) => {
    let verifyOptions = {
      issuer: app,
      expiresIn: "12h",
      algorithm: ["RS256"]
    };
    try {
      return jwt.verify(token, pubKey, verifyOptions);
    } catch (err) {
      return false
    }
  },

  decode: token => {
    return jwt.decode(token, { complete: true });
  }
}
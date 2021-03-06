let jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
let config = require('../config'); // get our config file

function verifyToken(req, res, next) {
  let token = req.headers['x-access-token'];
  if (!token)
    return res.status(403).send({auth: false, message: 'No token provided.'});
  jwt.verify(token, config.secret, function (err, decoded) {
    if (err)
      return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});
    req.userId = decoded.id;
    next();
  });
}

module.exports = verifyToken;

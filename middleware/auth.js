const jwt = require("jsonwebtoken");



module.exports = (req, res, next) => {
    const token = req.cookies.auth;
    if (!token) {
      return res.sendStatus(403);
    }
    try {
      const data = jwt.verify(token, process.env.secret);
      req.username = data.user;
      req.position = data.position
      req.branch = data.branch

      return next();
    } catch {
      return res.sendStatus(403);
    }
  };
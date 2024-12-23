const jwt = require("jsonwebtoken");

module.exports.generateToken = (userId) => {
  console.log("generateToken", process.env.JWT_SECRET);
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

module.exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

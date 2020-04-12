const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const receivedToken = req.header("Authorization").replace("Bearer ", "");
    const decodedToken = jwt.verify(receivedToken, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decodedToken._id,
      "tokens.token": receivedToken,
    });
    if (!user) throw new Error();
    req.token = receivedToken;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send(`Authorization Error!`);
  }
};

module.exports = auth;

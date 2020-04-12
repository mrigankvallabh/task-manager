const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { sendWelcomeEmail, sendCancelEmail } = require("../emails/account");
const router = express.Router();

// Create User
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Login Request
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (err) {
    res.status(401).send(`Unable to Login!`);
  }
});

// Get logged User profile
router.get("/users/me", auth, async (req, res) => {
  try {
    res.status(200).send(req.user);
  } catch (err) {
    res.status(500).send(err);
  }
  /*
  User.find({})
    .then(users => res.status(200).send(users))
    .catch(err => res.status(500).send(err));
  */
});

// Log current session out
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send(`Logged Out!`);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Logout of all sessions
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send(`Successfully Logged Out from all sessions`);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update logged user profile
router.patch("/users/me", auth, async (req, res) => {
  const allowedProperties = ["name", "email", "password", "age"];
  const receivedProperties = Object.keys(req.body);
  const isValidOperation = receivedProperties.every((property) =>
    allowedProperties.includes(property)
  );

  if (!isValidOperation)
    return res
      .status(403)
      .send(`Attempt to update forbidden or non existing property`);

  try {
    receivedProperties.forEach(
      (property) => (req.user[property] = req.body[property])
    );
    await req.user.save();
    res.status(200).send(req.user);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete logged user
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Upload avatar
const multer = require("multer");
const upload = multer({
  limits: {
    fileSize: 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpe?g|png)$/)) {
      return cb(new Error(`Allowed Formats are jpeg, jpg or png`));
    }
    cb(null, true);
  },
});
const sharp = require("sharp");

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send(`Avatar Uploaded`);
  },
  (err, req, res, next) => {
    res.status(400).send({ error: err.message });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send(`Avatar Deleted`);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) throw new Error();
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (err) {
    res.status(404).send();
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const User = require("../modiles/User");
const sendemail = require("../utils/sendMailer");

// route  GET api/auth

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// route  POST api/auth

router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials1" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ error: [{ msg: "Invalid Credentials2" }] });
      }

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

router.post("/restpassword", async (req, res) => {
  const email = req.body.email;
  
  if (!email) {
    return res.status(404).send("not email");
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).send("not email");
  }

  const send = await sendemail(email);
  res.send("code sent your email");
});

router.post("/configcode", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  let code = user.code;
  if (code === req.body.code) {
    return res.send("good code");
  } else {
    res.send("not good code");
  }
});

router.post("/resP", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).send(" email is not good");
  }
  if (password < 8) {
    return res.send("passowrd is not good");
  }
  let newPassword = bcrypt.hashSync(password, 10);
  let updataUser = await User.findByIdAndUpdate(user._id, {
    password: newPassword
  });
  return res.send("passowrd is good");
});

module.exports = router;

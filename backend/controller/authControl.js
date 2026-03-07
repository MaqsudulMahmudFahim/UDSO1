const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const signupTokens = new Map();
const { check, validationResult } = require("express-validator");

// Login Page (React does not need page render)
const getLogin = (req, res) => {
  const flashMessage = req.session.flashMessage || null;
  req.session.flashMessage = null;

  res.json({
    ok: true,
    flashMessage,
  });
};


const postLogin = async (req, res) => {
  const { email, mobile, password } = req.body;

  try {
    let user;

    // ============================
    // Admin login → Email
    // ============================
    if (email) {
      user = await User.findOne({
        email,
        userType: "admin",
      });
    }

    // ============================
    // Guest login → Mobile
    // ============================
    if (!email && mobile) {
      user = await User.findOne({
        mobile: mobile.toString().trim(),
        userType: "guest",
      });
    }

    if (!user) {
      return res.status(422).json({
        ok: false,
        errorMessages: ["User not found"],
      });
    }

    const doMatch = await bcrypt.compare(password, user.password);

    if (!doMatch) {
      return res.status(422).json({
        ok: false,
        errorMessages: ["Invalid password"],
      });
    }

    req.session.isLoggedIn = true;
    req.session.user = user;
    await req.session.save();

    res.json({
      ok: true,
      user,
      userType: user.userType,
      redirect: user.userType === "admin" ? "/admin-home" : "/",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ ok: false });
  }
};

// Logout
const postLogout = (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true, redirect: "/login" });
  });
};

// Signup page
const getSignup = (req, res) => {
  res.json({
    ok: true,
  });
};

// Post Signup (Normal version — still kept)
const postSignup = [
  check("name").notEmpty(),
  check("email").isEmail(),
  check("password").isLength({ min: 8 }),
  check("mobile").notEmpty(),
  check("userType").notEmpty(),

  async (req, res) => {
    const { name, email, password, mobile, userType } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        ok: false,
        errorMessages: errors.array().map((e) => e.msg),
      });
    }

    try {
      const hashed = await bcrypt.hash(password, 12);
      const newUser = new User({
        name,
        email,
        password: hashed,
        mobile,
        userType,
      });
      await newUser.save();

      res.json({
        ok: true,
        redirect: "/login",
      });
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ ok: false, message: "Internal Server Error" });
    }
  },
];

// Auth middlewares
const isAdmin = (req, res, next) => {
  if (!req.session.isLoggedIn || req.session.user.userType !== "admin") {
    return res.status(401).json({ ok: false, redirect: "/login" });
  }
  next();
};

const isGuest = (req, res, next) => {
  if (!req.session.isLoggedIn || req.session.user.userType !== "guest") {
    return res.status(401).json({ ok: false, redirect: "/login" });
  }
  next();
};

// Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "info.fahim99@gmail.com",
    pass: "qxtk cosr xrwb ypbn",
  },
});

// GET Forgot Password
const getForgotPassword = (req, res) => {
  res.json({
    ok: true,
  });
};


const postForgotPassword = async (req, res) => {
  const { email, mobile } = req.body;

  try {
    // ============================
    // 1️⃣ Guest → Mobile based
    // ============================
    if (mobile) {
      const user = await User.findOne({ mobile, userType: "guest" });

      if (!user) {
        return res.json({ ok: false, errorMessages: ["Mobile not found"] });
      }

      // Send reset link for guest
      const resetLink = `http://localhost:5173/reset-password/${user._id}?type=guest`;

      return res.json({
        ok: true,
        type: "guest",
        userId: user._id.toString(),
        resetLink,
        message:
          "Mobile verified. You can reset your password using the link sent.",
      });
    }

    // ============================
    // 2️⃣ Admin → Email + OTP
    // ============================
    if (email) {
      const user = await User.findOne({ email, userType: "admin" });

      if (!user) {
        return res.json({ ok: false, errorMessages: ["Email not found"] });
      }

      // Generate 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      signupTokens.set(email, {
        code,
        userId: user._id.toString(),
        expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      });

      // Send OTP to admin email
      await transporter.sendMail({
        to: email,
        from: "info.fahim99@gmail.com",
        subject: "Admin Password Reset OTP",
        html: `<h3>Your OTP for password reset is: <b>${code}</b></h3>`,
      });

      return res.json({
        ok: true,
        type: "admin",
        message: "OTP sent to your email",
      });
    }

    return res.json({
      ok: false,
      errorMessages: ["Provide mobile (guest) or email (admin)"],
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ ok: false, errorMessages: ["Server error"] });
  }
};

// GET Reset Password
const getResetPassword = async (req, res) => {
  const token = req.params.token;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({
        ok: false,
        errorMessages: ["Invalid or expired token."],
      });
    }

    res.json({
      ok: true,
      userId: user._id.toString(),
      passwordToken: token,
    });
  } catch (err) {
    console.error("Reset form load error:", err);
    res.status(500).json({ ok: false });
  }
};


const postResetPassword = async (req, res) => {
  const { userId, password, confirmPassword, email, otp } = req.body;

  if (password !== confirmPassword) {
    return res.json({ ok: false, errorMessages: ["Passwords do not match"] });
  }

  try {
    let user;

    // ============================
    // Guest → update by userId ONLY
    // ============================
    if (userId && !email) {
      user = await User.findOne({ _id: userId, userType: "guest" });

      if (!user) {
        return res.json({ ok: false, errorMessages: ["User not found"] });
      }

      user.password = await bcrypt.hash(password, 12);
      await user.save();

      return res.json({
        ok: true,
        redirect: "/login",
        message: "Password updated!",
      });
    }

    // ============================
    // Admin → verify OTP first
    // ============================
    if (email && otp) {
      if (!signupTokens.has(email)) {
        return res.json({
          ok: false,
          errorMessages: ["OTP expired or invalid"],
        });
      }

      const tokenData = signupTokens.get(email);

      if (tokenData.code !== otp || Date.now() > tokenData.expires) {
        return res.json({ ok: false, errorMessages: ["Invalid/expired OTP"] });
      }

      user = await User.findById(tokenData.userId);
      user.password = await bcrypt.hash(password, 12);
      await user.save();

      signupTokens.delete(email);

      return res.json({
        ok: true,
        redirect: "/login",
        message: "Password updated!",
      });
    }

    return res.json({ ok: false, errorMessages: ["Invalid request"] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, errorMessages: ["Server error"] });
  }
};

// ====================
// POST Signup with Verification
// ====================
const postSignupWithVerification = async (req, res) => {
  const { name, email, password, mobile, userType } = req.body;
  const errors = validationResult(req);

  // Validate request fields
  if (!errors.isEmpty()) {
    return res.status(422).json({
      ok: false,
      errorMessages: errors.array().map((e) => e.msg),
    });
  }

  try {
    // Basic required fields check
    if (!name || !password || !mobile || !userType) {
      return res.json({
        ok: false,
        errorMessages: ["All required fields must be provided"],
      });
    }

    const mobileStr = mobile.toString().trim();

    if (!/^01[0-9]{9}$/.test(mobileStr)) {
      return res.json({
        ok: false,
        errorMessages: ["Enter valid 11-digit mobile number (01XXXXXXXXX)"],
      });
    }

    // =========================
    // Guest → Direct Signup
    // =========================
    if (userType === "guest") {
      const exists = await User.findOne({ mobile: mobileStr, userType: "guest" });
      if (exists) {
        return res.json({ ok: false, errorMessages: ["Mobile already registered!"] });
      }

      const hashed = await bcrypt.hash(password, 12);

      const newUser = new User({
        name,
        mobile: mobileStr,
        password: hashed,
        userType,
        // ❌ No email for guest
      });

      await newUser.save();

      return res.json({
        ok: true,
        redirect: "/login",
        message: "Guest account created successfully",
      });
    }

    // =========================
    // Admin → OTP verification
    // =========================
    if (userType === "admin") {
      if (!email) {
        return res.json({ ok: false, errorMessages: ["Email is required for admin"] });
      }

      const exists = await User.findOne({ email, userType: "admin" });
      if (exists) {
        return res.json({ ok: false, errorMessages: ["Email already registered!"] });
      }

      const hashed = await bcrypt.hash(password, 12);
      const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

      // OTP always sent to main admin email
      const adminEmail = "info.fahim99@gmail.com";

      signupTokens.set(adminEmail, {
        code,
        data: { name, email, password: hashed, mobile: mobileStr, userType },
        expires: Date.now() + 10 * 60 * 1000, // 10 mins
      });

      // Send OTP email
      await transporter.sendMail({
        to: adminEmail,
        from: "info.fahim99@gmail.com",
        subject: "Admin Verification Code",
        html: `<h3>OTP for admin signup for user ${email}: <b>${code}</b></h3>`,
      });

      // Save pending info in session
      req.session.pendingEmail = adminEmail;
      req.session.pendingUserType = "admin";

      return res.json({
        ok: true,
        redirect: "/verify-email",
        message: "OTP sent to admin email",
      });
    }

    // Invalid user type
    return res.json({ ok: false, errorMessages: ["Invalid user type"] });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ ok: false, errorMessages: ["Server error"] });
  }
};



// GET verify email
const getVerifyEmail = (req, res) => {
  if (!req.session.pendingEmail) {
    return res.json({
      ok: false,
      redirect: "/signup",
    });
  }

  res.json({
    ok: true,
  });
};

const postVerifyEmail = async (req, res) => {
  const { code } = req.body;

  const pendingEmail = req.session.pendingEmail;
  const pendingUserType = req.session.pendingUserType;

  if (!pendingEmail || !pendingUserType) {
    return res.json({ ok: false, redirect: "/signup", errorMessages: ["No pending signup found"] });
  }

  const tokenData = signupTokens.get(pendingEmail);

  if (!tokenData) {
    return res.json({ ok: false, redirect: "/signup", errorMessages: ["OTP expired or invalid"] });
  }

  if (Date.now() > tokenData.expires) {
    signupTokens.delete(pendingEmail);
    return res.json({ ok: false, redirect: "/signup", errorMessages: ["OTP expired, please try again"] });
  }

  if (tokenData.code !== code) {
    return res.json({ ok: false, errorMessages: ["Invalid OTP"] });
  }

  try {
    // OTP verified, create admin user
    const userData = tokenData.data;

    const newUser = new User({
      name: userData.name,
      email: userData.email, // only admin
      password: userData.password, // hashed
      mobile: userData.mobile,
      userType: userData.userType,
    });

    await newUser.save();

    signupTokens.delete(pendingEmail);
    req.session.pendingEmail = null;
    req.session.pendingUserType = null;

    return res.json({
      ok: true,
      redirect: "/login",
      message: "Admin account created successfully",
    });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ ok: false, errorMessages: ["Server error"] });
  }
};


// Function to get current logged-in user
const getCurrentUser = (req, res) => {
  if (!req.session.user) {
    return res.json({ success: false, user: null });
  }
  res.json({ success: true, user: req.session.user });
};

const isLoggedIn = (req, res, next) => {
  if (!req.session.isLoggedIn || !req.session.user) {
    return res.status(401).json({ ok: false, redirect: "/login" });
  }
  next();
};

module.exports = {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
  isAdmin,
  isGuest,
  isLoggedIn,
  getForgotPassword,
  postForgotPassword,
  getResetPassword,
  postResetPassword,
  postSignupWithVerification,
  getVerifyEmail,
  postVerifyEmail,
  getCurrentUser,
};

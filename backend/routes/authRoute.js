const express = require("express");
const {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
  getForgotPassword,
  postForgotPassword,
  getResetPassword,
  postResetPassword,
  getVerifyEmail,
  postVerifyEmail,
  postSignupWithVerification,
  getCurrentUser
} = require("../controller/authControl");

const authRoute = express.Router();

authRoute.get("/login", getLogin);
authRoute.post("/login", postLogin);
authRoute.post("/logout", postLogout);
authRoute.get("/forgot-password", getForgotPassword);
authRoute.post("/forgot-password", postForgotPassword);
authRoute.get("/reset-password/:token", getResetPassword);
authRoute.post("/reset-password", postResetPassword);
authRoute.get("/signup", getSignup);
// authRoute.post("/signup", postSignupWithVerification);
authRoute.post("/signup-with-verification", postSignupWithVerification); 
authRoute.get("/verify-email", getVerifyEmail);
authRoute.post("/verify-email", postVerifyEmail);
authRoute.get("/me", getCurrentUser);

exports.authRoute = authRoute;

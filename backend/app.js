require("dotenv").config(); // ✅ Load .env variables

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const cors = require("cors");
const { checkOffers } = require("./controller/adminControl");

const rootDir = require("./utils/rootdir");
const { storeRoute } = require("./routes/storeRoute");
const { adminRoute } = require("./routes/adminRoute");
const { authRoute } = require("./routes/authRoute");
const { isAdmin, isGuest } = require("./controller/authControl");

// ✅ Use .env for MongoDB, PORT, and session secret
const database_path = process.env.MONGO_URI;
const port = process.env.PORT || 3000;
const sessionSecret = process.env.SESSION_SECRET;
const frontendURL = process.env.FRONTEND_URL;

const app = express();

// ✅ Random string helper
const randomString = (length) => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// ✅ CORS for React frontend
app.use(
  cors({
    origin: frontendURL,
    credentials: true,
  })
);

// ✅ View engine & parsing
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Static folders
app.use(express.static(path.join(rootDir, "public")));
app.use("/uploads", express.static(path.join(rootDir, "uploads")));

// ✅ Session store
const store = new MongoDBStore({
  uri: database_path,
  collection: "sessions",
});

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// ✅ Attach user to req
app.use((req, res, next) => {
  req.isLoggedIn = !!req.session.user;
  req.user = req.session.user || null;
  next();
});

// ✅ API Routes
app.use("/api/auth", authRoute);
app.use("/api/store", storeRoute);
app.use(
  "/api/admin",
  (req, res, next) => {
    if (!req.isLoggedIn)
      return res.status(401).json({ message: "Unauthorized" });
    if (req.user.userType !== "admin")
      return res.status(403).json({ message: "Forbidden" });
    next();
  },
  adminRoute
);

// ✅ Fallback for 404
app.use((req, res, next) => {
  res.status(404).json({
    ok: false,
    message: "Route not found",
    isLoggedIn: req.isLoggedIn,
    user: req.user,
  });
});

// ✅ Connect MongoDB and start server
mongoose.connect(database_path).then(() => {
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });

  checkOffers();
  setInterval(checkOffers, 60 * 60 * 1000);
});
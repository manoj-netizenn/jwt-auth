const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
dotenv.config();


const port = process.env.PORT || 3000;
const url = process.env.MONGO_URI||"mongodb://localhost:27017/userAuthDB";
mongoose
  .connect(url)
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    app.listen(port, () => {
      console.log(`listening on ${port}`);
    });
  });
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: {
    type: String,
    default: "user",
  },
});

const User = mongoose.model("User", userSchema);

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies ? req.cookies.token : null;
    if (!token) {
      return res.redirect("/login");
    }

    const decoded = jwt.verify(token, "anykey");
    req.userData = decoded;
    next();
  } catch (err) {
    return res.redirect("/login");
  }
};

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z_]{4,}$/;
  return usernameRegex.test(username);
};

const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!validateUsername(username)) {
    return res.status(400).send("Username did not meet criteria");
  }

  if (!validatePassword(password)) {
    return res.status(400).send("invalid password");
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).send("Username already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    username,
    password: hashedPassword,
  });
  res.redirect("/login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  // Find the user in the db
  const userFound = await User.findOne({
    username,
  });
  if (userFound && (await bcrypt.compare(password, userFound.password))) {
    const token = jwt.sign(
      {
        username: userFound.username,
        role: userFound.role,
      },
      "anykey",
      {
        expiresIn: "3d",
      }
    );
    res.cookie("token", token, {
      maxAge: 3 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.redirect("/dashboard");
  } else {
    res.send("Invalid login credentials");
  }
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  const username = req.userData ? req.userData.username : null;
  if (username) {
    res.render("dashboard", { username });
  }
  res.redirect("/login");
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");

  res.redirect("/login");
});

app.get("/forgot-password", (req, res) => {
  res.render("forgot-password");
});

app.post("/forgot-password", async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.send("User not found");
  }

  const resetToken = jwt.sign({ username: user.username }, "reset-secret-key", {
    expiresIn: "1h",
  });

  res.redirect(`/reset-password/${resetToken}`);
});

app.get("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  res.render("reset-password", { token });
});

app.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).send("Passwords do not match");
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).send("error password did not meet the criteria");
  }

  try {
    const decoded = jwt.verify(token, "reset-secret-key");
    const user = await User.findOne({ username: decoded.username });

    if (!user) {
      return res.send("Invalid reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      { username: decoded.username },
      { password: hashedPassword }
    );

    res.redirect("/login");
  } catch (error) {
    res.send("Invalid or expired reset token");
  }
});

app.listen(port, console.log("The server is running"));

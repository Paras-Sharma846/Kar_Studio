const User = require("../models/users");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const {verifyToken} = require("../utils/token")
const { generateToken } = require("../utils/token");
const { sendEmail } = require("../utils/sendEmail");

const validateEmailFormat = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
// Register User
module.exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate email format
    if (!validateEmailFormat(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if user with the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Check if password is at least 6 characters
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create a new user instance
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    // Save the user to the database
    const token = generateToken(user._id);
    await user.save();

    res.status(201).json({ message: "User registered successfully", user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login User
module.exports.loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body; 

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const expiresIn = rememberMe === true ? '30d' : '1h';

    const token = generateToken(user._id, expiresIn);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// forget-password
module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = generateToken(user._id, '1h'); 

    const resetLink = `http://frontendurl.com/reset-password?token=${resetToken}`;
    const emailSubject = "Password Reset Request";
    const emailBody = `Click here to reset your password: <a href="${resetLink}">${resetLink}</a>`;

    await sendEmail(user.email, emailSubject, emailBody);

    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// reset-password
module.exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const decoded = verifyToken(token); 
    const userId = decoded.id;
    console.log(userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password successfully reset" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

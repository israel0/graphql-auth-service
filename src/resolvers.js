const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  users: async () => {
    try {
      const users = await User.find();
      return users.map((user) => {
        return {
          ...user._doc,
          password: null, // Remove password from the response
          _id: user.id,
        };
      });
    } catch (err) {
      throw err;
    }
  },
  createUser: async ({ userInput }) => {
    const { name, email, password } = userInput;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User with this email already exists");
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        name,
        email,
        password: hashedPassword,
      });
      const savedUser = await user.save();
      return {
        ...savedUser._doc,
        password: null,
        _id: savedUser.id,
      };
    } catch (err) {
      throw err;
    }
  },
  loginUser: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET, // Use your own secret key
        { expiresIn: "1h" } // Token expires in 1 hour
      );
      return {
        user: {
          ...user._doc,
          password: null,
          _id: user.id,
        },
        token,
      };
    } catch (err) {
      throw err;
    }
  },
};

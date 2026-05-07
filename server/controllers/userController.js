const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);

const profilePicture = req.file ? `/uploads/${req.file.filename}` : '/uploads/default.png';


    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      profilePicture
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // res.status(201).json({ user: newUser, token });
 const sanitizedUser = {
  _id: newUser._id,
  username: newUser.username,
  email: newUser.email,
  profilePicture: newUser.profilePicture,
  createdAt: newUser.createdAt,
};

res.status(201).json({ user: sanitizedUser, token });


  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

 const sanitizedUser = {
  _id: user._id,
  username: user.username,
  email: user.email,
  profilePicture: user.profilePicture,
  createdAt: user.createdAt,
};

res.status(200).json({ user: sanitizedUser, token });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get logged in user profile
exports.getUserProfile = async (req, res) => {
  const user = req.user;
  res.status(200).json(user);
};

// Update user profile
// exports.updateUserProfile = async (req, res) => {
//   const user = await User.findById(req.user._id);

//   if (user) {
//     user.username = req.body.username || user.username;
//     user.email = req.body.email || user.email;
//     // user.profilePicture = req.body.profilePicture || user.profilePicture;
//     if (req.file) {
//   user.profilePicture = `/uploads/${req.file.filename}`;
// } else if (req.body.profilePicture) {
//   user.profilePicture = req.body.profilePicture;
// }


//     if (req.body.password) {
//       user.password = await bcrypt.hash(req.body.password, 12);
//     }

//     const updatedUser = await user.save();

//     const token = jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, {
//       expiresIn: '7d',
//     });

//    const sanitizedUser = {
//   _id: updatedUser._id,
//   username: updatedUser.username,
//   email: updatedUser.email,
//   profilePicture: updatedUser.profilePicture,
//   createdAt: updatedUser.createdAt,
// };

// res.json({ user: sanitizedUser, token });

//   } else {
//     res.status(404).json({ message: 'User not found' });
//   }
// };

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;

      if (req.file) {
        user.profilePicture = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await user.save();

      res.json({
        message: 'Profile updated successfully',
        updatedUser, // 👈 Send this to frontend
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

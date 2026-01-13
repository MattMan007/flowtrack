const User = require('../models/User');
const Organization = require('../models/Organization');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { name, email, password, organizationName } = req.body;

    if (!name || !email || !password || !organizationName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const slug = organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const existingOrg = await Organization.findOne({ slug });
    
    let organization;
    if (existingOrg) {
      const randomSuffix = Math.floor(Math.random() * 10000);
      organization = await Organization.create({
        name: organizationName,
        slug: `${slug}-${randomSuffix}`
      });
    } else {
      organization = await Organization.create({
        name: organizationName,
        slug
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      organizationId: organization._id,
      role: 'admin'
    });

    const token = generateToken(user._id, organization._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: organization._id,
          organizationName: organization.name
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating account',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const organization = await Organization.findById(user.organizationId);

    const token = generateToken(user._id, user.organizationId);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          organizationName: organization.name
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const organization = await Organization.findById(user.organizationId);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          organizationName: organization.name
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};


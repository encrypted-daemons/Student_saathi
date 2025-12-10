const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const sendToken = (user, statusCode, res, message) => {
  const token = user.getSignedJwtToken();
  
  const userData = {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      providerDetails: user.providerDetails, 
      studentProfile: user.studentProfile,  
      profilePic: user.profilePic
  };
  
  successResponse(res, message, { token, user: userData }, statusCode);
};

exports.register = async (req, res) => {
  try {
    const { 
        name, phone, password, role, 
        providerCategory, businessName,
        dob, gender, caste,
        state, district, hometown,
        college, course, year,
        diet, smoking, drinking, relationshipStatus
    } = req.body;

    const userExists = await User.findOne({ phone });
    if (userExists) {
      return errorResponse(res, 'Phone number already registered', 400);
    }

    let userData = {
        name, phone, password, role: role || 'student'
    };

    if (role === 'provider') {
        if (!providerCategory) return errorResponse(res, 'Provider Category is required', 400);
        userData.providerDetails = {
            category: providerCategory,
            businessName: businessName || name, 
            isVerified: false
        };
    }
    
    if (role === 'student') {
        userData.studentProfile = {
            dob, gender, caste,
            address: { state, district, hometown },
            college, course, year,
            habits: { diet, smoking, drinking },
            relationshipStatus
        };
    }

    const user = await User.create(userData);
    sendToken(user, 201, res, 'Registration Successful');

  } catch (error) {
    console.error(error);
    errorResponse(res, error.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) return errorResponse(res, 'Please provide phone and password', 400);

    const user = await User.findOne({ phone }).select('+password');

    if (!user || !(await user.matchPassword(password))) return errorResponse(res, 'Invalid credentials', 401);

    sendToken(user, 200, res, 'Login Successful');

  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        successResponse(res, 'User Profile Fetched', user);
    } catch (error) {
        errorResponse(res, error.message);
    }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return errorResponse(res, 'User not found', 404);

    const updates = req.body;

    if (updates.name) user.name = updates.name;
    if (updates.phone) user.phone = updates.phone;
    if (updates.profilePic) user.profilePic = updates.profilePic;

    if (user.role === 'student' && updates.studentProfile) {
        const currentProfile = user.studentProfile ? user.studentProfile.toObject() : {};
        const incoming = updates.studentProfile;
        const newAddress = {
            ...(currentProfile.address || {}),
            ...(incoming.address || {}),
            ...(incoming.state && { state: incoming.state }),
            ...(incoming.district && { district: incoming.district }),
            ...(incoming.hometown && { hometown: incoming.hometown }),
        };

        user.studentProfile = {
            ...currentProfile,
            ...incoming,
            address: newAddress, 
            habits: { ...(currentProfile.habits || {}), ...(incoming.habits || {}) }
        };
    }
    
    if (user.role === 'provider' && updates.providerDetails) {
        user.providerDetails = {
            ...(user.providerDetails ? user.providerDetails.toObject() : {}),
            ...updates.providerDetails
        };
    }

    await user.save();
    
    const userData = {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        providerDetails: user.providerDetails,
        details: user.role === 'student' ? user.studentProfile : user.providerDetails,
        profilePic: user.profilePic
    };

    successResponse(res, 'Profile Updated Successfully! ✨', { user: userData });

  } catch (error) {
    console.error("Update Error:", error);
    errorResponse(res, error.message, 500);
  }
};
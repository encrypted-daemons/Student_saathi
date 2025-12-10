const User = require('../models/User');
const Requirement = require('../models/Requirement');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Post a Roommate Ad
// @route   POST /api/roommates/post-ad
exports.postRequirement = async (req, res) => {
  try {
    const requirement = await Requirement.create({
      user: req.user.id,
      ...req.body
    });
    successResponse(res, 'Requirement Posted! Matching shuru... 🔍', requirement);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Find Matches (Algorithm)
// @route   GET /api/roommates/find-matches
exports.findMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser.studentProfile) {
        return errorResponse(res, 'Pehle apni student profile complete karein', 400);
    }

    // 1. Find Active Requirements (Dusron ke ads)
    // Filter: Same City & Gender is MANDATORY
    const othersAds = await Requirement.find({
        city: currentUser.studentProfile.address.district || 'Indore', // Default city fallback
        'preferences.gender': currentUser.studentProfile.gender,
        isActive: true,
        user: { $ne: currentUser._id } // Khud ka ad mat dikhao
    }).populate('user'); // User details bhi lao

    // 2. Calculate Match Score Logic
    const matches = othersAds.map(ad => {
        const otherUser = ad.user;
        let score = 0;
        let matchReasons = [];

        if (!otherUser || !otherUser.studentProfile) return null;

        // A. Academic Match (30 Points)
        if (otherUser.studentProfile.college === currentUser.studentProfile.college) {
            score += 20;
            matchReasons.push('Same College 🎓');
            if (otherUser.studentProfile.course === currentUser.studentProfile.course) {
                score += 10;
            }
        }

        // B. Roots Match (20 Points) - State/Hometown
        if (otherUser.studentProfile.address.state === currentUser.studentProfile.address.state) {
            score += 15;
            matchReasons.push('Same State 🏠');
            if (otherUser.studentProfile.address.district === currentUser.studentProfile.address.district) {
                score += 5;
                matchReasons.push('Same District');
            }
        }

        // C. Habits Match (30 Points) - Nasha & Khana
        if (otherUser.studentProfile.habits.smoking === currentUser.studentProfile.habits.smoking) {
            score += 15;
        } else if (currentUser.studentProfile.habits.smoking === 'No' && otherUser.studentProfile.habits.smoking === 'Yes') {
             score -= 50; // Deal Breaker! (Non-smoker ke sath Smoker nahi)
        }

        if (otherUser.studentProfile.habits.diet === currentUser.studentProfile.habits.diet) {
            score += 15;
            matchReasons.push(`${currentUser.studentProfile.habits.diet} Food Buddy 🥘`);
        }

        if (score > 100) score = 100;
        if (score < 0) score = 0;

        return {
            _id: ad._id,
            matchPercentage: score,
            reasons: matchReasons,
            details: ad,
            userProfile: {
                name: otherUser.name,
                college: otherUser.studentProfile.college,
                year: otherUser.studentProfile.year,
                hometown: otherUser.studentProfile.address.hometown,
                pic: otherUser.profilePic
            }
        };
    }).filter(item => item !== null);

    matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    successResponse(res, `${matches.length} potential roommates mile!`, matches);

  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};
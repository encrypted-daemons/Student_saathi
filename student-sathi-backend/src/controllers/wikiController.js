const Wiki = require('../models/Wiki');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Add City Info (Admin Only)
// @route   POST /api/wiki
exports.addWikiInfo = async (req, res) => {
  try {
    // Sirf Admin hi city info add kar sakta hai
    // (Provider ya Student nahi)
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Sirf Admin hi City Guide update kar sakta hai', 403);
    }

    const info = await Wiki.create({
      ...req.body,
      addedBy: req.user.id
    });

    successResponse(res, 'Information Add Ho Gayi! 📘', info, 201);

  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Get City Info (Public)
// @route   GET /api/wiki
exports.getWikiInfo = async (req, res) => {
  try {
    const { category, city } = req.query;
    
    let query = {};
    
    // Agar city di hai to filter karo, warna default Indore (ya jo DB me ho)
    if (city) query.city = { $regex: city, $options: 'i' };
    
    // Agar category maangi hai (e.g. sirf Transport)
    if (category) query.category = category;

    const infoList = await Wiki.find(query).sort({ title: 1 });

    successResponse(res, `${infoList.length} jaankari mili`, infoList);

  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};
const MarketplaceItem = require('../models/MarketplaceItem');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.sellItem = async (req, res) => {
  try {
    const { lat, lng, address, ...bodyData } = req.body;

    const itemData = {
      ...bodyData,
      seller: req.user.id,
      // Map Location 
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng || 75.8577), parseFloat(lat || 22.7196)], // Default if missing
        addressText: address
      }
    };

    const item = await MarketplaceItem.create(itemData);
    successResponse(res, 'Item Listed Successfully! 🛍️', item, 201);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

exports.getItems = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, keyword } = req.query;
    let query = { isSold: false };

    if (category) query.category = category;
    if (keyword) query.title = { $regex: keyword, $options: 'i' };
    
    const items = await MarketplaceItem.find(query)
      .populate('seller', 'name phone profilePic studentProfile') // Seller ki college details bhi chahiye
      .sort({ createdAt: -1 });

    successResponse(res, 'Items fetched', items);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

exports.getItemById = async (req, res) => {
    try {
        const item = await MarketplaceItem.findById(req.params.id)
            .populate('seller', 'name phone profilePic studentProfile');
        
        if (!item) return errorResponse(res, 'Item not found', 404);
        
        item.views += 1;
        await item.save();

        successResponse(res, 'Item Details', item);
    } catch (e) { errorResponse(res, e.message, 500); }
};

exports.markAsSold = async (req, res) => {
    try {
        await MarketplaceItem.findByIdAndUpdate(req.params.id, { isSold: true });
        successResponse(res, 'Item marked as Sold');
    } catch (e) { errorResponse(res, e.message); }
};
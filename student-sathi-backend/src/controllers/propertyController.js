const Property = require('../models/Property');
const Issue = require('../models/Issue');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const sendNotification = require('../utils/notificationHelper');

exports.addProperty = async (req, res) => {
  try {
    if (req.user.role !== 'provider' && req.user.role !== 'admin') {
      return errorResponse(res, 'Only Providers can list properties', 403);
    }

    const { lat, lng, ...bodyData } = req.body;

    if (!lat || !lng) {
        return errorResponse(res, 'Location is required', 400);
    }

    const propertyData = {
      ...bodyData,
      owner: req.user.id,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)] // [Lng, Lat]
      }
    };

    const property = await Property.create(propertyData);

    // Notify Owner
    const io = req.app.get('io');
    sendNotification(io, req.user.id, 'Property Listed! 🏠', `"${property.title}" is now live.`, 'success');

    successResponse(res, 'Property Listed Successfully!', property, 201);
  } catch (error) {
    console.error("Add Property Error:", error);
    errorResponse(res, error.message, 500);
  }
};

// 2. Get All Properties (Public Search with Filters)
exports.getProperties = async (req, res) => {
  try {
    const { 
      type, gender, minRent, maxRent, city,
      amenities, lat, lng, radius 
    } = req.query;

    let query = {};

    if (city) query.city = { $regex: city, $options: 'i' };
    if (type) query.type = type;
    if (gender) query.genderPreference = { $in: [gender, 'Any'] };

    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = parseInt(minRent);
      if (maxRent) query.rent.$lte = parseInt(maxRent);
    }

    if (amenities) {
        const list = amenities.split(',');
        list.forEach(a => { query[`amenities.${a}`] = true; });
    }

    if (lat && lng) {
      const distanceInMeters = (radius || 50) * 1000;
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: distanceInMeters
        }
      };
    }

    const properties = await Property.find(query)
      .populate('owner', 'name phone trustScore providerDetails')
      .sort({ createdAt: -1 });

    // Safe GeoJSON to Flat conversion for frontend
    const safeProperties = properties.map(p => {
        const doc = p.toObject();
        if(doc.location?.coordinates) {
            doc.location.lng = doc.location.coordinates[0];
            doc.location.lat = doc.location.coordinates[1];
        }
        return doc;
    });

    successResponse(res, 'Properties Fetched', safeProperties);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
        .populate('owner', 'name phone trustScore providerDetails');

    if (!property) return errorResponse(res, 'Not Found', 404);
    
    property.views = (property.views || 0) + 1;
    await property.save();

    successResponse(res, 'Details Fetched', property);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

exports.getMyProperties = async (req, res) => {
    try {
        const properties = await Property.find({ owner: req.user.id }).sort({ createdAt: -1 });
        successResponse(res, 'My Listings', properties);
    } catch (e) { errorResponse(res, e.message); }
};

exports.getProviderStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const properties = await Property.find({ owner: userId });
    
    const totalListings = properties.length;
    const totalViews = properties.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalRent = properties.reduce((acc, curr) => acc + (curr.rent || 0), 0);
    
    let activeIssues = 0;
    try {
        activeIssues = await Issue.countDocuments({ owner: userId, status: 'Open' });
    } catch(e) { activeIssues = 0; }

    res.json({
      success: true,
      data: { totalListings, totalViews, totalRent, activeIssues }
    });
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// 6. Update Property
exports.updateProperty = async (req, res) => {
    try {
        let property = await Property.findById(req.params.id);
        if(!property) return errorResponse(res, 'Not found', 404);
        
        if(property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return errorResponse(res, 'Access Denied', 403);
        }

        // GeoJSON Handling for Update
        if (req.body.lat && req.body.lng) {
            req.body.location = {
                type: 'Point',
                coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)]
            };
        }

        property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
        successResponse(res, 'Updated Successfully', property);
    } catch (e) { errorResponse(res, e.message); }
};

// 7. Delete Property
exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if(!property) return errorResponse(res, 'Not found', 404);
        if(property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return errorResponse(res, 'Access Denied', 403);
        }
        
        await property.deleteOne();
        successResponse(res, 'Deleted Successfully');
    } catch (e) { errorResponse(res, e.message); }
};
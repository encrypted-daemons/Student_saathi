const Service = require('../models/Service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Add New Service
exports.addService = async (req, res) => {
  try {
    if (req.user.role !== 'provider' && req.user.role !== 'admin') {
      return errorResponse(res, 'Only Providers can add services', 403);
    }

    const { lat, lng, ...bodyData } = req.body;

    const serviceData = {
      ...bodyData,
      provider: req.user.id,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      }
    };

    const service = await Service.create(serviceData);
    successResponse(res, 'Service Listed Successfully! 🎉', service, 201);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// 👇 YE MISSING THA - ISE ADD KARO (Provider Dashboard ke liye)
exports.getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user.id }).sort({ createdAt: -1 });
    successResponse(res, 'My Services Fetched', services);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// 👇 YE BHI ADD KARO (Dashboard Stats ke liye)
exports.getServiceStats = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user.id });
    res.json({
        success: true,
        data: {
            totalListings: services.length,
            avgRating: 0,
            specificStat: { label: 'Views', value: 0 }
        }
    });
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Get All Services (With Deep Filters)
exports.getServices = async (req, res) => {
  try {
    const { 
      category, city, lat, lng, radius,
      exam, demo, secondHand, printRate, route, vehicle
    } = req.query;

    let query = {};

    if (category) query.category = category;
    if (city) query.city = { $regex: city, $options: 'i' };

    if (category === 'Coaching') {
        if (exam) query['coachingDetails.exams'] = { $in: [new RegExp(exam, 'i')] };
        if (demo === 'true') query['coachingDetails.isDemoAvailable'] = true;
    }

    if (category === 'Stationery') {
        if (secondHand === 'true') query['stationeryDetails.sellsSecondHand'] = true;
        if (printRate) query['stationeryDetails.printingRate'] = { $lte: parseFloat(printRate) };
    }

    if (category === 'Transport') {
        if (route) query['transportDetails.routes'] = { $in: [new RegExp(route, 'i')] };
        if (vehicle) query['transportDetails.vehicleType'] = vehicle;
    }

    if (category === 'Mess') {
        if (req.query.messType) query['messDetails.type'] = req.query.messType;
    }

    if (lat && lng) {
      const distanceInMeters = (radius || 5) * 1000;
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: distanceInMeters
        }
      };
    }

    const services = await Service.find(query)
      .populate('provider', 'name phone providerDetails')
      .sort({ rating: -1 });

    successResponse(res, `Found ${services.length} services`, services);

  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

exports.getServiceById = async (req, res) => {
  try {
    // 👇 CHANGE: 'providerDetails' add kiya taaki Verification status mile
    const service = await Service.findById(req.params.id)
        .populate('provider', 'name phone providerDetails profilePic'); 
        
    if (!service) return errorResponse(res, 'Not Found', 404);
    
    // View Count Badhao
    service.views = (service.views || 0) + 1;
    await service.save();

    successResponse(res, 'Details Fetched', service);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

exports.updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) return errorResponse(res, 'Service not found', 404);

    if (service.provider.toString() !== req.user.id.toString()) {
      return errorResponse(res, 'Access Denied', 403);
    }

    if (req.body.details) {
        service.details = { ...service.details, ...req.body.details };
    }
    
    if (req.body.description) service.description = req.body.description;
    if (req.body.isActive !== undefined) service.isActive = req.body.isActive;
    if (req.body.plans) service.plans = req.body.plans; // Added plans update

    await service.save();
    successResponse(res, 'Updated Successfully! ✅', service);

  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return errorResponse(res, 'Service not found', 404);
    }

    // Check Ownership (Koi aur kisi ki service delete na kar de)
    if (service.provider.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Access Denied: You do not own this service', 403);
    }

    await service.deleteOne();
    
    successResponse(res, 'Service Deleted Successfully ✅');

  } catch (error) {
    console.error("Delete Error:", error);
    errorResponse(res, error.message, 500);
  }
};
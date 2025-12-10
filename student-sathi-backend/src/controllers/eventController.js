const Event = require('../models/Event');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.createEvent = async (req, res) => {
  try {
    
    const { lat, lng, foodStatus, crowdStatus, ...bodyData } = req.body;

    if (!lat || !lng) {
        return errorResponse(res, 'Location map par select karna zaroori hai', 400);
    }

    const eventData = {
      ...bodyData,
      organizer: req.user.id,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      isStudentEvent: req.user.role === 'student',
      foodStatus: foodStatus || 'N/A',
      crowdStatus: crowdStatus || 'Thodi Bheed 🚶'
    };

    const event = await Event.create(eventData);
    
    successResponse(res, 'Event Live ho gaya! Sabko bata diya. 📢', event, 201);

  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { category, isFree, lat, lng, radius, date, type } = req.query;
    
    let query = {};

    if (date) {
        const queryDate = new Date(date);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        query.date = { $gte: queryDate, $lt: nextDay };
    } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        query.date = { $gte: yesterday };
    }

    if (category) query.category = category;
    if (isFree === 'true') query.isFree = true;
    if (type === 'student') query.isStudentEvent = true;
    if (type === 'official') query.isStudentEvent = false;

    // Location Search
    if (lat && lng) {
      const distanceInMeters = (radius || 10) * 1000;
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: distanceInMeters
        }
      };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name role') 
      .sort({ date: 1 });

    successResponse(res, `${events.length} events mile`, events);

  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

exports.joinEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if(!event) return errorResponse(res, 'Event not found', 404);

        event.goingCount += 1;
        await event.save();

        successResponse(res, 'Plan Confirm! Maza aayega. 👍');
    } catch (error) {
        errorResponse(res, error.message, 500);
    }
};

exports.updateStatus = async (req, res) => {
  try {
    const { foodStatus, crowdStatus } = req.body;
    
    // Validate input
    if (!foodStatus && !crowdStatus) {
        return errorResponse(res, 'No status provided to update', 400);
    }

    const event = await Event.findById(req.params.id);
    if (!event) return errorResponse(res, 'Event not found', 404);
    if (foodStatus) event.foodStatus = foodStatus;
    if (crowdStatus) event.crowdStatus = crowdStatus;

    await event.save();

    
    successResponse(res, 'Status Updated ✅', event);
  } catch (error) {
    console.error("Event Update Error:", error);
    errorResponse(res, error.message, 500);
  }
};
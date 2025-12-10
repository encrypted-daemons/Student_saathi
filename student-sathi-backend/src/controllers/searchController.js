const Property = require('../models/Property');
const Service = require('../models/Service');
const MarketplaceItem = require('../models/MarketplaceItem');
const Event = require('../models/Event');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query; 

    if (!q || q.length < 2) {
        return successResponse(res, 'Search term too short', []);
    }

    const regex = { $regex: q, $options: 'i' }; 
    const properties = await Property.find({
        $or: [{ title: regex }, { address: regex }, { type: regex }, { city: regex }]
    }).select('title type address _id').limit(3);

    const services = await Service.find({
        $or: [
            { name: regex }, 
            { category: regex }, 
            { 'transportDetails.vehicleType': regex }
        ]
    }).select('name category address _id').limit(3);

    const items = await MarketplaceItem.find({
        $or: [{ title: regex }, { category: regex }],
        isSold: false
    }).select('title price category _id').limit(3);

    const events = await Event.find({
        $or: [{ title: regex }, { category: regex }]
    }).select('title date _id').limit(3);

    const results = [
        ...properties.map(p => ({ 
            id: p._id, 
            title: p.title, 
            subtitle: `Room in ${p.address}`, 
            type: 'Room', 
            link: `/student/property/${p._id}` 
        })),
        
        ...services.map(s => ({ 
            id: s._id, 
            title: s.name, 
            subtitle: s.category, 
            type: s.category, 
            link: s.category === 'Transport' ? `/student/transport/${s._id}` : `/student/service/${s._id}`
        })),

        ...items.map(i => ({ 
            id: i._id, 
            title: i.title, 
            subtitle: `₹${i.price}`, 
            type: 'Bazaar', 
            link: `/student/marketplace/${i._id}` 
        })),

        ...events.map(e => ({ 
            id: e._id, 
            title: e.title, 
            subtitle: 'Event', 
            type: 'Event', 
            link: '/student/events' 
        }))
    ];

    successResponse(res, `Found ${results.length} results`, results);

  } catch (error) {
    console.error("Search Error:", error);
    errorResponse(res, error.message, 500);
  }
};
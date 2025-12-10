const mongoose = require('mongoose');

const wikiSchema = new mongoose.Schema({
  city: { 
    type: String, 
    required: true, 
    trim: true,
    default: 'Indore' // Default city
  },
  
  // Kis tarah ki jaankari hai?
  category: {
    type: String,
    enum: ['Transport', 'Emergency', 'Hangout Spots', 'Govt Schemes', 'Cheap Markets'],
    required: true
  },

  title: { 
    type: String, 
    required: true 
  }, // e.g. "iBus Route: Bhanwarkuan to Railway Station"

  description: { type: String },

  // 👇 Flexible Data (Har category ke liye alag)
  data: {
    // For Transport
    stops: [String],      // ["Rajiv Gandhi", "Palasia", "Station"]
    fare: String,         // "₹10 - ₹20"
    timings: String,      // "6 AM - 11 PM"

    // For Emergency/Markets
    contactNumber: String,
    location: {
        lat: Number,
        lng: Number,
        address: String
    },

    // For Schemes
    websiteLink: String,
    eligibility: String
  },

  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, { timestamps: true });

module.exports = mongoose.model('Wiki', wikiSchema);
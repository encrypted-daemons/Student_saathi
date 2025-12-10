const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // --- 1. Basic Info ---
  category: {
    type: String,
    // 👇 Updated Categories
    enum: ['Mess', 'Library', 'Coaching', 'Stationery', 'Transport'],
    required: true
  },
  name: { type: String, required: true, trim: true },
  description: { type: String },
  contactNumber: { type: String, required: true },
  
  // --- 2. Location ---
  address: { type: String, required: true },
  city: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }
  },

  // --- 3. Pricing Plans (Common for all) ---
  plans: [{
    title: String,        // e.g. "Jee Batch", "Monthly Pass"
    price: Number,        // e.g. 25000
    duration: String,     // e.g. "Yearly", "Monthly"
    features: [String]    // e.g. ["Notes Included", "Pick & Drop"]
  }],

  // ==================================================
  // 👇 CATEGORY SPECIFIC DETAILS (GROUND REALITY) 👇
  // ==================================================

  // A. Mess Details
  messDetails: {
    type: { type: String, enum: ['Pure Veg', 'Veg/Non-Veg', 'Jain Available'] },
    serviceType: { type: String, enum: ['Dine-in Only', 'Delivery Only', 'Both'] },
    isTrialAvailable: { type: Boolean, default: false },
    specialMenu: { type: String }
  },

  // B. Library Details
  libraryDetails: {
    totalSeats: Number,
    amenities: {
      ac: { type: Boolean, default: false },
      wifi: { type: Boolean, default: true },
      locker: { type: Boolean, default: false },
      discussionRoom: { type: Boolean, default: false }
    },
    timings: { type: String, default: "8 AM - 10 PM" },
    isOpen24x7: { type: Boolean, default: false }
  },

  // C. Coaching Details (New) 🎓
  coachingDetails: {
    exams: [String], // e.g. ['JEE', 'NEET', 'UPSC', 'MCA Entrance']
    subjects: [String], // e.g. ['Maths', 'Physics', 'Coding']
    batchSize: { type: String, enum: ['Small (<20)', 'Medium (20-50)', 'Large (50+)'] },
    isDemoAvailable: { type: Boolean, default: true }, // Sabse zaroori sawal
    facility: {
      ac: Boolean,
      onlineBackup: Boolean, // Agar class chhut gayi to recording milegi?
      printedNotes: Boolean
    }
  },

  // D. Stationery/Book Store (New) 📚
  stationeryDetails: {
    services: {
      photocopy: Boolean,
      printout: Boolean,
      binding: Boolean,
      projectMaking: Boolean // Practical file banwane ke liye
    },
    printingRate: { type: Number }, // e.g. ₹1 per page (Sasta dhoondne ke liye)
    sellsSecondHand: { type: Boolean, default: false } // Seniors ki books
  },

  // E. Transport/Auto/Van (New) 🚌
  transportDetails: {
    vehicleType: { type: String, enum: ['Auto Rickshaw', 'Magic Van', 'Bus', 'Bike Pool'] },
    routes: [String], // e.g. ["Bhawarkuan to Medicaps", "Vijay Nagar to IPS"]
    seatsAvailable: Number,
    isLadiesSpecial: { type: Boolean, default: false } // Safety feature for girls
  },

  // --- Common Media & Rating ---
  images: [String],
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
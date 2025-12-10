const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Kya dhoondh rahe ho?
  lookingFor: {
    type: String,
    enum: ['Roommate', 'Flatmate', 'Room'], // Roommate (Ek room me), Flatmate (Alag room same flat)
    required: true
  },

  // Budget Range
  budget: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },

  // Location Preference
  preferredArea: { type: String, required: true }, // e.g. "Near Madicaps"
  city: { type: String, required: true },

  // Specific Preferences (Jo profile se alag ho sakti hain)
  preferences: {
    gender: { type: String, enum: ['Male', 'Female', 'Any'], required: true },
    diet: { type: String, enum: ['Veg Only', 'Non-Veg Allowed', 'Any'], default: 'Any' },
    smoking: { type: String, enum: ['Strictly No', 'Okay', 'Any'], default: 'Strictly No' },
    sameCollege: { type: Boolean, default: false } // Kya same college ka banda chahiye?
  },

  description: { type: String }, // "Mujhe padhai karne wala shaant roommate chahiye"
  
  isActive: { type: Boolean, default: true } // Ad chalu hai ya band

}, { timestamps: true });

module.exports = mongoose.model('Requirement', requirementSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  // --- 1. Basic Identity ---
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  
  role: {
    type: String,
    enum: ['student', 'provider', 'admin'],
    default: 'student'
  },

  // --- 2. PROVIDER FIELDS (Agar Service Provider hai) ---
  providerDetails: {
    category: {
      type: String,
      enum: ['Landlord', 'Mess', 'Library', 'Coaching', 'Stationery', 'Transport', null],
      default: null
    },
    businessName: { type: String },
    isVerified: { type: Boolean, default: false }
  },

  // --- 3. STUDENT DETAILED PROFILE (The Match-O-Meter Data) ---
  studentProfile: {
    // A. Personal & Background
    dob: { type: Date }, // Age calculation ke liye
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    caste: { type: String, default: null }, // Optional (Community matching)
    
    // B. Origin (Kahan se ho?)
    address: {
      state: { type: String },    // e.g. Madhya Pradesh
      district: { type: String }, // e.g. Indore
      hometown: { type: String }, // e.g. Mhow
      fullAddress: { type: String }
    },

    // C. Academic (Padhai)
    college: { type: String },
    course: { type: String }, // MCA
    year: { type: String },   // 2nd Year

    // D. Habits (Nasha & Khana)
    habits: {
      diet: { 
        type: String, 
        enum: ['Veg', 'Non-Veg', 'Eggitarian', 'Jain'], 
        default: 'Veg' 
      },
      smoking: { 
        type: String, 
        enum: ['No', 'Yes', 'Occasionally'], 
        default: 'No' 
      },
      drinking: { 
        type: String, 
        enum: ['No', 'Yes', 'Socially'], 
        default: 'No' 
      },
      cleanliness: {
        type: String,
        enum: ['Messy', 'Organized', 'Clean Freak'],
        default: 'Organized'
      }
    },

    // E. Relationship & Privacy (GF/BF Factor)
    relationshipStatus: {
      type: String,
      enum: ['Single', 'Committed', 'Prefer Not to Say'],
      default: 'Single'
    },
    guestPolicy: { // Kya room mein dosto/GF ko lana allowed hai?
      type: String,
      enum: ['No Guests', 'Friends Allowed', 'Any Guest Allowed'],
      default: 'Friends Allowed'
    }
  },

  profilePic: { type: String, default: 'default_avatar.png' },
  
  // Safety
  isVerified: { type: Boolean, default: false }, // Aadhar/College ID verify hone par true hoga
  trustScore: { type: Number, default: 50 },

  createdAt: { type: Date, default: Date.now }
});

// --- Encryption & Auth Methods (Same as before) ---
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = mongoose.model('User', userSchema);
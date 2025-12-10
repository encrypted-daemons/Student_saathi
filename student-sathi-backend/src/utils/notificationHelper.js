const Notification = require('../models/Notification');

const sendNotification = async (io, userId, title, message, type = 'info') => {
  try {
    // 1. Save to Database (History)
    await Notification.create({
      userId,
      title,
      message,
      type,
      read: false
    });

    // 2. Send Real-time Socket Event
    // Hum check kar rahe hain ki io aur userId exist karte hain ya nahi
    if (io && userId) {
        io.to(userId.toString()).emit('notification', {
            title,
            message,
            type
        });
        console.log(`🔔 Notification sent to ${userId}: ${title}`);
    }

  } catch (error) {
    console.error('Notification Error:', error.message);
  }
};

module.exports = sendNotification;
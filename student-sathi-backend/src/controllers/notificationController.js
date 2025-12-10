const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {  
    let filter = { isGlobal: true };
    
    if (req.user) {
        filter = { 
            $or: [
                { isGlobal: true },
                { recipient: req.user.id }
            ]
        };
    }

    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(20);          

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });

  } catch (error) {
    console.error("Notif Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//Create Notification
exports.createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
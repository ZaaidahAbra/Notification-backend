const pool = require('../config/database');

// Get all notifications for employee
const getEmployeeNotifications = async (req, res) => {
  try {
    console.log(' Fetching notifications from database...');
    
    // Query to get all notifications (both personal and broadcast)
    const [notifications] = await pool.query(`
      SELECT 
        notification_id,
        employee_id,
        title,
        message,
        date_created,
        is_broadcast,
        is_read
      FROM notification_records 
      WHERE employee_id = ? OR is_broadcast = 1
      ORDER BY date_created DESC
    `, [1]); // Using employee_id = 1 for demo

    console.log(`Found ${notifications.length} notifications`);

    // Categorize notifications by date - sort mail into new and old
    const categorized = categorizeNotifications(notifications);
    
    res.json({
      success: true,
      message: 'Notifications fetched successfully',
      data: {
        notifications: categorized,
        totalCount: notifications.length,
        unreadCount: notifications.filter(n => !n.is_read).length
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    
    console.log(`Marking notification ${notificationId} as read`);

    await pool.query(
      'UPDATE notification_records SET is_read = 1 WHERE notification_id = ?',
      [notificationId] //change from unread(0) to read (1)
    );

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

//  Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    console.log(' Marking ALL notifications as read');

    await pool.query(
      'UPDATE notification_records SET is_read = 1 WHERE (employee_id = ? OR is_broadcast = 1) AND is_read = 0',
      [1] // Using employee_id = 1 for demo
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

// Helper function to categorize notifications by time
function categorizeNotifications(notifications) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const categorized = {
    today: [],
    earlier: []
  };

  notifications.forEach(notification => {
    const notifDate = new Date(notification.date_created);
    
    if (notifDate.toDateString() === today.toDateString()) {
      categorized.today.push(notification);
    } else {
      categorized.earlier.push(notification);
    }
  });

  return categorized;
}

module.exports = {
  getEmployeeNotifications,
  markAsRead,
  markAllAsRead
};

//mailman who fetch notif and mark as read and organize
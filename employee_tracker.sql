-- Create database
CREATE DATABASE IF NOT EXISTS employee_tracker;
USE employee_tracker;

-- Create notification_records table
CREATE TABLE IF NOT EXISTS notification_records (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_broadcast TINYINT(1) DEFAULT 0,
    is_read TINYINT(1) DEFAULT 0
);

-- 📨 Insert dummy notifications
INSERT INTO notification_records (employee_id, title, message, is_broadcast, is_read, date_created) VALUES
(1, 'System Maintenance', 'The system will undergo maintenance tonight from 10 PM to 2 AM.', 1, 0, NOW() - INTERVAL 2 HOUR),
(1, 'Welcome to Employee Portal', 'Your account has been successfully activated. Welcome!', 0, 1, NOW() - INTERVAL 1 DAY),
(1, 'Holiday Schedule Update', 'The holiday schedule for December has been updated. Please check the calendar.', 1, 0, NOW() - INTERVAL 3 HOUR),
(1, 'Time Sheet Reminder', 'Please submit your time sheet for this week by Friday 5 PM.', 0, 0, NOW() - INTERVAL 30 MINUTE),
(1, 'Team Meeting', 'Monthly team meeting scheduled for tomorrow at 10 AM in Conference Room B.', 1, 1, NOW() - INTERVAL 2 DAY),
(1, 'Password Update Required', 'Your password will expire in 7 days. Please update it.', 0, 0, NOW() - INTERVAL 1 HOUR),
(1, 'New Policy Document', 'A new HR policy document has been uploaded. Please review it.', 1, 1, NOW() - INTERVAL 4 DAY),
(1, 'Birthday Greetings', 'Happy Birthday! Wishing you a fantastic day!', 0, 0, NOW() - INTERVAL 15 MINUTE);

-- ✅ Verify data was inserted
SELECT * FROM notification_records;
<template>
  <div class="notification-panel">
    <div class="panel-header">
      <h1>Notifications</h1>
      <div class="header-actions">
        <span class="unread-badge" v-if="unreadCount > 0">
          {{ unreadCount }} unread
        </span>
        <button 
          v-if="unreadCount > 0" 
          @click="markAllAsRead" 
          class="mark-all-btn"
          :disabled="loading"
        >
          Mark All as Read
        </button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button 
        v-for="filter in filters" 
        :key="filter.key"
        :class="['tab-btn', { active: activeFilter === filter.key }]"
        @click="setFilter(filter.key)"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading notifications...</p>
    </div>

    <!-- Notifications Content -->
    <div v-else class="notifications-content">
      <!-- Today's Notifications -->
      <div v-if="notifications.today.length > 0" class="time-section">
        <h3 class="section-title">Today</h3>
        <div class="notification-list">
          <div 
            v-for="notification in filteredNotifications.today" 
            :key="notification.notification_id"
            :class="['notification-card', { unread: !notification.is_read }]"
            @click="markAsRead(notification.notification_id)"
          >
            <div class="notification-icon">
              {{ notification.is_broadcast ? '📢' : '👤' }}
            </div>
            <div class="notification-content">
              <h4 class="notification-title">{{ notification.title }}</h4>
              <p class="notification-message">{{ notification.message }}</p>
              <div class="notification-meta">
                <span class="notification-time">
                  {{ formatTime(notification.date_created) }}
                </span>
                <span class="notification-type">
                  {{ notification.is_broadcast ? 'Broadcast' : 'Personal' }}
                </span>
              </div>
            </div>
            <div v-if="!notification.is_read" class="unread-indicator"></div>
          </div>
        </div>
      </div>

      <!-- Earlier Notifications -->
      <div v-if="notifications.earlier.length > 0" class="time-section">
        <h3 class="section-title">Earlier</h3>
        <div class="notification-list">
          <div 
            v-for="notification in filteredNotifications.earlier" 
            :key="notification.notification_id"
            :class="['notification-card', { unread: !notification.is_read }]"
            @click="markAsRead(notification.notification_id)"
          >
            <div class="notification-icon">
              {{ notification.is_broadcast ? '📢' : '👤' }}
            </div>
            <div class="notification-content">
              <h4 class="notification-title">{{ notification.title }}</h4>
              <p class="notification-message">{{ notification.message }}</p>
              <div class="notification-meta">
                <span class="notification-time">
                  {{ formatTime(notification.date_created) }}
                </span>
                <span class="notification-type">
                  {{ notification.is_broadcast ? 'Broadcast' : 'Personal' }}
                </span>
              </div>
            </div>
            <div v-if="!notification.is_read" class="unread-indicator"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="totalNotifications === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No notifications</h3>
        <p>You're all caught up!</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <p> X {{ error }}</p>
      <button @click="fetchNotifications" class="retry-btn">Try Again</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotificationPanel',
  data() {
    return {
      notifications: {
        today: [],
        earlier: []
      },
      activeFilter: 'all',
      loading: false,
      error: null,
      unreadCount: 0,
      filters: [
        { key: 'all', label: 'All' },
        { key: 'unread', label: 'Unread' },
        { key: 'read', label: 'Read' }
      ]
    }
  },
  computed: {
    totalNotifications() {
      return this.notifications.today.length + this.notifications.earlier.length
    },
    filteredNotifications() {
      if (this.activeFilter === 'all') {
        return this.notifications
      } else if (this.activeFilter === 'unread') {
        return {
          today: this.notifications.today.filter(n => !n.is_read),
          earlier: this.notifications.earlier.filter(n => !n.is_read)
        }
      } else if (this.activeFilter === 'read') {
        return {
          today: this.notifications.today.filter(n => n.is_read),
          earlier: this.notifications.earlier.filter(n => n.is_read)
        }
      }
      return this.notifications
    }
  },
  async mounted() { //when page open, this tell vue to fetch notifications
    await this.fetchNotifications()
  },
  methods: {
    async fetchNotifications() { // function get mail from backend
      this.loading = true
      this.error = null
      
      try {
        console.log('Fetching notifications from backend...')
        const response = await fetch('http://localhost:5000/api/notifications/employee')
        const data = await response.json()
        
        if (data.success) {
          this.notifications = data.data.notifications
          this.unreadCount = data.data.unreadCount // counts how many unread
          console.log(`Loaded ${this.totalNotifications} notifications (${this.unreadCount} unread)`)
        } else {
          throw new Error(data.message)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
        this.error = 'Failed to load notifications. Make sure the backend is running.'
      } finally {
        this.loading = false
      }
    },

    async markAsRead(notificationId) { // mark as read once notification clicked
      try {
        const response = await fetch('http://localhost:5000/api/notifications/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notificationId })
        })
        
        const data = await response.json()
        
        if (data.success) {
          // Update local state
          this.notifications.today = this.notifications.today.map(n => 
            n.notification_id === notificationId ? { ...n, is_read: 1 } : n
          )
          this.notifications.earlier = this.notifications.earlier.map(n => 
            n.notification_id === notificationId ? { ...n, is_read: 1 } : n
          )
          this.unreadCount = Math.max(0, this.unreadCount - 1)
          console.log(`Marked notification ${notificationId} as read`)
        }
      } catch (error) {
        console.error('Error marking as read:', error)
      }
    },

    async markAllAsRead() {
      try {
        const response = await fetch('http://localhost:5000/api/notifications/mark-all-read', {
          method: 'POST'
        })
        
        const data = await response.json()
        
        if (data.success) {
          // Update all notifications to read
          this.notifications.today = this.notifications.today.map(n => ({ ...n, is_read: 1 }))
          this.notifications.earlier = this.notifications.earlier.map(n => ({ ...n, is_read: 1 }))
          this.unreadCount = 0
          console.log('All notifications marked as read')
        }
      } catch (error) {
        console.error('Error marking all as read:', error)
      }
    },

    setFilter(filter) {
      this.activeFilter = filter
    },

    formatTime(dateString) { // format time to readable - so no timestamp but like 1hr ago
      const date = new Date(dateString)
      const now = new Date()
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'Just now'
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      
      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `${diffInHours}h ago`
      
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays === 1) return 'Yesterday'
      if (diffInDays < 7) return `${diffInDays}d ago`
      
      return date.toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.notification-panel {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.panel-header h1 {
  color: #ffffff;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.unread-badge {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.mark-all-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.mark-all-btn:hover:not(:disabled) {
  background: #218838;
}

.mark-all-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: #1a1a1a;
  padding: 0.5rem;
  border-radius: 8px;
}

.tab-btn {
  background: transparent;
  color: #888;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #333;
  color: #ffffff;
}

.tab-btn:hover:not(.active) {
  background: #2a2a2a;
  color: #ffffff;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #888;
}

.spinner {
  border: 3px solid #333;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.time-section {
  margin-bottom: 2rem;
}

.section-title {
  color: #888;
  font-size: 0.9rem;
  text-transform: uppercase;
  margin-bottom: 1rem;
  font-weight: 600;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification-card {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.notification-card.unread {
  border-left-color: #007bff;
  background: #2d3748;
}

.notification-card:hover {
  background: #2a2a2a;
  transform: translateX(4px);
}

.notification-icon {
  font-size: 1.2rem;
  margin-top: 0.25rem;
}

.notification-content {
  flex: 1;
}

.notification-title {
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.notification-message {
  color: #cccccc;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.notification-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-time {
  color: #888;
  font-size: 0.8rem;
}

.notification-type {
  color: #007bff;
  font-size: 0.7rem;
  background: rgba(0, 123, 255, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background: #007bff;
  border-radius: 50%;
  margin-top: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #888;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state {
  text-align: center;
  padding: 2rem;
  background: #dc3545;
  color: white;
  border-radius: 8px;
  margin: 2rem 0;
}

.retry-btn {
  background: white;
  color: #dc3545;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #f8f9fa;
}
</style>
<template>
  <div class="notification-panel-wrapper">
    <div class="notification-panel">
      <div class="panel-header">
        <h4>Notifications</h4>
      </div>

      <!-- Filter Tabs -->
      <div class="tabs">
        <button 
          v-for="filter in filters" 
          :key="filter.key"
          :class="{ active: activeFilter === filter.key }"
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

      <!-- Error State -->
      <div v-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="fetchNotifications" class="retry-btn">Try Again</button>
      </div>

      <!-- Notifications List -->
      <ul v-if="!loading && !error" class="notification-list">

        <!-- Today -->
        <li v-if="filteredNotifications.today.length > 0" class="time-group-header">Today</li>
        <li
          v-for="note in filteredNotifications.today"
          :key="'t-'+note.notification_id"
          class="notification-item"
          :class="{ 'is-unread': !note.is_read }"
          @click="markAsRead(note.notification_id)"
        >
          <div class="icon-wrap">
            <i class="fas fa-bell"></i>
          </div>
          <div class="details">
            <p class="title">{{ note.title }}</p>
            <p class="message">{{ note.message }}</p>
          </div>
          <span class="time">{{ formatTime(note.date_created) }}</span>
          <span v-if="!note.is_read" class="unread-dot"></span>
        </li>

        <!-- Earlier -->
        <li v-if="filteredNotifications.earlier.length > 0" class="time-group-header">Earlier</li>
        <li
          v-for="note in filteredNotifications.earlier"
          :key="'e-'+note.notification_id"
          class="notification-item"
          :class="{ 'is-unread': !note.is_read }"
          @click="markAsRead(note.notification_id)"
        >
          <div class="icon-wrap">
            <i class="fas fa-bell"></i>
          </div>
          <div class="details">
            <p class="title">{{ note.title }}</p>
            <p class="message">{{ note.message }}</p>
          </div>
          <span class="time">{{ formatTime(note.date_created) }}</span>
          <span v-if="!note.is_read" class="unread-dot"></span>
        </li>

        <!-- Empty State -->
        <li v-if="totalNotifications === 0" class="empty">
          No notifications in the '{{ activeFilter }}' view.
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotificationPanel',
  data() {
    return {
      notifications: { today: [], earlier: [] },
      activeFilter: 'all',
      loading: false,
      error: null,
      filters: [
        { key: 'all', label: 'All' },
        { key: 'read', label: 'Read' },
        { key: 'unread', label: 'Unread' }
      ]
    }
  },
  computed: {
    totalNotifications() {
      return this.notifications.today.length + this.notifications.earlier.length
    },
    filteredNotifications() {
      const filter = this.activeFilter
      if (filter === 'unread') {
        return {
          today: this.notifications.today.filter(n => !n.is_read),
          earlier: this.notifications.earlier.filter(n => !n.is_read)
        }
      } else if (filter === 'read') {
        return {
          today: this.notifications.today.filter(n => n.is_read),
          earlier: this.notifications.earlier.filter(n => n.is_read)
        }
      }
      return this.notifications
    }
  },
  async mounted() {
    await this.fetchNotifications()
  },
  methods: {
    async fetchNotifications() {
      this.loading = true
      this.error = null
      try {
        const response = await fetch('http://localhost:5000/api/notifications/employee')
        const data = await response.json()
        if (data.success) {
          this.notifications = data.data.notifications
        } else {
          throw new Error(data.message)
        }
      } catch (err) {
        this.error = 'Failed to load notifications. Make sure backend is running.'
      } finally {
        this.loading = false
      }
    },
    async markAsRead(notificationId) {
      try {
        const response = await fetch('http://localhost:5000/api/notifications/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId })
        })
        const data = await response.json()
        if (data.success) {
          this.notifications.today = this.notifications.today.map(n => 
            n.notification_id === notificationId ? { ...n, is_read: 1 } : n
          )
          this.notifications.earlier = this.notifications.earlier.map(n => 
            n.notification_id === notificationId ? { ...n, is_read: 1 } : n
          )
        }
      } catch (err) {
        console.error('Error marking as read:', err)
      }
    },
    setFilter(filter) {
      this.activeFilter = filter
    },
    formatTime(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diff = Math.floor((now - date) / 60000)
      if (diff < 1) return 'Just now'
      if (diff < 60) return `${diff}m ago`
      const hours = Math.floor(diff / 60)
      if (hours < 24) return `${hours}h ago`
      const days = Math.floor(hours / 24)
      return days === 1 ? 'Yesterday' : `${days}d ago`
    }
  }
}
</script>

<style scoped>
.notification-panel-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.notification-panel {
  width: 100%;
  max-width: 1400px;
  background: var(--panel-bg, #fff);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-height: 900px;
  font-family: 'Poppins', sans-serif;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
}

.panel-header h4 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color, #333);
  margin: 0;
  padding-bottom: 8px;
  position: relative;
}

.panel-header h4::after {
  content: '';
  display: block;
  width: 100%;
  height: 2px;
  background-color: var(--accent-color, #27AE60);
  border-radius: 2px;
  margin-top: 10px;
}

.tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.tabs button {
  background: transparent;
  border: none;
  padding: 6px 0;
  font-size: 1rem;
  color: var(--text-color, #444);
  cursor: pointer;
  position: relative;
}

.tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 2px;
  background-color: var(--accent-color, #27AE60);
}

.notification-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.time-group-header {
  font-weight: 600;
  color: var(--accent-color, #27AE60);
  margin-top: 10px;
  margin-bottom: 8px;
  /*text-align: left;*/
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
  transition: background 0.2s ease;
  cursor: pointer;
  text-align: left;
}

.notification-item.is-unread {
  background-color: rgba(39, 174, 96, 0.1);
}

.icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-color, #27AE60);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}

.details {
  flex-grow:1;display:flex;flex-direction:column;
}

.title {
  font-weight: 600;
  margin: 0;
  color: var(--text-color, #333);
}

.message {
  margin:2px 0 0 0;color: var(--subtext-color)
}

.time {
  font-size: 0.8rem;
  color: var(--subtext-color, #aaa);
}

.unread-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ff5c5c;
  align-self: center;
}

.empty {
  text-align: center;
  margin-top: 10px;
  color: var(--subtext-color, #777);
}

.loading-state, .error-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-color, #666);
}

.spinner {
  border: 3px solid #ccc;
  border-top: 3px solid var(--accent-color, #27AE60);
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

.retry-btn {
  background: var(--accent-color, #27AE60);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #219150;
}
</style>

// js/api/adminApi.js
const adminApi = {
  /**
   * Get all users with optional filters
   * @param {Object} filters - {role, search, student_type}
   * @returns {Promise<Array>} List of users
   */
  async getAllUsers(filters = {}) {
    try {
      let url = "/api/admin/users";
      const params = new URLSearchParams();

      if (filters.role) params.append("role", filters.role);
      if (filters.search) params.append("search", filters.search);
      if (filters.student_type)
        params.append("student_type", filters.student_type);

      if (params.toString()) {
        url += "?" + params.toString();
      }

      const token = localStorage.getItem("authToken");
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch users");

      return data.users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  /**
   * Get user statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/users/statistics", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch statistics");

      return data;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  },

  /**
   * Get user by ID
   * @param {number} userId
   * @returns {Promise<Object>} User object
   */
  async getUser(userId) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch user");

      return data.user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  /**
   * Delete a user with password confirmation
   * @param {number} userId
   * @param {string} password - Admin's password for confirmation
   * @returns {Promise<Object>} Success message
   */
  async deleteUser(userId, password) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete user");

      return data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  /**
   * Delete multiple users with password confirmation
   * @param {Array<number>} userIds
   * @param {string} password - Admin's password for confirmation
   * @returns {Promise<Object>} Success message with delete count
   */
  async deleteMultipleUsers(userIds, password) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_ids: userIds, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete users");

      return data;
    } catch (error) {
      console.error("Error deleting users:", error);
      throw error;
    }
  },

  /**
   * Get role distribution analytics
   * @returns {Promise<Array>} Role distribution data
   */
  async getRoleDistribution() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "/api/admin/users/analytics/role-distribution",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch analytics");

      return data.distribution;
    } catch (error) {
      console.error("Error fetching analytics:", error);
      throw error;
    }
  },

  /**
   * Get recent registrations
   * @param {number} limit - Number of records to fetch
   * @returns {Promise<Array>} Recent registrations
   */
  async getRecentRegistrations(limit = 10) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/users/recent?limit=${limit}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch recent registrations");

      return data.registrations;
    } catch (error) {
      console.error("Error fetching recent registrations:", error);
      throw error;
    }
  },

  /**
   * Create a new admin user
   * @param {Object} adminData - {firstname, lastname, birthday, username, email, password}
   * @returns {Promise<Object>} Created admin user
   */
  async createAdmin(adminData) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adminData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create admin");

      return data.user;
    } catch (error) {
      console.error("Error creating admin:", error);
      throw error;
    }
  },

  // ========== Forum Management ==========

  /**
   * Get all forums for admin management
   * @returns {Promise<Array>} List of forums
   */
  async getAllForums() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/forums", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch forums");

      return data.forums;
    } catch (error) {
      console.error("Error fetching forums:", error);
      throw error;
    }
  },

  /**
   * Get pending forum requests
   * @returns {Promise<Array>} List of pending forums
   */
  async getPendingForums() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/forums/pending", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch pending forums");

      return data.forums;
    } catch (error) {
      console.error("Error fetching pending forums:", error);
      throw error;
    }
  },

  /**
   * Get forum statistics
   * @returns {Promise<Object>} Forum statistics
   */
  async getForumStatistics() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/forums/statistics", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch forum statistics");

      return data;
    } catch (error) {
      console.error("Error fetching forum statistics:", error);
      throw error;
    }
  },

  /**
   * Get a single forum by ID
   * @param {number} forumId
   * @returns {Promise<Object>} Forum object
   */
  async getForum(forumId) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/forums/${forumId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch forum");

      return data.forum;
    } catch (error) {
      console.error("Error fetching forum:", error);
      throw error;
    }
  },

  /**
   * Approve a forum request
   * @param {number} forumId
   * @returns {Promise<Object>} Approval result
   */
  async approveForum(forumId) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/forums/${forumId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to approve forum");

      return data;
    } catch (error) {
      console.error("Error approving forum:", error);
      throw error;
    }
  },

  /**
   * Reject a forum request
   * @param {number} forumId
   * @returns {Promise<Object>} Rejection result
   */
  async rejectForum(forumId) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/forums/${forumId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to reject forum");

      return data;
    } catch (error) {
      console.error("Error rejecting forum:", error);
      throw error;
    }
  },

  // ========== Content Moderation ==========

  /**
   * Get flagged content with filters
   * @param {Object} filters - {status, contentType, reason}
   * @returns {Promise<Array>} List of flagged content
   */
  async getFlaggedContent(filters = {}) {
    try {
      const token = localStorage.getItem("authToken");
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.contentType) params.append("contentType", filters.contentType);
      if (filters.reason) params.append("reason", filters.reason);

      const url = "/api/admin/moderation/flagged" + (params.toString() ? "?" + params.toString() : "");
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch flagged content");

      return data.flagged;
    } catch (error) {
      console.error("Error fetching flagged content:", error);
      throw error;
    }
  },

  /**
   * Get content moderation statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getModerationStatistics() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/moderation/statistics", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch moderation statistics");

      return data;
    } catch (error) {
      console.error("Error fetching moderation statistics:", error);
      throw error;
    }
  },

  /**
   * Dismiss a flag (keep content)
   * @param {number} flagId
   * @returns {Promise<Object>} Result
   */
  async dismissFlag(flagId) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/moderation/flag/${flagId}/dismiss`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to dismiss flag");

      return data;
    } catch (error) {
      console.error("Error dismissing flag:", error);
      throw error;
    }
  },

  /**
   * Delete flagged content
   * @param {number} flagId
   * @returns {Promise<Object>} Result
   */
  async deleteFlaggedContent(flagId) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/moderation/flag/${flagId}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete content");

      return data;
    } catch (error) {
      console.error("Error deleting content:", error);
      throw error;
    }
  },

  // ========== Announcements ==========

  /**
   * Get all announcements
   * @returns {Promise<Array>} List of announcements
   */
  async getAllAnnouncements() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/announcements", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch announcements");

      return data.announcements || [];
    } catch (error) {
      console.error("Error fetching announcements:", error);
      return [];
    }
  },

  /**
   * Create announcement
   * @param {Object} data - {title, message, targetRole}
   * @returns {Promise<Object>} Created announcement
   */
  async createAnnouncement(data) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create announcement");

      return result.announcement;
    } catch (error) {
      console.error("Error creating announcement:", error);
      throw error;
    }
  },

  /**
   * Update announcement
   * @param {number} id
   * @param {Object} data - {title, message, targetRole}
   * @returns {Promise<Object>} Updated announcement
   */
  async updateAnnouncement(id, data) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to update announcement");

      return result.announcement;
    } catch (error) {
      console.error("Error updating announcement:", error);
      throw error;
    }
  },

  /**
   * Delete announcement
   * @param {number} id
   * @returns {Promise<Object>} Result
   */
  async deleteAnnouncement(id) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete announcement");

      return data;
    } catch (error) {
      console.error("Error deleting announcement:", error);
      throw error;
    }
  },

  // ========== Help & Support ==========

  /**
   * Get all FAQs
   * @returns {Promise<Array>} List of FAQs
   */
  async getAllFAQs() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/help/faqs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch FAQs");

      return data.faqs || [];
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      return [];
    }
  },

  /**
   * Create FAQ
   * @param {Object} data - {question, answer}
   * @returns {Promise<Object>} Created FAQ
   */
  async createFAQ(data) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/help/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create FAQ");

      return result.faq;
    } catch (error) {
      console.error("Error creating FAQ:", error);
      throw error;
    }
  },

  /**
   * Delete FAQ
   * @param {number} id
   * @returns {Promise<Object>} Result
   */
  async deleteFAQ(id) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/help/faqs/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete FAQ");

      return data;
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      throw error;
    }
  },

  /**
   * Get all help requests
   * @returns {Promise<Array>} List of help requests
   */
  async getAllHelpRequests() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/help/requests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch help requests");

      return data.requests || [];
    } catch (error) {
      console.error("Error fetching help requests:", error);
      return [];
    }
  },

  /**
   * Get help request by ID
   * @param {number} id
   * @returns {Promise<Object>} Help request
   */
  async getHelpRequest(id) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/help/requests/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch help request");

      return data.request;
    } catch (error) {
      console.error("Error fetching help request:", error);
      throw error;
    }
  },

  /**
   * Reply to help request
   * @param {number} id
   * @param {string} reply
   * @returns {Promise<Object>} Result
   */
  async replyToHelpRequest(id, reply) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/help/requests/${id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reply }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send reply");

      return data;
    } catch (error) {
      console.error("Error sending reply:", error);
      throw error;
    }
  },

  /**
   * Update help request status
   * @param {number} id
   * @param {string} status
   * @returns {Promise<Object>} Result
   */
  async updateHelpRequestStatus(id, status) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/help/requests/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update status");

      return data;
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  },

  /**
   * Get messages for a help request
   * @param {number} id
   * @returns {Promise<Array>} Messages
   */
  async getHelpRequestMessages(id) {
    try {
      const token = localStorage.getItem("authToken");
      const url = `/api/support/tickets/${id}/messages`;
      console.log("Fetching messages for ticket:", id, "URL:", url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Get messages response:", data);
      
      if (!response.ok) throw new Error(data.error || "Failed to fetch messages");

      return data.messages || [];
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  },

  /**
   * Add message to help request
   * @param {number} id
   * @param {string} message
   * @param {boolean} is_admin
   * @returns {Promise<Object>} Result
   */
  async addHelpRequestMessage(id, message, is_admin = true) {
    try {
      const token = localStorage.getItem("authToken");
      const url = `/api/support/tickets/${id}/messages`;
      console.log("=== ADMIN API ADD MESSAGE ===");
      console.log("Adding message to ticket:", id);
      console.log("URL:", url);
      console.log("is_admin:", is_admin);
      console.log("message:", message);
      console.log("Token exists:", !!token);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message, is_admin }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const data = await response.json();
      console.log("Add message response:", data);
      console.log("===============================");
      
      if (!response.ok) throw new Error(data.error || "Failed to add message");

      return data;
    } catch (error) {
      console.error("Error adding message:", error);
      throw error;
    }
  },
};

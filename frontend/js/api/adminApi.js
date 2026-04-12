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

  /**
   * Update a user
   * @param {number} userId
   * @param {Object} userData - {firstname, lastname, email, username, role, student_type}
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, userData) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update user");

      return data.user;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  // ===== Content Moderation API =====

  /**
   * Get content moderation statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getModerationStats() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/moderation/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch statistics");

      return data;
    } catch (error) {
      console.error("Error fetching moderation statistics:", error);
      throw error;
    }
  },

  /**
   * Get flagged content with optional filters
   * @param {Object} filters - {status, content_type, reason, search}
   * @returns {Promise<Array>} List of flagged content
   */
  async getFlaggedContent(filters = {}) {
    try {
      let url = "/api/admin/moderation";
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.content_type) params.append("content_type", filters.content_type);
      if (filters.reason) params.append("reason", filters.reason);
      if (filters.search) params.append("search", filters.search);

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
      if (!response.ok) throw new Error(data.error || "Failed to fetch flagged content");

      return data.flaggedContent;
    } catch (error) {
      console.error("Error fetching flagged content:", error);
      throw error;
    }
  },

  /**
   * Get specific flagged content by ID
   * @param {number} id
   * @returns {Promise<Object>} Flagged content object
   */
  async getFlaggedContentById(id) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/moderation/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch flagged content");

      return data.flaggedContent;
    } catch (error) {
      console.error("Error fetching flagged content:", error);
      throw error;
    }
  },

  /**
   * Dismiss a flag (keep content)
   * @param {number} id - Flagged content ID
   * @returns {Promise<Object>} Result message
   */
  async dismissFlag(id) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/moderation/${id}/dismiss`, {
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
   * @param {number} id - Flagged content ID
   * @returns {Promise<Object>} Result message
   */
  async deleteFlaggedContent(id) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/moderation/${id}`, {
        method: "DELETE",
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

  /**
   * Create a new flag
   * @param {Object} flagData - {content_id, content_type, author_id, reason, description}
   * @returns {Promise<Object>} Created flag
   */
  async createFlag(flagData) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/moderation/flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(flagData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to flag content");

      return data.flaggedContent;
    } catch (error) {
      console.error("Error creating flag:", error);
      throw error;
    }
  },

  // ===== Forum Management API =====

  async getForumStats() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/forums/stats", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch stats");
      return data;
    } catch (error) {
      console.error("Error fetching forum stats:", error);
      throw error;
    }
  },

  async getAllForums(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.creatorRole) params.append("creatorRole", filters.creatorRole);
      if (filters.status) params.append("status", filters.status);
      if (filters.includeUnpublished) params.append("includeUnpublished", filters.includeUnpublished);

      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/forums${params.toString() ? '?' + params : ''}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch forums");
      return data.forums;
    } catch (error) {
      console.error("Error fetching forums:", error);
      throw error;
    }
  },

  async getPendingForumApprovals() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/forums/pending", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch pending approvals");
      return data.approvals;
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      throw error;
    }
  },

  async getForumById(id) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/forums/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch forum");
      return data.forum;
    } catch (error) {
      console.error("Error fetching forum:", error);
      throw error;
    }
  },

  async approveForum(id) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/forums/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to approve forum");
      return data;
    } catch (error) {
      console.error("Error approving forum:", error);
      throw error;
    }
  },

  async rejectForum(id) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/forums/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to reject forum");
      return data;
    } catch (error) {
      console.error("Error rejecting forum:", error);
      throw error;
    }
  },

  async deleteForum(id) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/forums/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete forum");
      return data;
    } catch (error) {
      console.error("Error deleting forum:", error);
      throw error;
    }
  },

  // ===== Announcements API =====

  async getAnnouncements() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/announcements", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch announcements");
      return data.announcements;
    } catch (error) {
      console.error("Error fetching announcements:", error);
      throw error;
    }
  },

  async createAnnouncement(title, message) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, message })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create announcement");
      return data.announcement;
    } catch (error) {
      console.error("Error creating announcement:", error);
      throw error;
    }
  },

  async updateAnnouncement(id, title, message) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, message })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update announcement");
      return data.announcement;
    } catch (error) {
      console.error("Error updating announcement:", error);
      throw error;
    }
  },

  async deleteAnnouncement(id) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete announcement");
      return data;
    } catch (error) {
      console.error("Error deleting announcement:", error);
      throw error;
    }
  },

  // ===== Dashboard API =====

  async getDashboardOverview() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/dashboard/overview", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch dashboard data");
      return data;
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      throw error;
    }
  },

  async getDashboardActivity() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/dashboard/activity", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch activity");
      return data.activity;
    } catch (error) {
      console.error("Error fetching activity:", error);
      throw error;
    }
  },

  // ===== Profile API =====

  async getProfile() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/profile", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch profile");
      return data.user;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  async updateProfile(data) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to update profile");
      return result.user;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  async changePassword(oldPassword, newPassword) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to change password");
      return data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },

  // ===== Analytics API =====

  async getAnalyticsOverview() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/analytics/overview", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch analytics");
      return data;
    } catch (error) {
      console.error("Error fetching analytics:", error);
      throw error;
    }
  },

  async getUserGrowthData() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/analytics/user-growth", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch user growth");
      return data;
    } catch (error) {
      console.error("Error fetching user growth:", error);
      throw error;
    }
  },

  async getDailyLoginsData() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/analytics/daily-logins", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch daily logins");
      return data;
    } catch (error) {
      console.error("Error fetching daily logins:", error);
      throw error;
    }
  },

  async getContentDistributionData() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/analytics/content", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch content distribution");
      return data;
    } catch (error) {
      console.error("Error fetching content distribution:", error);
      throw error;
    }
  },

  async getMostActiveUsers() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/analytics/active-users", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch active users");
      return data.users;
    } catch (error) {
      console.error("Error fetching active users:", error);
      throw error;
    }
  },

  // ===== Help API =====

  async getFAQs() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/help/faqs", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch FAQs");
      return data.faqs;
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      throw error;
    }
  },

  async createFAQ(question, answer) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/help/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question, answer })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create FAQ");
      return data.faq;
    } catch (error) {
      console.error("Error creating FAQ:", error);
      throw error;
    }
  },

  async updateFAQ(id, question, answer) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/help/faqs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question, answer })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update FAQ");
      return data.faq;
    } catch (error) {
      console.error("Error updating FAQ:", error);
      throw error;
    }
  },

  async deleteFAQ(id) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/help/faqs/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete FAQ");
      return data;
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      throw error;
    }
  },

  async getHelpRequests(status) {
    try {
      const token = localStorage.getItem("authToken");
      const url = status ? `/api/admin/help/requests?status=${status}` : "/api/admin/help/requests";
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch requests");
      return data.requests;
    } catch (error) {
      console.error("Error fetching requests:", error);
      throw error;
    }
  },

  async replyToRequest(id, reply) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/help/requests/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reply })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send reply");
      return data.request;
    } catch (error) {
      console.error("Error sending reply:", error);
      throw error;
    }
  },

  // ===== Verification API =====

  async getVerifications(status) {
    try {
      const token = localStorage.getItem("authToken");
      const url = status ? `/api/admin/verifications?status=${status}` : "/api/admin/verifications";
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch verifications");
      return data.verifications;
    } catch (error) {
      console.error("Error fetching verifications:", error);
      throw error;
    }
  },

  async getPendingVerifications() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/verifications/pending", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch pending verifications");
      return data.verifications;
    } catch (error) {
      console.error("Error fetching pending verifications:", error);
      throw error;
    }
  },

  async getVerificationStats() {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/verifications/stats", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch stats");
      return data;
    } catch (error) {
      console.error("Error fetching verification stats:", error);
      throw error;
    }
  },

  async getVerificationById(id) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/verifications/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch verification");
      return data.verification;
    } catch (error) {
      console.error("Error fetching verification:", error);
      throw error;
    }
  },

  async approveVerification(id) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/verifications/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to approve verification");
      return data;
    } catch (error) {
      console.error("Error approving verification:", error);
      throw error;
    }
  },

  async rejectVerification(id, reason) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/verifications/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to reject verification");
      return data;
    } catch (error) {
      console.error("Error rejecting verification:", error);
      throw error;
    }
  },
};

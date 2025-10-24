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
};

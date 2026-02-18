// js/api/studentPomodoroApi.js
class StudentPomodoroApi {
  constructor() {
    this.baseUrl = "/api/student/pomodoro";
  }

  /**
   * Get authorization token from localStorage
   */
  getToken() {
    return localStorage.getItem("authToken");
  }

  /**
   * Create a new Pomodoro session
   */
  async createSession(mode) {
    try {
      const response = await fetch(`${this.baseUrl}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ mode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create session");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating Pomodoro session:", error);
      throw error;
    }
  }

  /**
   * Update session cycle count
   */
  async updateSession(sessionId, cyclesCompleted) {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ sessionId, cyclesCompleted }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update session");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating Pomodoro session:", error);
      throw error;
    }
  }

  /**
   * Finish a session
   */
  async finishSession(sessionId, options = {}) {
    // ... existing finish logic ...
    try {
      const body = { sessionId };
      if (options.durationMinutes !== undefined) {
        body.durationMinutes = options.durationMinutes;
      }

      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(body),
      };

      if (options.keepalive) {
        fetchOptions.keepalive = true;
      }

      const response = await fetch(`${this.baseUrl}/sessions/finish`, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to finish session");
      }

      return await response.json();
    } catch (error) {
      console.error("Error finishing Pomodoro session:", error);
      throw error;
    }
  }

  /**
   * Resume a session (after reload)
   */
  async resumeSession(sessionId) {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to resume session");
      }

      return await response.json();
    } catch (error) {
      console.error("Error resuming Pomodoro session:", error);
      throw error;
    }
  }

  /**
   * Get Pomodoro sessions
   */
  async getSessions(limit = 50) {
    try {
      const url = limit ? `${this.baseUrl}/sessions?limit=${limit}` : `${this.baseUrl}/sessions`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch sessions");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching Pomodoro sessions:", error);
      throw error;
    }
  }

  /**
   * Get Pomodoro statistics
   */
  async getStats(dateFrom = null, dateTo = null) {
    try {
      let url = `${this.baseUrl}/stats`;
      const params = new URLSearchParams();
      
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch statistics");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching Pomodoro stats:", error);
      throw error;
    }
  }
}

// Create singleton instance
const studentPomodoroApi = new StudentPomodoroApi();
window.studentPomodoroApi = studentPomodoroApi;

// js/api/calendarApi.js
class CalendarApi {
  constructor() {
    this.baseUrl = "/api/parent";
  }

  async request(endpoint, method = "GET", body = null) {
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("Authentication required");
    }

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Request failed with status ${response.status}`
      );
    }

    return await response.json();
  }

  async createDeadline(studentId, title, date) {
    return this.request("/calendar/deadlines", "POST", {
      student_id: studentId,
      title,
      date,
    });
  }

  async getDeadlines(studentId) {
    return this.request(`/calendar/students/${studentId}/deadlines`);
  }

  async updateDeadline(deadlineId, updates) {
    return this.request(`/calendar/deadlines/${deadlineId}`, "PUT", updates);
  }

  async deleteDeadline(deadlineId) {
    return this.request(`/calendar/deadlines/${deadlineId}`, "DELETE");
  }

  async createParentTask(text) {
    return this.request("/calendar/parent-tasks", "POST", { text });
  }

  async getParentTasks() {
    return this.request("/calendar/parent-tasks");
  }

  async updateParentTask(taskId, updates) {
    return this.request(`/calendar/parent-tasks/${taskId}`, "PUT", updates);
  }

  async deleteParentTask(taskId) {
    return this.request(`/calendar/parent-tasks/${taskId}`, "DELETE");
  }
}

const calendarApi = new CalendarApi();

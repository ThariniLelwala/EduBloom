// js/api/markApi.js
const API_BASE = "/api/student/marks";

class MarkApi {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    return localStorage.getItem("authToken");
  }

  async request(endpoint, method = "GET", data = null) {
    const token = this.getToken();
    if (!token) throw new Error("Not authenticated");

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    if (data) options.body = JSON.stringify(data);

    const response = await fetch(endpoint, options);
    const result = await response.json();

    if (!response.ok) throw new Error(result.error || `API error: ${response.status}`);
    return result;
  }

  // Subjects
  async createSubject(name) {
    return this.request(`${this.baseUrl}/subjects`, "POST", { name });
  }

  async getSubjects() {
    return this.request(`${this.baseUrl}/subjects`);
  }

  async getSubject(id) {
    return this.request(`${this.baseUrl}/subjects/${id}`);
  }

  async updateSubject(id, name) {
    return this.request(`${this.baseUrl}/subjects/${id}`, "PUT", { name });
  }

  async deleteSubject(id) {
    return this.request(`${this.baseUrl}/subjects/${id}`, "DELETE");
  }

  // Tests
  async createTest(subjectId, name, mark) {
    return this.request(`${this.baseUrl}/subjects/${subjectId}/tests`, "POST", { name, mark });
  }

  async updateTest(testId, name, mark) {
    return this.request(`${this.baseUrl}/tests/${testId}`, "PUT", { name, mark });
  }

  async deleteTest(testId) {
    return this.request(`${this.baseUrl}/tests/${testId}`, "DELETE");
  }
}

// Create singleton
const markApi = new MarkApi();

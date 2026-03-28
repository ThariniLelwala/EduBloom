// frontend/js/api/examApi.js
const API_BASE_URL = "/api/student";

const examApi = {
  getAuthHeaders() {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No auth token found");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  },

  async handleResponse(response) {
    if (response.status === 401 || response.status === 403) {
      window.location.href = "/login.html";
      throw new Error("Authentication failed");
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "An error occurred");
    }
    return data;
  },

  // Exam Term CRUD
  async createTerm(name) {
    const res = await fetch(`${API_BASE_URL}/exams/terms`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    return this.handleResponse(res);
  },

  async getTerms() {
    const res = await fetch(`${API_BASE_URL}/exams/terms`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  },

  async getTerm(termId) {
    const res = await fetch(`${API_BASE_URL}/exams/terms/${termId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  },

  async updateTerm(termId, name) {
    const res = await fetch(`${API_BASE_URL}/exams/terms/${termId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    return this.handleResponse(res);
  },

  async deleteTerm(termId) {
    const res = await fetch(`${API_BASE_URL}/exams/terms/${termId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  },

  // Exam Subject CRUD
  async createSubject(termId, name, mark) {
    const res = await fetch(`${API_BASE_URL}/exams/terms/${termId}/subjects`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name, mark }),
    });
    return this.handleResponse(res);
  },

  async updateSubject(subjectId, name, mark) {
    const res = await fetch(`${API_BASE_URL}/exams/subjects/${subjectId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name, mark }),
    });
    return this.handleResponse(res);
  },

  async deleteSubject(subjectId) {
    const res = await fetch(`${API_BASE_URL}/exams/subjects/${subjectId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  },
};

// Export for easier testing/modules, but mostly relies on global scope inclusion as per existing codebase pattern
if (typeof module !== "undefined" && module.exports) {
  module.exports = examApi;
}

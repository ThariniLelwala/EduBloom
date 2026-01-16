// js/api/gpaApi.js

const API_BASE = "/api/student/gpa";

class GpaApi {
  constructor() {
    this.baseUrl = API_BASE;
  }

  /**
   * Get token from localStorage
   */
  getToken() {
    return localStorage.getItem("authToken");
  }

  /**
   * Make API request with authentication
   */
  async request(endpoint, method = "GET", data = null) {
    const token = this.getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(endpoint, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `API error: ${response.status}`);
    }

    return result;
  }

  // ========== SEMESTERS ==========

  /**
   * Create a new semester
   */
  async createSemester(name) {
    return this.request(`${this.baseUrl}/semesters`, "POST", { name });
  }

  /**
   * Get all semesters with subjects
   */
  async getSemesters() {
    return this.request(`${this.baseUrl}/semesters`);
  }

  /**
   * Get a specific semester
   */
  async getSemester(semesterId) {
    return this.request(`${this.baseUrl}/semesters/${semesterId}`);
  }

  /**
   * Update a semester
   */
  async updateSemester(semesterId, name) {
    return this.request(`${this.baseUrl}/semesters/${semesterId}`, "PUT", {
      name,
    });
  }

  /**
   * Delete a semester
   */
  async deleteSemester(semesterId) {
    return this.request(`${this.baseUrl}/semesters/${semesterId}`, "DELETE");
  }

  // ========== SUBJECTS ==========

  /**
   * Create a new subject in a semester
   */
  async createSubject(semesterId, name, grade, credits) {
    return this.request(
      `${this.baseUrl}/semesters/${semesterId}/subjects`,
      "POST",
      { name, grade, credits }
    );
  }

  /**
   * Update a subject
   */
  async updateSubject(subjectId, updates) {
    return this.request(`${this.baseUrl}/subjects/${subjectId}`, "PUT", updates);
  }

  /**
   * Delete a subject
   */
  async deleteSubject(subjectId) {
    return this.request(`${this.baseUrl}/subjects/${subjectId}`, "DELETE");
  }

  // ========== GRADE MAPPINGS ==========

  /**
   * Get grade mappings
   */
  async getGradeMappings() {
    return this.request(`${this.baseUrl}/grade-mappings`);
  }

  /**
   * Update grade mappings
   */
  async updateGradeMappings(mappings) {
    return this.request(`${this.baseUrl}/grade-mappings`, "PUT", { mappings });
  }
}

// Create singleton instance
const gpaApi = new GpaApi();

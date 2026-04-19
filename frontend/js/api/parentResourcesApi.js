// js/api/parentResourcesApi.js
class ParentResourcesApi {
  constructor() {
    this.baseUrl = "/api/parent";
    this.publicUrl = "/api/public";
  }

  getToken() {
    return localStorage.getItem("authToken");
  }

  async request(endpoint, method = "GET", data = null, requireAuth = true) {
    const token = this.getToken();
    if (requireAuth && !token) {
      throw new Error("Not authenticated");
    }

    // Add cache bust for GET requests
    if (method === "GET") {
      endpoint += (endpoint.includes('?') ? '&' : '?') + '_t=' + Date.now();
    }

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

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

  // ========== PUBLIC RESOURCES FROM TEACHERS ==========
  // These don't require authentication

  async getAllPublicNotes() {
    return this.request(`${this.publicUrl}/notes`, "GET", null, false);
  }

  async getPublicNotesBySubject(subjectId) {
    return this.request(`${this.publicUrl}/subjects/${subjectId}/notes`, "GET", null, false);
  }

  async getAllPublishedQuizzes() {
    return this.request(`${this.publicUrl}/quizzes`, "GET", null, false);
  }

  async getPublishedQuizzesBySubject(subjectId) {
    return this.request(`${this.publicUrl}/subjects/${subjectId}/quizzes`, "GET", null, false);
  }

  async getPublishedQuizSet(quizSetId) {
    return this.request(`${this.publicUrl}/quizzes/${quizSetId}`, "GET", null, false);
  }

  async getAllPublishedForums() {
    return this.request(`${this.publicUrl}/forums`, "GET", null, false);
  }

  async getPublishedForumsByGrade(grade) {
    return this.request(`${this.publicUrl}/forums/grade/${grade}`, "GET", null, false);
  }

  async getAllTeachers() {
    return this.request(`${this.publicUrl}/teachers`, "GET", null, false);
  }

  // ========== RESOURCE RECOMMENDATIONS ==========
  // These require authentication

  async addRecommendation(studentId, resourceType, resourceId) {
    return this.request(`${this.baseUrl}/resources/recommend`, "POST", {
      student_id: studentId,
      resource_type: resourceType,
      resource_id: resourceId,
    });
  }

  async getRecommendations(studentId) {
    return this.request(`${this.baseUrl}/resources/${studentId}/recommendations`);
  }

  async removeRecommendation(recommendationId) {
    return this.request(`${this.baseUrl}/resources/remove-recommendation`, "POST", {
      recommendation_id: recommendationId,
    });
  }

  async removeRecommendationByResource(studentId, resourceType, resourceId) {
    return this.request(`${this.baseUrl}/resources/remove-recommendation`, "POST", {
      student_id: studentId,
      resource_type: resourceType,
      resource_id: resourceId,
    });
  }
}

const parentResourcesApi = new ParentResourcesApi();
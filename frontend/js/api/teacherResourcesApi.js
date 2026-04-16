// js/api/teacherResourcesApi.js

const API_BASE = "/api/public";
const STUDENT_API_BASE = "/api/student";

class TeacherResourcesApi {
  constructor() {
    this.baseUrl = API_BASE;
    this.studentBaseUrl = STUDENT_API_BASE;
  }

  getToken() {
    return localStorage.getItem("authToken");
  }

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

  // ========== PUBLIC NOTES ==========

  async getAllPublicNotes() {
    return this.request(`${this.baseUrl}/notes`);
  }

  async getPublicNotesBySubject(subjectId) {
    return this.request(`${this.baseUrl}/subjects/${subjectId}/notes`);
  }

  // ========== PUBLIC QUIZZES ==========

  async getAllPublishedQuizzes() {
    return this.request(`${this.baseUrl}/quizzes`);
  }

  async getPublishedQuizzesBySubject(subjectId) {
    return this.request(`${this.baseUrl}/subjects/${subjectId}/quizzes`);
  }

  async getPublishedQuizSet(quizSetId) {
    return this.request(`${this.baseUrl}/quizzes/${quizSetId}`);
  }

  // ========== PUBLIC FORUMS ==========

  async getAllPublishedForums() {
    return this.request(`${this.baseUrl}/forums`);
  }

  async getPublishedForumsByGrade(grade) {
    return this.request(`${this.baseUrl}/forums/grade/${grade}`);
  }

  // ========== PUBLIC TEACHERS ==========

  async getAllTeachers() {
    return this.request(`${this.baseUrl}/teachers`);
  }

  // ========== VIEW COUNTS ==========

  async incrementView(resourceType, resourceId) {
    return this.request(`${this.baseUrl}/${resourceType}/${resourceId}/view`, "POST");
  }

  async incrementStudentView(resourceType, resourceId) {
    return this.request(`${this.studentBaseUrl}/${resourceType}/${resourceId}/view`, "POST");
  }
}

const teacherResourcesApi = new TeacherResourcesApi();

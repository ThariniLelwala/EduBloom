// js/api/studentQuizApi.js

const API_BASE = "/api/student/quizzes";

class StudentQuizApi {
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

  // ========== QUIZ SUBJECTS ==========

  /**
   * Create a new quiz subject
   */
  async createSubject(name, description = null) {
    return this.request(`${this.baseUrl}/subjects`, "POST", {
      name,
      description,
    });
  }

  /**
   * Get all quiz subjects
   */
  async getSubjects() {
    return this.request(`${this.baseUrl}/subjects`);
  }

  /**
   * Get a specific quiz subject
   */
  async getSubject(subjectId) {
    return this.request(`${this.baseUrl}/subjects/${subjectId}`);
  }

  /**
   * Update a quiz subject
   */
  async updateSubject(subjectId, updates) {
    return this.request(
      `${this.baseUrl}/subjects/${subjectId}`,
      "PUT",
      updates
    );
  }

  /**
   * Delete a quiz subject
   */
  async deleteSubject(subjectId) {
    return this.request(`${this.baseUrl}/subjects/${subjectId}`, "DELETE");
  }

  // ========== QUIZ SETS ==========

  /**
   * Create a new quiz set
   */
  async createQuizSet(subjectId, name, description = null) {
    return this.request(`${this.baseUrl}/subjects/${subjectId}/sets`, "POST", {
      name,
      description,
    });
  }

  /**
   * Get all quiz sets for a subject
   */
  async getQuizSets(subjectId) {
    return this.request(`${this.baseUrl}/subjects/${subjectId}/sets`);
  }

  /**
   * Get a specific quiz set with all questions
   */
  async getQuizSet(setId) {
    return this.request(`${this.baseUrl}/sets/${setId}`);
  }

  /**
   * Update a quiz set
   */
  async updateQuizSet(setId, updates) {
    return this.request(`${this.baseUrl}/sets/${setId}`, "PUT", updates);
  }

  /**
   * Delete a quiz set
   */
  async deleteQuizSet(setId) {
    return this.request(`${this.baseUrl}/sets/${setId}`, "DELETE");
  }

  // ========== QUIZ QUESTIONS ==========

  /**
   * Create a new question
   */
  async createQuestion(setId, questionText, answers) {
    return this.request(`${this.baseUrl}/sets/${setId}/questions`, "POST", {
      question_text: questionText,
      answers,
    });
  }

  /**
   * Get all questions in a quiz set
   */
  async getQuestions(setId) {
    return this.request(`${this.baseUrl}/sets/${setId}/questions`);
  }

  /**
   * Update a question
   */
  async updateQuestion(questionId, updates) {
    return this.request(
      `${this.baseUrl}/questions/${questionId}`,
      "PUT",
      updates
    );
  }

  /**
   * Delete a question
   */
  async deleteQuestion(questionId) {
    return this.request(`${this.baseUrl}/questions/${questionId}`, "DELETE");
  }
}

// Create singleton instance
const studentQuizApi = new StudentQuizApi();

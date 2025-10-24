// js/api/todoApi.js
class TodoApi {
  constructor() {
    this.baseUrl = "/api/parent";
    this.currentStudentId = null;
  }

  /**
   * Request helper for all API calls
   */
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

  /**
   * Create a new todo item
   * POST /api/parent/todos
   */
  async createTodo(studentId, type, text) {
    return this.request("/todos", "POST", {
      student_id: studentId,
      type,
      text,
    });
  }

  /**
   * Get all todos for a student
   * GET /api/parent/students/:studentId/todos
   */
  async getTodos(studentId) {
    return this.request(`/students/${studentId}/todos`);
  }

  /**
   * Get todos by type for a student
   * GET /api/parent/students/:studentId/todos/:type
   */
  async getTodosByType(studentId, type) {
    return this.request(`/students/${studentId}/todos/${type}`);
  }

  /**
   * Update a todo item
   * PUT /api/parent/todos/:todoId
   */
  async updateTodo(todoId, updates) {
    return this.request(`/todos/${todoId}`, "PUT", updates);
  }

  /**
   * Delete a todo item
   * DELETE /api/parent/todos/:todoId
   */
  async deleteTodo(todoId) {
    return this.request(`/todos/${todoId}`, "DELETE");
  }

  /**
   * Get all students for this parent
   * GET /api/parent/students
   */
  async getStudents() {
    return this.request("/students");
  }

  /**
   * Archive expired weekly and monthly goals
   * POST /api/parent/archive-expired-goals
   */
  async archiveExpiredGoals() {
    return this.request("/archive-expired-goals", "POST");
  }

  /**
   * Get expired goals for a student
   * GET /api/parent/students/:studentId/expired-goals
   */
  async getExpiredGoals(studentId) {
    return this.request(`/students/${studentId}/expired-goals`);
  }
}

// Create singleton instance
const todoApi = new TodoApi();

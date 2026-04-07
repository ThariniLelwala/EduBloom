// js/api/teacherTodoApi.js
class TeacherTodoApi {
  constructor() {
    this.baseUrl = "/api/teacher/todos";
  }

  /**
   * Get authorization token from localStorage
   */
  getToken() {
    return localStorage.getItem("authToken");
  }

  /**
   * Create a new todo or deadline
   * @param {string} type - 'todo' or 'deadline'
   * @param {string} text - The task/event description
   * @param {string} expiresAt - Optional ISO date string
   */
  async createTodo(type, text, expiresAt = null) {
    try {
      const response = await fetch(`${this.baseUrl}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ type, text, expiresAt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create todo");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating teacher todo:", error);
      throw error;
    }
  }

  /**
   * Get all todos for the teacher
   */
  async getTodos() {
    try {
      const response = await fetch(this.baseUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch todos");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching teacher todos:", error);
      throw error;
    }
  }

  /**
   * Update a todo (mark as completed, edit text or date)
   */
  async updateTodo(todoId, updates) {
    try {
      const response = await fetch(`${this.baseUrl}/${todoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update todo");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating teacher todo:", error);
      throw error;
    }
  }

  /**
   * Delete a todo
   */
  async deleteTodo(todoId) {
    try {
      const response = await fetch(`${this.baseUrl}/${todoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete todo");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting teacher todo:", error);
      throw error;
    }
  }
}

// Create singleton instance
const teacherTodoApi = new TeacherTodoApi();
window.teacherTodoApi = teacherTodoApi;

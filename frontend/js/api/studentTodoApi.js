// js/api/studentTodoApi.js
class StudentTodoApi {
  constructor() {
    this.baseUrl = "/api/student/todos";
  }

  /**
   * Get authorization token from localStorage
   */
  getToken() {
    return localStorage.getItem("authToken");
  }

  /**
   * Create a new todo
   */
  async createTodo(type, text) {
    try {
      const response = await fetch(`${this.baseUrl}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ type, text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create todo");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating todo:", error);
      throw error;
    }
  }

  /**
   * Get all todos
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
      console.error("Error fetching todos:", error);
      throw error;
    }
  }

  /**
   * Get todos by type (todo, weekly, or monthly)
   */
  async getTodosByType(type) {
    try {
      const response = await fetch(`${this.baseUrl}/${type}`, {
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
      console.error("Error fetching todos by type:", error);
      throw error;
    }
  }

  /**
   * Update a todo (mark as completed or edit text)
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
      console.error("Error updating todo:", error);
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
      console.error("Error deleting todo:", error);
      throw error;
    }
  }

  /**
   * Archive expired weekly and monthly goals
   */
  async archiveExpiredGoals() {
    try {
      const response = await fetch(`/api/student/archive-expired-goals`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to archive expired goals");
      }

      return await response.json();
    } catch (error) {
      console.error("Error archiving expired goals:", error);
      throw error;
    }
  }

  /**
   * Get parent-assigned todos for this student
   */
  async getParentTodos() {
    try {
      const response = await fetch(`/api/student/parent-todos`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch parent todos");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching parent todos:", error);
      throw error;
    }
  }

  /**
   * Update parent todo (mark as completed)
   */
  async updateParentTodo(todoId, updates) {
    try {
      const response = await fetch(`/api/student/parent-todos/${todoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update parent todo");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating parent todo:", error);
      throw error;
    }
  }

  /**
   * Get expired goals
   */
  async getExpiredGoals() {
    try {
      const response = await fetch(`/api/student/expired-goals`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch expired goals");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching expired goals:", error);
      throw error;
    }
  }
}

// Create singleton instance
const studentTodoApi = new StudentTodoApi();

// frontend/js/api/parentProgressApi.js
class ParentProgressApi {
  constructor() {
    this.baseUrl = "/api/parent/children";
  }

  /**
   * Get authorization token from localStorage
   */
  getToken() {
    return localStorage.getItem("authToken");
  }

  /**
   * Get selected child ID from localStorage
   */
  getChildId() {
    return localStorage.getItem("selectedChildId");
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

  // ========== POMODORO ==========

  /**
   * Get child's pomodoro sessions
   */
  async getPomodoroSessions(childId, limit = 50) {
    const url = limit 
      ? `${this.baseUrl}/${childId}/pomodoro/sessions?limit=${limit}`
      : `${this.baseUrl}/${childId}/pomodoro/sessions`;
    return this.request(url, "GET");
  }

  /**
   * Get child's pomodoro statistics
   */
  async getPomodoroStats(childId, dateFrom = null, dateTo = null) {
    let url = `${this.baseUrl}/${childId}/pomodoro/stats`;
    const params = new URLSearchParams();
    
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.request(url, "GET");
  }

  // ========== DIARY ==========

  /**
   * Get child's diary entries
   */
  async getDiaryEntries(childId) {
    return this.request(`${this.baseUrl}/${childId}/diary/entries`, "GET");
  }

  // ========== TODOS ==========

  /**
   * Get child's todos
   */
  async getTodos(childId) {
    return this.request(`${this.baseUrl}/${childId}/todos`, "GET");
  }

  /**
   * Get child's todos by type
   */
  async getTodosByType(childId, type) {
    return this.request(`${this.baseUrl}/${childId}/todos/${type}`, "GET");
  }

  // ========== EXAMS ==========

  /**
   * Get child's exam terms
   */
  async getExamTerms(childId) {
    return this.request(`${this.baseUrl}/${childId}/exams/terms`, "GET");
  }

  // ========== MARKS ==========

  /**
   * Get child's mark subjects
   */
  async getMarkSubjects(childId) {
    return this.request(`${this.baseUrl}/${childId}/marks/subjects`, "GET");
  }

  // ========== CONVENIENCE METHODS ==========

  /**
   * Get all progress data for a child
   */
  async getAllProgressData(childId) {
    try {
      const [
        pomodoroSessions,
        pomodoroStats,
        diaryEntries,
        todos,
        examTerms,
        markSubjects
      ] = await Promise.all([
        this.getPomodoroSessions(childId),
        this.getPomodoroStats(childId),
        this.getDiaryEntries(childId),
        this.getTodos(childId),
        this.getExamTerms(childId),
        this.getMarkSubjects(childId)
      ]);

      return {
        pomodoro: {
          sessions: pomodoroSessions.sessions || [],
          stats: pomodoroStats.stats || {}
        },
        diary: {
          entries: diaryEntries.entries || []
        },
        todos: {
          items: todos.todos || []
        },
        exams: {
          terms: examTerms.terms || []
        },
        marks: {
          subjects: markSubjects.subjects || []
        }
      };
    } catch (error) {
      console.error("Error fetching all progress data:", error);
      throw error;
    }
  }
}

// Create singleton instance
const parentProgressApi = new ParentProgressApi();
window.parentProgressApi = parentProgressApi;
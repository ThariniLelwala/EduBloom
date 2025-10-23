// js/api/flashcardApi.js

const API_BASE = "/api/student/flashcards";

class FlashcardApi {
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

  // ========== FLASHCARD SUBJECTS ==========

  /**
   * Create a new flashcard subject
   */
  async createSubject(name, description = null) {
    return this.request(`${this.baseUrl}/subjects`, "POST", {
      name,
      description,
    });
  }

  /**
   * Get all flashcard subjects
   */
  async getSubjects() {
    return this.request(`${this.baseUrl}/subjects`);
  }

  /**
   * Get a specific flashcard subject
   */
  async getSubject(subjectId) {
    return this.request(`${this.baseUrl}/subjects/${subjectId}`);
  }

  /**
   * Update a flashcard subject
   */
  async updateSubject(subjectId, updates) {
    return this.request(
      `${this.baseUrl}/subjects/${subjectId}`,
      "PUT",
      updates
    );
  }

  /**
   * Delete a flashcard subject
   */
  async deleteSubject(subjectId) {
    return this.request(`${this.baseUrl}/subjects/${subjectId}`, "DELETE");
  }

  // ========== FLASHCARD SETS ==========

  /**
   * Create a new flashcard set
   */
  async createFlashcardSet(subjectId, name, description = null) {
    return this.request(`${this.baseUrl}/subjects/${subjectId}/sets`, "POST", {
      name,
      description,
    });
  }

  /**
   * Get all flashcard sets for a subject
   */
  async getFlashcardSets(subjectId) {
    return this.request(`${this.baseUrl}/subjects/${subjectId}/sets`);
  }

  /**
   * Get a specific flashcard set with all items
   */
  async getFlashcardSet(setId) {
    return this.request(`${this.baseUrl}/sets/${setId}`);
  }

  /**
   * Update a flashcard set
   */
  async updateFlashcardSet(setId, updates) {
    return this.request(`${this.baseUrl}/sets/${setId}`, "PUT", updates);
  }

  /**
   * Delete a flashcard set
   */
  async deleteFlashcardSet(setId) {
    return this.request(`${this.baseUrl}/sets/${setId}`, "DELETE");
  }

  // ========== FLASHCARD ITEMS ==========

  /**
   * Create a new flashcard item
   */
  async createFlashcardItem(setId, question, answer, itemOrder = 0) {
    return this.request(`${this.baseUrl}/sets/${setId}/items`, "POST", {
      question,
      answer,
      item_order: itemOrder,
    });
  }

  /**
   * Get all flashcard items in a set
   */
  async getFlashcardItems(setId) {
    return this.request(`${this.baseUrl}/sets/${setId}/items`);
  }

  /**
   * Update a flashcard item
   */
  async updateFlashcardItem(setId, itemId, updates) {
    return this.request(
      `${this.baseUrl}/sets/${setId}/items/${itemId}`,
      "PUT",
      updates
    );
  }

  /**
   * Delete a flashcard item
   */
  async deleteFlashcardItem(setId, itemId) {
    return this.request(
      `${this.baseUrl}/sets/${setId}/items/${itemId}`,
      "DELETE"
    );
  }

  /**
   * Reorder flashcard items
   */
  async reorderFlashcardItems(setId, itemIds) {
    return this.request(`${this.baseUrl}/sets/${setId}/reorder-items`, "PUT", {
      item_ids: itemIds,
    });
  }
}

// Create singleton instance
const flashcardApi = new FlashcardApi();

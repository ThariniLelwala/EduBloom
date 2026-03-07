// js/api/studentDiaryApi.js

class StudentDiaryApi {
  constructor() {
    this.baseUrl = "/api/student/diary";
  }

  // Helper method to get headers with authentication
  getHeaders() {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Fetch all diary entries for the current student
   */
  async getEntries() {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${this.baseUrl}/entries`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Authentication failed. Please log in again."
          );
        }
        throw new Error("Failed to fetch diary entries");
      }

      const data = await response.json();
      return data.entries || [];
    } catch (error) {
      console.error("Diary API Error (getEntries):", error);
      throw error;
    }
  }

  /**
   * Create a new diary entry
   */
  async createEntry(entryData) {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${this.baseUrl}/entries`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        throw new Error("Failed to create diary entry");
      }

      const data = await response.json();
      return data.entry;
    } catch (error) {
      console.error("Diary API Error (createEntry):", error);
      throw error;
    }
  }

  /**
   * Update an existing diary entry
   */
  async updateEntry(entryId, entryData) {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${this.baseUrl}/entries/${entryId}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        throw new Error("Failed to update diary entry");
      }

      const data = await response.json();
      return data.entry;
    } catch (error) {
      console.error("Diary API Error (updateEntry):", error);
      throw error;
    }
  }

  /**
   * Delete a diary entry
   */
  async deleteEntry(entryId) {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${this.baseUrl}/entries/${entryId}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete diary entry");
      }

      return true;
    } catch (error) {
      console.error("Diary API Error (deleteEntry):", error);
      throw error;
    }
  }
}

// Instantiate and export globally for use in scripts
const studentDiaryApi = new StudentDiaryApi();
window.studentDiaryApi = studentDiaryApi;

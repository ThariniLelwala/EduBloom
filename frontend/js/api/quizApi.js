// js/api/quizApi.js
const API_BASE = "/api/teacher/quiz";

// Get auth token from localStorage
function getAuthToken() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.warn("No authentication token found. User may not be logged in.");
  }
  return token;
}

// Helper function for API calls
async function apiCall(endpoint, method = "GET", body = null) {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "Authentication required. Please log in to access quizzes."
    );
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

  try {
    const response = await fetch(endpoint, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Quiz Subjects API
const QuizAPI = {
  // Subjects
  createSubject(name, description = null) {
    return apiCall(`${API_BASE}/subjects`, "POST", {
      name,
      description,
    });
  },

  getSubjects() {
    return apiCall(`${API_BASE}/subjects`);
  },

  getSubject(subjectId) {
    return apiCall(`${API_BASE}/subjects/${subjectId}`);
  },

  updateSubject(subjectId, name, description) {
    return apiCall(`${API_BASE}/subjects/${subjectId}`, "PUT", {
      name,
      description,
    });
  },

  deleteSubject(subjectId) {
    return apiCall(`${API_BASE}/subjects/${subjectId}`, "DELETE");
  },

  // Quiz Sets (Quizzes)
  createQuizSet(subjectId, name, description = null, isPublished = false) {
    return apiCall(`${API_BASE}/subjects/${subjectId}/quiz-sets`, "POST", {
      name,
      description,
      is_published: isPublished,
    });
  },

  getQuizSets(subjectId) {
    return apiCall(`${API_BASE}/subjects/${subjectId}/quiz-sets`);
  },

  getQuizSet(quizSetId) {
    return apiCall(`${API_BASE}/quiz-sets/${quizSetId}`);
  },

  updateQuizSet(quizSetId, updates) {
    return apiCall(`${API_BASE}/quiz-sets/${quizSetId}`, "PUT", updates);
  },

  deleteQuizSet(quizSetId) {
    return apiCall(`${API_BASE}/quiz-sets/${quizSetId}`, "DELETE");
  },

  // Questions
  createQuestion(quizSetId, questionText, answers) {
    return apiCall(`${API_BASE}/quiz-sets/${quizSetId}/questions`, "POST", {
      question_text: questionText,
      answers,
    });
  },

  getQuestions(quizSetId) {
    return apiCall(`${API_BASE}/quiz-sets/${quizSetId}/questions`);
  },

  getQuestion(questionId) {
    return apiCall(`${API_BASE}/questions/${questionId}`);
  },

  updateQuestion(questionId, questionText, answers) {
    return apiCall(`${API_BASE}/questions/${questionId}`, "PUT", {
      question_text: questionText,
      answers,
    });
  },

  deleteQuestion(questionId) {
    return apiCall(`${API_BASE}/questions/${questionId}`, "DELETE");
  },

  reorderQuestions(quizSetId, questionIds) {
    return apiCall(
      `${API_BASE}/quiz-sets/${quizSetId}/reorder-questions`,
      "PUT",
      {
        question_ids: questionIds,
      }
    );
  },
};

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = QuizAPI;
}

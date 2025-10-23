// controllers/student/flashcardController.js
const flashcardService = require("../../services/student/flashcardService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class FlashcardController {
  /**
   * Create a new flashcard subject
   * POST /api/student/flashcards/subjects
   */
  async createSubject(req, res) {
    try {
      const data = await parseRequestBody(req);
      const result = await flashcardService.createFlashcardSubject(
        req.user.id,
        data.name,
        data.description
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get all flashcard subjects for logged-in student
   * GET /api/student/flashcards/subjects
   */
  async getSubjects(req, res) {
    try {
      const result = await flashcardService.getFlashcardSubjects(req.user.id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get a specific flashcard subject
   * GET /api/student/flashcards/subjects/:subjectId
   */
  async getSubject(req, res) {
    try {
      const subjectId = parseInt(req.url.split("/")[5]);
      const result = await flashcardService.getFlashcardSubject(
        subjectId,
        req.user.id
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update a flashcard subject
   * PUT /api/student/flashcards/subjects/:subjectId
   */
  async updateSubject(req, res) {
    try {
      const subjectId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await flashcardService.updateFlashcardSubject(
        subjectId,
        req.user.id,
        data
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete a flashcard subject
   * DELETE /api/student/flashcards/subjects/:subjectId
   */
  async deleteSubject(req, res) {
    try {
      const subjectId = parseInt(req.url.split("/")[5]);
      const result = await flashcardService.deleteFlashcardSubject(
        subjectId,
        req.user.id
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Create a new flashcard set within a subject
   * POST /api/student/flashcards/subjects/:subjectId/sets
   */
  async createFlashcardSet(req, res) {
    try {
      const subjectId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await flashcardService.createFlashcardSet(
        subjectId,
        req.user.id,
        data.name,
        data.description
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get all flashcard sets for a subject
   * GET /api/student/flashcards/subjects/:subjectId/sets
   */
  async getFlashcardSets(req, res) {
    try {
      const subjectId = parseInt(req.url.split("/")[5]);
      const result = await flashcardService.getFlashcardSets(
        subjectId,
        req.user.id
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get a specific flashcard set with all items
   * GET /api/student/flashcards/sets/:setId
   */
  async getFlashcardSet(req, res) {
    try {
      const setId = parseInt(req.url.split("/")[5]);
      const result = await flashcardService.getFlashcardSet(setId, req.user.id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update a flashcard set
   * PUT /api/student/flashcards/sets/:setId
   */
  async updateFlashcardSet(req, res) {
    try {
      const setId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await flashcardService.updateFlashcardSet(
        setId,
        req.user.id,
        data
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete a flashcard set
   * DELETE /api/student/flashcards/sets/:setId
   */
  async deleteFlashcardSet(req, res) {
    try {
      const setId = parseInt(req.url.split("/")[5]);
      const result = await flashcardService.deleteFlashcardSet(
        setId,
        req.user.id
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Create a new flashcard item in a set
   * POST /api/student/flashcards/sets/:setId/items
   */
  async createFlashcardItem(req, res) {
    try {
      const setId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await flashcardService.createFlashcardItem(
        setId,
        req.user.id,
        data.question,
        data.answer,
        data.item_order || 0
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get all items in a flashcard set
   * GET /api/student/flashcards/sets/:setId/items
   */
  async getFlashcardItems(req, res) {
    try {
      const setId = parseInt(req.url.split("/")[5]);
      const result = await flashcardService.getFlashcardItems(
        setId,
        req.user.id
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update a flashcard item
   * PUT /api/student/flashcards/sets/:setId/items/:itemId
   */
  async updateFlashcardItem(req, res) {
    try {
      const parts = req.url.split("/");
      const setId = parseInt(parts[5]);
      const itemId = parseInt(parts[7]);
      const data = await parseRequestBody(req);
      const result = await flashcardService.updateFlashcardItem(
        itemId,
        setId,
        req.user.id,
        data
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete a flashcard item
   * DELETE /api/student/flashcards/sets/:setId/items/:itemId
   */
  async deleteFlashcardItem(req, res) {
    try {
      const parts = req.url.split("/");
      const setId = parseInt(parts[5]);
      const itemId = parseInt(parts[7]);
      const result = await flashcardService.deleteFlashcardItem(
        itemId,
        setId,
        req.user.id
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Reorder flashcard items in a set
   * PUT /api/student/flashcards/sets/:setId/reorder-items
   */
  async reorderFlashcardItems(req, res) {
    try {
      const setId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await flashcardService.reorderFlashcardItems(
        setId,
        req.user.id,
        data.item_ids
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new FlashcardController();

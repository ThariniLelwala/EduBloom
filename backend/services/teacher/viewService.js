// services/teacher/viewService.js
const db = require("../../db/db");

class ViewService {
  async incrementView(resourceType, resourceId) {
    let table, idColumn;

    switch (resourceType) {
      case 'notes':
        table = 'teacher_module_notes';
        idColumn = 'id';
        break;
      case 'quizzes':
        table = 'quiz_sets';
        idColumn = 'id';
        break;
      case 'forums':
        table = 'forum_posts';
        idColumn = 'id';
        break;
      default:
        throw new Error("Invalid resource type");
    }

    await db.query(
      `UPDATE ${table} SET views = views + 1 WHERE ${idColumn} = $1`,
      [resourceId]
    );

    return { success: true };
  }

  async getViews(resourceType, resourceId) {
    let table, idColumn;

    switch (resourceType) {
      case 'notes':
        table = 'teacher_module_notes';
        idColumn = 'id';
        break;
      case 'quizzes':
        table = 'quiz_sets';
        idColumn = 'id';
        break;
      case 'forums':
        table = 'forum_posts';
        idColumn = 'id';
        break;
      default:
        throw new Error("Invalid resource type");
    }

    const result = await db.query(
      `SELECT views FROM ${table} WHERE ${idColumn} = $1`,
      [resourceId]
    );

    if (result.rows.length === 0) {
      throw new Error("Resource not found");
    }

    return { views: result.rows[0].views || 0 };
  }
}

module.exports = new ViewService();

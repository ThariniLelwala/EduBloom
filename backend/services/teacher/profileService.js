// services/teacher/profileService.js
const db = require("../../db/db");

class ProfileService {
  /**
   * Get teacher's own profile
   */
  async getProfile(teacherId) {
    const result = await db.query(
      `SELECT tp.*, u.username, u.email, u.firstname, u.lastname
       FROM teacher_profiles tp
       JOIN users u ON tp.teacher_id = u.id
       WHERE tp.teacher_id = $1`,
      [teacherId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Create or update teacher profile
   */
  async upsertProfile(teacherId, data) {
    const {
      title,
      qualifications,
      specialization,
      experience,
      certifications,
      contact_email,
      office_hours,
    } = data;

    const existing = await db.query(
      "SELECT teacher_id FROM teacher_profiles WHERE teacher_id = $1",
      [teacherId]
    );

    if (existing.rows.length === 0) {
      const result = await db.query(
        `INSERT INTO teacher_profiles (
          teacher_id, title, qualifications, specialization, experience, 
          certifications, contact_email, office_hours, rating, review_count,
          total_students, resources_created, resource_views
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 0, 0, 0, 0)
        RETURNING *`,
        [
          teacherId,
          title || null,
          qualifications || null,
          specialization || null,
          experience || null,
          certifications || null,
          contact_email || null,
          office_hours || null,
        ]
      );
      return result.rows[0];
    } else {
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (title !== undefined) {
        updateFields.push(`title = $${paramCount++}`);
        updateValues.push(title);
      }
      if (qualifications !== undefined) {
        updateFields.push(`qualifications = $${paramCount++}`);
        updateValues.push(qualifications);
      }
      if (specialization !== undefined) {
        updateFields.push(`specialization = $${paramCount++}`);
        updateValues.push(specialization);
      }
      if (experience !== undefined) {
        updateFields.push(`experience = $${paramCount++}`);
        updateValues.push(experience);
      }
      if (certifications !== undefined) {
        updateFields.push(`certifications = $${paramCount++}`);
        updateValues.push(certifications);
      }
      if (contact_email !== undefined) {
        updateFields.push(`contact_email = $${paramCount++}`);
        updateValues.push(contact_email);
      }
      if (office_hours !== undefined) {
        updateFields.push(`office_hours = $${paramCount++}`);
        updateValues.push(office_hours);
      }

      if (updateFields.length > 0) {
        updateFields.push(`updated_at = NOW()`);
        updateValues.push(teacherId);

        const result = await db.query(
          `UPDATE teacher_profiles 
           SET ${updateFields.join(", ")}
           WHERE teacher_id = $${paramCount}
           RETURNING *`,
          updateValues
        );
        return result.rows[0];
      }

      return await this.getProfile(teacherId);
    }
  }

  /**
   * Get public profile for a teacher (for students to view)
   */
  async getPublicProfile(teacherId) {
    const result = await db.query(
      `SELECT tp.teacher_id, tp.title, tp.qualifications, tp.specialization,
              tp.experience, tp.certifications, tp.rating, tp.review_count,
              tp.total_students, tp.resources_created, tp.resource_views,
              tp.contact_email, tp.office_hours,
              u.username, u.firstname, u.lastname
       FROM teacher_profiles tp
       JOIN users u ON tp.teacher_id = u.id
       WHERE tp.teacher_id = $1`,
      [teacherId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Get all public teachers with optional filters
   */
  async getAllPublicTeachers(filters = {}) {
    const { subject, rating, grade } = filters;

    let query = `
      SELECT tp.teacher_id, tp.title, tp.specialization, tp.rating, 
             tp.review_count, tp.total_students, tp.resources_created,
             u.username, u.firstname, u.lastname
      FROM teacher_profiles tp
      JOIN users u ON tp.teacher_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (rating) {
      params.push(parseFloat(rating));
      query += ` AND tp.rating >= $${params.length}`;
    }

    query += ` ORDER BY tp.rating DESC, tp.review_count DESC`;

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Update stats for a teacher (resources, views, students)
   */
  async updateStats(teacherId, stats) {
    const { total_students, resources_created, resource_views } = stats;

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (total_students !== undefined) {
      updateFields.push(`total_students = $${paramCount++}`);
      updateValues.push(total_students);
    }
    if (resources_created !== undefined) {
      updateFields.push(`resources_created = $${paramCount++}`);
      updateValues.push(resources_created);
    }
    if (resource_views !== undefined) {
      updateFields.push(`resource_views = $${paramCount++}`);
      updateValues.push(resource_views);
    }

    if (updateFields.length === 0) {
      return await this.getProfile(teacherId);
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(teacherId);

    const result = await db.query(
      `UPDATE teacher_profiles 
       SET ${updateFields.join(", ")}
       WHERE teacher_id = $${paramCount}
       RETURNING *`,
      updateValues
    );

    return result.rows[0];
  }
}

module.exports = new ProfileService();
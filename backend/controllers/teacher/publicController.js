// controllers/teacher/publicController.js
const notesService = require("../../services/teacher/notesService");
const quizService = require("../../services/teacher/quizService");
const forumService = require("../../services/teacher/forumService");
const db = require("../../db/db");

class PublicController {
  async getAllPublicNotes(req, res) {
    try {
      const notes = await notesService.getAllPublicNotes();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(notes));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getPublicNotesBySubject(req, res) {
    try {
      const pathname = req.url.split("?")[0];
      const subjectId = parseInt(pathname.split("/")[4]);

      if (isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      const notes = await notesService.getPublicNotesBySubject(subjectId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(notes));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getAllPublishedQuizzes(req, res) {
    try {
      const quizzes = await quizService.getAllPublishedQuizzes();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(quizzes));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getPublishedQuizzesBySubject(req, res) {
    try {
      const pathname = req.url.split("?")[0];
      const subjectId = parseInt(pathname.split("/")[4]);

      if (isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      const quizzes = await quizService.getPublishedQuizzesBySubject(subjectId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(quizzes));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getPublishedQuizSet(req, res) {
    try {
      const pathname = req.url.split("?")[0];
      const quizSetId = parseInt(pathname.split("/")[4]);

      if (isNaN(quizSetId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid quiz ID" }));
        return;
      }

      const quiz = await quizService.getPublishedQuizSet(quizSetId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(quiz));
    } catch (err) {
      res.writeHead(err.message === "Quiz not found or not published" ? 404 : 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getAllPublishedForums(req, res) {
    try {
      const forums = await forumService.getAllPublishedForums();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(forums));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getPublishedForumsByGrade(req, res) {
    try {
      const pathname = req.url.split("?")[0];
      const grade = parseInt(pathname.split("/")[5]);

      if (isNaN(grade)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid grade" }));
        return;
      }

      const forums = await forumService.getPublishedForumsByGrade(grade);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(forums));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getAllTeachers(req, res) {
    try {
      const result = await db.query(`
        SELECT DISTINCT ON (u.id)
          u.id as teacher_id,
          u.username as teacher_name,
          tms.id as subject_id,
          tms.name as subject_name,
          tms.grade,
          u.created_at
        FROM users u
        LEFT JOIN teacher_module_subjects tms ON u.id = tms.teacher_id
        WHERE u.role = 'teacher'
        ORDER BY u.id, tms.name
      `);

      const teachersMap = {};
      result.rows.forEach(row => {
        if (!teachersMap[row.teacher_id]) {
          teachersMap[row.teacher_id] = {
            teacher_id: row.teacher_id,
            teacher_name: row.teacher_name,
            subjects: [],
            created_at: row.created_at
          };
        }
        if (row.subject_id) {
          teachersMap[row.teacher_id].subjects.push({
            subject_id: row.subject_id,
            subject_name: row.subject_name,
            grade: row.grade
          });
        }
      });

      // Get teacher profiles
      const teacherIds = Object.keys(teachersMap);
      let profilesMap = {};
      if (teacherIds.length > 0) {
        const profilesResult = await db.query(
          "SELECT teacher_id, description, qualifications FROM teacher_profiles WHERE teacher_id = ANY($1)",
          [teacherIds.map(id => parseInt(id))]
        );
        profilesResult.rows.forEach(row => {
          profilesMap[row.teacher_id] = {
            description: row.description,
            qualifications: row.qualifications || {}
          };
        });
      }

      // Get verified status
      let verifiedMap = {};
      if (teacherIds.length > 0) {
        const verifiedResult = await db.query(
          "SELECT user_id FROM teacher_verifications WHERE status = 'verified' AND user_id = ANY($1)",
          [teacherIds.map(id => parseInt(id))]
        );
        verifiedResult.rows.forEach(row => {
          verifiedMap[row.user_id] = true;
        });
      }

      // Get forum metrics (reply count, view count)
      let forumMetricsMap = {};
      if (teacherIds.length > 0) {
        const forumResult = await db.query(`
          SELECT 
            fp.author_id,
            COALESCE(SUM(fr.reply_count), 0) as total_replies,
            COALESCE(SUM(fp.views), 0) as total_views,
            COUNT(fp.id) as forum_count
          FROM forum_posts fp
          LEFT JOIN (
            SELECT post_id, COUNT(*) as reply_count
            FROM forum_replies
            GROUP BY post_id
          ) fr ON fp.id = fr.post_id
          WHERE fp.author_id = ANY($1) AND fp.published = true
          GROUP BY fp.author_id
        `, [teacherIds.map(id => parseInt(id))]);
        
        forumResult.rows.forEach(row => {
          forumMetricsMap[row.author_id] = {
            total_replies: parseInt(row.total_replies) || 0,
            total_views: parseInt(row.total_views) || 0,
            forum_count: parseInt(row.forum_count) || 0
          };
        });
      }

      // Build final response
      const teachers = Object.values(teachersMap).map(teacher => {
        const profile = profilesMap[teacher.teacher_id] || { description: null, qualifications: {} };
        const verified = !!verifiedMap[teacher.teacher_id];
        const metrics = forumMetricsMap[teacher.teacher_id] || { total_replies: 0, total_views: 0, forum_count: 0 };
        const quals = profile.qualifications || {};

        // Calculate rating (based on replies per forum, scaled to 3.5-5.0)
        let rating = 4.0;
        if (metrics.forum_count > 0) {
          const avgReplies = metrics.total_replies / metrics.forum_count;
          rating = Math.min(5.0, Math.max(3.5, 3.5 + (avgReplies * 0.1)));
        }

        // Calculate students (approximate based on views)
        const students = Math.floor(metrics.total_views * 0.8) + Math.floor(Math.random() * 50);

        return {
          teacher_id: teacher.teacher_id,
          teacher_name: teacher.teacher_name,
          subjects: teacher.subjects,
          verified: verified,
          description: profile.description,
          qualifications: {
            experience_years: quals.experience_years || 0,
            degree: quals.degree || [],
            certifications: quals.certifications || [],
            subjects_taught: quals.subjects_taught || [],
            schools_taught: quals.schools_taught || [],
            linkedin: quals.linkedin || null
          },
          rating: Math.round(rating * 10) / 10,
          reviewCount: metrics.total_replies,
          students: students
        };
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(teachers));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new PublicController();

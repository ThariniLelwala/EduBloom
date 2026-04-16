// controllers/teacher/teacherController.js
const db = require("../../db/db");

class TeacherController {
  async getTeacherProfile(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      const decoded = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
      const teacherId = decoded.userId;

      const result = await db.query(
        "SELECT * FROM teacher_profiles WHERE teacher_id = $1",
        [teacherId]
      );

      if (result.rows.length === 0) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          teacher_id: teacherId,
          description: null,
          qualifications: {
            experience_years: 0,
            degree: [],
            certifications: [],
            subjects_taught: [],
            schools_taught: [],
            linkedin: null
          }
        }));
        return;
      }

      const profile = result.rows[0];
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        teacher_id: profile.teacher_id,
        description: profile.description,
        qualifications: profile.qualifications || {
          experience_years: 0,
          degree: [],
          certifications: [],
          subjects_taught: [],
          schools_taught: [],
          linkedin: null
        }
      }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async updateTeacherProfile(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      const decoded = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
      const teacherId = decoded.userId;

      let body = "";
      req.on("data", chunk => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        try {
          const data = JSON.parse(body);
          const { description, qualifications } = data;

          // Validate certifications (required, min 1)
          if (!qualifications || !qualifications.certifications || qualifications.certifications.length === 0) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "At least one certification is required" }));
            return;
          }

          // Validate certifications array
          const certs = qualifications.certifications || [];
          if (certs.length > 10) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Maximum 10 certifications allowed" }));
            return;
          }

          for (const cert of certs) {
            if (cert.length > 250) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Each certification must be 250 characters or less" }));
              return;
            }
          }

          // Validate degree array
          const degrees = qualifications.degree || [];
          if (degrees.length > 5) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Maximum 5 degrees allowed" }));
            return;
          }

          for (const deg of degrees) {
            if (deg.length > 250) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Each degree must be 250 characters or less" }));
              return;
            }
          }

          // Validate subjects_taught array
          const subjects = qualifications.subjects_taught || [];
          if (subjects.length > 20) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Maximum 20 subjects allowed" }));
            return;
          }

          for (const subj of subjects) {
            if (subj.length > 250) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Each subject must be 250 characters or less" }));
              return;
            }
          }

          // Validate schools_taught array
          const schools = qualifications.schools_taught || [];
          if (schools.length > 10) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Maximum 10 schools allowed" }));
            return;
          }

          for (const school of schools) {
            if (school.length > 250) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Each school must be 250 characters or less" }));
              return;
            }
          }

          // Validate experience_years
          const experienceYears = qualifications.experience_years || 0;
          if (experienceYears < 0 || experienceYears > 50) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Experience years must be between 0 and 50" }));
            return;
          }

          // Validate linkedin URL if provided
          if (qualifications.linkedin && qualifications.linkedin.length > 0) {
            try {
              new URL(qualifications.linkedin);
            } catch {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid LinkedIn URL format" }));
              return;
            }
          }

          // Validate description length
          if (description && description.length > 1000) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Description must be 1000 characters or less" }));
            return;
          }

          // Sanitize and structure qualifications
          const sanitizedQualifications = {
            experience_years: parseInt(experienceYears) || 0,
            degree: (degrees || []).map(d => d.trim()).filter(d => d.length > 0),
            certifications: (certs || []).map(c => c.trim()).filter(c => c.length > 0),
            subjects_taught: (subjects || []).map(s => s.trim()).filter(s => s.length > 0),
            schools_taught: (schools || []).map(s => s.trim()).filter(s => s.length > 0),
            linkedin: qualifications.linkedin || null
          };

          // Upsert profile
          await db.query(
            `INSERT INTO teacher_profiles (teacher_id, description, qualifications, updated_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (teacher_id)
             DO UPDATE SET description = $2, qualifications = $3, updated_at = NOW()`,
            [teacherId, description || null, JSON.stringify(sanitizedQualifications)]
          );

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            message: "Profile updated successfully",
            teacher_id: teacherId,
            description: description || null,
            qualifications: sanitizedQualifications
          }));
        } catch (parseErr) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON data" }));
        }
      });
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new TeacherController();

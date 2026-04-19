// Parent Resource Recommendation System
document.addEventListener("DOMContentLoaded", async function () {
  await ChildSelector.init();
  initializeParentResources();

  ChildSelector.onChildChanged(() => {
    loadResources();
    loadRecommendations();
    updateStatistics();
  });
});

let resourceData = {
  forums: [],
  notes: [],
  quizzes: [],
  teachers: [],
};

let parentRecommendations = {};
let resourceIdMap = {};

async function initializeParentResources() {
  await loadResources();
  await loadRecommendations();
  updateStatistics();
}

async function loadResources() {
  try {
    const [forums, notes, quizzes, teachers] = await Promise.all([
      parentResourcesApi.getAllPublishedForums(),
      parentResourcesApi.getAllPublicNotes(),
      parentResourcesApi.getAllPublishedQuizzes(),
      parentResourcesApi.getAllTeachers(),
    ]);

    resourceData.forums = forums || [];
    resourceData.notes = notes || [];
    resourceData.quizzes = quizzes || [];
    resourceData.teachers = teachers || [];

    resourceIdMap = {};
    resourceData.forums.forEach(item => { resourceIdMap[`forum-${item.id}`] = { type: 'forums', id: item.id }; });
    resourceData.notes.forEach(item => { resourceIdMap[`note-${item.id}`] = { type: 'notes', id: item.id }; });
    resourceData.quizzes.forEach(item => { 
      const quizId = item.id || item.quiz_set_id;
      resourceIdMap[`quiz-${quizId}`] = { type: 'quizzes', id: quizId }; 
    });
    resourceData.teachers.forEach(item => { 
      const teacherId = item.teacher_id || item.id;
      resourceIdMap[`teacher-${teacherId}`] = { type: 'teachers', id: teacherId }; 
    });

    renderAllResources();
  } catch (error) {
    console.error("Error loading resources:", error);
    showToast("Failed to load resources", "error");
  }
}

async function loadRecommendations() {
  const selectedChild = ChildSelector.getSelectedChild();
  const childId = selectedChild ? selectedChild.id : null;

  if (!childId) {
    parentRecommendations = {};
    return;
  }

  try {
    const recommendations = await parentResourcesApi.getRecommendations(childId);
    parentRecommendations = recommendations || {};
  } catch (error) {
    console.error("Error loading recommendations:", error);
    parentRecommendations = {};
  }
}

function updateStatistics() {
  document.getElementById("total-forums").textContent = resourceData.forums.length;
  document.getElementById("total-notes").textContent = resourceData.notes.length;
  document.getElementById("total-quizzes").textContent = resourceData.quizzes.length;
  document.getElementById("total-teachers").textContent = resourceData.teachers.length;
  
  // Update card-specific counts
  const activeForumsEl = document.getElementById("active-forums");
  const notesCountEl = document.getElementById("notes-count");
  const quizCountEl = document.getElementById("quiz-count");
  const teachersCountEl = document.getElementById("teachers-count");
  if (activeForumsEl) activeForumsEl.textContent = resourceData.forums.length;
  if (notesCountEl) notesCountEl.textContent = resourceData.notes.length;
  if (quizCountEl) quizCountEl.textContent = resourceData.quizzes.length;
  if (teachersCountEl) teachersCountEl.textContent = resourceData.teachers.length;
  
  // Update quiz questions count
  const totalQuestions = resourceData.quizzes.reduce((sum, q) => sum + (parseInt(q.question_count) || 0), 0);
  const quizQuestionsEl = document.getElementById("quiz-questions");
  if (quizQuestionsEl) {
    quizQuestionsEl.innerHTML = `<i class="fas fa-list"></i> ${totalQuestions} questions`;
  }
  
  // Update verified teachers count
  const verifiedCount = resourceData.teachers.filter(t => t.verified === true).length;
  const verifiedEl = document.getElementById("verified-teachers");
  if (verifiedEl) {
    verifiedEl.innerHTML = `<i class="fas fa-check-circle"></i> ${verifiedCount}/${resourceData.teachers.length}`;
  }
  
  // Update last activity timestamps
  updateLastActivity();

  const recommendedCount = Object.values(parentRecommendations).filter(v => v === true).length;
  document.getElementById("recommended-count").textContent = recommendedCount;
}

function updateLastActivity() {
  // Forum last activity
  const forumEl = document.getElementById("forum-last-activity");
  if (resourceData.forums.length > 0) {
    const latestForum = resourceData.forums.reduce((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || 0);
      const dateB = new Date(b.created_at || b.updated_at || 0);
      return dateA > dateB ? a : b;
    });
    const forumDate = new Date(latestForum.created_at || latestForum.updated_at);
    if (forumEl && forumDate && !isNaN(forumDate.getTime())) {
      forumEl.innerHTML = `<i class="fas fa-clock"></i> ${formatTimeAgo(forumDate)}`;
    } else if (forumEl) {
      forumEl.innerHTML = `<i class="fas fa-clock"></i> N/A`;
    }
  } else if (forumEl) {
    forumEl.innerHTML = `<i class="fas fa-clock"></i> No forums`;
  }
  
  // Notes last activity
  const notesEl = document.getElementById("notes-last-activity");
  if (resourceData.notes.length > 0) {
    const latestNote = resourceData.notes.reduce((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || 0);
      const dateB = new Date(b.created_at || b.updated_at || 0);
      return dateA > dateB ? a : b;
    });
    const noteDate = new Date(latestNote.created_at || latestNote.updated_at);
    if (notesEl && noteDate && !isNaN(noteDate.getTime())) {
      notesEl.innerHTML = `<i class="fas fa-calendar"></i> ${formatTimeAgo(noteDate)}`;
    } else if (notesEl) {
      notesEl.innerHTML = `<i class="fas fa-calendar"></i> N/A`;
    }
  } else if (notesEl) {
    notesEl.innerHTML = `<i class="fas fa-calendar"></i> No notes`;
  }
}

function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

function renderAllResources() {
  renderForums();
  renderNotes();
  renderQuizzes();
  renderTeachers();
  renderRecentRecommendations();
}

function renderForums() {
  const container = document.getElementById("forums-list");
  container.innerHTML = "";

  if (resourceData.forums.length === 0) {
    container.innerHTML = '<p style="color: rgba(255,255,255,0.6);">No forums available</p>';
    return;
  }

  resourceData.forums.forEach((forum) => {
    const forumId = forum.id;
    const isRecommended = parentRecommendations[forumId] === true;
    const forumTitle = forum.title || forum.name || 'Untitled Forum';
    const forumDescription = forum.description || '';
    const forumAuthor = forum.author || 'Unknown';
    let forumGrade = forum.target_grade ? parseInt(forum.target_grade) : null;
    const rawTags = forum.tags ? (Array.isArray(forum.tags) ? forum.tags : JSON.parse(forum.tags)) : [];
    
    // Extract grade from tags if target_grade is null
    if (!forumGrade && rawTags.length > 0) {
      for (const tag of rawTags) {
        const tagStr = String(tag).toLowerCase().replace(/\s/g, '');
        
        // Match "grade9", "grade10", etc.
        const numMatch = tagStr.match(/^grade(\d+)$/);
        if (numMatch) {
          forumGrade = parseInt(numMatch[1]);
          break;
        }
        
        // Match "gradenine", "gradeeight", etc.
        const wordMap = {
          'gradefive': 5, 'gradesix': 6, 'gradeseven': 7, 'gradeeight': 8,
          'gradenine': 9, 'gradeten': 10, 'gradeeleven': 11, 'gradetwelve': 12, 'gradethirteen': 13
        };
        if (wordMap[tagStr]) {
          forumGrade = wordMap[tagStr];
          break;
        }
      }
    }
    
    const forumTags = rawTags.filter(t => {
      if (!t) return false;
      const tagStr = String(t).toLowerCase().replace(/\s/g, '');
      // Filter out any tag containing grade
      if (tagStr.includes('grade')) return false;
      // Filter out exact grade number (9, 10, 11, etc.)
      if (forumGrade && tagStr === String(forumGrade)) return false;
      return true;
    });
    const replyCount = parseInt(forum.reply_count) || 0;

    const item = document.createElement("div");
    item.className = "resource-item-parent";
    item.innerHTML = `
      <div class="resource-header">
        <div>
          <div class="resource-name">${forumTitle}${forumGrade ? `<span class="grade-badge">Grade ${forumGrade}</span>` : ''}</div>
          <div class="resource-meta">
            <span><i class="fas fa-user"></i> ${forumAuthor}</span>
            <span><i class="fas fa-comment"></i> ${replyCount} replies</span>
          </div>
          <div class="resource-description">${forumDescription}</div>
          ${forumTags.length ? `<div class="resource-tags">${forumTags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
          ${isRecommended ? '<span class="recommendation-badge"><i class="fas fa-check-circle"></i> Recommended</span>' : ''}
        </div>
      </div>
      <div class="resource-actions">
        <button class="btn-secondary" onclick="viewResource('forum-${forumId}')">
          <i class="fas fa-eye"></i> View
        </button>
        ${isRecommended 
          ? `<button class="btn-primary" onclick="toggleRecommendation('${forumId}', 'forums', false)"><i class="fas fa-times"></i> Unrecommend</button>`
          : `<button class="btn-primary" onclick="toggleRecommendation('${forumId}', 'forums', true)"><i class="fas fa-thumbs-up"></i> Recommend</button>`
        }
      </div>
    `;
    container.appendChild(item);
  });
}

function renderNotes() {
  const container = document.getElementById("notes-list");
  container.innerHTML = "";

  if (resourceData.notes.length === 0) {
    container.innerHTML = '<p style="color: rgba(255,255,255,0.6);">No notes available</p>';
    return;
  }

  resourceData.notes.forEach((note) => {
    const noteId = note.id;
    const isRecommended = parentRecommendations[noteId] === true;
    const noteTitle = note.title || note.name || 'Untitled Note';
    const noteSubject = note.subject_name || note.subject || '';
    const noteTeacher = note.teacher_name || note.teacher || '';
    const notePages = note.pages || note.page_count || note.file_pages || 1;

    const item = document.createElement("div");
    item.className = "resource-item-parent";
    item.innerHTML = `
      <div class="resource-header">
        <div>
          <div class="resource-name">${noteTitle}</div>
          <div class="resource-description">${noteSubject} by ${noteTeacher}</div>
          ${isRecommended ? '<span class="recommendation-badge"><i class="fas fa-check-circle"></i> Recommended</span>' : ''}
        </div>
        <div style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.6);">
          ${notePages} pages
        </div>
      </div>
      <div class="resource-actions">
        <button class="btn-secondary" onclick="viewResource('note-${noteId}')">
          <i class="fas fa-eye"></i> View
        </button>
        ${isRecommended 
          ? `<button class="btn-primary" onclick="toggleRecommendation('${noteId}', 'notes', false)"><i class="fas fa-times"></i> Unrecommend</button>`
          : `<button class="btn-primary" onclick="toggleRecommendation('${noteId}', 'notes', true)"><i class="fas fa-thumbs-up"></i> Recommend</button>`
        }
      </div>
    `;
    container.appendChild(item);
  });
}

function renderQuizzes() {
  const container = document.getElementById("quizzes-list");
  container.innerHTML = "";

  if (resourceData.quizzes.length === 0) {
    container.innerHTML = '<p style="color: rgba(255,255,255,0.6);">No quizzes available</p>';
    return;
  }

  resourceData.quizzes.forEach((quiz) => {
    const quizId = quiz.id || quiz.quiz_set_id;
    const isRecommended = parentRecommendations[quizId] === true;
    const quizTitle = quiz.title || quiz.name || 'Untitled Quiz';
    const quizSubject = quiz.subject_name || quiz.subject || '';
    const questionCount = parseInt(quiz.question_count) || 0;

    const item = document.createElement("div");
    item.className = "resource-item-parent";
    item.innerHTML = `
      <div class="resource-header">
        <div>
          <div class="resource-name">${quizTitle}</div>
          <div class="resource-description">${quizSubject}</div>
          ${isRecommended ? '<span class="recommendation-badge"><i class="fas fa-check-circle"></i> Recommended</span>' : ''}
        </div>
        <div style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.6);">
          ${questionCount} questions
        </div>
      </div>
      <div class="resource-actions">
        <button class="btn-secondary" onclick="viewResource('quiz-${quizId}')">
          <i class="fas fa-eye"></i> View
        </button>
        ${isRecommended 
          ? `<button class="btn-primary" onclick="toggleRecommendation('${quizId}', 'quizzes', false)"><i class="fas fa-times"></i> Unrecommend</button>`
          : `<button class="btn-primary" onclick="toggleRecommendation('${quizId}', 'quizzes', true)"><i class="fas fa-thumbs-up"></i> Recommend</button>`
        }
      </div>
    `;
    container.appendChild(item);
  });
}

function renderTeachers() {
  const container = document.getElementById("teachers-list");
  container.innerHTML = "";

  if (resourceData.teachers.length === 0) {
    container.innerHTML = '<p style="color: rgba(255,255,255,0.6);">No teachers available</p>';
    return;
  }

  resourceData.teachers.forEach((teacher) => {
    const teacherId = teacher.teacher_id || teacher.id;
    const isRecommended = parentRecommendations[teacherId] === true;
    const teacherName = teacher.teacher_name || teacher.name || teacher.username || 'Unknown Teacher';
    const teacherSubjects = teacher.subjects && teacher.subjects.length 
      ? teacher.subjects.map(s => s.subject_name).filter(Boolean).join(', ')
      : teacher.subject || teacher.expertise || '';
    const teacherVerified = teacher.verified || false;
    const teacherRating = teacher.rating || 0;

    const item = document.createElement("div");
    item.className = "resource-item-parent";
    item.innerHTML = `
      <div class="resource-header">
        <div>
          <div class="resource-name">${teacherName}</div>
          <div class="resource-description">${teacherSubjects} ${
            teacherVerified ? '<i class="fas fa-check-circle" style="color: #4caf50; font-size: 0.7rem;"></i>' : ''
          }</div>
          ${isRecommended ? '<span class="recommendation-badge"><i class="fas fa-check-circle"></i> Recommended</span>' : ''}
        </div>
        <div style="font-size: 0.85rem; color: #ffd700;">
          <i class="fas fa-star"></i> ${teacherRating > 0 ? teacherRating.toFixed(1) : 'N/A'}
        </div>
      </div>
      <div class="resource-actions">
        <button class="btn-secondary" onclick="viewResource('teacher-${teacherId}')">
          <i class="fas fa-eye"></i> View
        </button>
        ${isRecommended 
          ? `<button class="btn-primary" onclick="toggleRecommendation('${teacherId}', 'teachers', false)"><i class="fas fa-times"></i> Unrecommend</button>`
          : `<button class="btn-primary" onclick="toggleRecommendation('${teacherId}', 'teachers', true)"><i class="fas fa-thumbs-up"></i> Recommend</button>`
        }
      </div>
    `;
    container.appendChild(item);
  });
}

function renderRecentRecommendations() {
  const container = document.getElementById("recent-recommendations");
  container.innerHTML = "";

  const recommendedIds = Object.entries(parentRecommendations)
    .filter(([_, isRecommended]) => isRecommended === true)
    .map(([id, _]) => parseInt(id))
    .slice(0, 5);

  if (recommendedIds.length === 0) {
    container.innerHTML = '<p style="color: rgba(255, 255, 255, 0.6); text-align: center; padding: 20px;">No recommendations yet. Start by recommending resources to your child!</p>';
    return;
  }

  const allItems = [
    ...resourceData.forums.map(f => ({ ...f, type: 'forums', id: f.id })),
    ...resourceData.notes.map(n => ({ ...n, type: 'notes', id: n.id })),
    ...resourceData.quizzes.map(q => ({ ...q, type: 'quizzes', id: q.id || q.quiz_set_id })),
    ...resourceData.teachers.map(t => ({ ...t, type: 'teachers', id: t.teacher_id || t.id })),
  ];

  recommendedIds.forEach(id => {
    const item = allItems.find(i => i.id === id);
    if (item) {
      const title = item.title || item.name || item.teacher_name || "";
      const desc = item.subject_name || item.subject || item.description || "";

      const activityItem = document.createElement("div");
      activityItem.className = "activity-item";
      activityItem.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${title}</span>
        <small>${desc}</small>
      `;
      container.appendChild(activityItem);
    }
  });
}

async function toggleRecommendation(resourceId, resourceType, recommend) {
  const selectedChild = ChildSelector.getSelectedChild();
  const childId = selectedChild ? selectedChild.id : null;

  if (!childId) {
    showToast("Please select a child first", "error");
    return;
  }

  try {
    if (recommend) {
      await parentResourcesApi.addRecommendation(childId, resourceType, parseInt(resourceId));
      parentRecommendations[resourceId] = true;
      showToast("Resource recommended to your child!");
    } else {
      await parentResourcesApi.removeRecommendationByResource(childId, resourceType, parseInt(resourceId));
      delete parentRecommendations[resourceId];
      showToast("Recommendation removed");
    }
    renderAllResources();
    updateStatistics();
  } catch (error) {
    console.error("Error toggling recommendation:", error);
    showToast("Failed to update recommendation", "error");
  }
}

window.toggleRecommendation = toggleRecommendation;

function viewResource(resourceId) {
  const mapping = resourceIdMap[resourceId];
  if (!mapping) {
    showToast("Resource not found", "error");
    return;
  }

  const { type, id } = mapping;

  if (type === 'forums') {
    const forum = resourceData.forums.find(f => f.id === id);
    openForumModal(forum);
  } else if (type === 'notes') {
    const note = resourceData.notes.find(n => n.id === id);
    openNotesModal(note);
  } else if (type === 'quizzes') {
    const quiz = resourceData.quizzes.find(q => (q.id || q.quiz_set_id) === id);
    openQuizModal(quiz);
  } else if (type === 'teachers') {
    const teacher = resourceData.teachers.find(t => (t.teacher_id || t.id) === id);
    openTeacherModal(teacher);
  }
}

window.viewResource = viewResource;

function openForumModal(forum) {
  if (forum) {
    document.getElementById("forum-title").textContent = forum.title || forum.name || "Forum";
    const contentElement = document.getElementById("forum-content");
    
    let content = forum.description || "No description available";
    content += `\n\nAuthor: ${forum.author || 'Unknown'}`;
    content += `\nReplies: ${forum.reply_count || 0}`;
    content += `\nViews: ${forum.views || 0}`;
    if (forum.target_grade) {
      content += `\nGrade: ${forum.target_grade}`;
    }
    let tags = forum.tags;
    if (tags && !Array.isArray(tags)) {
      try { tags = JSON.parse(tags); } catch (e) { tags = []; }
    }
    if (tags && tags.length > 0) {
      content += `\nTags: ${tags.join(', ')}`;
    }
    content += `\n\nCreated: ${new Date(forum.created_at).toLocaleString()}`;
    if (forum.updated_at) {
      content += `\nUpdated: ${new Date(forum.updated_at).toLocaleString()}`;
    }
    
    contentElement.textContent = content;
  }
  document.getElementById("forum-modal").classList.add("show");
}

function closeForum() {
  document.getElementById("forum-modal").classList.remove("show");
}

function openNotesModal(note) {
  if (note) {
    document.getElementById("notes-title").textContent = note.title || note.name || "Note";
    const noteSubject = note.subject_name || note.subject || 'N/A';
    const noteTeacher = note.teacher_name || note.teacher || 'N/A';
    const notePages = note.pages || note.page_count || 1;
    document.getElementById("notes-content").textContent = 
      `Subject: ${noteSubject}\nBy: ${noteTeacher}\nPages: ${notePages}`;
  }
  document.getElementById("notes-modal").classList.add("show");
}

function closeNotes() {
  document.getElementById("notes-modal").classList.remove("show");
}

function openQuizModal(quiz) {
  if (quiz) {
    const quizTitle = quiz.title || quiz.name || "Quiz";
    const quizSubject = quiz.subject_name || quiz.subject || 'N/A';
    const questionCount = parseInt(quiz.question_count) || 0;
    document.getElementById("quiz-title").textContent = quizTitle;
    document.getElementById("quiz-content").textContent = 
      `Subject: ${quizSubject}\nQuestions: ${questionCount}`;
  }
  document.getElementById("quiz-modal").classList.add("show");
}

function closeQuiz() {
  document.getElementById("quiz-modal").classList.remove("show");
}

function openTeacherModal(teacher) {
  if (teacher) {
    const teacherName = teacher.teacher_name || teacher.name || teacher.username || 'Unknown Teacher';
    const teacherSubjects = teacher.subjects && teacher.subjects.length 
      ? teacher.subjects.map(s => s.subject_name).filter(Boolean).join(', ')
      : teacher.subject || 'N/A';
    const teacherVerified = teacher.verified ? 'Yes' : 'No';
    const teacherRating = teacher.rating || 0;
    const teacherStudents = teacher.students || 0;
    const teacherQualifications = teacher.qualifications || {};
    
    document.getElementById("teacher-title").textContent = teacherName;
    document.getElementById("teacher-content").textContent = 
      `Subjects: ${teacherSubjects}\nVerified: ${teacherVerified}\nRating: ${teacherRating > 0 ? teacherRating.toFixed(1) : 'N/A'}\nStudents: ${teacherStudents}`;
  }
  document.getElementById("teacher-modal").classList.add("show");
}

function closeTeacher() {
  document.getElementById("teacher-modal").classList.remove("show");
}

function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = message;
    toast.className = `toast toast-${type}`;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 3000);
  }
}
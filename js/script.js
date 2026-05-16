const API_URL = 'http://localhost:3000/api';

function getToken() {
  return sessionStorage.getItem('token') || localStorage.getItem('token');
}

function getUserId() {
  return sessionStorage.getItem('userId') || localStorage.getItem('userId');
}

function getUserRole() {
  return sessionStorage.getItem('userRole') || localStorage.getItem('userRole');
}

function getAssignedStudentsEndpoint() {
  const role = getUserRole();
  const userId = getUserId();
  if (role === 'school-supervisor' && userId) {
    return `${API_URL}/users/students/assigned/school/${userId}`;
  }
  if (role === 'industry-supervisor' && userId) {
    return `${API_URL}/users/industry-supervisor/my-interns`;
  }
  return `${API_URL}/users/students`;
}

async function handleRegister() {
  const role = document.getElementById('reg-role').value;

  if (!role) {
    alert('Please select your role.');
    return;
  }

  const password = document.getElementById('reg-pw').value;
  const confirmPw = document.getElementById('reg-cpw').value;

  if (!password || password !== confirmPw) {
    alert('Passwords do not match.');
    return;
  }

  // Basic password policy to harden account security.
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    alert('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
    return;
  }

  let data = { role, password };

  if (role === 'student') {
    const fullName = document.getElementById('reg-fullname').value.trim();
    const registrationNumber = document.getElementById('reg-regnumber').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    if (!fullName || !registrationNumber || !email) {
      alert('Please fill in full name, registration number, and email.');
      return;
    }

    data = {
      ...data,
      fullName,
      registrationNumber,
      yearOfStudy: document.getElementById('reg-year').value,
      internshipAttempt: document.getElementById('reg-attempt').value,
      course: document.getElementById('reg-course').value,
      placementCompany: document.getElementById('reg-placement').value,
      country: document.getElementById('reg-country').value,
      email,
    };
  } else {
    const fullName = document.getElementById('reg-sup-fullname').value.trim();
    const staffId = document.getElementById('reg-staffid').value.trim();
    const email = document.getElementById('reg-sup-email').value.trim();
    if (!fullName || !staffId || !email) {
      alert('Please fill in full name, staff ID, and email.');
      return;
    }

    data = {
      ...data,
      fullName,
      staffId,
      email,
      department: role !== 'admin'
        ? document.getElementById('reg-department').value
        : null,
    };
  }

  const btn = document.getElementById('register-btn');
  btn.innerHTML = '<span class="spinner"></span> Creating account...';
  btn.disabled = true;

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || 'Registration failed. Please try again.');
      return;
    }

    alert('Account created successfully! Please sign in.');
    showPage('page-login');
    // Clear the register form
    document.getElementById('reg-role').value = '';
    toggleRegFields();

  } catch (err) {
    alert('Could not connect to server. Make sure the backend is running.');
  } finally {
    btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
    btn.disabled = false;
  }
}
/* ===== PAGE NAVIGATION ===== */

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
  const page = document.getElementById(id);
  if (page) {
    page.style.display = 'flex'; setTimeout(() => page.classList.add('active'), 10);
    history.pushState({ page: id }, '', `#${id}`);
    
    // Scroll both window and all scrollable containers to top
    window.scrollTo(0, 0);
    document.querySelectorAll('.page-body, .main-content, .dash-wrap').forEach(el => {
      el.scrollTop = 0;
    });
  }
  document.querySelectorAll('.notif-panel').forEach(n => n.classList.remove('open'));
}

function toggleRegFields() {
  const role = document.getElementById('reg-role').value;
  document.getElementById('student-fields').style.display = role === 'student' ? 'block' : 'none';
  document.getElementById('supervisor-fields').style.display = (role && role !== 'student') ? 'block' : 'none';
  document.getElementById('pw-fields').style.display = role ? 'block' : 'none';
  if (role === 'admin') document.getElementById('dept-field').style.display = 'none';
  else document.getElementById('dept-field').style.display = 'block';
}


function goToLogin() {
  sessionStorage.clear();
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('isLoggedIn');   
  localStorage.removeItem('activePage');
  localStorage.removeItem('activeTab');
  localStorage.removeItem('activeTabPrefix');

  // Clear login form fields
  const loginId = document.getElementById('login-id');
  const loginPw = document.getElementById('login-pw');
  if (loginId) loginId.value = '';
  if (loginPw) loginPw.value = '';
  // Scroll both window and all scrollable containers to top
  window.scrollTo(0, 0);
  document.querySelectorAll('.page-body, .main-content, .dash-wrap').forEach(el => {
    el.scrollTop = 0;
  });

  localStorage.removeItem('activeTab');
  localStorage.removeItem('activeTabPrefix');
  showPage('page-login');
}

async function handleLogin() {
  const id = document.getElementById('login-id').value.trim();
  const pw = document.getElementById('login-pw').value.trim();

  if (!id || !pw) {
    alert('Please enter your ID and password to continue.');
    return;
  }

  const btn = document.getElementById('login-btn');
  btn.innerHTML = '<span class="spinner"></span> Signing in...';
  btn.disabled = true;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: id, password: pw }),
    });

    const result = await response.json();
    if (!response.ok) {
      alert(result.message || 'Invalid credentials.');
      return;
    }
    // Save token and user info to BOTH storages
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('token', result.token);
    sessionStorage.setItem('userRole', result.role);
    sessionStorage.setItem('userName', result.name);
    sessionStorage.setItem('userId', String(result.id));
    localStorage.setItem('token', result.token);
    localStorage.setItem('userRole', result.role);
    localStorage.setItem('userName', result.name);
    localStorage.setItem('userId', String(result.id));

    const pages = {
      student: 'page-student',
      'school-supervisor': 'page-school-supervisor',
      'industry-supervisor': 'page-industry-supervisor',
      admin: 'page-admin',
    };

    const page = pages[result.role] || 'page-student';
    sessionStorage.setItem('activePage', page);

    localStorage.setItem('activePage', page);
    localStorage.setItem('isLoggedIn', 'true');

    localStorage.setItem('activeTab', 'dashboard');
    const roleToPrefix = {
      student: 'student',
      'school-supervisor': 'school',
      'industry-supervisor': 'industry',
      admin: 'admin',
    };
    localStorage.setItem('activeTabPrefix', roleToPrefix[result.role] || 'student');

    setTimeout(() => {
      loadUserDashboard();
      showPage(page);
      const prefix = roleToPrefix[result.role] || 'student';
      switchTab(prefix, 'dashboard', null);
    }, 300);

  } catch (err) {
    alert('Could not connect to server. Make sure the backend is running.');
  } finally {
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Sign In</span>';
    btn.disabled = false;
  }
}

// WIRE USER DASHBOARDS WITH REAL DATA

function loadUserDashboard() {
  clearDashboard();
  const userName = sessionStorage.getItem('userName') || localStorage.getItem('userName');
  const userId = getUserId();
  const userRole = sessionStorage.getItem('userRole') || localStorage.getItem('userRole');

  if (!userName || !userId || !userRole) return;


  // Get first name only for greeting
  const firstName = userName.split(' ')[0];

  // Update student dashboard
  if (userRole === 'student') {
    // Update greeting
    const greeting = document.querySelector('#student-tab-dashboard .welcome-banner h3');
    if (greeting) greeting.textContent = `Good morning, ${firstName}! 👋`;

    // Update sidebar name and role
    const sidebarName = document.querySelector('#sidebar-student .sidebar-user-name');
    const sidebarAvatar = document.querySelector('#sidebar-student .sidebar-user-avatar');
    if (sidebarName) sidebarName.textContent = userName;
    if (sidebarAvatar) {
      // Get initials
      const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
      sidebarAvatar.textContent = initials;
    }

    // Load student logs
    loadStudentLogs(userId);
    loadStudentCards(userId);
    loadStudentProfile(userId);
    loadStudentReport(userId);
  }

  // Update school supervisor dashboard
  if (userRole === 'school-supervisor') {
    const greeting = document.querySelector('#school-tab-dashboard .welcome-banner h3');
    if (greeting) greeting.textContent = `Welcome, ${firstName}! 🎓`;

    const sidebarName = document.querySelector('#sidebar-school .sidebar-user-name');
    const sidebarAvatar = document.querySelector('#sidebar-school .sidebar-user-avatar');
    if (sidebarName) sidebarName.textContent = userName;
    if (sidebarAvatar) {
      const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
      sidebarAvatar.textContent = initials;
    }
    loadSchoolCards();
    loadSupervisionStudents();
    loadGradingStudents();
    loadSchoolStudents();
    loadSchoolReports();
  }

  // update industry supervisor dashboard

  if (userRole === 'industry-supervisor') {
    const greeting = document.querySelector('#industry-tab-dashboard .welcome-banner h3');
    if (greeting) greeting.textContent = `Welcome, ${firstName}! 🏢`;

    const sidebarName = document.querySelector('#sidebar-industry .sidebar-user-name');
    const sidebarAvatar = document.querySelector('#sidebar-industry .sidebar-user-avatar');
    if (sidebarName) sidebarName.textContent = userName;
    if (sidebarAvatar) {
      const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
      sidebarAvatar.textContent = initials;
    }
    loadPendingLogs();
    loadIndustryCards();
    loadIndustryInterns();
    loadIndustryNotifications();
    loadIndustryHistory();
    loadIndustryGradingStudents();
    // start periodic refresh to pick up new student uploads and approvals
    try {
      if (window._industryRefreshInterval) clearInterval(window._industryRefreshInterval);
    } catch (e) {}
    window._industryRefreshInterval = setInterval(() => {
      loadPendingLogs();
      loadIndustryCards();
      loadIndustryInterns();
      loadIndustryNotifications();
      loadIndustryHistory();
      loadIndustryGradingStudents();
    }, 30000);
  }

  // Update admin dashboard
  if (userRole === 'admin') {
    const greeting = document.querySelector('#admin-tab-dashboard .welcome-banner h3');
    if (greeting) greeting.textContent = `Welcome, ${firstName}! 🛡️`;

    const sidebarName = document.querySelector('#sidebar-admin .sidebar-user-name');
    const sidebarRole = document.querySelector('#sidebar-admin .sidebar-user-role');
    if (sidebarName) sidebarName.textContent = userName;
    if (sidebarRole) sidebarRole.textContent = 'System Administrator';
    const sidebarAvatar = document.querySelector('#sidebar-admin .sidebar-user-avatar');
    if (sidebarAvatar) {
      const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
      sidebarAvatar.textContent = initials;
    }

    loadAdminDashboardData();
  }
}

// Auto assign supervisor
async function autoAssignSupervisors() {
  if (!confirm('This will reassign ALL students to supervisors from scratch. Continue?')) return;

  try {
    // Get all students and supervisors
    const [studentsRes, supervisorsRes] = await Promise.all([
      fetch(`${API_URL}/users/students`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }),
      fetch(`${API_URL}/users/role/school-supervisor`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
    ]);

    const students = await studentsRes.json();
    const supervisors = await supervisorsRes.json();

    if (supervisors.length === 0) {
      alert('No school supervisors found. Please add supervisors first.');
      return;
    }

    // Distribute students evenly across supervisors
    const assignments = students.map((student, index) => ({
      studentId: student.id,
      schoolSupervisorId: supervisors[index % supervisors.length].id
    }));

    // Save all assignments
    await Promise.all(assignments.map(a =>
      fetch(`${API_URL}/users/students/${a.studentId}/assign-supervisors`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ schoolSupervisorId: a.schoolSupervisorId }),
      })
    ));

    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--success);color:#fff;padding:12px 24px;border-radius:10px;font-weight:600;z-index:9999';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${students.length} students assigned across ${supervisors.length} supervisors!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);

    // Refresh dashboard
    loadAdminDashboardData();

  } catch (err) {
    alert('Could not complete auto assignment. Make sure the backend is running.');
  }
}

async function loadPendingLogs() {
  try {
    const myId = getUserId();
    const endpoint = myId ? `${API_URL}/logs/pending/${myId}` : `${API_URL}/logs/pending`;

    // Fetch logs and assigned students together
    const [logs, assignedStudents] = await Promise.all([
      fetchJson(endpoint),
      fetchJson(getAssignedStudentsEndpoint()),
    ]);

    const studentMap = new Map(
      (assignedStudents || []).map(s => [Number(s.id), s])
    );

    const getStudentInfo = (studentId) => {
      const s = studentMap.get(Number(studentId));
      if (!s) return { name: `Student #${studentId}`, sub: '', initials: String(studentId).slice(0,2) };
      const initials = s.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
      return {
        name: s.fullName,
        sub: `${s.registrationNumber || ''} · ${s.course || ''}`.trim().replace(/^·\s*|·\s*$/, ''),
        initials,
      };
    };

    const cardTemplate = (log) => {
      const info = getStudentInfo(log.studentId);
      return `
        <div class="request-card">
          <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0">
            <div class="avatar" style="flex-shrink:0">${info.initials}</div>
            <div style="min-width:0;flex:1">
              <div style="font-weight:600;font-size:.95rem;margin-bottom:2px">${escapeHtml(info.name)}</div>
              ${info.sub ? `<div style="font-size:.78rem;color:var(--text3);margin-bottom:3px">${escapeHtml(info.sub)}</div>` : ''}
              <div style="font-size:.9rem;color:var(--text);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                ${escapeHtml(log.taskName)}
              </div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <span class="tag ${log.workType === 'Onsite' ? 'onsite' : 'offsite'}" style="font-size:.75rem">${log.workType}</span>
                <span style="font-size:.78rem;color:var(--text3)">
                  <i class="fas fa-clock" style="margin-right:3px"></i>
                  ${log.estimatedHours}h · ${new Date(log.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ${new Date(log.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;margin-left:12px">
            <span class="tag pending" style="font-size:.75rem">Pending</span>
            <button class="btn btn-primary btn-sm" onclick="openLogReviewModal(${log.id}, '${info.name}', '${info.sub}')">
              <i class="fas fa-eye"></i> Review
            </button>
          </div>
        </div>
      `;
    };

    // Update pending count card
    const cards = document.querySelectorAll('#industry-tab-dashboard .card-val');
    if (cards[0]) cards[0].textContent = logs.length;

    // Update sidebar badge
    const badge = document.querySelector('#sidebar-industry .nav-item:nth-child(2) .badge');
    if (badge) badge.textContent = logs.length;

    const requestList = document.querySelector('#industry-tab-dashboard .request-list');
    if (requestList) {
      requestList.innerHTML = logs.length > 0
        ? logs.map(cardTemplate).join('')
        : '<p style="padding:20px;color:var(--text2)">No pending approvals.</p>';
    }

    const requestsTab = document.querySelector('#industry-tab-requests .request-list');
    if (requestsTab) {
      requestsTab.innerHTML = logs.length > 0
        ? logs.map(cardTemplate).join('')
        : '<p style="padding:20px;color:var(--text2)">No pending approvals.</p>';
    }

  } catch (err) {
    console.error('Failed to load pending logs:', err);
  }
}

async function loadIndustryNotifications() {
  try {
    const response = await fetch(`${API_URL}/notifications/my-notifications`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const notifications = await response.json();
    const list = document.getElementById('industry-notif-list');
    if (!list) return;

    if (!Array.isArray(notifications) || notifications.length === 0) {
      list.innerHTML = `
        <div class="notif-item">
          <div class="notif-icon" style="background:rgba(59,130,246,.12);color:var(--primary)"><i class="fas fa-info-circle"></i></div>
          <div class="notif-text">
            <h5>No new notifications</h5>
            <p>You're all caught up.</p>
          </div>
        </div>`;
      return;
    }

    list.innerHTML = notifications.slice(0, 6).map(note => {
      const message = note.message || 'New notification';
      const time = note.createdAt ? new Date(note.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Now';
      return `
        <div class="notif-item">
          <div class="notif-icon" style="background:rgba(59,130,246,.12);color:var(--primary)"><i class="fas fa-bell"></i></div>
          <div class="notif-text">
            <h5>${message}</h5>
            <p>${note.student?.fullName || note.studentId ? `Student ${note.student?.fullName || note.studentId}` : ''}</p>
            <div class="notif-time">${time}</div>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    console.error('Failed to load industry notifications:', err);
  }
}

async function loadIndustryHistory() {
  try {
    const response = await fetch(`${API_URL}/logs`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const logs = await response.json();
    const tbody = document.querySelector('#industry-tab-history .table-wrap tbody');
    if (!tbody) return;

    if (!Array.isArray(logs) || logs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;color:var(--text2);padding:20px">
            No reviewed tasks yet.
          </td>
        </tr>`;
      return;
    }

    const rows = logs
      .filter(log => log.status !== 'pending')
      .sort((a, b) => new Date(b.approvedAt || b.createdAt) - new Date(a.approvedAt || a.createdAt))
      .map(log => {
        const studentName = log.student?.fullName || `Student ${log.studentId}`;
        const safeTask = (log.taskName || 'Task').replace(/'/g, "\\'");
        const action = log.status === 'approved' ? '<span class="tag approved">Approved</span>' : '<span class="tag rejected">Rejected</span>';
        const comment = log.supervisorComment || log.approvalComment || 'No comment';
        const date = new Date(log.approvedAt || log.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        return `
          <tr>
            <td>${date}</td>
            <td>${studentName}</td>
            <td>${safeTask}</td>
            <td>${action}</td>
            <td>${comment}</td>
          </tr>`;
      });

    tbody.innerHTML = rows.length > 0 ? rows.join('') : `
      <tr>
        <td colspan="5" style="text-align:center;color:var(--text2);padding:20px">
          No reviewed tasks yet.
        </td>
      </tr>`;
  } catch (err) {
    console.error('Failed to load industry approval history:', err);
  }
}

// APPROVING LOGS
async function approveLog(logId, status, comment = null) {
  if (!comment && status === 'rejected') {
    comment = prompt('Enter reason for rejection (optional):') || null;
  }
  const supervisorId = getUserId();
  try {
    await fetchJson(`${API_URL}/logs/${logId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        supervisorComment: comment,
        approvedBy: Number(supervisorId),
      }),
    });
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--success);color:#fff;padding:12px 24px;border-radius:10px;font-weight:600;z-index:9999';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> Log ${status} successfully!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
    closeModal('log-review-modal');
    loadPendingLogs();
    loadIndustryCards();
  } catch (err) {
    console.error('Failed to approve log:', err);
    alert('Could not update log status. Please try again.');
  }
}

async function openLogReviewModal(logId) {
  try {
    const log = await fetchJson(`${API_URL}/logs/${logId}`);
    if (!log) return;

    let student = null;
    try {
      student = await fetchJson(`${API_URL}/users/${log.studentId}`);
    } catch (e) {
      console.warn('Could not load student details:', e.message);
    }

    const modal = document.getElementById('log-review-modal');
    if (!modal) return;

    const studentEl = modal.querySelector('#review-student-name');
    const taskEl = modal.querySelector('#review-task-name');
    const metaEl = modal.querySelector('#review-meta');
    const gpsEl = modal.querySelector('#review-gps');
    const descEl = modal.querySelector('#review-description');
    const skillsEl = modal.querySelector('#review-skills');
    const toolsEl = modal.querySelector('#review-tools');
    const commentInput = modal.querySelector('#review-comment');
    const approvBtn = modal.querySelector('#review-approve-btn');
    const rejectBtn = modal.querySelector('#review-reject-btn');

    if (studentEl) {
      if (student) {
        studentEl.innerHTML = `
          <div style="font-weight:700;font-size:1rem">${escapeHtml(student.fullName)}</div>
          <div style="font-size:.85rem;color:var(--text2);margin-top:2px">
            ${student.registrationNumber || '—'} · ${student.course || '—'}
          </div>
        `;
      } else {
        studentEl.textContent = `Student #${log.studentId}`;
      }
    }

    if (taskEl) taskEl.textContent = log.taskName;
    if (metaEl) metaEl.innerHTML = `
      <span class="tag ${log.workType === 'Onsite' ? 'onsite' : 'offsite'}">${log.workType}</span>
      <span style="color:var(--text2)">${log.estimatedHours} hours · ${new Date(log.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
    `;
    if (gpsEl) {
      gpsEl.innerHTML = log.gpsLatitude
        ? `<span class="gps-badge"><i class="fas fa-check"></i> Verified · ${Number(log.gpsLatitude).toFixed(4)}°N, ${Number(log.gpsLongitude).toFixed(4)}°E</span>`
        : `<span class="gps-badge fail"><i class="fas fa-times"></i> No GPS recorded</span>`;
    }
    if (descEl) descEl.textContent = log.description || '—';
    if (skillsEl) skillsEl.textContent = log.skillsApplied || '—';
    if (toolsEl) toolsEl.textContent = log.toolsUsed || '—';
    if (commentInput) commentInput.value = '';

    if (approvBtn) {
      approvBtn.onclick = () => {
        const comment = commentInput?.value.trim();
        if (!comment) {
          alert('Please add a comment before approving.');
          return;
        }
        approveLog(logId, 'approved', comment);
      };
    }
    if (rejectBtn) {
      rejectBtn.onclick = () => {
        const comment = commentInput?.value.trim() || null;
        approveLog(logId, 'rejected', comment);
      };
    }

    openModal('log-review-modal');
  } catch (err) {
    console.error('Failed to load log for review:', err);
    alert('Could not load log details. Please try again.');
  }
}



async function loadIndustryInterns() {
  try {
    const students = await fetchJson(getAssignedStudentsEndpoint());
    const progressMap = await getStudentProgressMap();
    const grid = document.getElementById('industry-interns-grid');
    if (!grid) return;

    if (!students || students.length === 0) {
      grid.innerHTML = '<p style="color:var(--text2);padding:20px">No interns assigned yet.</p>';
      return;
    }

    grid.innerHTML = students.map(student => {
      const stats = progressMap.get(Number(student.id)) || { progress: 0 };
      const initials = student.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
      const fullName = (student.fullName || '').replace(/'/g, "\\'");
      const regNo = (student.registrationNumber || '').replace(/'/g, "\\'");
      const course = (student.course || '').replace(/'/g, "\\'");
      const placement = (student.placementCompany || '').replace(/'/g, "\\'");
      const email = (student.email || '').replace(/'/g, "\\'");

      return `
        <div class="student-card">
          <div class="student-card-top">
            <div class="avatar avatar-lg">${initials}</div>
            <div class="student-card-info">
              <h4>${escapeHtml(student.fullName)}</h4>
              <p>${student.registrationNumber || '—'} · ${student.course || '—'}</p>
            </div>
          </div>
          <div class="student-card-meta">
            <span>${escapeHtml(student.placementCompany || 'Not Placed')}</span>
            <span><span class="approved-dot"></span>Active</span>
          </div>
          <div style="font-size:.8rem;color:var(--text2);margin-bottom:6px">Overall Progress</div>
          <div class="prog-bar">
            <div class="prog-fill ${stats.progress > 0 && stats.progress < 60 ? 'amber' : ''}" 
                 style="width:${stats.progress}%"></div>
          </div>
          <div style="font-size:.78rem;color:var(--text3);margin-top:4px;text-align:right">${stats.progress}%</div>
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="btn btn-primary btn-sm" style="flex:1"
              onclick="openIndustryInternMessage(${student.id}, '${fullName}')">
              <i class="fas fa-comment"></i> Message
            </button>
            <button class="btn btn-outline btn-sm" style="flex:1"
              onclick="openStudentProfile(${student.id}, '${fullName}', '${regNo}', '${course}', '${placement}', '${email}')">
              <i class="fas fa-user"></i> Profile
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load industry interns:', err);
  }
}

function openIndustryInternMessage(studentId, studentName) {
  const navItem = document.querySelector(
    `#sidebar-industry .nav-item[onclick*="'messages'"]`
  );
  switchTab('industry', 'messages', navItem);
  setTimeout(() => {
    loadConversationWith(Number(studentId), studentName);
  }, 400);
}

// Wire Student logs
async function loadStudentLogs(studentId) {
  try {
    const logs = await fetchJson(`${API_URL}/logs/student/${studentId}`);

    // ── RECENT LOGS TABLE (dashboard) ──
    const recentTbody = document.querySelector('#student-tab-dashboard .table-wrap tbody');
    if (recentTbody) {
      if (logs.length === 0) {
        recentTbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center;color:var(--text2);padding:20px">
              No log entries yet. Submit your first log above.
            </td>
          </tr>`;
      } else {
        // Show only the 4 most recent
        const recent = logs.slice(0, 4);
        recentTbody.innerHTML = recent.map(log => `
          <tr>
            <td>${new Date(log.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            <td>${log.taskName}</td>
            <td><span class="tag ${log.workType === 'Onsite' ? 'onsite' : 'offsite'}">${log.workType}</span></td>
            <td>${log.estimatedHours}h</td>
            <td><span class="tag ${log.status}">${log.status.charAt(0).toUpperCase() + log.status.slice(1)}</span></td>
            <td><button class="btn btn-outline btn-sm" onclick="openLogDetail(${log.id}, '${log.taskName}', '${log.workType}', '${log.estimatedHours}', '${log.status}', '${log.description || ''}', '${log.skillsApplied || ''}', '${log.gpsLatitude || ''}', '${log.gpsLongitude || ''}', '${new Date(log.createdAt).toLocaleDateString('en-GB')}')">View</button></td>
          </tr>
        `).join('');
      }
    }

    // ── ALL LOGS TABLE (My Logs tab) ──
    const tbody = document.getElementById('logs-tbody');
    if (tbody) {
      if (logs.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align:center;color:var(--text2);padding:20px">
              No log entries yet.
            </td>
          </tr>`;
      } else {
        tbody.innerHTML = logs.map((log, index) => `
          <tr>
            <td>${logs.length - index}</td>
            <td>${new Date(log.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
            <td>${log.taskName}</td>
            <td><span class="tag ${log.workType === 'Onsite' ? 'onsite' : 'offsite'}">${log.workType}</span></td>
            <td>${log.estimatedHours}h</td>
            <td><span class="gps-badge"><i class="fas fa-check"></i> ${log.gpsLatitude ? 'Verified' : 'No GPS'}</span></td>
            <td><span class="tag ${log.status}">${log.status.charAt(0).toUpperCase() + log.status.slice(1)}</span></td>
            <td><button class="btn btn-outline btn-sm" onclick="openLogDetail(${log.id}, '${log.taskName}', '${log.workType}', '${log.estimatedHours}', '${log.status}', '${log.description || ''}', '${log.skillsApplied || ''}', '${log.gpsLatitude || ''}', '${log.gpsLongitude || ''}', '${new Date(log.createdAt).toLocaleDateString('en-GB')}')">Detail</button></td>
          </tr>
        `).join('');
      }
    }

    // ── APPROVED TASKS TABLE ──
    const approvedTbody = document.querySelector('#student-tab-approved .table-wrap tbody');
    if (approvedTbody) {
      const approvedLogs = logs.filter(l => l.status === 'approved');
      if (approvedLogs.length === 0) {
        approvedTbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:var(--text2);padding:20px">
          No approved tasks yet.
        </td>
      </tr>`;
      } else {
        approvedTbody.innerHTML = approvedLogs.map(log => `
      <tr>
        <td>${new Date(log.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
        <td>${log.taskName}</td>
        <td>${log.estimatedHours}h</td>
        <td>${log.approvedBy ? 'Industry Supervisor' : '—'}</td>
        <td><em style="color:var(--text3)">${log.supervisorComment || 'No comment'}</em></td>
      </tr>
    `).join('');
      }
    }
  } catch (err) {
    console.error('Failed to load logs:', err);
  }
}


async function loadSchoolReports() {
  try {
    const [reportsRes, studentsRes] = await Promise.all([
      fetch(`${API_URL}/reports`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }),
      fetch(getAssignedStudentsEndpoint(), {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
    ]);

    const allReports = await reportsRes.json();
    const assignedStudents = await studentsRes.json();

    const assignedIds = new Set(assignedStudents.map(s => Number(s.id)));
    const myReports = allReports.filter(r => assignedIds.has(Number(r.studentId)));

    const tbody = document.querySelector('#school-tab-reports .table-wrap tbody');
    if (!tbody) return;

    if (myReports.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;color:var(--text2);padding:20px">
            No reports submitted yet.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = myReports.map(report => {
      const student = assignedStudents.find(s => Number(s.id) === Number(report.studentId));
      const studentName = student?.fullName || 'Unknown';
      const regNo = student?.registrationNumber || '—';
      const submittedDate = new Date(report.submittedAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      const fileName = report.fileUrl.split('\\').pop().split('/').pop();

      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px">
              <div class="avatar">${studentName.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
              ${studentName}
            </div>
          </td>
          <td>${regNo}</td>
          <td>${submittedDate}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="window.open('http://localhost:3000/uploads/${fileName}', '_blank')">
              <i class="fas fa-file-download"></i> Download
            </button>
          </td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Failed to load reports:', err);
  }
}

function downloadReport(fileUrl) {
  const fileName = fileUrl.split('\\').pop().split('/').pop();
  window.open(`http://localhost:3000/uploads/${fileName}`, '_blank');
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!res.ok) return null;
  return res.json();
}


async function openLogDetail(logId) {
  try {
    const log = await fetchJson(`${API_URL}/logs/${logId}`);
    if (!log) return;

    const modal = document.getElementById('log-detail-modal');
    if (!modal) return;

    // Work type tag
    const headerBox = modal.querySelector('.modal > div');
    if (headerBox) {
      headerBox.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span class="tag ${log.workType === 'Onsite' ? 'onsite' : 'offsite'}">${log.workType}</span>
          <span class="gps-badge">
            ${log.gpsLatitude
              ? `<i class="fas fa-check"></i> GPS Verified · ${Number(log.gpsLatitude).toFixed(4)}°N, ${Number(log.gpsLongitude).toFixed(4)}°E`
              : `<i class="fas fa-times"></i> No GPS recorded`}
          </span>
        </div>
        <h4 style="font-size:1.05rem;margin-bottom:6px">${escapeHtml(log.taskName)}</h4>
        <div style="font-size:.82rem;color:var(--text2)">
          ${new Date(log.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · ${log.estimatedHours} hours
        </div>
      `;
    }

    // Description
    const formGroups = modal.querySelectorAll('.form-group');
    if (formGroups[0]) {
      formGroups[0].innerHTML = `
        <label>Description</label>
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;font-size:.9rem;line-height:1.7;color:var(--text2)">
          ${escapeHtml(log.description || '—')}
        </div>
      `;
    }

    // Skills applied
    if (formGroups[1]) {
      formGroups[1].innerHTML = `
        <label>Skills Applied</label>
        <div style="font-size:.9rem">${escapeHtml(log.skillsApplied || '—')}</div>
      `;
    }

    // Status
    if (formGroups[2]) {
      let statusHtml = '';
      if (log.status === 'approved') {
        const approvedDate = log.approvedAt
          ? new Date(log.approvedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : '';
        statusHtml = `<span class="tag approved">Approved · ${approvedDate}</span>`;
      } else if (log.status === 'rejected') {
        statusHtml = `<span class="tag rejected">Rejected</span>`;
      } else {
        statusHtml = `<span class="tag pending">Pending Approval</span>`;
      }
      formGroups[2].innerHTML = `<label>Status</label>${statusHtml}`;
    }

    // Supervisor comment
    if (formGroups[3]) {
      const comment = log.supervisorComment;
      formGroups[3].innerHTML = `
        <label>Supervisor Comment</label>
        <div style="font-style:${comment ? 'italic' : 'normal'};color:${comment ? 'var(--text2)' : 'var(--text3)'};font-size:.9rem">
          ${comment ? `"${escapeHtml(comment)}"` : 'No comment yet — awaiting supervisor review.'}
        </div>
      `;
    }

    openModal('log-detail-modal');
  } catch (err) {
    console.error('Failed to load log detail:', err);
    alert('Could not load log details. Please try again.');
  }
}

// CLEAR DASHBOARD BEFORE LOADING NEW DATA
function clearDashboard() {
  // Clear all card values
  document.querySelectorAll('.card-val').forEach(c => c.textContent = '—');

  // Clear all table bodies
  document.querySelectorAll('.table-wrap tbody').forEach(t => t.innerHTML = '');

  // Clear student cards grid
  document.querySelectorAll('.student-cards-grid').forEach(g => g.innerHTML = '');

  // Clear request lists
  document.querySelectorAll('.request-list').forEach(r => r.innerHTML = '');

  // Clear welcome banners
  document.querySelectorAll('.welcome-banner p').forEach(p => p.textContent = 'Loading your dashboard...');
  document.querySelectorAll('.welcome-banner h3').forEach(h => h.textContent = 'Loading...');
  document.querySelectorAll('.wb-badge').forEach(b => b.innerHTML = '<i class="fas fa-map-marker-alt"></i> Loading...');
}

// WIRING STUDENTS CARD

async function loadStudentCards(studentId) {
  try {
    const [logs, settings] = await Promise.all([
      fetchJson(`${API_URL}/logs/student/${studentId}`),
      fetchJson(`${API_URL}/settings`)
    ]);

    // Define these FIRST before using them
    const total = logs.length;
    const approved = logs.filter(l => l.status === 'approved').length;
    const pending = logs.filter(l => l.status === 'pending').length;

    // Get dates from settings
    const endSetting = settings.find(s => s.key === 'internship_end');
    const endDate = endSetting ? new Date(endSetting.value) : new Date('2026-04-21');
    const today = new Date();

    // Calculate days left
    const daysLeft = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

    // Progress based on approved logs
    const timeProgress = total > 0 ? Math.round((approved / total) * 100) : 0;

    // Update cards
    const cards = document.querySelectorAll('#student-tab-dashboard .card-val');
    if (cards[0]) cards[0].textContent = total;
    if (cards[1]) cards[1].textContent = daysLeft;
    if (cards[2]) cards[2].textContent = timeProgress + '%';
    if (cards[3]) cards[3].textContent = approved;

    // Update approved tab cards
    const approvedTabCards = document.querySelectorAll('#student-tab-approved .card-val');
    if (approvedTabCards[0]) approvedTabCards[0].textContent = approved;
    if (approvedTabCards[1]) approvedTabCards[1].textContent = pending;
    if (approvedTabCards[2]) approvedTabCards[2].textContent = logs.filter(l => l.status === 'rejected').length;

    // Update progress bar
    const progFill = document.querySelector('#student-tab-dashboard .prog-fill');
    if (progFill) progFill.style.width = timeProgress + '%';

    // Update pending badge
    const logsBadge = document.querySelector('#sidebar-student .nav-item[onclick*="logs"] .badge');
    if (logsBadge) logsBadge.textContent = total;
    // Update welcome banner
    const bannerText = document.querySelector('#student-tab-dashboard .welcome-banner p');
    if (bannerText) {
      bannerText.innerHTML = `You have <strong>${pending} pending tasks</strong> awaiting industry supervisor approval. Keep up the great work!`;
    }

  } catch (err) {
    console.error('Failed to load cards:', err);
  }
}

// WIRING INDUSTRY-SUP CARDS
async function loadIndustryCards() {
  try {
    const myId = getUserId();
    const [pendingLogs, allLogsRaw, assignedStudents] = await Promise.all([
      fetchJson(myId ? `${API_URL}/logs/pending/${myId}` : `${API_URL}/logs/pending`),
      fetchJson(`${API_URL}/logs`),
      fetchJson(getAssignedStudentsEndpoint()),
    ]);
    const assignedIds = new Set((assignedStudents || []).map(s => Number(s.id)));
    const allLogs = allLogsRaw.filter(l => assignedIds.has(Number(l.studentId)));

    const pending = pendingLogs.length;
    const approved = allLogs.filter(l => l.status === 'approved').length;
    const rejected = allLogs.filter(l => l.status === 'rejected').length;

    const activeInterns = assignedStudents.length;

    // Update cards
    const cards = document.querySelectorAll('#industry-tab-dashboard .card-val');
    if (cards[0]) cards[0].textContent = pending;
    if (cards[1]) cards[1].textContent = approved;
    if (cards[2]) cards[2].textContent = activeInterns;
    if (cards[3]) cards[3].textContent = rejected;

    // Update welcome banner
    const welcomeMsg = document.getElementById('industry-welcome-msg');
    if (welcomeMsg) welcomeMsg.innerHTML = `You have <strong>${pending} tasks pending your approval</strong> from student interns.`;

    const welcomeHeading = document.getElementById('industry-welcome-heading');
    if (welcomeHeading) welcomeHeading.textContent = `Welcome, ${(localStorage.getItem('userName') || '').split(' ')[0]}! 🏢`;

    const profileRes = await fetch(`${API_URL}/users/${myId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const profile = await profileRes.json();

    const placementBadge = document.getElementById('industry-placement-badge');
    if (placementBadge) placementBadge.innerHTML = `<i class="fas fa-building"></i> ${profile.department || profile.placementCompany || '—'}`;

    const requestsBadge = document.getElementById('industry-requests-badge');
    if (requestsBadge) requestsBadge.textContent = pending;

    const nameInput = document.getElementById('industry-profile-name');
    const orgInput = document.getElementById('industry-profile-org');
    const emailInput = document.getElementById('industry-profile-email');
    if (nameInput) nameInput.value = profile.fullName || '';
    if (orgInput) orgInput.value = profile.placementCompany || profile.department || '';
    if (emailInput) emailInput.value = profile.email || '';

  } catch (err) {
    console.error('Failed to load industry cards:', err);
  }
}

// WIRE SCHOOL-SUP CARDS
async function loadSchoolCards() {
  try {
    const [allLogs, allReports, students] = await Promise.all([
      fetchJson(`${API_URL}/logs`),
      fetchJson(`${API_URL}/reports`),
      fetchJson(getAssignedStudentsEndpoint()),
    ]);

    // Card 0 — all registered students (until assignment is introduced)
    const totalStudents = students.length;

    // Card 1 — total logs reviewed 
    const assignedStudentIds = new Set(students.map(s => Number(s.id)));
    const totalReviewed = allLogs.filter(l => assignedStudentIds.has(Number(l.studentId))).length;

    // Card 2 — reports submitted but not yet reviewed
    const reportsDue = allReports.filter(r => r.status === 'submitted').length;

    // Card 3 — average progress across all students
    const totalLogs = allLogs.length;
    const approvedLogs = allLogs.filter(l => l.status === 'approved').length;
    const avgProgress = totalLogs > 0
      ? Math.round((approvedLogs / totalLogs) * 100)
      : 0;

    // Update cards
    const cards = document.querySelectorAll('#school-tab-dashboard .card-val');
    if (cards[0]) cards[0].textContent = totalStudents;
    if (cards[1]) cards[1].textContent = totalReviewed;
    if (cards[2]) cards[2].textContent = reportsDue;
    if (cards[3]) cards[3].textContent = avgProgress + '%';

    // Update welcome banner
    const bannerText = document.querySelector('#school-tab-dashboard .welcome-banner p');
    if (bannerText) {
      bannerText.innerHTML = `You are supervising <strong>${totalStudents} active student interns</strong>. ${reportsDue} students have progress reports due.`;
    }

    // Students badge — total students
    const studentsBadge = document.querySelector('#sidebar-school .nav-item[onclick*="students"] .badge');
    if (studentsBadge) studentsBadge.textContent = totalStudents;

    const studentListTitle = document.querySelector('#school-tab-students .section-head h3');
    if (studentListTitle) studentListTitle.textContent = `Student List (${totalStudents})`;

    // Remove supervision and grading badges
    const supervisionBadge = document.querySelector('#sidebar-school .nav-item[onclick*="supervision"] .badge');
    if (supervisionBadge) supervisionBadge.remove();

    const gradingBadge = document.querySelector('#sidebar-school .nav-item[onclick*="grading"] .badge');
    if (gradingBadge) gradingBadge.remove();

    // Remove messages badge for now
    const messagesBadge = document.querySelector('#sidebar-school .nav-item[onclick*="messages"] .badge');
    if (messagesBadge) messagesBadge.remove();

    const settingsData = await fetch(`${API_URL}/settings`).then(r => r.json());
    const institutionVal = settingsData.find(s => s.key === 'institution_name');
    const schoolBadge = document.getElementById('school-institution-badge');
    if (schoolBadge && institutionVal) {
      schoolBadge.innerHTML = `<i class="fas fa-graduation-cap"></i> ${institutionVal.value}`;
    }

  } catch (err) {
    console.error('Failed to load school cards:', err);
  }
}

async function loadSchoolStudents() {
  try {
    const students = await fetchJson(getAssignedStudentsEndpoint());
    const progressMap = await getStudentProgressMap();

    const tbody = document.querySelector('#school-tab-students .table-wrap tbody');
    if (!tbody) return;

    if (students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;color:var(--text2);padding:20px">
            No students found.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = students.map(student => {
      const safeName = (student.fullName || '').replace(/'/g, "\\'");
      const safeReg = (student.registrationNumber || '').replace(/'/g, "\\'");
      const safeCourse = (student.course || '').replace(/'/g, "\\'");
      const safePlacement = (student.placementCompany || '').replace(/'/g, "\\'");
      const safeEmail = (student.email || '').replace(/'/g, "\\'");
      const stats = progressMap.get(Number(student.id)) || { total: 0, approved: 0, pending: 0, progress: 0, latest: null };
      const statusTag = stats.total === 0 ? 'rejected' : stats.progress >= 60 ? 'approved' : 'pending';
      const statusText = stats.total === 0 ? 'No logs' : stats.progress >= 60 ? 'Good' : 'Needs review';
      const rowProgress = `${stats.progress}%`;
      const totalLogs = stats.total || 0;

      return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar">${safeName.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
            ${safeName}
          </div>
        </td>
        <td>${student.registrationNumber || '—'}</td>
        <td>${student.placementCompany || '—'}</td>
        <td>${totalLogs}</td>
        <td>
          <div style="min-width:90px">
            <div class="prog-bar">
              <div class="prog-fill" style="width:${rowProgress}"></div>
            </div>
            <div style="font-size:.75rem;color:var(--text3);margin-top:2px">${rowProgress}</div>
          </div>
        </td>
        <td><span class="tag ${statusTag}">${statusText}</span></td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="openStudentProfile(${student.id}, '${safeName}', '${safeReg}', '${safeCourse}', '${safePlacement}', '${safeEmail}')">
            View Logs
          </button>
        </td>
      </tr>
    `;
    }).join('');

    // Also update dashboard summary cards from live students list.
    const summaryGrid = document.querySelector('#school-tab-dashboard .student-cards-grid');
    if (summaryGrid) {
      const topStudents = students.slice(0, 3);
      summaryGrid.innerHTML = topStudents.map(student => {
        const stats = progressMap.get(Number(student.id)) || { progress: 0 };
        const initials = student.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        const latestText = stats.progress > 0 ? 'Latest: Active' : 'Latest: No logs yet';
        const fullName = (student.fullName || '').replace(/'/g, "\\'");
        const regNo = (student.registrationNumber || '').replace(/'/g, "\\'");
        const course = (student.course || '').replace(/'/g, "\\'");
        const placement = (student.placementCompany || '').replace(/'/g, "\\'");
        const email = (student.email || '').replace(/'/g, "\\'");
        return `
          <div class="student-card" onclick="openStudentProfile(${student.id}, '${fullName}', '${regNo}', '${course}', '${placement}', '${email}')">
            <div class="student-card-top">
              <div class="avatar avatar-lg">${initials}</div>
              <div class="student-card-info">
                <h4>${student.fullName}</h4>
                <p>${student.registrationNumber || '—'}</p>
              </div>
            </div>
            <div class="student-card-meta"><span><i class="fas fa-building" style="margin-right:4px"></i>${student.placementCompany || 'Not Placed'}</span><span><span class="approved-dot"></span>${latestText}</span></div>
            <div style="font-size:.8rem;color:var(--text2);margin-bottom:6px">Progress</div>
            <div class="prog-bar"><div class="prog-fill ${stats.progress > 0 && stats.progress < 60 ? 'amber' : ''}" style="width:${stats.progress}%"></div></div>
            <div style="font-size:.78rem;color:var(--text3);margin-top:4px;text-align:right">${stats.progress}%</div>
          </div>
        `;
      }).join('');
    }

  } catch (err) {
    console.error('Failed to load school students:', err);
  }
}

async function getStudentProgressMap() {
  const progressMap = new Map();
  try {
    const allLogs = await fetchJson(`${API_URL}/logs`);

    const grouped = new Map();
    allLogs.forEach(log => {
      if (!grouped.has(log.studentId)) grouped.set(log.studentId, []);
      grouped.get(log.studentId).push(log);
    });

    grouped.forEach((studentLogs, studentId) => {
      const total = studentLogs.length;
      const approved = studentLogs.filter(l => l.status === 'approved').length;
      const pending = studentLogs.filter(l => l.status === 'pending').length;
      const progress = total > 0 ? Math.round((approved / total) * 100) : 0;
      const latest = studentLogs[0] || null;
      progressMap.set(Number(studentId), { total, approved, pending, progress, latest });
    });
  } catch (err) {
    console.error('Failed to build progress map:', err);
  }

  return progressMap;
}

async function loadAdminDashboardData() {
  try {
    const [counts, students, supervisors] = await Promise.all([
      fetchJson(`${API_URL}/users/counts`),
      fetchJson(`${API_URL}/users/students`),
      fetchJson(`${API_URL}/users/supervisors`),
    ]);
    const progressMap = await getStudentProgressMap();

    // Admin dashboard cards
    const adminCards = document.querySelectorAll('#admin-tab-dashboard .card-val');
    const notStarted = students.filter(s => !progressMap.has(Number(s.id))).length;
    if (adminCards[0]) adminCards[0].textContent = String(counts.students || students.length);
    if (adminCards[1]) adminCards[1].textContent = String(notStarted);
    if (adminCards[2]) adminCards[2].textContent = String(supervisors.school?.length || 0);

    // Days to end
    const settingsForDays = await fetch(`${API_URL}/settings`).then(r => r.json());
    const endSetting = settingsForDays.find(s => s.key === 'internship_end');
    const endDate = endSetting ? new Date(endSetting.value) : null;
    const daysLeft = endDate ? Math.max(0, Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))) : 0;
    if (adminCards[3]) adminCards[3].textContent = String(daysLeft);

    // welcome message
    const welcomeMsg = document.getElementById('admin-welcome-msg');
    if (welcomeMsg) {
      welcomeMsg.innerHTML = `Managing <strong>${students.length} students</strong> across <strong>${supervisors.school?.length || 0} supervisors</strong>. Programme ends in <strong>${daysLeft} days</strong>.`;
    }

    // Admin summary table (dashboard)
    const summaryTbody = document.querySelector('#admin-tab-dashboard .table-wrap tbody');
    if (summaryTbody) {
      const recent = students.slice(0, 6);
      summaryTbody.innerHTML = recent.map(student => {
        const stats = progressMap.get(Number(student.id)) || { progress: 0 };
        const initials = student.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        const statusTag = stats.progress >= 60 ? 'approved' : stats.progress > 0 ? 'pending' : 'rejected';
        const statusText = stats.progress >= 60 ? 'Active' : stats.progress > 0 ? 'In Progress' : 'Not Started';
        return `
          <tr>
            <td><div style="display:flex;align-items:center;gap:10px"><div class="avatar">${initials}</div>${student.fullName}</div></td>
            <td>${student.registrationNumber || '—'}</td>
            <td>—</td>
            <td>${student.placementCompany || '<span style="color:var(--text3);font-style:italic">Not Placed</span>'}</td>
            <td>
              <div style="min-width:90px">
                <div class="prog-bar"><div class="prog-fill ${stats.progress > 0 && stats.progress < 60 ? 'amber' : ''}" style="width:${stats.progress}%"></div></div>
                <div style="font-size:.72rem;color:var(--text3);margin-top:2px">${stats.progress}%</div>
              </div>
            </td>
            <td><span class="tag ${statusTag}">${statusText}</span></td>
          </tr>
        `;
      }).join('');
    }

    // badges
    const adminStudentsBadge = document.getElementById('admin-students-badge');
    const adminSupervisorsBadge = document.getElementById('admin-supervisors-badge');
    if (adminStudentsBadge) adminStudentsBadge.textContent = counts.students || students.length;
    if (adminSupervisorsBadge) adminSupervisorsBadge.textContent = supervisors.school?.length || 0;

    // Admin students tab heading + table
    const studentsTitle = document.querySelector('#admin-tab-students .section-head h3');
    if (studentsTitle) studentsTitle.textContent = `Students (${students.length})`;

    const studentsTbody = document.querySelector('#admin-tab-students .table-wrap tbody');
    if (studentsTbody) {
      // First load supervisors for dropdown
      const schoolSvsRes = await fetch(`${API_URL}/users/role/school-supervisor`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const schoolSupervisors = await schoolSvsRes.json();

      studentsTbody.innerHTML = students.map(student => {
        const stats = progressMap.get(Number(student.id)) || { progress: 0 };
        const initials = student.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        const statusTag = stats.progress >= 60 ? 'approved' : stats.progress > 0 ? 'pending' : 'rejected';
        const statusText = stats.progress >= 60 ? 'Active' : stats.progress > 0 ? 'In Progress' : 'Not Started';

        const supervisorOptions = schoolSupervisors.map(sv =>
          `<option value="${sv.id}" ${student.schoolSupervisorId === sv.id ? 'selected' : ''}>${sv.fullName}</option>`
        ).join('');

        return `
      <tr>
        <td><div style="display:flex;align-items:center;gap:10px"><div class="avatar">${initials}</div>${student.fullName}</div></td>
        <td>${student.registrationNumber || '—'}</td>
        <td>${student.course || '—'}</td>
        <td>
          <select id="sv-select-${student.id}" 
            style="padding:6px 10px;border:1px solid var(--border);border-radius:6px;font-size:.82rem;background:var(--surface2);color:var(--text);outline:none">
            <option value="">— Assign —</option>
            ${supervisorOptions}
          </select>
        </td>
        <td>${student.placementCompany || '—'}</td>
        <td><div class="prog-bar" style="min-width:80px"><div class="prog-fill ${stats.progress > 0 && stats.progress < 60 ? 'amber' : ''}" style="width:${stats.progress}%"></div></div></td>
        <td><span class="tag ${statusTag}">${statusText}</span></td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="assignSupervisor(${student.id})">
            <i class="fas fa-user-check"></i> Assign
          </button>
        </td>
      </tr>
    `;
      }).join('');
    }

    // Admin supervisors tab counts
    // Update supervisor tab button
    const schoolSvTab = document.querySelector('.tab-btn[onclick*="sv\',\'school"]');
    if (schoolSvTab) schoolSvTab.textContent = `School Supervisors (${supervisors.school?.length || 0})`;

    // Populate school supervisors grid
    const schoolSvGrid = document.querySelector('#sv-tab-school .student-cards-grid');
    if (schoolSvGrid && supervisors.school) {
      if (supervisors.school.length === 0) {
        schoolSvGrid.innerHTML = '<p style="padding:20px;color:var(--text2)">No school supervisors yet.</p>';
      } else {
        schoolSvGrid.innerHTML = supervisors.school.map(sv => {
          const initials = sv.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
          const assigned = students.filter(s => Number(s.schoolSupervisorId) === Number(sv.id)).length;
          const capacity = 50;
          return `
        <div class="student-card">
          <div class="student-card-top">
            <div class="avatar avatar-lg">${initials}</div>
            <div class="student-card-info">
              <h4>${sv.fullName}</h4>
              <p>${sv.staffId || '—'}</p>
            </div>
          </div>
          <div class="student-card-meta">
            <span>${sv.department || '—'}</span>
            <span><span class="approved-dot"></span>Active</span>
          </div>
          <div style="font-size:.82rem;color:var(--text2);margin-top:8px">
            Assigned Students: <strong>${assigned}/${capacity}</strong>
          </div>
          <div class="prog-bar" style="margin-top:6px">
            <div class="prog-fill ${assigned >= capacity ? 'amber' : ''}" 
              style="width:${Math.min(100, Math.round((assigned / capacity) * 100))}%">
            </div>
          </div>
        </div>
      `;
        }).join('');
      }
    }
  } catch (err) {
    console.error('Failed to load admin dashboard data:', err);
  }

  // Load settings into admin form
  try {
    const settingsRes = await fetch(`${API_URL}/settings`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const settingsData = await settingsRes.json();

    const startVal = settingsData.find(s => s.key === 'internship_start');
    const endVal = settingsData.find(s => s.key === 'internship_end');

    const dateInputs = document.querySelectorAll('#admin-tab-settings input[type="date"]');
    if (dateInputs[0] && startVal) dateInputs[0].value = startVal.value;
    if (dateInputs[1] && endVal) dateInputs[1].value = endVal.value;

    const institutionVal = settingsData.find(s => s.key === 'institution_name');
    const startYear = startVal ? new Date(startVal.value).getFullYear() : new Date().getFullYear();
    const endYear = endVal ? new Date(endVal.value).getFullYear() : new Date().getFullYear();

    const institutionBadge = document.getElementById('admin-institution-badge');
    if (institutionBadge) {
      institutionBadge.innerHTML = `<i class="fas fa-university"></i> ${institutionVal?.value || 'Institution'} · ${startYear}/${endYear} Internship Programme`;
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

//save admin settings
async function saveAdminSettings() {
  const inputs = document.querySelectorAll('#admin-tab-settings input[type="date"]');
  const startDate = inputs[0]?.value;
  const endDate = inputs[1]?.value;
  const institutionName = document.getElementById('institution-name')?.value || '';

  if (!startDate || !endDate) {
    alert('Please fill in both dates.');
    return;
  }

  if (new Date(endDate) <= new Date(startDate)) {
    alert('End date must be after start date.');
    return;
  }

  try {
    await Promise.all([
      fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ key: 'internship_start', value: startDate, label: 'Internship Start Date' }),
      }),
      fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ key: 'internship_end', value: endDate, label: 'Internship End Date' }),
      }),
      fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ key: 'institution_name', value: institutionName, label: 'Institution Name' }),
      }),
    ]);

    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--success);color:#fff;padding:12px 24px;border-radius:10px;font-weight:600;z-index:9999';
    toast.innerHTML = '<i class="fas fa-check-circle"></i> Settings saved successfully!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);

  } catch (err) {
    alert('Could not save settings.');
  }
}
//assign supervisor

async function assignSupervisor(studentId) {
  const select = document.getElementById(`sv-select-${studentId}`);
  const schoolSupervisorId = select.value ? Number(select.value) : null;

  if (!schoolSupervisorId) {
    alert('Please select a school supervisor first.');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/users/students/${studentId}/assign-supervisors`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ schoolSupervisorId }),
    });

    if (!response.ok) {
      alert('Failed to assign supervisor.');
      return;
    }

    // Show success toast
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--success);color:#fff;padding:12px 24px;border-radius:10px;font-weight:600;z-index:9999';
    toast.innerHTML = '<i class="fas fa-check-circle"></i> Supervisor assigned successfully!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);

    // Refresh dashboard
    loadAdminDashboardData();

  } catch (err) {
    alert('Could not connect to server.');
  }
}

//add supervisor
async function addSupervisor() {
  const typeSelect = document.querySelector('#admin-tab-add-supervisor select');
  const textInputs = document.querySelectorAll('#admin-tab-add-supervisor input[type="text"]');
  const emailInput = document.querySelector('#admin-tab-add-supervisor input[type="email"]');
  const passwordInput = document.querySelector('#admin-tab-add-supervisor input[type="password"]');
  const numberInput = document.querySelector('#admin-tab-add-supervisor input[type="number"]');

  const type = typeSelect?.value;
  const fullName = textInputs[0]?.value.trim();
  const staffId = textInputs[1]?.value.trim();
  const email = emailInput?.value.trim();
  const department = textInputs[2]?.value.trim();
  const password = passwordInput?.value.trim();
  const maxCapacity = numberInput?.value;

  if (!fullName || !staffId || !email || !password) {
    alert('Please fill in Full Name, Staff ID, Email and Password.');
    return;
  }

  const role = type === 'School Supervisor' ? 'school-supervisor' : 'industry-supervisor';

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role,
        fullName,
        staffId,
        email,
        password,
        department,
        maxCapacity: Number(maxCapacity) || 20,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || 'Failed to add supervisor.');
      return;
    }

    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--success);color:#fff;padding:12px 24px;border-radius:10px;font-weight:600;z-index:9999';
    toast.innerHTML = '<i class="fas fa-check-circle"></i> Supervisor added successfully!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);

    // Clear form fields
    document.querySelectorAll('#admin-tab-add-supervisor input').forEach(i => i.value = '');

    // Refresh dashboard
    loadAdminDashboardData();

  } catch (err) {
    alert('Could not connect to server.');
  }
}


function toggleSchoolChat() {
  document.getElementById('school-chat-box').classList.toggle('open');
}

async function loadAdminSupervisors() {
  try {
    const supervisors = await fetchJson(`${API_URL}/users/supervisors`);
    const schoolSups = supervisors.school || [];
    const industrySups = supervisors.industry || [];

    const schoolTab = document.querySelector('#admin-tab-supervisors .tab-row .tab-btn[onclick*=\'school\']');
    const industryTab = document.querySelector('#admin-tab-supervisors .tab-row .tab-btn[onclick*=\'industry\']');
    if (schoolTab) schoolTab.textContent = `School Supervisors (${schoolSups.length})`;
    if (industryTab) industryTab.textContent = `Industry Supervisors (${industrySups.length})`;

    const schoolGrid = document.querySelector('#sv-tab-school .student-cards-grid');
    if (schoolGrid) {
      schoolGrid.innerHTML = schoolSups.length === 0
        ? '<p style="color:var(--text2);padding:20px">No school supervisors registered yet.</p>'
        : schoolSups.map(sup => {
          const initials = sup.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
          return `
            <div class="student-card">
              <div class="student-card-top">
                <div class="avatar avatar-lg">${initials}</div>
                <div class="student-card-info">
                  <h4>${sup.fullName}</h4>
                  <p>${sup.staffId || '—'}</p>
                </div>
              </div>
              <div class="student-card-meta">
                <span>${sup.department || 'No department'}</span>
                <span><span class="approved-dot"></span>Active</span>
              </div>
              <div style="font-size:.82rem;color:var(--text2);margin-top:8px">
                <i class="fas fa-envelope" style="margin-right:4px"></i>${sup.email || '—'}
              </div>
            </div>
          `;
        }).join('');
    }

    const industryGrid = document.querySelector('#sv-tab-industry .student-cards-grid');
    if (industryGrid) {
      industryGrid.innerHTML = industrySups.length === 0
        ? '<p style="color:var(--text2);padding:20px">No industry supervisors registered yet.</p>'
        : industrySups.map(sup => {
          const initials = sup.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
          return `
            <div class="student-card">
              <div class="student-card-top">
                <div class="avatar avatar-lg">${initials}</div>
                <div class="student-card-info">
                  <h4>${sup.fullName}</h4>
                  <p>${sup.staffId || '—'}</p>
                </div>
              </div>
              <div class="student-card-meta">
                <span>${sup.department || sup.email || '—'}</span>
                <span><span class="approved-dot"></span>Active</span>
              </div>
              <div style="font-size:.82rem;color:var(--text2);margin-top:8px">
                <i class="fas fa-envelope" style="margin-right:4px"></i>${sup.email || '—'}
              </div>
            </div>
          `;
        }).join('');
    }
  } catch (err) {
    console.error('Failed to load supervisors:', err);
  }
}

async function openAssignSupervisorModal(studentId, studentName) {
  assigningStudentId = studentId;
  const nameEl = document.getElementById('assign-student-name');
  if (nameEl) nameEl.textContent = `Assigning supervisors for: ${studentName}`;

  try {
    const supervisors = await fetchJson(`${API_URL}/users/supervisors`);
    const schoolSelect = document.getElementById('assign-school-supervisor');
    const industrySelect = document.getElementById('assign-industry-supervisor');
    if (!schoolSelect || !industrySelect) {
      alert('Assignment controls are not available.');
      return;
    }

    schoolSelect.innerHTML = '<option value="">— Select School Supervisor —</option>' +
      (supervisors.school || []).map(s =>
        `<option value="${s.id}">${s.fullName} (${s.staffId || s.email})</option>`
      ).join('');

    industrySelect.innerHTML = '<option value="">— Select Industry Supervisor —</option>' +
      (supervisors.industry || []).map(s =>
        `<option value="${s.id}">${s.fullName} (${s.staffId || s.email})</option>`
      ).join('');

    openModal('assign-supervisor-modal');
  } catch (err) {
    alert('Failed to load supervisors. Please try again.');
  }
}

async function submitSupervisorAssignment() {
  if (!assigningStudentId) return;
  const schoolSupervisorId = document.getElementById('assign-school-supervisor')?.value;
  const industrySupervisorId = document.getElementById('assign-industry-supervisor')?.value;

  if (!schoolSupervisorId && !industrySupervisorId) {
    alert('Please select at least one supervisor.');
    return;
  }

  try {
    await fetchJson(`${API_URL}/users/students/${assigningStudentId}/assign-supervisors`, {
      method: 'PATCH',
      body: JSON.stringify({
        schoolSupervisorId: schoolSupervisorId ? Number(schoolSupervisorId) : null,
        industrySupervisorId: industrySupervisorId ? Number(industrySupervisorId) : null,
      }),
    });
    alert('Supervisors assigned successfully!');
    closeModal('assign-supervisor-modal');
    loadAdminDashboardData();
  } catch (err) {
    alert('Failed to assign supervisors. Make sure the backend endpoint exists: PATCH /api/users/students/{studentId}/assign-supervisors');
  }
}

function redirectToMessagesPage() {
  const loggedIn = sessionStorage.getItem('isLoggedIn');
  if (loggedIn !== 'true') {
    showPage('page-login');
    return;
  }
  const userRole = getUserRole();
  const roleToPrefix = {
    student: 'student',
    'school-supervisor': 'school',
    'industry-supervisor': 'industry',
    admin: 'admin',
  };
  const prefix = roleToPrefix[userRole] || 'student';
  switchTab(prefix, 'messages', null);
}

function openFloatingMessages() {
  const role = getUserRole();
  if (!role) { goToLogin(); return; }
  const prefix = role === 'school-supervisor' ? 'school'
    : role === 'industry-supervisor' ? 'industry'
    : role === 'admin' ? 'admin' : 'student';
  const navItem = document.querySelector(
    `#sidebar-${prefix} .nav-item[onclick*="'messages'"]`
  );
  switchTab(prefix, 'messages', navItem);
  initializeMessagingPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}



const messagingState = {
  activeConversationUserId: null,
  activeConversationUserName: '',
  pollingTimer: null,
  searchTimer: null,
  initialized: false,
  currentSearchQuery: '',
};

function formatTimestamp(value) {
  const date = new Date(value);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function getActiveMessagesRoot() {
  return document.querySelector('.tab-content.active');
}

function getMessagingPrefix() {
  const role = getUserRole();
  if (role === 'school-supervisor') return 'school-';
  if (role === 'industry-supervisor') return 'industry-';
  if (role === 'admin') return 'admin-';
  return '';
}

function findMessageElement(selector) {
  const prefix = getMessagingPrefix();
  const prefixed = selector.replace(/^#messages-/, `#${prefix}messages-`);
  return document.querySelector(prefixed) || document.querySelector(selector);
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>",']/g, function (char) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
  });
}



async function initializeMessagingPage() {
  if (messagingState.initialized) return;

  const token = getToken();
  const userId = getUserId();
  if (!token || !userId) { goToLogin(); return; }

  const searchInput = findMessageElement('#messages-search-input');
  const sendButton = findMessageElement('#messages-send-button');
  const textarea = findMessageElement('#messages-textarea');

  if (!searchInput || !sendButton || !textarea) {
    console.warn('[Messages] DOM elements not found for role:', getUserRole());
    return;
  }

  // Clone elements to remove stale listeners
  const newSearch = searchInput.cloneNode(true);
  searchInput.parentNode.replaceChild(newSearch, searchInput);
  const newBtn = sendButton.cloneNode(true);
  sendButton.parentNode.replaceChild(newBtn, sendButton);
  const newTextarea = textarea.cloneNode(true);
  textarea.parentNode.replaceChild(newTextarea, textarea);

  // Role-aware search
  newSearch.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();
    const role = getUserRole();
    const contactsList = findMessageElement('#messages-contacts-list');
    if (!contactsList) return;
    contactsList.querySelectorAll('.contact-item').forEach(item => {
      const name = item.querySelector('.contact-name')?.textContent?.toLowerCase() || '';
      const regNo = item.querySelector('.contact-subtext')?.textContent?.toLowerCase() || '';
      let match;
      if (role === 'student') {
        match = name.includes(query);
      } else {
        match = regNo.includes(query) || name.includes(query);
      }
      item.style.display = (query === '' || match) ? 'flex' : 'none';
    });
  });

  newBtn.addEventListener('click', sendActiveMessage);
  newBtn.disabled = true;
  newTextarea.addEventListener('input', updateSendButtonState);
  newTextarea.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendActiveMessage();
    }
  });

  messagingState.initialized = true;

  try {
    await Promise.all([loadAvailableContacts(), refreshUnreadCount()]);
  } catch (err) {
    console.error('[Messages] Failed to load initial data:', err);
    return;
  }

  if (messagingState.pollingTimer) clearInterval(messagingState.pollingTimer);
  messagingState.pollingTimer = setInterval(async () => {
    try {
      const myId = getUserId();
      const token = getToken();
      if (!myId || !token) return; // Skip if not authenticated

      const searchEl = findMessageElement('#messages-search-input');
      const textareaEl = findMessageElement('#messages-textarea');
      const userIsTyping = document.activeElement === searchEl ||
                           document.activeElement === textareaEl;

      if (messagingState.activeConversationUserId) {
        try {
          await loadConversationWith(
            messagingState.activeConversationUserId,
            messagingState.activeConversationUserName,
            true
          );
        } catch (convErr) {
          if (convErr.message && convErr.message.includes('403')) {
            messagingState.activeConversationUserId = null;
            messagingState.activeConversationUserName = '';
          }
          console.warn('[Messages] Conversation poll skipped:', convErr.message);
        }
      }

      if (!userIsTyping) {
        const currentSearch = searchEl?.value || '';
        await loadAvailableContacts(currentSearch);
      }

      await refreshUnreadCount();
    } catch (err) {
      console.warn('[Messages] Polling error (non-critical):', err.message);
    }
  }, 15000);
}

async function loadAvailableContacts(search = '') {
  try {
    const myId = getUserId();
    if (!myId) return; // Guard against null userId

    const query = search ? `?q=${encodeURIComponent(search)}` : '';
    const [contacts, conversationMessages] = await Promise.all([
      fetchJson(`${API_URL}/messages/available-users${query}`),
      fetchJson(`${API_URL}/messages/user/${myId}`),
    ]);

    // Guard against undefined or non-array responses
    const messages = Array.isArray(conversationMessages) ? conversationMessages : [];
    const contactList = Array.isArray(contacts) ? contacts : [];

    const conversationSummary = messages.reduce((map, msg) => {
      const otherId = Number(msg.senderId) === Number(myId) ? Number(msg.receiverId) : Number(msg.senderId);
      const summary = map.get(otherId) || { unread: 0, lastMessage: '', lastAt: '' };
      if (!summary.lastAt || new Date(msg.sentAt) > new Date(summary.lastAt)) {
        summary.lastMessage = msg.content;
        summary.lastAt = msg.sentAt;
      }
      if (Number(msg.receiverId) === Number(myId) && !msg.isRead) {
        summary.unread += 1;
      }
      map.set(otherId, summary);
      return map;
    }, new Map());

    contactList.sort((a, b) => {
      const aMeta = conversationSummary.get(Number(a.id));
      const bMeta = conversationSummary.get(Number(b.id));
      if (aMeta?.lastAt && bMeta?.lastAt) {
        return new Date(bMeta.lastAt) - new Date(aMeta.lastAt);
      }
      if (aMeta?.lastAt) return -1;
      if (bMeta?.lastAt) return 1;
      return a.fullName.localeCompare(b.fullName);
    });
    renderContactList(contactList, conversationSummary);
  } catch (err) {
    console.error('Failed to load messaging contacts:', err);
    showMessagingEmptyState('Unable to load contacts. Please try again later.');
  }
}

function renderContactList(users, conversationMap) {
  const container = findMessageElement('#messages-contacts-list');
  if (!container) return;
  container.innerHTML = '';

  const role = getUserRole();

  if (!users || users.length === 0) {
    const emptyMsg = role === 'student'
      ? 'Your assigned supervisors will appear here.'
      : 'Your assigned students will appear here. Search by registration number above.';
    container.innerHTML = `<div class="message-empty-state">${emptyMsg}</div>`;
    return;
  }

  users.forEach(user => {
    const summary = conversationMap.get(Number(user.id)) || { unread: 0, lastMessage: '', lastAt: '' };
    const initials = user.fullName.split(' ').map(p => p[0] || '').join('').slice(0, 2).toUpperCase();
    const subtext = user.registrationNumber || user.staffId || '';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'contact-item' + (Number(messagingState.activeConversationUserId) === Number(user.id) ? ' active' : '');
    button.setAttribute('data-user-id', String(user.id));
    button.onclick = () => loadConversationWith(Number(user.id), user.fullName);
    button.innerHTML = `
      <div class="contact-avatar">${escapeHtml(initials)}</div>
      <div class="contact-details">
        <div class="contact-top">
          <div>
            <div class="contact-name">${escapeHtml(user.fullName)}</div>
            <div class="contact-role">${escapeHtml(user.role === 'student' ? (user.registrationNumber || '') : (user.role || ''))}</div>
          </div>
          <div class="contact-right">
            <div class="contact-time">${summary.lastAt ? formatRecentTimestamp(summary.lastAt) : ''}</div>
            ${summary.unread > 0 ? `<span class="contact-unread-badge">${summary.unread}</span>` : ''}
          </div>
        </div>
        ${subtext ? `<div class="contact-subtext">${escapeHtml(subtext)}</div>` : ''}
        <div class="contact-preview">${escapeHtml(summary.lastMessage || 'No messages yet')}</div>
      </div>
    `;
    container.appendChild(button);
  });
}

async function loadConversationWith(otherUserId, otherUserName, isPolling = false) {
  if (!otherUserId) return;
  messagingState.activeConversationUserId = otherUserId;
  messagingState.activeConversationUserName = otherUserName;

  const history = findMessageElement('#messages-history');
  const emptyState = findMessageElement('#messages-empty-state');
  const sendRow = findMessageElement('#messages-send-row');
  const title = findMessageElement('#messages-chat-title');
  const subtitle = findMessageElement('#messages-chat-subtitle');

  if (!isPolling) {
    if (title) title.textContent = otherUserName;
    if (subtitle) subtitle.textContent = 'Loading…';
    if (emptyState) { emptyState.textContent = 'Loading conversation…'; emptyState.style.display = 'block'; }
    if (history) history.style.display = 'none';
    if (sendRow) sendRow.style.display = 'none';
  }

  // Highlight active contact
  document.querySelectorAll('.contact-item').forEach(el => el.classList.remove('active'));
  const activeContact = document.querySelector(`.contact-item[data-user-id="${otherUserId}"]`);
  if (activeContact) activeContact.classList.add('active');

  try {
    const myId = getUserId();
    const messages = await fetchJson(`${API_URL}/messages/conversation/with/${otherUserId}`);

    if (!messages || messages.length === 0) {
      if (emptyState) {
        emptyState.innerHTML = `<div style="text-align:center;padding:40px 20px">
          <div style="font-size:3rem;margin-bottom:12px">👋</div>
          <div style="font-weight:600;font-size:1.1rem;margin-bottom:6px">No messages yet — say hello!</div>
          <div style="color:var(--text2);font-size:.9rem">Start the conversation with ${escapeHtml(otherUserName)}</div>
        </div>`;
        emptyState.style.display = 'block';
      }
      if (history) history.style.display = 'none';
    } else {
      renderMessageHistory(messages, myId);
      if (emptyState) emptyState.style.display = 'none';
    }

    // Always show send row after contact is selected
    if (sendRow) sendRow.style.display = 'flex';
    if (subtitle) subtitle.textContent = `Conversation with ${otherUserName}`;

    // Mark messages as read
    await fetch(`${API_URL}/messages/read/${otherUserId}/${myId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${getToken()}` },
    });

    await loadAvailableContacts(findMessageElement('#messages-search-input')?.value || '');

  } catch (err) {
    console.error('Failed to load conversation:', err);
    if (emptyState) {
      emptyState.textContent = 'Unable to load this conversation. Please try again.';
      emptyState.style.display = 'block';
    }
    // Still show send row so user can try sending
    if (sendRow) sendRow.style.display = 'flex';
  } finally {
    if (!isPolling) {
      const textarea = findMessageElement('#messages-textarea');
      if (textarea) textarea.focus();
    }
  }
}

function renderMessageHistory(messages, myId) {
  const history = findMessageElement('#messages-history');
  if (!history) return;
  if (!messages || messages.length === 0) {
    showMessagingEmptyState('No messages yet.');
    return;
  }

  const role = getUserRole();
  const canDelete = role === 'school-supervisor' || role === 'industry-supervisor' || role === 'admin';

  history.innerHTML = messages.map(msg => {
    const isMine = Number(msg.senderId) === Number(myId);
    const deleteBtn = canDelete
      ? `<button class="msg-delete-btn" onclick="deleteMessage(${msg.id})" title="Delete message">
           <i class="fas fa-trash-alt"></i>
         </button>`
      : '';
    return `
      <div class="msg ${isMine ? 'out' : 'in'}" data-msg-id="${msg.id}">
        <div class="msg-bubble">
          ${escapeHtml(msg.content)}
          ${deleteBtn}
        </div>
        <div class="msg-time">${formatTimestamp(msg.sentAt)}</div>
      </div>
    `;
  }).join('');

  history.style.display = 'flex';
  history.scrollTo({ top: history.scrollHeight, behavior: 'smooth' });
}

function showMessagingEmptyState(message) {
  const history = findMessageElement('#messages-history');
  const emptyState = findMessageElement('#messages-empty-state');
  if (history) history.style.display = 'none';
  if (emptyState) {
    emptyState.innerHTML = `
      <div class="empty-illustration"><i class="fas fa-comments"></i></div>
      <h4>No messages yet — say hello! 👋</h4>
      <p>${escapeHtml(message)}</p>
    `;
    emptyState.style.display = 'flex';
  }
}

function showMessagingErrorState(message) {
  console.error('[Messages] Error state:', message);
  showMessagingEmptyState(message);
}

function updateSendButtonState() {
  const input = findMessageElement('#messages-textarea');
  const button = findMessageElement('#messages-send-button');
  if (!button || !input) return;
  const hasText = input.value.trim().length > 0;
  button.disabled = !hasText;
}

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}

function formatRecentTimestamp(value) {
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (sameDay) {
    return `Today ${time}`;
  }
  return `${date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ${time}`;
}

function showChatPanel() {
  const sidebar = document.querySelector('.tab-content.active .messages-sidebar');
  const main = document.querySelector('.tab-content.active .messages-main');
  if (sidebar && main) {
    sidebar.classList.add('hidden-mobile');
    main.classList.remove('hidden-mobile');
  }
}

function showContactsPanel() {
  const sidebar = document.querySelector('.tab-content.active .messages-sidebar');
  const main = document.querySelector('.tab-content.active .messages-main');
  if (sidebar && main) {
    sidebar.classList.remove('hidden-mobile');
    main.classList.add('hidden-mobile');
  }
}

async function refreshUnreadCount() {
  const badge = document.getElementById('floating-messages-unread');
  try {
    const myId = getUserId();
    const result = await fetchJson(`${API_URL}/messages/unread/${myId}`);
    const count = Number(result);
    const prefix = getUserRole() === 'school-supervisor'
      ? 'school'
      : getUserRole() === 'industry-supervisor'
        ? 'industry'
        : getUserRole() === 'admin'
          ? 'admin'
          : 'student';
    const sidebarBadge = document.querySelector(`#sidebar-${prefix} .nav-item[onclick*="'messages'"] .badge`);

    const countText = count > 0 ? String(count) : '0';
    const messagesUnread = document.getElementById('messages-unread-count');
    if (messagesUnread) {
      messagesUnread.textContent = countText;
    }

    if (badge) {
      badge.style.display = count > 0 ? 'inline-block' : 'none';
      badge.textContent = countText;
    }

    if (sidebarBadge) {
      sidebarBadge.textContent = countText;
      sidebarBadge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  } catch (err) {
    console.error('Failed to refresh unread count:', err);
  }
}

async function sendActiveMessage() {
  const input = findMessageElement('#messages-textarea');
  const content = input?.value.trim();
  if (!content) return;
  if (!messagingState.activeConversationUserId) {
    alert('Please select a contact first.');
    return;
  }

  const myId = getUserId();
  const history = findMessageElement('#messages-history');

  // Optimistic UI — show bubble immediately
  const tempId = 'msg-temp-' + Date.now();
  const tempBubble = document.createElement('div');
  tempBubble.className = 'msg out';
  tempBubble.id = tempId;
  tempBubble.innerHTML = `${escapeHtml(content)}<div class="msg-time">Sending…</div>`;
  if (history) {
    history.style.display = 'flex';
    history.appendChild(tempBubble);
    history.scrollTop = history.scrollHeight;
  }

  // Clear input immediately
  input.value = '';

  try {
    await fetchJson(`${API_URL}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        receiverId: Number(messagingState.activeConversationUserId),
        content,
      }),
    });

    // Replace temp bubble with confirmed one
    const confirmed = document.getElementById(tempId);
    if (confirmed) {
      confirmed.innerHTML = `${escapeHtml(content)}<div class="msg-time">${formatTimestamp(new Date())}</div>`;
    }

    // Refresh conversation silently
    await loadConversationWith(
      messagingState.activeConversationUserId,
      messagingState.activeConversationUserName,
      true
    );

  } catch (err) {
    console.error('Failed to send message:', err);
    const failed = document.getElementById(tempId);
    if (failed) {
      failed.style.borderColor = 'var(--danger)';
      failed.style.opacity = '0.7';
      failed.innerHTML += `<div style="font-size:.7rem;color:var(--danger);margin-top:4px">Failed to send. Please retry.</div>`;
    }
  }
}

async function fetchJson(url, options = {}) {
  const token = getToken();
  if (!token) {
    goToLogin();
    return;
  }
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`,
    },
  });
  if (response.status === 401) {
    goToLogin();
    return;
  }
  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(text || 'Request failed');
  }
  return response.json();
}

async function openStudentProfile(studentId, fullName, regNumber, course, placement, email) {
  // Update modal header
  const avatar = document.querySelector('#student-profile-modal .profile-avatar');
  const nameEl = document.querySelector('#student-profile-modal .profile-info h3');
  const subEl = document.querySelector('#student-profile-modal .profile-info p');
  const placementEl = document.querySelector('#student-profile-modal .profile-meta-item:first-child span');
  const emailEl = document.querySelector('#student-profile-modal .profile-meta-item:last-child span');
  const sectionHeading = document.querySelector('#student-profile-modal .section-head h3');

  if (avatar) avatar.textContent = fullName.split(' ').map(n => n[0]).join('').toUpperCase();
  if (nameEl) nameEl.textContent = fullName;
  if (subEl) subEl.textContent = `${regNumber || 'N/A'} · ${course || 'N/A'}`;
  if (placementEl) placementEl.textContent = placement || 'N/A';
  if (emailEl) emailEl.textContent = email || 'N/A';
  if (sectionHeading) sectionHeading.textContent = 'Student Log Entries';

  // Wire download button immediately
  const downloadBtn = document.getElementById('download-report-btn');
  if (downloadBtn) {
    downloadBtn.onclick = () => downloadStudentReport(studentId, fullName);
  }

  // Wire send message button
  const sendMsgBtn = document.getElementById('send-message-btn');
  if (sendMsgBtn) {
    sendMsgBtn.onclick = () => {
      closeModal('student-profile-modal');
      const role = getUserRole();
      const prefix = role === 'school-supervisor' ? 'school'
        : role === 'industry-supervisor' ? 'industry'
        : role === 'admin' ? 'admin' : 'student';
      const navItem = document.querySelector(
        `#sidebar-${prefix} .nav-item[onclick*="'messages'"]`
      );
      switchTab(prefix, 'messages', navItem);
      setTimeout(() => {
        loadConversationWith(Number(studentId), fullName);
      }, 400);
    };
  }

  // Fetch student logs
  try {
    const response = await fetch(`${API_URL}/logs/student/${studentId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const logs = response.ok ? await response.json() : [];
    const total = Array.isArray(logs) ? logs.length : 0;
    const approved = total > 0 ? logs.filter(l => l.status === 'approved').length : 0;
    const progress = total > 0 ? Math.round((approved / total) * 100) : 0;

    // Update stats cards in modal
    const modalCards = document.querySelectorAll('#student-profile-modal .card-val');
    if (modalCards[0]) modalCards[0].textContent = total;
    if (modalCards[1]) modalCards[1].textContent = approved;
    if (modalCards[2]) modalCards[2].textContent = progress + '%';

    // Update progress bar
    const progFill = document.querySelector('#student-profile-modal .prog-fill');
    if (progFill) progFill.style.width = progress + '%';

    const progText = document.querySelector('#student-profile-modal .prog-bar + div');
    if (progText) progText.textContent = `${progress}% · ${approved}/${total} approved`;

    const tbody = document.querySelector('#student-profile-modal tbody');
    if (tbody) {
      if (total === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text2)">No logs have been submitted yet.</td></tr>`;
      } else {
        tbody.innerHTML = logs.map(log => `
          <tr onclick="openLogDetail(${log.id})" style="cursor:pointer">
            <td>${new Date(log.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            <td>${log.taskName || 'Untitled log'}</td>
            <td>${log.estimatedHours || 0}h</td>
            <td><span class="tag ${log.status}">${log.status ? log.status.charAt(0).toUpperCase() + log.status.slice(1) : 'Unknown'}</span></td>
            <td><button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); openLogDetail(${log.id})">View</button></td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Failed to load student profile data:', err);
  }

  openModal('student-profile-modal');
}

async function openLogDetail(logId) {
  try {
    const response = await fetch(`${API_URL}/logs/${logId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!response.ok) {
      console.error('Failed to load log details', response.statusText);
      return;
    }

    const log = await response.json();
    const titleEl = document.getElementById('log-detail-title');
    const dateEl = document.getElementById('log-detail-date');
    const hoursEl = document.getElementById('log-detail-hours');
    const statusEl = document.getElementById('log-detail-status');
    const descriptionEl = document.getElementById('log-detail-description');
    const skillsEl = document.getElementById('log-detail-skills');
    const challengesEl = document.getElementById('log-detail-challenges');
    const attachmentsEl = document.getElementById('log-detail-attachments');
    const commentsEl = document.getElementById('log-detail-comments');

    if (titleEl) titleEl.textContent = log.taskName || 'Log Entry Detail';
    if (dateEl) dateEl.textContent = log.createdAt ? new Date(log.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown date';
    if (hoursEl) hoursEl.textContent = `${log.estimatedHours || 0} hour${log.estimatedHours === 1 ? '' : 's'}`;

    if (statusEl) {
      statusEl.innerHTML = `<span class="tag ${log.status}">${log.status ? log.status.charAt(0).toUpperCase() + log.status.slice(1) : 'Unknown'}</span>`;
    }
    if (descriptionEl) descriptionEl.textContent = log.description || 'No description provided.';
    if (skillsEl) skillsEl.textContent = log.skillsApplied || 'No activities recorded.';
    if (challengesEl) challengesEl.textContent = log.challenges || 'No challenges recorded.';

    if (attachmentsEl) {
      if (log.proofFileUrl) {
        attachmentsEl.innerHTML = `<a href="${log.proofFileUrl}" target="_blank" rel="noopener noreferrer">View attachment</a>`;
      } else {
        attachmentsEl.textContent = 'No attachment provided.';
      }
    }
    if (commentsEl) commentsEl.textContent = log.supervisorComment || 'No supervisor comments yet.';

    openModal('log-detail-modal');
  } catch (err) {
    console.error('Failed to load log details:', err);
  }
}


async function loadStudentProfile(userId) {
  try {
    const user = await fetchJson(`${API_URL}/users/${userId}`);
    if (!user) return;

    // Update placement in welcome banner
    const placementBadge = document.querySelector('#student-tab-dashboard .wb-badge');
    if (placementBadge) {
      placementBadge.innerHTML = `<i class="fas fa-map-marker-alt"></i> Placed at: ${user.placementCompany || 'Not set'} · ${user.country || ''}`;
    }

    // Update sidebar role info
    const sidebarRole = document.querySelector('#sidebar-student .sidebar-user-role');
    if (sidebarRole) {
      sidebarRole.textContent = `${user.course || ''} · ${user.yearOfStudy || ''}`;
    }

    // Update settings profile tab
    const settingsName = document.querySelector('#student-tab-settings input[type="text"]');
    if (settingsName) settingsName.value = user.fullName || '';

    const settingsReg = document.querySelectorAll('#student-tab-settings input[type="text"]');
    if (settingsReg[1]) settingsReg[1].value = user.registrationNumber || '';
    if (settingsReg[2]) settingsReg[2].value = user.placementCompany || '';

    const settingsEmail = document.querySelector('#student-tab-settings input[type="email"]');
    if (settingsEmail) settingsEmail.value = user.email || '';

  } catch (err) {
    console.error('Failed to load profile:', err);
  }
}

async function downloadStudentReport(studentId, studentName) {
  try {
    const report = await fetchJson(`${API_URL}/reports/student/${studentId}`);

    if (!report || !report.id) {
      alert(`${studentName} has not submitted a report yet.`);
      return;
    }

    // Open file in new tab
    window.open(`http://localhost:3000/${report.fileUrl}`, '_blank');

  } catch (err) {
    alert('Could not fetch report. Make sure the backend is running.');
  }
}


/* ===== SIDEBAR ===== */
function openSidebar(sidebarId, overlayId) {
  document.getElementById(sidebarId).classList.add('open');
  document.getElementById(overlayId).classList.add('open');
}

function closeSidebar(sidebarId, overlayId) {
  document.getElementById(sidebarId).classList.remove('open');
  document.getElementById(overlayId).classList.remove('open');
}

/* ===== TAB SWITCHING ===== */
function switchTab(prefix, tabName, navEl) {
  history.pushState({ prefix, tabName }, '', `#${prefix}-${tabName}`);
  localStorage.setItem("activeTab", tabName);
  localStorage.setItem("activeTabPrefix", prefix);
  document.querySelectorAll(`#page-${prefix === 'industry' ? 'industry-supervisor' : prefix === 'school' ? 'school-supervisor' : prefix} .tab-content`).forEach(t => t.classList.remove('active'));
  const tab = document.getElementById(`${prefix}-tab-${tabName}`);
  if (tab) tab.classList.add('active');
  const pageId = `${prefix === 'industry' ? 'industry' : prefix === 'school' ? 'school' : prefix}-page-title`;
  const titles = { dashboard: 'Dashboard', logs: 'My Logs', approved: 'Approved Tasks', attendance: 'Attendance', settings: 'Settings', students: 'Students', reports: 'Reports', messages: 'Messages', requests: 'Approval Requests', history: 'Approval History', interns: 'My Interns', supervisors: 'Supervisors', 'add-supervisor': 'Add Supervisor', placements: 'Placements & GPS' };
  const titleEl = document.getElementById(pageId);
  if (titleEl) titleEl.textContent = titles[tabName] || tabName;
  const sidebar = document.getElementById(`sidebar-${prefix === 'industry' ? 'industry' : prefix === 'school' ? 'school' : prefix}`);
  if (sidebar) {
    sidebar.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (navEl) navEl.classList.add('active');
  }
  // Fallback: highlight by matching onclick attribute
  if (!navEl && sidebar) {
    sidebar.querySelectorAll('.nav-item').forEach(n => {
      if (n.getAttribute('onclick') && n.getAttribute('onclick').includes(`'${tabName}'`)) {
        n.classList.add('active');
      }
    });
  }
  
  // Load interns when industry supervisor clicks on interns tab
  if (prefix === 'industry' && tabName === 'interns') {
    loadIndustryInterns();
  }
  // Load grading students when industry supervisor opens grading tab
  if (prefix === 'industry' && tabName === 'grading') {
    loadIndustryGradingStudents();
  }
  
  if (window.innerWidth <= 768) {
    const overlayId = `overlay-${prefix === 'industry' ? 'industry' : prefix === 'school' ? 'school' : prefix}`;
    const sidebarId = `sidebar-${prefix === 'industry' ? 'industry' : prefix === 'school' ? 'school' : prefix}`;
    closeSidebar(sidebarId, overlayId);
  }

  if (prefix === 'industry' && tabName === 'interns') {
    setTimeout(() => loadIndustryInterns(), 200);
  }

  // Handle messaging tab initialization and polling
  if (tabName === 'messages') {
    // Only initialize once — never reset while on messages tab
    if (!messagingState.initialized) {
      setTimeout(() => initializeMessagingPage(), 200);
    }
  } else {
    if (messagingState.pollingTimer) {
      clearInterval(messagingState.pollingTimer);
      messagingState.pollingTimer = null;
    }
    messagingState.initialized = false;
    messagingState.activeConversationUserId = null;
    messagingState.activeConversationUserName = '';
  }

  if (prefix === 'admin' && tabName === 'supervisors') {
    setTimeout(() => loadAdminSupervisors(), 200);
  }
}

function switchInnerTab(prefix, tabName, el) {
  document.querySelectorAll(`[id^="${prefix}-tab-"]`).forEach(t => t.classList.remove('active'));
  const tab = document.getElementById(`${prefix}-tab-${tabName}`);
  if (tab) tab.classList.add('active');
  el.closest('.tab-row').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

/* ===== MODALS ===== */
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', function (e) { if (e.target === this) this.classList.remove('open'); }));

/* ===== PASSWORD TOGGLE ===== */
function togglePw(id, el) {
  const input = document.getElementById(id);
  if (input.type === 'password') { input.type = 'text'; el.innerHTML = '<i class="fas fa-eye-slash"></i>'; }
  else { input.type = 'password'; el.innerHTML = '<i class="fas fa-eye"></i>'; }
}
function togglePwEl(el) {
  const input = el.previousElementSibling || el.parentElement.querySelector('input');
  if (input && input.type === 'password') { input.type = 'text'; el.innerHTML = '<i class="fas fa-eye-slash"></i>'; }
  else if (input) { input.type = 'password'; el.innerHTML = '<i class="fas fa-eye"></i>'; }
}

/* ===== NOTIFICATIONS ===== */
function toggleNotif(id) {
  const panel = document.getElementById(id);
  const isOpen = panel.classList.contains('open');
  document.querySelectorAll('.notif-panel').forEach(n => n.classList.remove('open'));
  if (!isOpen) panel.classList.add('open');
}
document.addEventListener('click', function (e) {
  if (!e.target.closest('.topbar-btn') && !e.target.closest('.notif-panel')) {
    document.querySelectorAll('.notif-panel').forEach(n => n.classList.remove('open'));
  }
});

/* ===== THEME ===== */
function setTheme(theme, el) {
  localStorage.setItem("savedTheme", theme);
  document.documentElement.setAttribute('data-theme', theme === 'default' ? '' : theme);
  if (theme === 'purple') {
    document.documentElement.style.setProperty('--primary', '#7c3aed');
    document.documentElement.style.setProperty('--primary-light', '#8b5cf6');
    document.documentElement.style.setProperty('--primary-dark', '#5b21b6');
  } else { document.documentElement.style.removeProperty('--primary'); document.documentElement.style.removeProperty('--primary-light'); document.documentElement.style.removeProperty('--primary-dark'); }
  document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
  document.querySelectorAll('.theme-option').forEach(o => { if (o.onclick.toString().includes(`'${theme}'`)) o.classList.add('active'); });
  if (el) { document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active')); el.classList.add('active'); }
}

/* ===== FILE UPLOAD ===== */
function showUpload(input) {
  const preview = document.getElementById('upload-preview');
  if (input.files && input.files[0]) {
    const name = input.files[0].name;
    preview.style.display = 'block';
    preview.innerHTML = `<div style="display:flex;align-items:center;gap:8px;background:rgba(26,107,74,.08);border-radius:8px;padding:8px 12px;font-size:.85rem"><i class="fas fa-file-image" style="color:var(--primary)"></i> ${name} <i class="fas fa-check-circle" style="color:var(--success);margin-left:auto"></i></div>`;
  }
}

/* ===== LOG SUBMIT ===== */
async function submitLog() {
  const taskName = document.querySelector('#student-tab-dashboard input[placeholder="Brief title of what you did"]').value.trim();
  const workType = document.querySelector('#student-tab-dashboard select').value;
  const description = document.querySelector('#student-tab-dashboard textarea').value.trim();
  const skillsApplied = document.querySelector('#student-tab-dashboard input[placeholder="e.g. SQL, Communication, Excel"]').value.trim();
  const toolsUsed = document.querySelector('#student-tab-dashboard input[placeholder="e.g. VS Code, Git, Postman, Excel"]').value.trim();
  const estimatedHours = document.querySelector('#student-tab-dashboard input[type="number"]').value;

  if (!taskName || !description || !workType) {
    alert('Please fill in Task Name, Work Type and Description.');
    return;
  }

  if (!estimatedHours || estimatedHours < 1) {
    alert('Please enter estimated hours.');
    return;
  }

  const userId = getUserId();
  if (!userId) {
    alert('Session expired. Please log in again.');
    return;
  }

  const btn = event.target;
  btn.innerHTML = '<span class="spinner"></span> Submitting...';
  btn.disabled = true;

  try {
    // Get GPS coordinates
    let gpsLatitude = null;
    let gpsLongitude = null;

    if (navigator.geolocation) {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            gpsLatitude = pos.coords.latitude;
            gpsLongitude = pos.coords.longitude;
            resolve();
          },
          () => resolve() // continue even if GPS fails
        );
      });
    }

    await fetchJson(`${API_URL}/logs`, {
      method: 'POST',
      body: JSON.stringify({
        studentId: Number(userId),
        taskName,
        workType,
        description,
        skillsApplied,
        toolsUsed,
        estimatedHours: Number(estimatedHours),
        gpsLatitude,
        gpsLongitude,
      }),
    });

    // Show success toast
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--success);color:#fff;padding:12px 24px;border-radius:10px;font-weight:600;z-index:9999;animation:fadeUp .3s ease';
    toast.innerHTML = '<i class="fas fa-check-circle"></i> Log entry submitted successfully!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);

    // Clear form fields
    document.querySelector('#student-tab-dashboard input[placeholder="Brief title of what you did"]').value = '';
    document.querySelector('#student-tab-dashboard textarea').value = '';
    document.querySelector('#student-tab-dashboard input[placeholder="e.g. SQL, Communication, Excel"]').value = '';
    document.querySelector('#student-tab-dashboard input[type="number"]').value = '';

    // Refresh cards and logs
    loadStudentCards(userId);
    loadStudentLogs(userId);

  } catch (err) {
    alert('Could not connect to server. Make sure the backend is running.');
  } finally {
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Log Entry';
    btn.disabled = false;
  }
}

/* ===== DRAG & DROP UPLOAD ===== */
const uploadArea = document.querySelector('.upload-area');
if (uploadArea) {
  uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.style.borderColor = 'var(--primary)'; uploadArea.style.background = 'rgba(26,107,74,0.06)'; });
  uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = ''; uploadArea.style.background = ''; });
  uploadArea.addEventListener('drop', e => { e.preventDefault(); uploadArea.style.borderColor = ''; uploadArea.style.background = ''; });
}

// LOAD GRADING STUDENTS
async function loadGradingStudents() {
  try {
    const students = await fetchJson(getAssignedStudentsEndpoint());

    const select = document.getElementById('grading-student-select');
    if (!select) return;

    select.innerHTML = '<option value="">Select Student...</option>';
    students.forEach(student => {
      select.innerHTML += `<option value="${student.id}">${student.fullName} (${student.registrationNumber})</option>`;
    });

  } catch (err) {
    console.error('Failed to load grading students:', err);
  }
}


/* ==== LOAD gRADING FORM =====*/

async function loadGradingForm() {
  const select = document.getElementById('grading-student-select');
  const container = document.getElementById('grading-form-container');

  if (!select.value) {
    alert('Please select a student first');
    return;
  }

  // Update student name in form header
  const selectedOption = select.options[select.selectedIndex];
  const studentName = selectedOption.text.split('(')[0].trim();
  const nameHeader = document.querySelector('#grading-form-container h4');
  if (nameHeader) nameHeader.textContent = studentName;

  if (container) container.style.display = 'block';

  // Setup industry grading listeners
  setupIndustryGradingListeners();
}

async function submitGrading() {
  const studentSelect = document.getElementById('grading-student-select');
  const studentId = studentSelect.value;

  if (!studentId) {
    alert('Please select a student first.');
    return;
  }

  const supervisorId = getUserId();

  // Gather all grading fields
  const data = {
    supervisorId: Number(supervisorId),
    studentId: Number(studentId),
    // Attendance
    attendanceRate: Number(document.querySelector('#grading-form-container input[placeholder*="95"]')?.value) || null,
    attendanceComments: document.querySelectorAll('#grading-form-container textarea')[0]?.value || null,
    // Daily Entries
    logQuality: document.querySelectorAll('#grading-form-container select')[0]?.value || null,
    logConsistency: Number(document.querySelector('#grading-form-container input[type="range"]')?.value) || null,
    // Report
    reportGrade: document.querySelectorAll('#grading-form-container select')[1]?.value || null,
    reportFeedback: document.querySelectorAll('#grading-form-container textarea')[1]?.value || null,
    // Communication
    communicationRating: Number(document.querySelectorAll('#grading-form-container input[type="number"]')[1]?.value) || null,
    communicationObservations: document.querySelectorAll('#grading-form-container textarea')[2]?.value || null,
    // Industry Supervisor Detailed Grading
    enthusiasm: Number(document.getElementById('enthusiasm')?.value) || 0,
    technicalCompetence: Number(document.getElementById('technical-competence')?.value) || 0,
    punctuality: Number(document.getElementById('punctuality')?.value) || 0,
    presentationSmartness: Number(document.getElementById('presentation-smartness')?.value) || 0,
    superiorSubordinateRelationship: Number(document.getElementById('superior-relationship')?.value) || 0,
    adherenceToPolicies: Number(document.getElementById('adherence-policies')?.value) || 0,
    industryComments: document.getElementById('industry-comments')?.value || null,
    // Overall
    overallGrade: document.querySelector('#grading-form-container .card-val')?.textContent || null,
    finalComments: document.querySelectorAll('#grading-form-container textarea')[3]?.value || null,
  };

  try {
    await fetchJson(`${API_URL}/gradings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    alert('Grading submitted successfully!');
    document.getElementById('grading-form-container').style.display = 'none';
    document.getElementById('grading-student-select').value = '';

  } catch (err) {
    alert('Could not connect to server. Make sure the backend is running.');
  }
}

// Calculate industry supervisor total dynamically
function calculateIndustryTotal() {
  const enthusiasm = Number(document.getElementById('enthusiasm')?.value) || 0;
  const technicalCompetence = Number(document.getElementById('technical-competence')?.value) || 0;
  const punctuality = Number(document.getElementById('punctuality')?.value) || 0;
  const presentationSmartness = Number(document.getElementById('presentation-smartness')?.value) || 0;
  const superiorRelationship = Number(document.getElementById('superior-relationship')?.value) || 0;
  const adherencePolicies = Number(document.getElementById('adherence-policies')?.value) || 0;

  const total = enthusiasm + technicalCompetence + punctuality + presentationSmartness + superiorRelationship + adherencePolicies;
  const totalElement = document.getElementById('industry-total');
  if (totalElement) {
    totalElement.textContent = `${total}/30`;
    totalElement.style.color = total > 15 ? 'var(--success)' : total > 10 ? 'var(--warning)' : 'var(--danger)';
  }
}

// Add event listeners for industry grading inputs
function setupIndustryGradingListeners() {
  const industryInputs = [
    'enthusiasm', 'technical-competence', 'punctuality',
    'presentation-smartness', 'superior-relationship', 'adherence-policies'
  ];

  industryInputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', calculateIndustryTotal);
    }
  });
}

// Calculate industry grading total for industry supervisor page
function calculateIndustryGradingTotal() {
  const enthusiasm = Number(document.getElementById('industry-enthusiasm')?.value) || 0;
  const technicalCompetence = Number(document.getElementById('industry-technical-competence')?.value) || 0;
  const punctuality = Number(document.getElementById('industry-punctuality')?.value) || 0;
  const presentationSmartness = Number(document.getElementById('industry-presentation-smartness')?.value) || 0;
  const superiorRelationship = Number(document.getElementById('industry-superior-relationship')?.value) || 0;
  const adherencePolicies = Number(document.getElementById('industry-adherence-policies')?.value) || 0;

  const total = enthusiasm + technicalCompetence + punctuality + presentationSmartness + superiorRelationship + adherencePolicies;
  const totalElement = document.getElementById('industry-grading-total');
  if (totalElement) {
    totalElement.textContent = `${total}/30`;
    totalElement.style.color = total > 15 ? 'var(--success)' : total > 10 ? 'var(--warning)' : 'var(--danger)';
  }
}

// Setup listeners for industry grading form
function setupIndustryGradingFormListeners() {
  const industryInputs = [
    'industry-enthusiasm', 'industry-technical-competence', 'industry-punctuality',
    'industry-presentation-smartness', 'industry-superior-relationship', 'industry-adherence-policies'
  ];

  industryInputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', calculateIndustryGradingTotal);
    }
  });
}

// Load industry grading form
async function loadIndustryGradingForm() {
  const select = document.getElementById('industry-grading-student-select');
  const container = document.getElementById('industry-grading-form-container');

  if (!select.value) {
    alert('Please select an intern first');
    return;
  }

  const studentId = select.value;
  const selectedOption = select.options[select.selectedIndex];
  const studentName = selectedOption.text.split('(')[0].trim();

  // Update name immediately
  const nameHeader = document.querySelector('#industry-grading-form-container h4');
  if (nameHeader) nameHeader.textContent = studentName;

  if (container) container.style.display = 'block';

  // Fetch full student details
  try {
    const student = await fetchJson(`${API_URL}/users/${studentId}`);
    if (student) {
      const avatar = document.getElementById('industry-grading-avatar');
      const nameEl = document.getElementById('industry-grading-name');
      const regEl = document.getElementById('industry-grading-reg');
      const placementEl = document.getElementById('industry-grading-placement');
    
      if (avatar) avatar.textContent = student.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
      if (nameEl) nameEl.textContent = student.fullName;
      if (regEl) regEl.textContent = student.registrationNumber || '—';
      if (placementEl) placementEl.textContent = `Placement: ${student.placementCompany || '—'}`;
    }
  } catch (err) {
    console.error('Failed to load student details:', err);
  }

  setupIndustryGradingFormListeners();
}

// Submit industry grading
async function submitIndustryGrading() {
  const studentSelect = document.getElementById('industry-grading-student-select');
  const studentId = studentSelect.value;

  if (!studentId) {
    alert('Please select an intern first.');
    return;
  }

  const data = {
    enthusiasm: Number(document.getElementById('industry-enthusiasm')?.value) || 0,
    technicalCompetence: Number(document.getElementById('industry-technical-competence')?.value) || 0,
    punctuality: Number(document.getElementById('industry-punctuality')?.value) || 0,
    presentationSmartness: Number(document.getElementById('industry-presentation-smartness')?.value) || 0,
    superiorSubordinateRelationship: Number(document.getElementById('industry-superior-relationship')?.value) || 0,
    adherenceToPolicies: Number(document.getElementById('industry-adherence-policies')?.value) || 0,
    industryComments: document.getElementById('industry-grading-comments')?.value || null,
  };

  try {
    const response = await fetch(`${API_URL}/gradings/industry/${studentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || 'Failed to submit grading.');
      return;
    }

    alert('Industry grading submitted successfully!');
    document.getElementById('industry-grading-form-container').style.display = 'none';
    document.getElementById('industry-grading-student-select').value = '';

  } catch (err) {
    alert('Could not connect to server. Make sure the backend is running.');
  }
}

/*====== SCHOOL SUPERVISION SCHEDULING ======*/
// Student data
// const students = [
//   { id: 'AK', name: 'Amina Kibuuka', regNo: '2021/BSC/042', country: 'Uganda', email: 'amina@mak.ac.ug', placement: 'Stanbic Bank Uganda Ltd' },
//   { id: 'JM', name: 'Jonah Mwangi', regNo: '2021/BSC/019', country: 'Uganda', email: 'jonah@mak.ac.ug', placement: 'MTN Uganda HQ' },
//   { id: 'PN', name: 'Patience Nantale', regNo: '2021/BSC/031', country: 'Uganda', email: 'patience@mak.ac.ug', placement: 'Airtel Uganda' },
//   { id: 'INTL1', name: 'John Doe', regNo: '2021/BSC/050', country: 'Kenya', email: 'john@university.ac.ke', placement: 'Safaricom Kenya' },
//   { id: 'INTL2', name: 'Jane Smith', regNo: '2021/BSC/051', country: 'Nigeria', email: 'jane@university.ac.ng', placement: 'MTN Nigeria' },
// ];

// LOAD STUDENTS FROM THE DATABASE DYNAMICALLY
async function loadSupervisionStudents() {
  try {
    const students = await fetchJson(getAssignedStudentsEndpoint());

    const select = document.getElementById('supervision-student-select');
    if (!select) return;

    select.innerHTML = '<option value="">Select Student...</option>';
    students.forEach(student => {
      select.innerHTML += `<option value="${student.id}">${student.fullName} (${student.registrationNumber})</option>`;
    });

  } catch (err) {
    console.error('Failed to load students:', err);
  }
}

// LOAD SUPERVISION FORM
function loadSupervisionForm() {
  const select = document.getElementById('supervision-student-select');
  const container = document.getElementById('supervision-form-container');
  const studentId = select.value;

  if (!studentId) {
    alert('Please select a student first');
    return;
  }

  // Show the form
  if (container) container.style.display = 'block';

  // Update student info from selected option text
  const selectedOption = select.options[select.selectedIndex];
  const studentName = selectedOption.text.split('(')[0].trim();

  const nameHeader = document.querySelector('#supervision-form-container h4');
  if (nameHeader) nameHeader.textContent = studentName;

  // Default to onground for all — zoom only for international
  // For now set mode to onground by default
  const modeSelect = document.getElementById('supervision-mode');
  if (modeSelect) {
    modeSelect.value = 'onground';
    handleModeChange({ target: modeSelect });
  }
}

// Update Student Info
function updateStudentInfo(student) {
  const countrySpan = document.getElementById('student-country');
  const locationInput = document.getElementById('supervision-location');
  const nameHeader = document.querySelector('#supervision-form-container h4');

  if (countrySpan) countrySpan.textContent = student.country;
  if (locationInput) locationInput.value = student.placement;
  if (nameHeader) nameHeader.textContent = student.name;
}

// Check Zoom Availability Based on Country
function checkZoomAvailability(country) {
  const modeSelect = document.getElementById('supervision-mode');
  const zoomOption = document.getElementById('zoom-option');
  const zoomNotice = document.getElementById('zoom-notice');
  const locationLabel = document.getElementById('location-label');
  const locationInput = document.getElementById('supervision-location');
  const zoomLinkGroup = document.getElementById('zoom-link-group');
  const zoomLinkInput = document.getElementById('zoom-link');

  const isInternational = country !== 'Uganda';

  if (zoomOption) zoomOption.style.display = isInternational ? 'block' : 'none';
  if (zoomNotice) zoomNotice.style.display = isInternational ? 'none' : 'block';
  if (locationLabel) locationLabel.textContent = isInternational ? 'Meeting Platform' : 'Supervision Location';
  if (locationInput) locationInput.placeholder = isInternational ? 'e.g. Zoom Meeting Room' : 'e.g. Office 204, School of Computing';
  if (zoomLinkGroup) zoomLinkGroup.style.display = isInternational ? 'block' : 'none';
  if (zoomLinkInput) zoomLinkInput.required = isInternational;

  if (modeSelect) {
    modeSelect.value = isInternational ? 'zoom' : 'onground';
    handleModeChange({ target: modeSelect });
  }
}

// Handle Mode Change
function handleModeChange(e) {
  const select = e.target;
  const mode = select.value;
  const zoomLinkGroup = document.getElementById('zoom-link-group');
  const zoomLinkInput = document.getElementById('zoom-link');
  const locationInput = document.getElementById('supervision-location');

  if (zoomLinkGroup && zoomLinkInput && locationInput) {
    if (mode === 'zoom') {
      zoomLinkGroup.style.display = 'block';
      zoomLinkInput.required = true;
      locationInput.required = false;
    } else {
      zoomLinkGroup.style.display = 'none';
      zoomLinkInput.required = false;
      locationInput.required = true;
    }
  }
}

// Schedule Supervision (Part 1)
async function scheduleSupervision() {
  const dateInput = document.getElementById('supervision-date');
  const timeInput = document.getElementById('supervision-time');
  const modeSelect = document.getElementById('supervision-mode');
  const locationInput = document.getElementById('supervision-location');
  const zoomLinkInput = document.getElementById('zoom-link');
  const durationSelect = document.getElementById('supervision-duration');
  const notesInput = document.getElementById('supervision-notes-before');
  const studentSelect = document.getElementById('supervision-student-select');

  if (!dateInput.value || !timeInput.value) {
    alert('Please select date and time');
    return;
  }

  if (modeSelect.value === 'zoom' && !zoomLinkInput.value) {
    alert('Please provide Zoom link for online supervision');
    return;
  }

  if (modeSelect.value === 'onground' && !locationInput.value) {
    alert('Please provide supervision location');
    return;
  }

  const supervisorId = getUserId();
  const studentId = studentSelect.value;

  if (!supervisorId || !studentId) {
    alert('Session expired or no student selected. Please try again.');
    return;
  }

  try {
    const result = await fetchJson(`${API_URL}/supervisions`, {
      method: 'POST',
      body: JSON.stringify({
        supervisorId: Number(supervisorId),
        studentId: Number(studentId),
        mode: modeSelect.value,
        supervisionDate: dateInput.value,
        supervisionTime: timeInput.value,
        durationMinutes: Number(durationSelect.value),
        location: locationInput.value,
        zoomLink: zoomLinkInput.value || null,
        notesBefore: notesInput ? notesInput.value : null,
      }),
    });

    alert('Supervision scheduled successfully! Student has been notified.');

    // Store the supervision id for assessment submission
    sessionStorage.setItem('currentSupervisionId', String(result.id));
    localStorage.setItem('currentSupervisionId', String(result.id));

    // Auto fill assessment date
    const actualDateInput = document.getElementById('assessment-actual-date');
    if (actualDateInput) {
      actualDateInput.value = dateInput.value + ' at ' + timeInput.value;
    }

  } catch (err) {
    alert('Could not connect to server. Make sure the backend is running.');
  }
}

// Submit Assessment (Part 2)
async function submitAssessment() {
  const statusSelect = document.getElementById('assessment-status');
  const performanceSelect = document.getElementById('assessment-performance');
  const technicalInput = document.getElementById('assessment-technical');
  const professionalismInput = document.getElementById('assessment-professionalism');
  const improvementInput = document.getElementById('assessment-improvement');
  const finalCommentsInput = document.getElementById('assessment-final-comments');
  const actualDateInput = document.getElementById('assessment-actual-date');

  if (statusSelect.value !== 'completed') {
    alert('Please mark supervision as completed before submitting assessment');
    return;
  }

  if (!technicalInput.value || !professionalismInput.value || !finalCommentsInput.value) {
    alert('Please fill in all assessment fields');
    return;
  }

  const supervisionId = sessionStorage.getItem('currentSupervisionId') || localStorage.getItem('currentSupervisionId');
  if (!supervisionId) {
    alert('No supervision session found. Please schedule first.');
    return;
  }

  try {
    await fetchJson(`${API_URL}/supervisions/${supervisionId}/assessment`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: statusSelect.value,
        actualDateTime: actualDateInput.value,
        performanceRating: performanceSelect.value,
        technicalSkills: technicalInput.value,
        professionalism: professionalismInput.value,
        areasOfImprovement: improvementInput.value,
        finalComments: finalCommentsInput.value,
      }),
    });

    alert('Assessment submitted successfully!');

    // Reset form
    document.getElementById('supervision-form-container').style.display = 'none';
    document.getElementById('supervision-student-select').value = '';
    sessionStorage.removeItem('currentSupervisionId');

  } catch (err) {
    alert('Could not connect to server. Make sure the backend is running.');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
  console.log('Supervision tab initialized');
});

/* ======== STUDENTS REPORTS ========*/
// Report Submission State
let isReportSubmitted = false;
let selectedFile = null;

// Validate File Selection
function validateFile(input) {
  const file = input.files[0];
  const fileNameDisplay = document.getElementById('file-name');
  const confirmBtn = document.getElementById('btn-confirm-upload');

  if (file) {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      input.value = '';
      fileNameDisplay.textContent = '';
      confirmBtn.disabled = true;
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert('File size must be less than 10MB.');
      input.value = '';
      fileNameDisplay.textContent = '';
      confirmBtn.disabled = true;
      return;
    }

    selectedFile = file;
    fileNameDisplay.textContent = `Selected: ${file.name}`;
    confirmBtn.disabled = false;
  } else {
    fileNameDisplay.textContent = '';
    confirmBtn.disabled = true;
  }
}

// Open Confirmation Modal
function openReportModal() {
  if (!selectedFile) return;
  document.getElementById('report-modal').style.display = 'flex';
  document.getElementById('confirm-checkbox').checked = false;
  document.getElementById('btn-submit-report').disabled = true;
}

// Close Confirmation Modal
function closeReportModal() {
  document.getElementById('report-modal').style.display = 'none';
}

// Handle Checkbox Change
document.getElementById('confirm-checkbox')?.addEventListener('change', function () {
  document.getElementById('btn-submit-report').disabled = !this.checked;
});

// Submit Report
async function submitReport() {
  const submitBtn = document.getElementById('btn-submit-report');
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
  submitBtn.disabled = true;

  const userId = getUserId();
  if (!userId) {
    alert('Session expired. Please log in again.');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('file', selectedFile);

    const result = await fetchJson(`${API_URL}/reports/upload?studentId=${userId}`, {
      method: 'POST',
      body: formData,
    });

    // Hide upload section show success
    document.getElementById('upload-section').style.display = 'none';
    document.getElementById('success-section').style.display = 'block';
    document.getElementById('report-status-badge').className = 'tag approved';
    document.getElementById('report-status-badge').textContent = 'Submitted';

    // Set submission date
    const now = new Date();
    document.getElementById('submission-date').textContent = now.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    closeReportModal();

    document.getElementById('report-file').value = '';
    document.getElementById('file-name').textContent = '';
    document.getElementById('btn-confirm-upload').disabled = true;

    isReportSubmitted = true;
    selectedFile = null;

    alert('Report submitted successfully!');

  } catch (err) {
    alert('Could not connect to server. Make sure the backend is running.');
  } finally {
    submitBtn.innerHTML = 'Submit Report';
    submitBtn.disabled = false;
  }
}

// CHECK WHETHER STUDENT ALREADY SUBMITTED REPORT
async function loadStudentReport(studentId) {
  try {
    const response = await fetch(`${API_URL}/reports/student/${studentId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    // Handle empty body or 404 gracefully without throwing
    if (response.status === 404 || response.status === 204) {
      return; // No report yet — leave upload section visible
    }

    const text = await response.text();
    if (!text || text.trim() === '') return; // Empty body — no report yet

    const report = JSON.parse(text);

    if (report && report.id) {
      document.getElementById('upload-section').style.display = 'none';
      document.getElementById('success-section').style.display = 'block';
      document.getElementById('report-status-badge').className = 'tag approved';
      document.getElementById('report-status-badge').textContent = 'Submitted';

      const date = new Date(report.submittedAt);
      document.getElementById('submission-date').textContent = date.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
      });

      isReportSubmitted = true;
    } else {
      // No report — make sure upload section is visible
      document.getElementById('upload-section').style.display = 'block';
      document.getElementById('success-section').style.display = 'none';
      document.getElementById('report-status-badge').className = 'tag pending';
      document.getElementById('report-status-badge').textContent = 'Not Submitted';
      isReportSubmitted = false;
    }
  } catch (err) {
    console.error('Failed to load report status:', err);
    // Ensure upload section shows on error
    document.getElementById('upload-section').style.display = 'block';
    document.getElementById('success-section').style.display = 'none';
    // Silently ignore — student just hasn't submitted a report yet
    console.warn('Report not yet submitted for student:', studentId);
  }
}
// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
  if (isReportSubmitted) {
    document.getElementById('upload-section').style.display = 'none';
    document.getElementById('success-section').style.display = 'block';
    document.getElementById('report-status-badge').className = 'tag approved';
    document.getElementById('report-status-badge').textContent = 'Submitted';
  }
});

window.addEventListener('popstate', function (e) {
  if (e.state && e.state.prefix && e.state.tabName) {
    switchTab(e.state.prefix, e.state.tabName, null);
  }
});

window.addEventListener("load", function () {
  // restore theme
  const savedTheme = localStorage.getItem("savedTheme");
  if (savedTheme) {
    const themeOption = document.querySelector(`.theme-option[onclick*="'${savedTheme}'"]`);
    setTheme(savedTheme, themeOption || null);
  }

  // read auth from session storage
  const loggedIn = sessionStorage.getItem("isLoggedIn");
  const page = sessionStorage.getItem("activePage");
  const activeTab = localStorage.getItem("activeTab");
  const activeTabPrefix = localStorage.getItem("activeTabPrefix");

  // Only restore session if truly logged in AND page is a real dashboard
  if (loggedIn === "true" && page && page !== "page-login") {
    showPage(page);
    loadUserDashboard();
    if (activeTab && activeTabPrefix) {
      const navItem = document.querySelector(
        `#sidebar-${activeTabPrefix} .nav-item[onclick*="'${activeTab}'"]`
      );
      switchTab(activeTabPrefix, activeTab, navItem || null);
    }
  } else {
    showPage("page-login");
  }
});

/* ======== INDUSTRY SUPERVISOR - LINK & MANAGE INTERNS ========*/

// Load industry supervisor interns
async function loadIndustryInterns() {
  try {
    const response = await fetch(`${API_URL}/users/industry-supervisor/my-interns`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!response.ok) {
      console.error('Failed to load interns:', response.statusText);
      return;
    }

    const interns = await response.json();
    const grid = document.getElementById('industry-interns-grid');
    const emptyState = document.getElementById('industry-interns-empty');

    if (!grid) return;

    if (!interns || interns.length === 0) {
      grid.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    grid.innerHTML = interns.map(student => {
      const initials = (student.fullName || 'S').split(' ').map(n => n[0]).join('').toUpperCase();
      const safeName = (student.fullName || '').replace(/'/g, "\\'");
      const safeReg = (student.registrationNumber || '').replace(/'/g, "\\'");
      const safeCourse = (student.course || '').replace(/'/g, "\\'");
      const safePlacement = (student.placementCompany || '').replace(/'/g, "\\'");
      const safeEmail = (student.email || '').replace(/'/g, "\\'");

      return `
        <div class="student-card" onclick="openStudentProfile(${student.id}, '${safeName}', '${safeReg}', '${safeCourse}', '${safePlacement}', '${safeEmail}')">
          <div class="student-card-top">
            <div class="avatar avatar-lg">${initials}</div>
            <div class="student-card-info">
              <h4>${student.fullName}</h4>
              <p>${student.registrationNumber || '—'} · ${student.course || '—'}</p>
            </div>
          </div>
          <div class="student-card-meta">
            <span><i class="fas fa-building" style="margin-right:4px"></i>${student.placementCompany || 'Not Placed'}</span>
            <span><span class="approved-dot"></span>Active</span>
          </div>
          <div style="font-size:.8rem;color:var(--text2);margin-bottom:6px">View Details</div>
          <button class="btn btn-outline btn-sm" style="width:100%;margin-top:6px">
            <i class="fas fa-arrow-right"></i> Open Profile
          </button>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Failed to load industry interns:', err);
  }
}

// Link students by registration number
async function linkIndustryStudents() {
  const input = document.getElementById('industry-link-reg-numbers');
  const messageDiv = document.getElementById('industry-link-message');
  
  if (!input || !input.value.trim()) {
    messageDiv.textContent = 'Please enter at least one registration number';
    messageDiv.className = '';
    messageDiv.style.display = 'block';
    messageDiv.style.backgroundColor = 'rgba(239,68,68,0.1)';
    messageDiv.style.color = 'var(--red)';
    return;
  }

  const regNumbers = input.value
    .split(',')
    .map(reg => reg.trim())
    .filter(reg => reg.length > 0);

  if (regNumbers.length === 0) {
    messageDiv.textContent = 'Please enter valid registration numbers';
    messageDiv.style.display = 'block';
    messageDiv.style.backgroundColor = 'rgba(239,68,68,0.1)';
    messageDiv.style.color = 'var(--red)';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/users/industry-supervisor/link-students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ registrationNumbers: regNumbers })
    });

    const result = await response.json();

    if (!response.ok) {
      messageDiv.textContent = result.message || 'Failed to link students';
      messageDiv.style.display = 'block';
      messageDiv.style.backgroundColor = 'rgba(239,68,68,0.1)';
      messageDiv.style.color = 'var(--red)';
      return;
    }

    // Build message showing results
    let message = '';
    if (result.linked && result.linked.length > 0) {
      message += `✓ Successfully linked ${result.linked.length} student(s)`;
    }
    if (result.failed && result.failed.length > 0) {
      if (message) message += ' | ';
      message += `✗ ${result.failed.length} issue(s): ${result.failed.join(', ')}`;
    }

    messageDiv.textContent = message || 'Students linked successfully';
    messageDiv.style.display = 'block';
    messageDiv.style.backgroundColor = result.linked && result.linked.length > 0 
      ? 'rgba(34,197,94,0.1)' 
      : 'rgba(239,68,68,0.1)';
    messageDiv.style.color = result.linked && result.linked.length > 0 
      ? 'var(--green)' 
      : 'var(--red)';

    // Clear input
    input.value = '';

    // Refresh the interns list
    setTimeout(() => {
      loadIndustryInterns();
      loadIndustryCards(); // Update dashboard cards
    }, 500);

  } catch (err) {
    console.error('Failed to link students:', err);
    messageDiv.textContent = 'Could not connect to server. Make sure the backend is running.';
    messageDiv.style.display = 'block';
    messageDiv.style.backgroundColor = 'rgba(239,68,68,0.1)';
    messageDiv.style.color = 'var(--red)';
  }
}

// ===== Industry Supervisor Grading UI =====
async function loadIndustryGradingStudents() {
  try {
    const response = await fetch(`${API_URL}/industry-supervisor/grading/students`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const students = await response.json();
    const select = document.getElementById('industry-grading-student-select');
    const loadBtn = document.querySelector('#industry-tab-grading .section-head button');
    if (!select) return;
    select.innerHTML = '<option value="">Select Intern...</option>';
    if (!Array.isArray(students) || students.length === 0) {
      select.disabled = true;
      if (loadBtn) loadBtn.disabled = true;
      select.innerHTML = '<option value="">No assigned students available for grading</option>';
      return;
    }
    select.disabled = false;
    if (loadBtn) loadBtn.disabled = false;
    students.forEach(s => {
      select.innerHTML += `<option value="${s.id}">${s.fullName} (${s.registrationNumber || '—'}) — ${s.internshipOrganization || ''}</option>`;
    });
  } catch (err) {
    console.error('Failed to load industry grading students:', err);
  }
}

function loadIndustryGradingForm() {
  const select = document.getElementById('industry-grading-student-select');
  const container = document.getElementById('industry-grading-form-container');
  if (!select || !select.value) {
    alert('Please select an intern to grade.');
    return;
  }
  const text = select.options[select.selectedIndex].text;
  const name = text.split('(')[0].trim();
  const headerName = document.querySelector('#industry-grading-form-container h4');
  if (headerName) headerName.textContent = name;
  // Show container
  if (container) container.style.display = 'block';
  // Reset inputs
  ['industry-enthusiasm','industry-technical-competence','industry-punctuality','industry-presentation-smartness','industry-superior-relationship','industry-adherence-policies'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('industry-grading-total').textContent = '0/30';
  // Wire listeners for auto-calculation
  ['industry-enthusiasm','industry-technical-competence','industry-punctuality','industry-presentation-smartness','industry-superior-relationship','industry-adherence-policies'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.oninput = calculateIndustryGradingTotal;
  });
}

function calculateIndustryGradingTotal() {
  const enthusiasm = Number(document.getElementById('industry-enthusiasm')?.value) || 0;
  const technical = Number(document.getElementById('industry-technical-competence')?.value) || 0;
  const punctuality = Number(document.getElementById('industry-punctuality')?.value) || 0;
  const presentation = Number(document.getElementById('industry-presentation-smartness')?.value) || 0;
  const superior = Number(document.getElementById('industry-superior-relationship')?.value) || 0;
  const adherence = Number(document.getElementById('industry-adherence-policies')?.value) || 0;
  const total = enthusiasm + technical + punctuality + presentation + superior + adherence;
  const el = document.getElementById('industry-grading-total');
  if (el) {
    el.textContent = `${total}/30`;
    el.style.color = total > 20 ? 'var(--success)' : total > 10 ? 'var(--warning)' : 'var(--danger)';
  }
}

async function submitIndustryGrading() {
  const select = document.getElementById('industry-grading-student-select');
  if (!select || !select.value) {
    alert('Please select an intern first.');
    return;
  }
  const studentId = Number(select.value);
  const payload = {
    enthusiasm: Number(document.getElementById('industry-enthusiasm')?.value) || 0,
    technicalCompetence: Number(document.getElementById('industry-technical-competence')?.value) || 0,
    punctuality: Number(document.getElementById('industry-punctuality')?.value) || 0,
    presentationSmartness: Number(document.getElementById('industry-presentation-smartness')?.value) || 0,
    superiorSubordinateRelationship: Number(document.getElementById('industry-superior-relationship')?.value) || 0,
    adherenceToPolicies: Number(document.getElementById('industry-adherence-policies')?.value) || 0,
    industryComments: document.getElementById('industry-grading-comments')?.value || null,
  };

  try {
    const res = await fetch(`${API_URL}/industry-supervisor/grading/${studentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) {
      alert(result.message || 'Failed to submit grading');
      return;
    }

    alert('Grading saved successfully');
    // Refresh UI: industry cards, school students/grading, and clear form
    if (document.getElementById('industry-grading-form-container')) document.getElementById('industry-grading-form-container').style.display = 'none';
    if (document.getElementById('industry-grading-student-select')) document.getElementById('industry-grading-student-select').value = '';
    // Refresh cards and school/student sections
    loadIndustryCards();
    loadSchoolStudents();
    // try refreshing student cards if visible
    loadStudentCards(studentId).catch(()=>{});

  } catch (err) {
    alert('Could not connect to server.');
  }
}
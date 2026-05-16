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
    return `${API_URL}/users/students/assigned/industry/${userId}`;
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
    goToLogin();

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
  if (page) { page.style.display = 'flex'; setTimeout(() => page.classList.add('active'), 10); }
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

// function goToLogin() {
//   sessionStorage.removeItem('isLoggedIn');
//   sessionStorage.removeItem('activePage');
//   localStorage.removeItem('userRole');
//   sessionStorage.removeItem('token');
//   sessionStorage.removeItem('userName');
//   sessionStorage.removeItem('userId');
//   localStorage.removeItem('activeTab');
//   localStorage.removeItem('activeTabPrefix');
//   localStorage.removeItem('token');
//   localStorage.removeItem('userName');
//   localStorage.removeItem('userId');
//   showPage('page-login');
// }
function goToLogin() {
  // Clear all session and local storage
  sessionStorage.removeItem('isLoggedIn');
  sessionStorage.removeItem('activePage');
  sessionStorage.removeItem('userRole');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('userName');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('currentSupervisionId');
  localStorage.removeItem('activeTab');
  localStorage.removeItem('activeTabPrefix');
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');

  // Clear login form fields
  const loginId = document.getElementById('login-id');
  const loginPw = document.getElementById('login-pw');
  if (loginId) loginId.value = '';
  if (loginPw) loginPw.value = '';

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
      alert(result.message || 'Invalid credentials. Please try again.');
      return;
    }

    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('token', result.token);
    sessionStorage.setItem('userRole', result.role);
    sessionStorage.setItem('userName', result.name);
    sessionStorage.setItem('userId', String(result.id));

    localStorage.setItem('token', result.token);
    localStorage.setItem('userName', result.name);
    localStorage.setItem('userId', String(result.id));
    localStorage.setItem('userRole', result.role);

    const pages = {
      student: 'page-student',
      'school-supervisor': 'page-school-supervisor',
      'industry-supervisor': 'page-industry-supervisor',
      admin: 'page-admin',
    };

    const page = pages[result.role] || 'page-student';
    sessionStorage.setItem('activePage', page);

    localStorage.setItem('activeTab', 'dashboard');
    const roleToPrefix = {
      student: 'student',
      'school-supervisor': 'school',
      'industry-supervisor': 'industry',
      admin: 'admin',
    };
    localStorage.setItem('activeTabPrefix', roleToPrefix[result.role] || 'student');

    loadUserDashboard();
    showPage(page);
  } catch (err) {
    alert('Could not connect to server. Make sure the backend is running.');
  } finally {
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Sign In</span>';
    btn.disabled = false;
  }
}

// WIRE USER DASHBOARDS WITH REAL DATA

function loadUserDashboard() {
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
    }, 5000);
  }

  // Update admin dashboard
  if (userRole === 'admin') {
    const greeting = document.querySelector('#admin-tab-dashboard .welcome-banner h3');
    if (greeting) greeting.textContent = `Welcome, ${firstName}! 🛡️`;

    const sidebarName = document.querySelector('#sidebar-admin .sidebar-user-name');
    const sidebarRole = document.querySelector('#sidebar-admin .sidebar-user-role');
    if (sidebarName) sidebarName.textContent = userName;
    if (sidebarRole) sidebarRole.textContent = 'System Administrator';

    loadAdminDashboardData();
  }
}

// WIRE INDUSTRY SUPERVISOR APPROVAL
async function loadPendingLogs() {
  try {
    const myId = getUserId();
    const endpoint = myId ? `${API_URL}/logs/pending/${myId}` : `${API_URL}/logs/pending`;
    const response = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const logs = await response.json();

    // Update pending count card
    const cards = document.querySelectorAll('#industry-tab-dashboard .card-val');
    if (cards[0]) cards[0].textContent = logs.length;

    // Update sidebar badge
    const badge = document.querySelector('#sidebar-industry .nav-item:nth-child(2) .badge');
    if (badge) badge.textContent = logs.length;

    // Update request list in dashboard
    const requestList = document.querySelector('#industry-tab-dashboard .request-list');
    if (requestList && logs.length > 0) {
      requestList.innerHTML = logs.map(log => `
        <div class="request-card">
          <div class="avatar">S${log.studentId}</div>
          <div class="request-card-body">
            <h4>${log.taskName}</h4>
            <p>Student ID: ${log.studentId}</p>
            <div class="request-card-meta">
              <span class="tag ${log.workType === 'Onsite' ? 'onsite' : 'offsite'}">${log.workType}</span>
              &nbsp; ${log.estimatedHours} hours &nbsp; · &nbsp;
              ${new Date(log.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
            <span class="tag pending">Pending</span>
            <div style="display:flex;gap:6px">
              <button class="btn btn-primary btn-sm" onclick="approveLog(${log.id}, 'approved')">
                <i class="fas fa-check"></i> Approve
              </button>
              <button class="btn btn-outline btn-sm" style="border-color:var(--danger);color:var(--danger)" onclick="approveLog(${log.id}, 'rejected')">
                <i class="fas fa-times"></i> Reject
              </button>
            </div>
          </div>
        </div>
      `).join('');
    } else if (requestList) {
      requestList.innerHTML = '<p style="padding:20px;color:var(--text2)">No pending approvals.</p>';
    }

    // Also update the requests tab
    const requestsTab = document.querySelector('#industry-tab-requests .request-list');
    if (requestsTab) requestsTab.innerHTML = requestList ? requestList.innerHTML : '';

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
async function approveLog(logId, status) {
  const comment = status === 'rejected'
    ? prompt('Enter reason for rejection (optional):')
    : null;

  const supervisorId = getUserId();

  try {
    const response = await fetch(`${API_URL}/logs/${logId}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        status,
        supervisorComment: comment,
        approvedBy: Number(supervisorId),
      }),
    });

    if (!response.ok) {
      alert('Failed to update log status.');
      return;
    }

    // Show toast
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--success);color:#fff;padding:12px 24px;border-radius:10px;font-weight:600;z-index:9999';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> Log ${status} successfully!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);

    // Refresh pending logs
    loadPendingLogs();

  } catch (err) {
    alert('Could not connect to server.');
  }
}

// Wire Student logs
async function loadStudentLogs(studentId) {
  try {
    const response = await fetch(`${API_URL}/logs/student/${studentId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const logs = await response.json();

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

  } catch (err) {
    console.error('Failed to load logs:', err);
  }
}

function openLogDetail(id, taskName, workType, hours, status, description, skills, lat, lng, date) {
  const modal = document.getElementById('log-detail-modal');

  // Update task type tag
  const typeTag = modal.querySelector('.tag.onsite, .tag.offsite');
  if (typeTag) {
    typeTag.className = `tag ${workType === 'Onsite' ? 'onsite' : 'offsite'}`;
    typeTag.textContent = workType;
  }

  // Update GPS badge
  const gpsBadge = modal.querySelector('.gps-badge');
  if (gpsBadge) {
    gpsBadge.innerHTML = lat
      ? `<i class="fas fa-check"></i> GPS Verified · ${lat}°N, ${lng}°E`
      : `<i class="fas fa-times"></i> No GPS`;
  }

  // Update task name
  const taskTitle = modal.querySelector('h4');
  if (taskTitle) taskTitle.textContent = taskName;

  // Update date and hours
  const metaDiv = modal.querySelector('.modal h4 + div, h4 ~ div');
  const allDivs = modal.querySelectorAll('div');
  allDivs.forEach(d => {
    if (d.textContent.includes('hours') && d.style.fontSize === '.82rem') {
      d.textContent = `${date} · ${hours} hours`;
    }
  });

  // Update description
  const descDiv = modal.querySelector('.form-group div[style*="line-height"]');
  if (descDiv) descDiv.textContent = description || 'No description provided.';

  // Update skills
  const skillDivs = modal.querySelectorAll('.form-group div');
  skillDivs.forEach(d => {
    if (d.previousElementSibling && d.previousElementSibling.textContent === 'Skills Applied') {
      d.textContent = skills || 'Not specified';
    }
  });

  // Update status
  const statusTag = modal.querySelector('.form-group .tag.approved, .form-group .tag.pending, .form-group .tag.rejected');
  if (statusTag) {
    statusTag.className = `tag ${status}`;
    statusTag.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  }

  openModal('log-detail-modal');
}

// WIRING STUDENTS CARD

async function loadStudentCards(studentId) {
  try {
    const [logsRes, settingsRes] = await Promise.all([
      fetch(`${API_URL}/logs/student/${studentId}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }),
      fetch(`${API_URL}/settings`)
    ]);

    const logs = await logsRes.json();
    const settings = await settingsRes.json();

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
    const [pendingRes, allLogsRes, assignedStudentsRes] = await Promise.all([
      fetch(myId ? `${API_URL}/logs/pending/${myId}` : `${API_URL}/logs/pending`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }),
      fetch(`${API_URL}/logs`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }),
      fetch(getAssignedStudentsEndpoint(), {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
    ]);

    const pendingLogs = await pendingRes.json();
    const allLogsRaw = await allLogsRes.json();
    const assignedStudents = await assignedStudentsRes.json();
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
    const bannerText = document.querySelector('#industry-tab-dashboard .welcome-banner p');
    if (bannerText) {
      bannerText.innerHTML = `You have <strong>${pending} tasks pending your approval</strong> from student interns.`;
    }

  } catch (err) {
    console.error('Failed to load industry cards:', err);
  }
}

// WIRE SCHOOL-SUP CARDS
async function loadSchoolCards() {
  try {
    const [allLogsRes, reportsRes, studentsRes] = await Promise.all([
      fetch(`${API_URL}/logs`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }),
      fetch(`${API_URL}/reports`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }),
      fetch(getAssignedStudentsEndpoint(), {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
    ]);

    const allLogs = await allLogsRes.json();
    const allReports = await reportsRes.json();
    const students = await studentsRes.json();

    // Card 0 — all registered students (until assignment is introduced)
    const totalStudents = students.length;

    // Card 1 — total logs reviewed (approved or rejected)
    const totalReviewed = allLogs.filter(l => l.status !== 'pending').length;

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

  } catch (err) {
    console.error('Failed to load school cards:', err);
  }
}

async function loadSchoolStudents() {
  try {
    const response = await fetch(getAssignedStudentsEndpoint(), {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const students = await response.json();
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
    const logsResponse = await fetch(`${API_URL}/logs`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const allLogs = await logsResponse.json();

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
    const [countsRes, studentsRes, supervisorsRes] = await Promise.all([
      fetch(`${API_URL}/users/counts`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
      fetch(`${API_URL}/users/students`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
      fetch(`${API_URL}/users/supervisors`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
    ]);

    const counts = await countsRes.json();
    const students = await studentsRes.json();
    const supervisors = await supervisorsRes.json();
    const progressMap = await getStudentProgressMap();

    // Admin dashboard cards
    const adminCards = document.querySelectorAll('#admin-tab-dashboard .card-val');
    const notStarted = students.filter(s => !progressMap.has(Number(s.id))).length;
    if (adminCards[0]) adminCards[0].textContent = String(counts.students || students.length);
    if (adminCards[1]) adminCards[1].textContent = String(notStarted);
    if (adminCards[2]) adminCards[2].textContent = String(counts.supervisors || 0);

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

    // Admin students tab heading + table
    const studentsTitle = document.querySelector('#admin-tab-students .section-head h3');
    if (studentsTitle) studentsTitle.textContent = `Students (${students.length})`;

    const studentsTbody = document.querySelector('#admin-tab-students .table-wrap tbody');
    if (studentsTbody) {
      // First load supervisors for dropdown
      const supervisorsRes = await fetch(`${API_URL}/users/role/school-supervisor`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const schoolSupervisors = await supervisorsRes.json();

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
    const schoolSvTab = document.querySelector('.tab-btn[onclick*="sv\',\'school"]');
    const industrySvTab = document.querySelector('.tab-btn[onclick*="sv\',\'industry"]');
    if (schoolSvTab) schoolSvTab.textContent = `School Supervisors (${supervisors.school?.length || 0})`;
    if (industrySvTab) industrySvTab.textContent = `Industry Supervisors (${supervisors.industry?.length || 0})`;
  } catch (err) {
    console.error('Failed to load admin dashboard data:', err);
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

function toggleSchoolChat() {
  document.getElementById('school-chat-box').classList.toggle('open');
}

function schoolChatEnter(e) {
  if (e.key === 'Enter') sendSchoolChat();
}

async function sendSchoolChat() {
  const input = document.getElementById('school-chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  const myId = getUserId();
  const chatMessages = document.getElementById('school-chat-messages');
  const partnerId = chatMessages?.dataset.partnerId;

  if (!partnerId) {
    alert('Please select a student first from My Students tab.');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        senderId: Number(myId),
        receiverId: Number(partnerId),
        content: msg,
      }),
    });

    if (!response.ok) return;

    const div = document.createElement('div');
    div.className = 'msg out';
    div.innerHTML = `${msg}<div class="msg-time">Just now</div>`;
    chatMessages.appendChild(div);
    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

  } catch (err) {
    console.error('Failed to send message:', err);
  }
}

// LOAD 2 WAY CONVERSATION 
// Load conversation between two users
async function loadConversation(otherUserId, otherUserName) {
  const myId = getUserId();

  try {
    const response = await fetch(
      `${API_URL}/messages/conversation/${myId}/${otherUserId}`,
      { headers: { 'Authorization': `Bearer ${getToken()}` } }
    );

    const messages = await response.json();

    // Mark messages as read
    await fetch(`${API_URL}/messages/read/${otherUserId}/${myId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    // Find the chat messages container
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;

    // Update chat header
    const chatHead = document.querySelector('.chat-head-info h4');
    if (chatHead) chatHead.textContent = otherUserName;

    // Store current chat partner id for sending
    chatMessages.dataset.partnerId = otherUserId;
    chatMessages.dataset.partnerName = otherUserName;

    if (messages.length === 0) {
      chatMessages.innerHTML = `
        <div class="msg in">
          Start your conversation with ${otherUserName}
          <div class="msg-time">Now</div>
        </div>`;
      return;
    }

    chatMessages.innerHTML = messages.map(msg => `
      <div class="msg ${Number(msg.senderId) === Number(myId) ? 'out' : 'in'}">
        ${msg.content}
        <div class="msg-time">
          ${new Date(msg.sentAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    `).join('');

    chatMessages.scrollTop = chatMessages.scrollHeight;

  } catch (err) {
    console.error('Failed to load conversation:', err);
  }
}

// Send a real message
async function sendChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  const myId = getUserId();
  const chatMessages = document.querySelector('.chat-messages');
  const partnerId = chatMessages?.dataset.partnerId;

  if (!partnerId) {
    // Fallback to old mock behavior if no partner selected
    const msgs = document.querySelector('.chat-messages');
    const div = document.createElement('div');
    div.className = 'msg out';
    div.innerHTML = msg + '<div class="msg-time">Just now</div>';
    msgs.appendChild(div);
    input.value = '';
    msgs.scrollTop = msgs.scrollHeight;
    return;
  }

  try {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        senderId: Number(myId),
        receiverId: Number(partnerId),
        content: msg,
      }),
    });

    if (!response.ok) return;

    // Add message to UI immediately
    const div = document.createElement('div');
    div.className = 'msg out';
    div.innerHTML = `${msg}<div class="msg-time">Just now</div>`;
    chatMessages.appendChild(div);
    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

  } catch (err) {
    console.error('Failed to send message:', err);
  }
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
    sendMsgBtn.onclick = async () => {
      closeModal('student-profile-modal');

      const chatMessages = document.getElementById('school-chat-messages');
      const chatHead = document.querySelector('#school-chat-box .chat-head-info h4');

      if (chatMessages) chatMessages.dataset.partnerId = studentId;
      if (chatHead) chatHead.textContent = fullName;

      await loadSchoolConversation(studentId, fullName);
      toggleSchoolChat();
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
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const user = await response.json();
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
    const response = await fetch(`${API_URL}/reports/student/${studentId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const report = await response.json();

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

async function loadSchoolConversation(otherUserId, otherUserName) {
  const myId = getUserId();
  const chatMessages = document.getElementById('school-chat-messages');
  if (!chatMessages) return;

  try {
    const response = await fetch(
      `${API_URL}/messages/conversation/${myId}/${otherUserId}`,
      { headers: { 'Authorization': `Bearer ${getToken()}` } }
    );

    const messages = await response.json();

    // Mark as read
    await fetch(`${API_URL}/messages/read/${otherUserId}/${myId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (messages.length === 0) {
      chatMessages.innerHTML = `
        <div class="msg in">
          Start your conversation with ${otherUserName}
          <div class="msg-time">Now</div>
        </div>`;
      return;
    }

    chatMessages.innerHTML = messages.map(msg => `
      <div class="msg ${Number(msg.senderId) === Number(myId) ? 'out' : 'in'}">
        ${msg.content}
        <div class="msg-time">
          ${new Date(msg.sentAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    `).join('');

    chatMessages.scrollTop = chatMessages.scrollHeight;

  } catch (err) {
    console.error('Failed to load conversation:', err);
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

/* ===== CHAT ===== */
function toggleChat() { document.getElementById('chat-box').classList.toggle('open'); }
function sendChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  const msgs = document.querySelector('.chat-messages');
  const div = document.createElement('div');
  div.className = 'msg out';
  div.innerHTML = msg + '<div class="msg-time">Just now</div>';
  msgs.appendChild(div);
  input.value = '';
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(() => {
    const reply = document.createElement('div');
    reply.className = 'msg in';
    reply.innerHTML = "Thanks for the update! Keep logging your daily activities. 👍 <div class='msg-time'>Just now</div>";
    msgs.appendChild(reply);
    msgs.scrollTop = msgs.scrollHeight;
  }, 1200);
}
function chatEnter(e) { if (e.key === 'Enter') sendChat(); }

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

    const response = await fetch(`${API_URL}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        studentId: Number(userId),
        taskName,
        workType,
        description,
        skillsApplied,
        estimatedHours: Number(estimatedHours),
        gpsLatitude,
        gpsLongitude,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || 'Failed to submit log.');
      return;
    }

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
    const response = await fetch(getAssignedStudentsEndpoint(), {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const students = await response.json();

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
    const response = await fetch(`${API_URL}/gradings`, {
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

  // Update student name in form header
  const selectedOption = select.options[select.selectedIndex];
  const studentName = selectedOption.text.split('(')[0].trim();
  const nameHeader = document.querySelector('#industry-grading-form-container h4');
  if (nameHeader) nameHeader.textContent = studentName;

  if (container) container.style.display = 'block';

  // Setup industry grading listeners
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
    const response = await fetch(getAssignedStudentsEndpoint(), {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const students = await response.json();

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
    const response = await fetch(`${API_URL}/supervisions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
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

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || 'Failed to schedule supervision.');
      return;
    }

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
    const response = await fetch(`${API_URL}/supervisions/${supervisionId}/assessment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
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

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || 'Failed to submit assessment.');
      return;
    }

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

    const response = await fetch(`${API_URL}/reports/upload?studentId=${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || 'Failed to upload report.');
      return;
    }

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

    const report = await response.json();

    if (report && report.id) {
      // Already submitted — show success section
      document.getElementById('upload-section').style.display = 'none';
      document.getElementById('success-section').style.display = 'block';
      document.getElementById('report-status-badge').className = 'tag approved';
      document.getElementById('report-status-badge').textContent = 'Submitted';

      const date = new Date(report.submittedAt);
      document.getElementById('submission-date').textContent = date.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
      });

      isReportSubmitted = true;
    }

  } catch (err) {
    console.error('Failed to load report status:', err);
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
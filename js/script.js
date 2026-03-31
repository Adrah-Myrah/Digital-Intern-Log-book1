const API_URL = 'http://localhost:3000/api';

function getToken() {
  return sessionStorage.getItem('token') || localStorage.getItem('token');
}

function getUserId() {
  return sessionStorage.getItem('userId') || localStorage.getItem('userId');
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

  let data = { role, password };

  if (role === 'student') {
    data = {
      ...data,
      fullName: document.getElementById('reg-fullname').value,
      registrationNumber: document.getElementById('reg-regnumber').value,
      yearOfStudy: document.getElementById('reg-year').value,
      internshipAttempt: document.getElementById('reg-attempt').value,
      course: document.getElementById('reg-course').value,
      placementCompany: document.getElementById('reg-placement').value,
      country: document.getElementById('reg-country').value,
      email: document.getElementById('reg-email').value,
    };
  } else {
    data = {
      ...data,
      fullName: document.getElementById('reg-sup-fullname').value,
      staffId: document.getElementById('reg-staffid').value,
      email: document.getElementById('reg-sup-email').value,
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
let currentLoginRole = 'student';

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

  // Reset login tab to student
  currentLoginRole = 'student';
  document.querySelectorAll('#page-login .auth-tab').forEach(t => t.classList.remove('active'));
  const firstTab = document.querySelector('#page-login .auth-tab');
  if (firstTab) firstTab.classList.add('active');

  showPage('page-login');
}

// function setLoginRole(role, el) {
//   currentLoginRole = role;
//   document.querySelectorAll('#page-login .auth-tab').forEach(t => t.classList.remove('active'));
//   el.classList.add('active');
//   const labels = { student: 'Registration Number', school: 'Staff ID', industry: 'Staff ID', admin: 'Admin ID' };
//   const placeholders = { student: 'e.g. 2021/BSC/001', school: 'e.g. STAFF-014', industry: 'e.g. STAFF-042', admin: 'e.g. ADMIN-001' };
//   document.getElementById('login-id-label').textContent = labels[role];
//   document.getElementById('login-id').placeholder = placeholders[role];
// }

function setLoginRole(role, el) {
  currentLoginRole = role;
  document.querySelectorAll('#page-login .auth-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  const labels = {
    student: 'Registration Number',
    'school-supervisor': 'Staff ID',
    'industry-supervisor': 'Staff ID',
    admin: 'Admin ID'
  };
  const placeholders = {
    student: 'e.g. 23/UG/***/BIT-S',
    'school-supervisor': 'e.g. STAFF-014',
    'industry-supervisor': 'e.g. STAFF-042',
    admin: 'e.g. ADMIN-001'
  };

  document.getElementById('login-id-label').textContent = labels[role];
  document.getElementById('login-id').placeholder = placeholders[role];
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
    // debug line
    console.log('Sending login:', { identifier: id, password: pw, role: currentLoginRole });

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: id,
        password: pw,
        role: currentLoginRole,
      }),
    });

    const result = await response.json();

    // DEBUG
    console.log('Login response:', result);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      alert(result.message || 'Invalid credentials. Please try again.');
      return;
    }

    // Save real session data
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('token', result.token);
    sessionStorage.setItem('userRole', result.role);
    sessionStorage.setItem('userName', result.name);
    sessionStorage.setItem('userId', String(result.id));

    // these survive page reopen
    localStorage.setItem('token', result.token);
    localStorage.setItem('userName', result.name);
    localStorage.setItem('userId', String(result.id));
    localStorage.setItem('userRole', result.role);

    // DEBUG
    console.log('Session saved:', {
      userName: sessionStorage.getItem('userName'),
      userRole: sessionStorage.getItem('userRole'),
      userId: sessionStorage.getItem('userId'),
      localUserName: localStorage.getItem('userName'),
      localRole: localStorage.getItem('userRole'),
    });


    const pages = {
      student: 'page-student',
      'school-supervisor': 'page-school-supervisor',
      'industry-supervisor': 'page-industry-supervisor',
      admin: 'page-admin',
    };

    const page = pages[result.role] || 'page-student';
    sessionStorage.setItem('activePage', page);

    localStorage.setItem('activeTab', 'dashboard');
    localStorage.setItem('activeTabPrefix',
      result.role === 'school-supervisor' ? 'school' :
        result.role === 'industry-supervisor' ? 'industry' :
          result.role === 'admin' ? 'admin' : 'student'
    );

    loadUserDashboard();

    showPage(page);

    // TEMPORARY DEBUG
    setTimeout(() => {
      console.log('After login check:');
      console.log('sessionStorage userRole:', sessionStorage.getItem('userRole'));
      console.log('localStorage userRole:', localStorage.getItem('userRole'));
      console.log('sessionStorage userId:', sessionStorage.getItem('userId'));
      console.log('localStorage userId:', localStorage.getItem('userId'));
    }, 500);

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
  }
}

// WIRE INDUSTRY SUPERVISOR APPROVAL
async function loadPendingLogs() {
  try {
    const response = await fetch(`${API_URL}/logs/pending`, {
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
            <td><button class="btn btn-outline btn-sm" onclick="openModal('log-detail-modal')">View</button></td>
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
            <td><button class="btn btn-outline btn-sm" onclick="openModal('log-detail-modal')">Detail</button></td>
          </tr>
        `).join('');
      }
    }

  } catch (err) {
    console.error('Failed to load logs:', err);
  }
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
    const [pendingRes, allLogsRes] = await Promise.all([
      fetch(`${API_URL}/logs/pending`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }),
      fetch(`${API_URL}/logs`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
    ]);

    const pendingLogs = await pendingRes.json();
    const allLogs = await allLogsRes.json();

    const pending = pendingLogs.length;
    const approved = allLogs.filter(l => l.status === 'approved').length;
    const rejected = allLogs.filter(l => l.status === 'rejected').length;

    // Get unique student IDs
    const activeInterns = [...new Set(allLogs.map(l => l.studentId))].length;

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
    const [allLogsRes, reportsRes] = await Promise.all([
      fetch(`${API_URL}/logs`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      }),
      fetch(`${API_URL}/reports`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
    ]);

    const allLogs = await allLogsRes.json();
    const allReports = await reportsRes.json();

    // Card 0 — unique students who have submitted logs
    const studentIds = [...new Set(allLogs.map(l => l.studentId))];
    const totalStudents = studentIds.length;

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
    const response = await fetch(`${API_URL}/users/students`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const students = await response.json();

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

    tbody.innerHTML = students.map(student => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar">${student.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
            ${student.fullName}
          </div>
        </td>
        <td>${student.registrationNumber || '—'}</td>
        <td>${student.placementCompany || '—'}</td>
        <td>
          <div style="min-width:90px">
            <div class="prog-bar">
              <div class="prog-fill" style="width:0%"></div>
            </div>
            <div style="font-size:.75rem;color:var(--text3);margin-top:2px">0%</div>
          </div>
        </td>
        <td>—</td>
        <td><span class="tag approved">Active</span></td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="openStudentProfile(${student.id}, '${student.fullName}', '${student.registrationNumber}', '${student.course}', '${student.placementCompany}', '${student.email}')">
            View Profile
          </button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Failed to load school students:', err);
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

  if (avatar) avatar.textContent = fullName.split(' ').map(n => n[0]).join('').toUpperCase();
  if (nameEl) nameEl.textContent = fullName;
  if (subEl) subEl.textContent = `${regNumber} · ${course || 'N/A'}`;
  if (placementEl) placementEl.textContent = placement || 'N/A';
  if (emailEl) emailEl.textContent = email || 'N/A';

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
    
    // Load conversation into school chat
    const chatMessages = document.getElementById('school-chat-messages');
    const chatHead = document.querySelector('#school-chat-box .chat-head-info h4');
    
    if (chatMessages) chatMessages.dataset.partnerId = studentId;
    if (chatHead) chatHead.textContent = fullName;

    // Load existing messages
    await loadSchoolConversation(studentId, fullName);
    
    // Open chat
    toggleSchoolChat();
  };
}

  // Fetch student logs
  try {
    const response = await fetch(`${API_URL}/logs/student/${studentId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const logs = await response.json();
    const total = logs.length;
    const approved = logs.filter(l => l.status === 'approved').length;
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
    if (progText) progText.textContent = `${progress}% · ${approved}/${total} tasks approved`;

    // Update recent logs table in modal
    const tbody = document.querySelector('#student-profile-modal tbody');
    if (tbody) {
      if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--text2)">No logs yet</td></tr>`;
      } else {
        tbody.innerHTML = logs.slice(0, 5).map(log => `
          <tr>
            <td>${new Date(log.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
            <td>${log.taskName}</td>
            <td><span class="tag ${log.status}">${log.status.charAt(0).toUpperCase() + log.status.slice(1)}</span></td>
          </tr>
        `).join('');
      }
    }

  } catch (err) {
    console.error('Failed to load student profile data:', err);
  }

  openModal('student-profile-modal');
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
    const response = await fetch(`${API_URL}/users/students`, {
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
  const gradingInputs = document.querySelectorAll('#grading-form-container input[type="number"]');
  const gradingSelects = document.querySelectorAll('#grading-form-container select');
  const gradingTextareas = document.querySelectorAll('#grading-form-container textarea');

  const data = {
    supervisorId: Number(supervisorId),
    studentId: Number(studentId),
    attendanceRate: Number(gradingInputs[0]?.value) || null,
    attendanceComments: gradingTextareas[0]?.value || null,
    logQuality: gradingSelects[0]?.value || null,
    logConsistency: Number(document.querySelector('#grading-form-container input[type="range"]')?.value) || null,
    reportGrade: gradingSelects[1]?.value || null,
    reportFeedback: gradingTextareas[1]?.value || null,
    communicationRating: Number(gradingInputs[1]?.value) || null,
    communicationObservations: gradingTextareas[2]?.value || null,
    industryPerformance: gradingSelects[2]?.value || null,
    industryComments: gradingTextareas[3]?.value || null,
    overallGrade: document.querySelector('#grading-form-container .card-val')?.textContent || null,
    finalComments: gradingTextareas[4]?.value || null,
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
    const response = await fetch(`${API_URL}/users/students`, {
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
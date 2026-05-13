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
  const target = document.getElementById(id);
  if (!target) return;
  
  // Only hide/show if we're actually changing pages
  const currentActive = document.querySelector('.page.active');
  if (currentActive && currentActive.id === id) return;
  
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });
  
  target.style.display = 'flex';
  target.classList.add('active'); // no setTimeout — no flash
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
  sessionStorage.clear();
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  localStorage.removeItem('userId');
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
    const logs = await fetchJson(endpoint);

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
    if (requestsTab) {
      if (logs.length > 0) {
        requestsTab.innerHTML = logs.map(log => `
          <div class="request-card">
            <div class="avatar">${String(log.studentId).slice(0,2)}</div>
            <div class="request-card-body">
              <h4>${escapeHtml(log.taskName)}</h4>
              <p>Student ID: ${log.studentId} · ${new Date(log.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <div class="request-card-meta">
                <span class="tag ${log.workType === 'Onsite' ? 'onsite' : 'offsite'}">${log.workType}</span>
                &nbsp; ${log.estimatedHours} hours
              </div>
              ${log.description ? `<p style="margin-top:8px;font-size:.85rem;color:var(--text2)">${escapeHtml(log.description.substring(0, 120))}${log.description.length > 120 ? '...' : ''}</p>` : ''}
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
              <span class="tag pending">Pending</span>
              <div style="display:flex;gap:6px">
                <button class="btn btn-primary btn-sm" onclick="approveLog(${log.id}, 'approved')">
                  <i class="fas fa-check"></i> Approve
                </button>
                <button class="btn btn-outline btn-sm" style="border-color:var(--danger);color:var(--danger)" 
                        onclick="approveLog(${log.id}, 'rejected')">
                  <i class="fas fa-times"></i> Reject
                </button>
              </div>
            </div>
          </div>
        `).join('');
      } else {
        requestsTab.innerHTML = '<p style="padding:20px;color:var(--text2)">No pending approvals.</p>';
      }
    }

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
    await fetchJson(`${API_URL}/logs/${logId}/approve`, {
      method: 'PATCH',
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
            <td><button class="btn btn-outline btn-sm" onclick="openLogDetail(${log.id})">View</button></td>
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
            <td><button class="btn btn-outline btn-sm" onclick="openLogDetail(${log.id})">Detail</button></td>
          </tr>
        `).join('');
      }
    }

  } catch (err) {
    console.error('Failed to load logs:', err);
  }
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
    const [allLogs, allReports, students] = await Promise.all([
      fetchJson(`${API_URL}/logs`),
      fetchJson(`${API_URL}/reports`),
      fetchJson(getAssignedStudentsEndpoint()),
    ]);

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
      studentsTbody.innerHTML = students.map(student => {
        const stats = progressMap.get(Number(student.id)) || { progress: 0 };
        const initials = student.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        const statusTag = stats.progress >= 60 ? 'approved' : stats.progress > 0 ? 'pending' : 'rejected';
        const statusText = stats.progress >= 60 ? 'Active' : stats.progress > 0 ? 'In Progress' : 'Not Started';
        return `
          <tr>
            <td><div style="display:flex;align-items:center;gap:10px"><div class="avatar">${initials}</div>${student.fullName}</div></td>
            <td>${student.registrationNumber || '—'}</td>
            <td>${student.course || '—'}</td>
            <td>—</td>
            <td>${student.placementCompany || '—'}</td>
            <td><div class="prog-bar" style="min-width:80px"><div class="prog-fill ${stats.progress > 0 && stats.progress < 60 ? 'amber' : ''}" style="width:${stats.progress}%"></div></div></td>
            <td><span class="tag ${statusTag}">${statusText}</span></td>
            <td>
              <button class="btn btn-outline btn-sm" onclick="openAssignSupervisorModal(${student.id}, '${student.fullName.replace(/'/g, "\\'")}')">
                Assign Supervisor
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Admin supervisors tab counts
    const schoolSvTab = document.querySelector('.tab-btn[onclick*=\'school\']');
    const industrySvTab = document.querySelector('.tab-btn[onclick*=\'industry\']');
    if (schoolSvTab) schoolSvTab.textContent = `School Supervisors (${supervisors.school?.length || 0})`;
    if (industrySvTab) industrySvTab.textContent = `Industry Supervisors (${supervisors.industry?.length || 0})`;
  } catch (err) {
    console.error('Failed to load admin dashboard data:', err);
  }
}

let assigningStudentId = null;

async function handleAdminAddSupervisor() {
  const typeSelect = document.querySelector('#admin-tab-add-supervisor select');
  const inputs = document.querySelectorAll('#admin-tab-add-supervisor input');
  const fullName = inputs[0]?.value.trim();
  const staffId = inputs[1]?.value.trim();
  const email = inputs[2]?.value.trim();
  const department = inputs[3]?.value.trim();
  const password = inputs[5]?.value.trim();

  if (!fullName || !staffId || !email || !password) {
    alert('Please fill in Full Name, Staff ID, Email and Password.');
    return;
  }

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    alert('Password must be at least 8 characters with uppercase, lowercase and a number.');
    return;
  }

  const roleMap = {
    'School Supervisor': 'school-supervisor',
    'Industry Supervisor': 'industry-supervisor',
  };
  const role = roleMap[typeSelect?.value] || 'school-supervisor';

  const btn = document.querySelector('#admin-tab-add-supervisor .btn-primary');
  if (btn) {
    btn.innerHTML = '<span class="spinner"></span> Adding...';
    btn.disabled = true;
  }

  try {
    await fetchJson(`${API_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ fullName, staffId, email, department, password, role }),
    });
    alert(`Supervisor ${fullName} added successfully!`);
    document.querySelectorAll('#admin-tab-add-supervisor input').forEach(i => i.value = '');
    loadAdminDashboardData();
  } catch (err) {
    alert('Failed to add supervisor. ' + err.message);
  } finally {
    if (btn) {
      btn.innerHTML = '<i class="fas fa-user-plus"></i> Add Supervisor';
      btn.disabled = false;
    }
  }
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

  if (title) title.textContent = otherUserName;
  if (subtitle) subtitle.textContent = 'Loading…';
  if (emptyState) { emptyState.textContent = 'Loading conversation…'; emptyState.style.display = 'block'; }
  if (history) history.style.display = 'none';
  if (sendRow) sendRow.style.display = 'none';

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
    const logs = await fetchJson(`${API_URL}/logs/student/${studentId}`);
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
    }
  } catch (err) {
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
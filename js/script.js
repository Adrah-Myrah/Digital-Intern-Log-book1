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
      fullName: document.getElementById('reg-fullname').value,
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

function goToLogin() {
  sessionStorage.removeItem('isLoggedIn');
  sessionStorage.removeItem('activePage');
  sessionStorage.removeItem('userRole');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('userName');
  sessionStorage.removeItem('userId');
  localStorage.removeItem('activeTab');
  localStorage.removeItem('activeTabPrefix');
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userId');
  showPage('page-login');
}

function setLoginRole(role, el) {
  currentLoginRole = role;
  document.querySelectorAll('#page-login .auth-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const labels = { student: 'Registration Number', school: 'Staff ID', industry: 'Staff ID', admin: 'Admin ID' };
  const placeholders = { student: 'e.g. 2021/BSC/001', school: 'e.g. STAFF-014', industry: 'e.g. STAFF-042', admin: 'e.g. ADMIN-001' };
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

  } catch (err) {
    alert('Could not connect to server. Make sure the backend is running.');
  } finally {
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Sign In</span>';
    btn.disabled = false;
  }
}

// wire student dashboard with real data
function loadUserDashboard() {
  const userName = sessionStorage.getItem('userName') || localStorage.getItem('userName');
  const userId = getUserId();
  const userRole = sessionStorage.getItem('userRole') || localStorage.getItem('userRole');

  if (!userName) return;

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
  }

  // Update industry supervisor dashboard
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
  }
}

// Wire Student logs
async function loadStudentLogs(studentId) {
  try {
    const response = await fetch(`${API_URL}/logs/student/${studentId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const logs = await response.json();

    // Update total logs count
    const totalLogsEl = document.querySelector('#student-tab-dashboard .card-val');
    if (totalLogsEl) totalLogsEl.textContent = logs.length;

    // Update logs table in My Logs tab
    const tbody = document.getElementById('logs-tbody');
    if (!tbody || logs.length === 0) return;

    tbody.innerHTML = logs.map((log, index) => `
      <tr>
        <td>${logs.length - index}</td>
        <td>${new Date(log.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
        <td>${log.taskName}</td>
        <td><span class="tag ${log.workType === 'Onsite' ? 'onsite' : 'offsite'}">${log.workType}</span></td>
        <td>${log.estimatedHours}h</td>
        <td><span class="gps-badge"><i class="fas fa-check"></i> Verified</span></td>
        <td><span class="tag ${log.status}">${log.status.charAt(0).toUpperCase() + log.status.slice(1)}</span></td>
        <td><button class="btn btn-outline btn-sm" onclick="openModal('log-detail-modal')">Detail</button></td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Failed to load logs:', err);
  }
}

// wiring dashboard cards
// async function loadStudentCards(studentId) {
//   try {
//     const response = await fetch(`${API_URL}/logs/student/${studentId}`, {
//       headers: { 'Authorization': `Bearer ${getToken()}` }
//     });

//     const logs = await response.json();

//     const total = logs.length;
//     const approved = logs.filter(l => l.status === 'approved').length;
//     const pending = logs.filter(l => l.status === 'pending').length;

//     // Total log entries card
//     const cards = document.querySelectorAll('#student-tab-dashboard .card-val');
//     if (cards[0]) cards[0].textContent = total;

//     // Approved tasks card
//     if (cards[3]) cards[3].textContent = approved;

//     // Update pending badge in sidebar
//     const logsBadge = document.querySelector('#sidebar-student .nav-item:nth-child(2) .badge');
//     if (logsBadge) logsBadge.textContent = pending;

//     // Update welcome banner pending count
//     const bannerText = document.querySelector('#student-tab-dashboard .welcome-banner p');
//     if (bannerText) {
//       bannerText.innerHTML = `You have <strong>${pending} pending tasks</strong> awaiting industry supervisor approval.`;
//     }

//   } catch (err) {
//     console.error('Failed to load cards:', err);
//   }
// }
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
    const logsBadge = document.querySelector('#sidebar-student .nav-item:nth-child(2) .badge');
    if (logsBadge) logsBadge.textContent = pending;

    // Update welcome banner
    const bannerText = document.querySelector('#student-tab-dashboard .welcome-banner p');
    if (bannerText) {
      bannerText.innerHTML = `You have <strong>${pending} pending tasks</strong> awaiting industry supervisor approval. Keep up the great work!`;
    }

  } catch (err) {
    console.error('Failed to load cards:', err);
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
function submitLog() {
  const btn = event.target;
  btn.innerHTML = '<span class="spinner"></span> Submitting...';
  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Log Entry';
    // Show a toast
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--success);color:#fff;padding:12px 24px;border-radius:10px;font-weight:600;z-index:9999;animation:fadeUp .3s ease';
    toast.innerHTML = '<i class="fas fa-check-circle"></i> Log entry submitted successfully!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }, 1000);
}

/* ===== DRAG & DROP UPLOAD ===== */
const uploadArea = document.querySelector('.upload-area');
if (uploadArea) {
  uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.style.borderColor = 'var(--primary)'; uploadArea.style.background = 'rgba(26,107,74,0.06)'; });
  uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = ''; uploadArea.style.background = ''; });
  uploadArea.addEventListener('drop', e => { e.preventDefault(); uploadArea.style.borderColor = ''; uploadArea.style.background = ''; });
}
/* ==== LOAD gRADING FORM =====*/

function loadGradingForm() {
  const select = document.getElementById('grading-student-select');
  const container = document.getElementById('grading-form-container');

  if (select.value) {
    container.style.display = 'block';
    // Here you would typically fetch student data via AJAX
    // For now, we just show the form
  } else {
    alert('Please select a student first');
  }
}

function submitGrading() {
  alert('Grading submitted successfully!');
  // Add your submission logic here
}
/*====== SCHOOL SUPERVISION SCHEDULING ======*/
// Student data
const students = [
  { id: 'AK', name: 'Amina Kibuuka', regNo: '2021/BSC/042', country: 'Uganda', email: 'amina@mak.ac.ug', placement: 'Stanbic Bank Uganda Ltd' },
  { id: 'JM', name: 'Jonah Mwangi', regNo: '2021/BSC/019', country: 'Uganda', email: 'jonah@mak.ac.ug', placement: 'MTN Uganda HQ' },
  { id: 'PN', name: 'Patience Nantale', regNo: '2021/BSC/031', country: 'Uganda', email: 'patience@mak.ac.ug', placement: 'Airtel Uganda' },
  { id: 'INTL1', name: 'John Doe', regNo: '2021/BSC/050', country: 'Kenya', email: 'john@university.ac.ke', placement: 'Safaricom Kenya' },
  { id: 'INTL2', name: 'Jane Smith', regNo: '2021/BSC/051', country: 'Nigeria', email: 'jane@university.ac.ng', placement: 'MTN Nigeria' },
];

// Load Supervision Form
function loadSupervisionForm() {
  const select = document.getElementById('supervision-student-select');
  const container = document.getElementById('supervision-form-container');
  const studentId = select.value;

  if (!studentId) {
    alert('Please select a student first');
    return;
  }

  const student = students.find(s => s.id === studentId);
  if (student) {
    updateStudentInfo(student);
    checkZoomAvailability(student.country);
    if (container) container.style.display = 'block';
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
function scheduleSupervision() {
  const dateInput = document.getElementById('supervision-date');
  const timeInput = document.getElementById('supervision-time');
  const modeSelect = document.getElementById('supervision-mode');
  const locationInput = document.getElementById('supervision-location');
  const zoomLinkInput = document.getElementById('zoom-link');

  // Validate required fields
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

  // Show success message
  alert('Supervision scheduled successfully! Student has been notified.');

  // Auto-fill assessment form with scheduled date
  const actualDateInput = document.getElementById('assessment-actual-date');
  if (actualDateInput) {
    actualDateInput.value = dateInput.value + ' at ' + timeInput.value;
  }
}

// Submit Assessment (Part 2)
function submitAssessment() {
  const statusSelect = document.getElementById('assessment-status');
  const performanceSelect = document.getElementById('assessment-performance');
  const technicalInput = document.getElementById('assessment-technical');
  const professionalismInput = document.getElementById('assessment-professionalism');
  const improvementInput = document.getElementById('assessment-improvement');
  const finalCommentsInput = document.getElementById('assessment-final-comments');

  // Validate required fields
  if (statusSelect.value !== 'completed') {
    alert('Please mark supervision as completed before submitting assessment');
    return;
  }

  if (!technicalInput.value || !professionalismInput.value || !finalCommentsInput.value) {
    alert('Please fill in all assessment fields');
    return;
  }

  // Show success message
  alert('Assessment submitted successfully!');

  // Reset form
  document.getElementById('supervision-form-container').style.display = 'none';
  document.getElementById('supervision-student-select').value = '';
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
function submitReport() {
  // Simulate upload
  const submitBtn = document.getElementById('btn-submit-report');
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
  submitBtn.disabled = true;

  setTimeout(() => {
    // Hide upload section, show success
    document.getElementById('upload-section').style.display = 'none';
    document.getElementById('success-section').style.display = 'block';
    document.getElementById('report-status-badge').className = 'tag approved';
    document.getElementById('report-status-badge').textContent = 'Submitted';

    // Set submission date
    const now = new Date();
    document.getElementById('submission-date').textContent = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    // Close modal
    closeReportModal();

    // Reset file input
    document.getElementById('report-file').value = '';
    document.getElementById('file-name').textContent = '';
    document.getElementById('btn-confirm-upload').disabled = true;

    // Set state
    isReportSubmitted = true;

    alert('Report submitted successfully!');
  }, 1500);
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
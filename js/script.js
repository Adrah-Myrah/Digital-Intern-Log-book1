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

function goToLogin() { showPage('page-login'); }

function setLoginRole(role, el) {
  currentLoginRole = role;
  document.querySelectorAll('#page-login .auth-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const labels = { student: 'Registration Number', school: 'Staff ID', industry: 'Staff ID', admin: 'Admin ID' };
  const placeholders = { student: 'e.g. 2021/BSC/001', school: 'e.g. STAFF-014', industry: 'e.g. STAFF-042', admin: 'e.g. ADMIN-001' };
  document.getElementById('login-id-label').textContent = labels[role];
  document.getElementById('login-id').placeholder = placeholders[role];
}

function handleLogin() {
  const btn = document.getElementById('login-btn');
  btn.innerHTML = '<span class="spinner"></span> Signing in...';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Sign In</span>';
    btn.disabled = false;
    const pages = { student: 'page-student', school: 'page-school-supervisor', industry: 'page-industry-supervisor', admin: 'page-admin' };
    showPage(pages[currentLoginRole] || 'page-student');
  }, 1200);
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
document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', function(e) { if (e.target === this) this.classList.remove('open'); }));

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
document.addEventListener('click', function(e) {
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
document.addEventListener('DOMContentLoaded', function() {
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
document.getElementById('confirm-checkbox')?.addEventListener('change', function() {
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
document.addEventListener('DOMContentLoaded', function() {
  if (isReportSubmitted) {
    document.getElementById('upload-section').style.display = 'none';
    document.getElementById('success-section').style.display = 'block';
    document.getElementById('report-status-badge').className = 'tag approved';
    document.getElementById('report-status-badge').textContent = 'Submitted';
  }
});


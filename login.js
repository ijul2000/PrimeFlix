// =========================================================
// PRIME FLIX — halaman Login / Register (login.html)
// Guna endpoint POST yang sama (Code.gs) dengan action
// "login" / "register". Sesi pengguna yang berjaya log masuk
// disimpan dalam localStorage (kekal walaupun tab ditutup)
// supaya index.html, movie.html & watch.html boleh terus
// mengesan status log masuk. Kata laluan TIDAK PERNAH disimpan
// di sini — hanya {ID, Username, Email, Role} yang backend
// pulangkan.
// =========================================================

// Guna URL Web App yang sama seperti script.js
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbydLAqC63yo3LXJXMXpRyJNH4KYc5wtmstaewPa-NAnklQvV2JSCv28JdfWNiJsma51fQ/exec';

const AUTH_SESSION_KEY = 'primeflix_session_v1';

function readSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function writeSession(user) {
  try { localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user)); } catch (err) { /* abaikan */ }
}

// Destinasi selepas log masuk/daftar berjaya. Kalau page ni dibuka
// oleh requireAuth() pada index.html/movie.html/watch.html, URL asal
// yang cuba diakses dihantar melalui ?redirect=..., supaya pengguna
// dibawa balik ke situ selepas berjaya log masuk. Kalau tiada, default
// ke index.html.
function getRedirectTarget() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  return redirect ? redirect : 'index.html';
}

// Kalau sesi dah wujud (pengguna dah log masuk), tak perlu papar
// borang log masuk lagi — terus hantar ke destinasi.
(function redirectIfAlreadyLoggedIn() {
  if (readSession()) {
    window.location.replace(getRedirectTarget());
  }
})();

function webAppReady() {
  return typeof WEBAPP_URL === 'string' && WEBAPP_URL.indexOf('GANTI_DENGAN') === -1;
}

async function apiAuth(action, data) {
  const res = await fetch(WEBAPP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, data })
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Request failed.');
  return json.data; // { ID, Username, Email, Role }
}

document.addEventListener('DOMContentLoaded', () => {

  const gateTabs = document.getElementById('authGateTabs');
  const gateLoginForm = document.getElementById('gateLoginForm');
  const gateRegisterForm = document.getElementById('gateRegisterForm');

  if (!gateLoginForm || !gateRegisterForm) return;

  function showFormError(form, message) {
    const errEl = form.querySelector('[data-form-error]');
    if (!errEl) return;
    errEl.textContent = message || '';
    errEl.hidden = !message;
  }

  // Tab "Login" / "Register".
  if (gateTabs) {
    gateTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-gate-tab]');
      if (!btn) return;
      const tab = btn.dataset.gateTab;
      gateTabs.querySelectorAll('.auth-gate-tab').forEach(t => t.classList.toggle('active', t === btn));
      gateLoginForm.hidden = tab !== 'login';
      gateRegisterForm.hidden = tab !== 'register';
      showFormError(gateLoginForm, '');
      showFormError(gateRegisterForm, '');
    });
  }

  gateLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showFormError(gateLoginForm, '');
    if (!webAppReady()) { showFormError(gateLoginForm, 'WEBAPP_URL is not set in login.js.'); return; }

    const submitBtn = gateLoginForm.querySelector('[data-submit-btn]');
    const fd = new FormData(gateLoginForm);
    const data = { Username: fd.get('Username'), Password: fd.get('Password') };

    submitBtn.disabled = true;
    try {
      const user = await apiAuth('login', data);
      writeSession(user);
      window.location.href = getRedirectTarget();
    } catch (err) {
      showFormError(gateLoginForm, err.message || 'Login failed.');
      submitBtn.disabled = false;
    }
  });

  gateRegisterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showFormError(gateRegisterForm, '');
    if (!webAppReady()) { showFormError(gateRegisterForm, 'WEBAPP_URL is not set in login.js.'); return; }

    const submitBtn = gateRegisterForm.querySelector('[data-submit-btn]');
    const fd = new FormData(gateRegisterForm);
    const data = {
      Username: fd.get('Username'),
      Email: fd.get('Email'),
      Password: fd.get('Password'),
      ConfirmPassword: fd.get('ConfirmPassword')
    };
    if (data.Password !== data.ConfirmPassword) {
      showFormError(gateRegisterForm, 'Password and Confirm Password do not match.');
      return;
    }

    submitBtn.disabled = true;
    try {
      const user = await apiAuth('register', data);
      writeSession(user);
      window.location.href = getRedirectTarget();
    } catch (err) {
      showFormError(gateRegisterForm, err.message || 'Registration failed.');
      submitBtn.disabled = false;
    }
  });
});

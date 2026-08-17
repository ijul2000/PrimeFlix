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

// =========================================================
// SESI — storan berlapis (localStorage + cookie fallback)
// Sesetengah pelayar (mod Private/Incognito, pelayar dalam-app
// WhatsApp/Instagram/Facebook/TikTok) menyekat localStorage. Cookie
// biasa (document.cookie) kadangkala masih dibenarkan walaupun
// localStorage disekat — jadi kita cuba localStorage dahulu, dan
// SENTIASA turut simpan sebagai cookie sebagai lapisan sandaran.
// NOTA: kalau pelayar sekat KEDUA-DUA localStorage & cookie (contohnya
// sesetengah pelayar dalam-app dalam mod storan tidak-berterusan),
// tiada cara bypass dari kod client-side — itu sekatan platform, bukan
// sekatan laman web ini.
// =========================================================
function setSessionCookie(value) {
  try {
    document.cookie = AUTH_SESSION_KEY + '=' + encodeURIComponent(value) + ';path=/;max-age=' + (30 * 24 * 60 * 60) + ';SameSite=Lax';
    return true;
  } catch (err) {
    return false;
  }
}
function getSessionCookie() {
  try {
    const match = document.cookie.match(new RegExp('(?:^|; )' + AUTH_SESSION_KEY + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  } catch (err) {
    return null;
  }
}

function readSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) { /* localStorage tak tersedia — cuba cookie */ }
  try {
    const cookieRaw = getSessionCookie();
    return cookieRaw ? JSON.parse(cookieRaw) : null;
  } catch (err) {
    return null;
  }
}

// Pulangkan true/false — BUKAN senyap seperti sebelum ini — supaya
// pemanggil tahu dengan pasti sama ada sesi betul-betul tersimpan
// (localStorage ATAU cookie sandaran).
function writeSession(user) {
  let localOk = false;
  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
    const check = localStorage.getItem(AUTH_SESSION_KEY);
    localOk = !!check && JSON.parse(check).ID === user.ID;
  } catch (err) {
    localOk = false;
  }
  const cookieOk = setSessionCookie(JSON.stringify(user));
  return localOk || cookieOk;
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

// Tampal penanda "_ac=1" (auth-check) pada URL destinasi selepas login
// berjaya. Ini membolehkan requireAuth() pada index.html/movie.html/
// watch.html bezakan dua situasi bila sesi tak dijumpai di sana:
//   1) Pengguna memang belum log masuk -> redirect terus ke login.html
//      (macam biasa).
//   2) Pengguna BARU SAHAJA log masuk di sini (writeSession() dah
//      sahkan localStorage tertulis betul PADA HALAMAN LOGIN INI),
//      tapi sesi hilang lepas navigasi ke halaman lain — biasanya
//      sebab pelayar dalam-app (WhatsApp/Instagram/Facebook/TikTok)
//      atau mod Private tak kekalkan localStorage merentasi navigasi.
//      Dalam kes ni, redirect balik ke login.html akan berulang tanpa
//      henti ("asyik kembali ke page login") — jadi requireAuth() pada
//      halaman destinasi akan berhenti loop dan papar mesej jelas
//      apabila nampak penanda ini.
function withAuthCheckFlag(url) {
  return url + (url.indexOf('?') === -1 ? '?' : '&') + '_ac=1';
}

// Kalau sesi dah wujud (pengguna dah log masuk), tak perlu papar
// borang log masuk lagi — terus hantar ke destinasi.
(function redirectIfAlreadyLoggedIn() {
  if (readSession()) {
    window.location.replace(getRedirectTarget());
  }
})();

// Kesan pelayar dalam-app (WhatsApp/Instagram/Facebook/Messenger/
// TikTok) melalui User-Agent — pelayar ni selalunya menyekat
// localStorage & cookie storan-berterusan, jadi log masuk boleh
// "berjaya" di server tapi sesi tak kekal (lihat requireAuth() pada
// index.html/movie.html/watch.html). Papar amaran AWAL supaya
// pengguna boleh buka terus dalam Safari/Chrome sebelum cuba log
// masuk, bukan lepas gagal. Ini pengesanan "best effort" sahaja
// (User-Agent boleh berubah/tak tepat 100%) — bukan bypass, cuma
// amaran awal.
function isLikelyInAppBrowser() {
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|Line\/|MicroMessenger|TikTok|musical_ly|WhatsApp/i.test(ua);
}

document.addEventListener('DOMContentLoaded', () => {
  const warningEl = document.getElementById('inAppBrowserWarning');
  if (warningEl && isLikelyInAppBrowser()) {
    warningEl.hidden = false;
  }
});

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
      const saved = writeSession(user);
      if (!saved) {
        // Login BERJAYA di server, tapi browser/peranti ni menyekat
        // localStorage (mod Private/Incognito, browser dalam-app
        // WhatsApp/Instagram/Facebook/TikTok, atau setting Safari
        // "Block All Cookies"). Kalau kita tetap redirect di sini,
        // page seterusnya (requireAuth) akan gagal jumpa sesi dan
        // hantar balik ke login — nampak macam "login pun tak jalan"
        // walhal login sebenarnya berjaya. Jadi berhenti di sini
        // dengan mesej yang jelas, bukan bounce senyap.
        showFormError(gateLoginForm, 'Login berjaya, tetapi peranti/pelayar ini menyekat KEDUA-DUA storan sesi (localStorage & cookie). Sila matikan mod Private/Incognito, benarkan cookies & storan laman web (buka Tetapan Safari/Chrome), atau buka pautan ini terus dalam Safari/Chrome — bukan dalam pelayar dalam-app (WhatsApp/Instagram/Facebook/TikTok).');
        submitBtn.disabled = false;
        return;
      }
      window.location.href = withAuthCheckFlag(getRedirectTarget());
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
      const saved = writeSession(user);
      if (!saved) {
        showFormError(gateRegisterForm, 'Pendaftaran berjaya, tetapi peranti/pelayar ini menyekat KEDUA-DUA storan sesi (localStorage & cookie). Sila matikan mod Private/Incognito, benarkan cookies & storan laman web (buka Tetapan Safari/Chrome), atau buka pautan ini terus dalam Safari/Chrome — bukan dalam pelayar dalam-app (WhatsApp/Instagram/Facebook/TikTok).');
        submitBtn.disabled = false;
        return;
      }
      window.location.href = withAuthCheckFlag(getRedirectTarget());
    } catch (err) {
      showFormError(gateRegisterForm, err.message || 'Registration failed.');
      submitBtn.disabled = false;
    }
  });
});

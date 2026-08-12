// =========================================================
// PRIME FLIX — page butiran movie (movie.html)
// =========================================================

// Guna URL Web App yang sama seperti script.js
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbydLAqC63yo3LXJXMXpRyJNH4KYc5wtmstaewPa-NAnklQvV2JSCv28JdfWNiJsma51fQ/exec';

document.addEventListener('DOMContentLoaded', () => {

  const backdropImg = document.getElementById('detailBackdropImg');
  const metaEl = document.getElementById('detailMeta');
  const titleEl = document.getElementById('detailTitle');
  const descEl = document.getElementById('detailDesc');

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const type = params.get('type') || 'movie';

  if (!id) {
    titleEl.textContent = 'Rekod tidak dijumpai.';
    descEl.textContent = 'Tiada ID diberikan dalam pautan.';
    return;
  }

  if (typeof WEBAPP_URL !== 'string' || WEBAPP_URL.indexOf('GANTI_DENGAN') !== -1) {
    titleEl.textContent = 'WEBAPP_URL belum ditetapkan.';
    descEl.textContent = 'Sila tetapkan WEBAPP_URL dalam movie.js untuk papar butiran filem.';
    return;
  }

  async function loadDetail() {
    try {
      const res = await fetch(`${WEBAPP_URL}?action=list&type=${encodeURIComponent(type)}`);
      const json = await res.json();
      if (!json.ok || !Array.isArray(json.data)) {
        throw new Error(json.error || 'Gagal memuatkan data.');
      }

      const record = json.data.find(r => String(r.ID) === String(id));
      if (!record) {
        titleEl.textContent = 'Rekod tidak dijumpai.';
        descEl.textContent = 'Filem yang anda cari mungkin telah dipadam.';
        return;
      }

      renderDetail(record);
    } catch (err) {
      titleEl.textContent = 'Gagal memuatkan butiran.';
      descEl.textContent = 'Sila cuba semula sebentar lagi.';
    }
  }

  function renderDetail(record) {
    backdropImg.style.backgroundImage = record.Backdrop ? `url("${record.Backdrop}")` : 'none';
    titleEl.textContent = record.Title || '';
    metaEl.textContent = [record.Year, record.Genre].filter(Boolean).join(' · ');
    descEl.textContent = record.Description || '';
    document.title = `${record.Title || 'Butiran Filem'} — Prime Flix`;
  }

  loadDetail();
});

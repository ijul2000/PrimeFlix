// =========================================================
// PRIME FLIX — interactions
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Hero slider (Movie / TV Show) ---- */
  const heroData = {
    movie: [
      {
        eyebrow: 'Baharu Dimuat Naik',
        title: 'Malam Terakhir di Kota Hujan',
        meta: '2026 · Thriller',
        desc: 'Seorang detektif persendirian mempunyai satu malam sahaja untuk menyelamatkan bandar sebelum ribut terakhir melanda. Drama thriller yang menegangkan dari awal hingga akhir.',
        hue: 4
      },
      {
        eyebrow: 'Baharu Dimuat Naik',
        title: 'Jejak Sunyi',
        meta: '2025 · Misteri',
        desc: 'Seorang wartawan menyiasat kehilangan misteri di sebuah pekan kecil, hanya untuk mendapati bahawa jejak yang dicari membawanya kepada rahsia yang lebih gelap.',
        hue: 356
      },
      {
        eyebrow: 'Baharu Dimuat Naik',
        title: 'Cahaya Dari Utara',
        meta: '2025 · Sci-Fi',
        desc: 'Satu isyarat aneh dari kutub utara mencetuskan ekspedisi saintifik yang mengubah pemahaman manusia tentang alam semesta — dan diri mereka sendiri.',
        hue: 8
      },
      {
        eyebrow: 'Baharu Dimuat Naik',
        title: 'Serangan Senja',
        meta: '2026 · Aksi',
        desc: 'Sebuah pasukan tentera elit diberi masa terhad untuk menewaskan ancaman yang menggugat keselamatan bandar sebelum matahari terbenam.',
        hue: 350
      },
      {
        eyebrow: 'Baharu Dimuat Naik',
        title: 'Rindu Yang Hilang',
        meta: '2026 · Drama',
        desc: 'Kisah sebuah keluarga yang cuba menyatukan semula ikatan yang retak selepas bertahun-tahun berjauhan, dibalut emosi yang mendalam.',
        hue: 12
      }
    ],
    tvshow: [
      {
        eyebrow: 'Baharu Dikemaskini',
        title: 'Rumah di Hujung Jalan',
        meta: 'Musim 3 · Episod 8 Baharu',
        desc: 'Rahsia keluarga yang tertanam sekian lama mula terbongkar apabila seorang ahli keluarga pulang selepas bertahun-tahun menghilangkan diri.',
        hue: 4
      },
      {
        eyebrow: 'Baharu Dikemaskini',
        title: 'Unit Siasatan',
        meta: 'Musim 1 · Episod 10 Baharu',
        desc: 'Sebuah pasukan siasatan jenayah berdepan kes paling rumit dalam kerjaya mereka, dengan setiap episod mendedahkan lapisan konspirasi baharu.',
        hue: 355
      },
      {
        eyebrow: 'Baharu Dikemaskini',
        title: 'Kod Bandar',
        meta: 'Musim 1 · Episod 6 Baharu',
        desc: 'Seorang juruteknik IT terperangkap dalam permainan kucing dan tikus digital apabila sistem bandar pintar dicerobohi oleh penggodam misteri.',
        hue: 6
      },
      {
        eyebrow: 'Baharu Dikemaskini',
        title: 'Warisan Terpendam',
        meta: 'Musim 4 · Episod 3 Baharu',
        desc: 'Perebutan harta pusaka keluarga besar membawa kepada pendedahan rahsia generasi yang mengubah segala-galanya.',
        hue: 10
      },
      {
        eyebrow: 'Baharu Dikemaskini',
        title: 'Sekolah Tengah Malam',
        meta: 'Musim 2 · Episod 5 Baharu',
        desc: 'Sekumpulan pelajar menyiasat kejadian ganjil yang berlaku setiap tengah malam di sekolah asrama lama mereka.',
        hue: 350
      }
    ]
  };

  const heroBackdrop = document.getElementById('heroBackdrop');
  const heroText = document.getElementById('heroText');
  const heroEyebrow = document.getElementById('heroEyebrow');
  const heroTitle = document.getElementById('heroTitle');
  const heroMeta = document.getElementById('heroMeta');
  const heroDesc = document.getElementById('heroDesc');
  const heroDots = document.getElementById('heroDots');

  let heroCategory = 'movie';
  let heroIndex = 0;
  let heroTimer = null;

  function renderHeroDots() {
    heroDots.innerHTML = '';
    heroData[heroCategory].forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hero-dot' + (i === heroIndex ? ' active' : '');
      dot.setAttribute('aria-label', `Slaid ${i + 1}`);
      dot.addEventListener('click', () => goToHeroSlide(heroCategory, i));
      heroDots.appendChild(dot);
    });
  }

  function applyHeroSlide() {
    const slide = heroData[heroCategory][heroIndex];
    heroText.classList.add('is-fading');
    setTimeout(() => {
      heroEyebrow.textContent = slide.eyebrow;
      heroTitle.textContent = slide.title;
      heroMeta.textContent = slide.meta;
      heroDesc.textContent = slide.desc;
      heroBackdrop.style.setProperty('--tint', slide.hue);
      heroText.classList.remove('is-fading');
    }, 220);
    renderHeroDots();
  }

  function goToHeroSlide(category, index) {
    heroCategory = category;
    heroIndex = index;
    applyHeroSlide();
    restartHeroAutoplay();
  }

  function nextHeroSlide() {
    heroIndex = (heroIndex + 1) % heroData[heroCategory].length;
    applyHeroSlide();
  }

  function restartHeroAutoplay() {
    if (heroTimer) clearInterval(heroTimer);
    heroTimer = setInterval(nextHeroSlide, 6000);
  }

  const heroSection = document.getElementById('heroSlider');

  function setHeroCategoryFromHref(href) {
    if (href === '#movies') return 'movie';
    if (href === '#tvshows') return 'tvshow';
    return null;
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const category = setHeroCategoryFromHref(link.getAttribute('href'));
      if (category && category !== heroCategory) {
        goToHeroSlide(category, 0);
      }
    });
  });

  heroSection.addEventListener('mouseenter', () => { if (heroTimer) clearInterval(heroTimer); });
  heroSection.addEventListener('mouseleave', () => { restartHeroAutoplay(); });

  applyHeroSlide();
  restartHeroAutoplay();

  /* ---- Mobile nav toggle ---- */
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    mobileNav.classList.toggle('open');
  });

  mobileNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('open');
    });
  });

  /* ---- Search form ---- */
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      console.log('Mencari:', query);
      // Placeholder: sambungkan ke logik carian sebenar di sini
    }
  });

  // On small screens, tap the icon to expand the search field first
  const searchIconBtn = searchForm.querySelector('.search-icon-btn');
  searchIconBtn.addEventListener('click', (e) => {
    if (window.innerWidth <= 480 && !searchForm.classList.contains('expanded')) {
      e.preventDefault();
      searchForm.classList.add('expanded');
      searchInput.focus();
    }
  });
  searchInput.addEventListener('blur', () => {
    if (window.innerWidth <= 480 && !searchInput.value) {
      searchForm.classList.remove('expanded');
    }
  });

  /* ---- Nav active state on click ---- */
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      document.querySelectorAll(`.nav-link[href="${link.getAttribute('href')}"]`)
        .forEach(l => l.classList.add('active'));
    });
  });

  /* ---- Populate poster rows with placeholder content ---- */
  const rowData = [
    [
      { title: 'Malam Terakhir di Kota Hujan', sub: '2026 · Thriller', badge: 'HD', hue: 42 },
      { title: 'Jejak Sunyi', sub: '2025 · Misteri', badge: 'Baharu', hue: 200 },
      { title: 'Api di Ufuk', sub: '2024 · Aksi', badge: 'HD', hue: 12 },
      { title: 'Bayang Kota Lama', sub: '2026 · Drama', badge: '4K', hue: 265 },
      { title: 'Ombak Terakhir', sub: '2023 · Pengembaraan', badge: 'HD', hue: 190 },
      { title: 'Cahaya Dari Utara', sub: '2025 · Sci-Fi', badge: 'Baharu', hue: 150 },
      { title: 'Rentak Metropolitan', sub: '2024 · Komedi', badge: 'HD', hue: 320 },
    ],
    [
      { title: 'Pemburu Fajar', sub: '2025 · Aksi', badge: 'HD', hue: 8 },
      { title: 'Laluan Naga', sub: '2023 · Pengembaraan', badge: '4K', hue: 30 },
      { title: 'Serangan Senja', sub: '2026 · Aksi', badge: 'Baharu', hue: 355 },
      { title: 'Ekspedisi Terakhir', sub: '2024 · Pengembaraan', badge: 'HD', hue: 170 },
      { title: 'Zon Bahaya', sub: '2022 · Aksi', badge: 'HD', hue: 20 },
      { title: 'Rimba Terlarang', sub: '2025 · Pengembaraan', badge: 'HD', hue: 140 },
    ],
    [
      { title: 'Rumah di Hujung Jalan', sub: 'Musim 3 · Drama', badge: 'Baharu', hue: 260 },
      { title: 'Kod Bandar', sub: 'Musim 1 · Thriller', badge: 'HD', hue: 210 },
      { title: 'Meja Suku Sebelas', sub: 'Musim 2 · Komedi', badge: 'HD', hue: 330 },
      { title: 'Warisan Terpendam', sub: 'Musim 4 · Drama', badge: '4K', hue: 45 },
      { title: 'Unit Siasatan', sub: 'Musim 1 · Jenayah', badge: 'Baharu', hue: 5 },
      { title: 'Sekolah Tengah Malam', sub: 'Musim 2 · Misteri', badge: 'HD', hue: 285 },
      { title: 'Dermaga 9', sub: 'Musim 1 · Drama', badge: 'HD', hue: 185 },
    ],
    [
      { title: 'Surat Yang Tak Sampai', sub: '2025 · Drama', badge: 'HD', hue: 350 },
      { title: 'Antara Dua Musim', sub: '2024 · Drama', badge: 'HD', hue: 220 },
      { title: 'Pulang', sub: '2023 · Drama', badge: '4K', hue: 40 },
      { title: 'Rindu Yang Hilang', sub: '2026 · Drama', badge: 'Baharu', hue: 300 },
      { title: 'Simfoni Senyap', sub: '2022 · Drama', badge: 'HD', hue: 160 },
      { title: 'Cinta di Musim Kemarau', sub: '2025 · Drama', badge: 'HD', hue: 25 },
    ],
  ];

  const rows = document.querySelectorAll('[data-row]');

  rows.forEach((rowEl, i) => {
    const items = rowData[i] || [];
    items.forEach(item => {
      rowEl.appendChild(buildPosterCard(item));
    });
  });

  function buildPosterCard({ title, sub, badge, hue }) {
    const card = document.createElement('div');
    card.className = 'poster-card';
    card.tabIndex = 0;

    const art = document.createElement('div');
    art.className = 'poster-art';
    art.style.background =
      `linear-gradient(160deg, hsl(${hue} 45% 20%) 0%, hsl(${hue + 25} 35% 10%) 55%, #0a0a0a 100%)`;

    const badgeEl = document.createElement('span');
    badgeEl.className = 'poster-badge';
    badgeEl.textContent = badge;

    const play = document.createElement('div');
    play.className = 'poster-play';
    play.innerHTML = `<svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="21" stroke="#FF6B5B" stroke-width="1.5" opacity="0.7"/>
        <path d="M18 14v16l13-8-13-8Z" fill="#FF6B5B"/>
      </svg>`;

    art.appendChild(badgeEl);
    art.appendChild(play);

    const meta = document.createElement('div');
    meta.className = 'poster-meta';
    meta.innerHTML = `<div class="poster-title">${title}</div><div class="poster-sub">${sub}</div>`;

    card.appendChild(art);
    card.appendChild(meta);
    return card;
  }

});

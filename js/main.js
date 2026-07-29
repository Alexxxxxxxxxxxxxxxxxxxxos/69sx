// ============================================================
// 69sx — main.js
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── TYPEWRITER ──────────────────────────────────────────
  const greetings = [
    "hello.", "hallo.", "hej.", "ciao.", "bonjour.", "hola.",
    "你好.", "こんにちは.", "안녕하세요.", "مرحبا.", "привет.",
    "olá.", "salut.", "yo.", "wagwan.", "safe.", "bless.",
    "what's good.", "easy now.", "y'alright."
  ];

  const helloEl = document.getElementById('hello-text');
  let greetIdx = 0;
  const typeSpeed = 80;
  const eraseSpeed = 45;
  const pauseMs = 1000;

  function typewrite(text, cb) {
    let i = 0;
    const iv = setInterval(() => {
      helloEl.textContent = text.substring(0, i + 1);
      i++;
      if (i > text.length) {
        clearInterval(iv);
        setTimeout(() => erase(cb), pauseMs);
      }
    }, typeSpeed);
  }

  function erase(cb) {
    let len = helloEl.textContent.length;
    const iv = setInterval(() => {
      len--;
      helloEl.textContent = helloEl.textContent.substring(0, len);
      if (len <= 0) {
        clearInterval(iv);
        if (cb) cb();
      }
    }, eraseSpeed);
  }

  function typeNext() {
    typewrite(greetings[greetIdx], () => {
      greetIdx = (greetIdx + 1) % greetings.length;
      setTimeout(typeNext, 300);
    });
  }

  typeNext();

  // Kill cursor after a while
  setTimeout(() => {
    const cursors = document.querySelectorAll('.cursor');
    cursors.forEach(c => {
      c.style.animation = 'none';
      c.style.opacity = '0';
    });
  }, 15000);

  // ── WEATHER ─────────────────────────────────────────────
  function updateWeather() {
    fetch('https://wttr.in/?format=j1')
      .then(r => r.json())
      .then(data => {
        const current = data.current_condition[0];
        const temp = current.temp_C;
        const desc = current.weatherDesc[0].value.toLowerCase()
          .replace(/partly cloudy/gi, 'pcldy')
          .replace(/cloudy/gi, 'cldy')
          .replace(/overcast/gi, 'ovrcst')
          .replace(/light rain/gi, 'rain')
          .replace(/moderate rain/gi, 'rain')
          .replace(/heavy rain/gi, 'rain')
          .replace(/clear sky/gi, 'clear')
          .replace(/sunny/gi, 'clear')
          .replace(/mist/gi, 'mist')
          .replace(/fog/gi, 'fog');

        const el = document.getElementById('weather');
        if (el) {
          el.textContent = `${desc} · ${temp}°c  —  london`;
          if (!el.dataset.seen) {
            el.style.opacity = '0.35';
            el.dataset.seen = '1';
          }
        }
      })
      .catch(() => {});
  }

  updateWeather();
  setInterval(updateWeather, 120000);

  // ── PHOTO DATA ──────────────────────────────────────────
  const photos = [
    {
      src: 'assets/photos/temp_image_1784892226361.jpeg',
      thumb: 'assets/photos/temp_image_1784892226361.jpeg',
      camera: 'Nikon Z6Ⅲ',
      lens: 'NIKKOR Z 24-70mm f/4 S',
      aperture: 'ƒ/4.0',
      focal: '42mm',
      shutter: '1/640',
      iso: 'ISO 6400',
      location: 'london bridge'
    },
    {
      src: 'assets/photos/temp_image_1784892230103.jpeg',
      thumb: 'assets/photos/temp_image_1784892230103.jpeg',
      camera: 'Nikon Z6Ⅲ',
      lens: 'NIKKOR Z 24-70mm f/4 S',
      aperture: 'ƒ/4.0',
      focal: '70mm',
      shutter: '1/400',
      iso: 'ISO 12800',
      location: 'the city'
    },
    {
      src: 'assets/photos/temp_image_1784892233400.jpeg',
      thumb: 'assets/photos/temp_image_1784892233400.jpeg',
      camera: 'Nikon Z6Ⅲ',
      lens: 'NIKKOR Z 24-70mm f/4 S',
      aperture: 'ƒ/4.0',
      focal: '54mm',
      shutter: '1/100',
      iso: 'ISO 1600',
      location: 'bermondsey'
    }
  ];

  // ── POPULATE PHOTO GRID ─────────────────────────────────
  const grid = document.getElementById('photos-grid');
  if (grid) {
    photos.forEach((p, i) => {
      const frame = document.createElement('div');
      frame.className = 'photo-frame';
      frame.innerHTML = `
        <img src="${p.thumb}" alt="" loading="${i === 0 ? 'eager' : 'lazy'}">
        <span class="photo-num">${String(i + 1).padStart(3, '0')}</span>
      `;
      frame.addEventListener('click', () => openLightbox(p));
      grid.appendChild(frame);
    });
  }

  // ── LIGHTBOX ────────────────────────────────────────────
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbMeta = document.getElementById('lightbox-meta');
  const lbClose = lightbox.querySelector('.lightbox-close');
  const lbBackdrop = lightbox.querySelector('.lightbox-backdrop');

  function openLightbox(photo) {
    lbImg.src = photo.src;
    lbImg.alt = photo.location || '';
    lbMeta.innerHTML = `
      <span><span class="meta-label">camera</span> <span class="meta-value">${photo.camera}</span></span>
      <span><span class="meta-label">lens</span> <span class="meta-value">${photo.lens}</span></span>
      <span><span class="meta-label">aperture</span> <span class="meta-value">${photo.aperture}</span></span>
      <span><span class="meta-label">focal</span> <span class="meta-value">${photo.focal}</span></span>
      <span><span class="meta-label">shutter</span> <span class="meta-value">${photo.shutter}</span></span>
      <span><span class="meta-label">iso</span> <span class="meta-value">${photo.iso}</span></span>
      ${photo.location ? `<span><span class="meta-label">📍</span> <span class="meta-value">${photo.location}</span></span>` : ''}
    `;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  lbClose.addEventListener('click', closeLightbox);
  lbBackdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });

  // ── LAST.FM ─────────────────────────────────────────────
  const LASTFM_KEY = 'db39bd17b8f07c587cb868d863c814ef';
  const LASTFM_USER = 'qehk';

  async function loadLastFM() {
    const el = document.getElementById('now-playing');
    if (!el) return;

    try {
      const res = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${LASTFM_USER}&api_key=${LASTFM_KEY}&format=json&limit=1`
      );
      const data = await res.json();
      const track = data.recenttracks?.track?.[0];
      if (!track) {
        el.innerHTML = '<span style="font-family:\'SF Mono\',monospace;font-size:11px;color:#bbb;">no scrobbles yet</span>';
        return;
      }

      const artist = track.artist?.['#text'] || 'Unknown';
      const name = track.name || 'Unknown';
      const nowPlaying = track['@attr']?.nowplaying === 'true';
      const images = track.image || [];
      const artUrl = images.length ? images[images.length - 1]['#text'] : null;

      el.innerHTML = `
        ${artUrl ? `<img class="np-thumb" src="${artUrl}" alt="" loading="lazy">` : ''}
        <div class="np-text">
          <div class="np-label">${nowPlaying ? 'now playing' : 'last played'}</div>
          <div class="np-track">${name}</div>
          <div class="np-artist">${artist}</div>
        </div>
      `;
    } catch (e) {
      el.innerHTML = '<span style="font-family:\'SF Mono\',monospace;font-size:11px;color:#bbb;">offline</span>';
    }
  }

  loadLastFM();
  setInterval(loadLastFM, 45000);

});

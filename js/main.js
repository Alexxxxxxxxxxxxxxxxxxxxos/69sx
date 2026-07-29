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
  const typeSpeed = 80, eraseSpeed = 45, pauseMs = 1000;

  function typewrite(text, cb) {
    let i = 0;
    const iv = setInterval(() => {
      helloEl.textContent = text.substring(0, i + 1);
      i++;
      if (i > text.length) { clearInterval(iv); setTimeout(() => erase(cb), pauseMs); }
    }, typeSpeed);
  }

  function erase(cb) {
    let len = helloEl.textContent.length;
    const iv = setInterval(() => {
      len--;
      helloEl.textContent = helloEl.textContent.substring(0, len);
      if (len <= 0) { clearInterval(iv); if (cb) cb(); }
    }, eraseSpeed);
  }

  function typeNext() {
    typewrite(greetings[greetIdx], () => {
      greetIdx = (greetIdx + 1) % greetings.length;
      setTimeout(typeNext, 300);
    });
  }

  typeNext();

  setTimeout(() => {
    document.querySelectorAll('.cursor').forEach(c => {
      c.style.animation = 'none'; c.style.opacity = '0';
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
          .replace(/light rain|moderate rain|heavy rain/gi, 'rain')
          .replace(/clear sky|sunny/gi, 'clear')
          .replace(/mist|fog/gi, 'fog');

        const el = document.getElementById('weather');
        if (el) {
          el.textContent = `${desc} · ${temp}°c  —  london`;
          if (!el.dataset.seen) { el.style.opacity = '0.35'; el.dataset.seen = '1'; }
        }
      })
      .catch(() => {});
  }

  updateWeather();
  setInterval(updateWeather, 120000);

  // ── SCROLL REVEAL + PARALLAX ────────────────────────────
  const revealEls = document.querySelectorAll('.hero-about, footer');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  const parallaxBgs = document.querySelectorAll('.hero-bg');
  function updateParallax() {
    const scrollY = window.scrollY;
    parallaxBgs.forEach(bg => {
      const section = bg.closest('section') || bg.parentElement;
      const rect = section.getBoundingClientRect();
      const offset = (scrollY - (rect.top + scrollY)) * 0.15;
      bg.style.transform = `translateY(${offset}px)`;
    });
  }

  window.addEventListener('scroll', updateParallax, { passive: true });
  updateParallax();

  // ── CONTACT FORM ────────────────────────────────────────
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('form-status');
      status.textContent = 'sending...';
      status.className = 'form-status';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          status.textContent = 'sent. talk soon.';
          status.className = 'form-status success';
          form.reset();
        } else {
          status.textContent = 'something went wrong. try again?';
          status.className = 'form-status error';
        }
      } catch (err) {
        status.textContent = 'couldn\'t send. check your connection.';
        status.className = 'form-status error';
      }
    });
  }

});

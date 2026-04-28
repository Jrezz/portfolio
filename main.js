// ----- Typewriter -----
const roles = ['Data Engineering', 'Software Engineering', 'Machine Learning'];
let roleIdx = 0, charIdx = 0, deleting = false;
const typeEl = document.getElementById('typewriter');

function tick() {
  const current = roles[roleIdx];
  if (deleting) {
    typeEl.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      setTimeout(tick, 420);
      return;
    }
  } else {
    typeEl.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(tick, 1900);
      return;
    }
  }
  setTimeout(tick, deleting ? 42 : 78);
}

tick();

// ----- Canvas particle network -----
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  const ACCENT = '143, 182, 255';
  const N = 58;
  const LINK_DIST = 135;
  const MOUSE_DIST = 190;

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  // Build particles
  const pts = Array.from({ length: N }, () => ({
    x:  Math.random() * window.innerWidth,
    y:  Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.32,
    vy: (Math.random() - 0.5) * 0.32,
    r:  Math.random() * 1.2 + 0.7,
  }));

  function line(x1, y1, x2, y2, alpha) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
    ctx.lineWidth = 0.75;
    ctx.stroke();
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < N; i++) {
      const p = pts[i];

      // drift & bounce
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT}, 0.5)`;
      ctx.fill();

      // particle ↔ particle links (only check pairs once)
      for (let j = i + 1; j < N; j++) {
        const q = pts[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        if (Math.abs(dx) > LINK_DIST || Math.abs(dy) > LINK_DIST) continue;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK_DIST) line(p.x, p.y, q.x, q.y, (1 - d / LINK_DIST) * 0.13);
      }

      // particle → mouse link
      const mx = p.x - mouse.x, my = p.y - mouse.y;
      if (Math.abs(mx) < MOUSE_DIST && Math.abs(my) < MOUSE_DIST) {
        const md = Math.sqrt(mx * mx + my * my);
        if (md < MOUSE_DIST) line(p.x, p.y, mouse.x, mouse.y, (1 - md / MOUSE_DIST) * 0.28);
      }
    }

    raf = requestAnimationFrame(frame);
  }

  let raf = requestAnimationFrame(frame);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(frame);
  });
})();

// ----- Dynamic year -----
document.getElementById('year').textContent = new Date().getFullYear();

// ----- Topbar scroll shadow -----
const topbar = document.getElementById('topbar');
window.addEventListener('scroll', () => {
  topbar.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

// ----- Scroll reveal -----
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ----- Active nav tracking -----
const navLinks = document.querySelectorAll('.top-nav a[data-nav]');

const navObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const link = document.querySelector(`.top-nav a[data-nav="${e.target.id}"]`);
      if (link) link.classList.add('active');
    }
  });
}, { threshold: 0.35 });

document.querySelectorAll('section[id]').forEach(s => navObs.observe(s));

// Shared JS – strong neon animations, particles, UI behaviour

// Dynamic years
['year','year2','year3','year4'].forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.textContent = new Date().getFullYear();
});

// Theme toggle (persist)
const themeBtns = document.querySelectorAll('[aria-label="Toggle theme"]');
const body = document.body;
const stored = localStorage.getItem('theme');
if (stored === 'dark') {
  body.classList.add('theme-c');
} else {
  body.classList.remove('theme-c');
}

themeBtns.forEach(b => {
  if (b) {
    b.textContent = body.classList.contains('theme-c') ? '🌙' : '☀️';
    b.addEventListener('click', () => {
      body.classList.toggle('theme-c');
      const isDark = body.classList.contains('theme-c');
      themeBtns.forEach(btn => btn.textContent = isDark ? '🌙' : '☀️');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
});

// Nav highlight based on path
(function highlight(){
  const links = document.querySelectorAll('.main-nav .nav-link');
  const path = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => { if(a.getAttribute('href') === path) a.classList.add('active'); });
})();

// Hover-tilt effect (mouse parallax) for .hover-tilt elements
document.querySelectorAll('.hover-tilt').forEach(card=>{
  card.addEventListener('mousemove', (e)=>{
      if (e.target.tagName === 'A') return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width/2) / r.width;
    const y = (e.clientY - r.top - r.height/2) / r.height;
    card.style.transform = `perspective(900px) rotateX(${ -y * 6 }deg) rotateY(${ x * 8 }deg) translateZ(6px)`;
  });
  card.addEventListener('mouseleave', ()=> card.style.transform = '');
});

// Project filters
document.querySelectorAll('.filters').forEach(filterGroup => {
  const buttons = filterGroup.querySelectorAll('.filter');
  const scope = filterGroup.closest('.filter-scope');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const type = btn.dataset.filter;

      scope.querySelectorAll('.project-card').forEach(card => {
        card.style.display =
          type === 'all' || card.dataset.type === type ? '' : 'none';
      });
    });
  });
});


// Modal behavior
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
document.querySelectorAll('.open-modal').forEach(btn=> btn.addEventListener('click', ()=> openProjectModal(btn.dataset.id)));
document.querySelectorAll('.modal-close').forEach(x=> x.addEventListener('click', ()=> modal && modal.setAttribute('aria-hidden','true')));
modal && modal.addEventListener('click', e => { if(e.target === modal) modal.setAttribute('aria-hidden','true'); });

function openProjectModal(id){
  const map = {
    '1': { title:'Public Transport Tracker', body:'Real-time tracker with maps, ETA and route planning. Built using vanilla JS + REST APIs.' },
    '2': { title:'Knowzilla Presentation', body:'PowerPoint developed from the Knowzilla report using a professional Canva template.' },
    '3': { title:'City Services Prototype', body:'Android prototype including transport tracker, garbage pickup alerts and facility locator.' }
  };
  const p = map[id] || { title:'Project', body:'Details coming soon.' };
  modalContent && (modalContent.innerHTML = `<h3>${p.title}</h3><p>${p.body}</p><p class="muted"><strong>Tech:</strong> JS • Node • Android</p>`);
  modal && modal.setAttribute('aria-hidden','false');
}

// Contact form post
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const status = document.getElementById('contactStatus');
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Sending...';
    const data = { name: contactForm.name.value, email: contactForm.email.value, message: contactForm.message.value };
    try {
      const res = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
      if (res.ok) { status.textContent = 'Message sent! Thank you.'; contactForm.reset(); }
      else { const j = await res.json().catch(()=>null); status.textContent = j && j.error ? j.error : 'Error sending message.'; }
    } catch(err) { status.textContent = 'Network error.'; console.error(err); }
  });
}

// Intersection reveal
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('in-view'); });
}, { threshold: 0.12 });
document.querySelectorAll('.feature, .project-card, .neon-card, .about-card').forEach(el => io.observe(el));

// ---------- HERO PARTICLES (canvas) ----------
(function heroParticles(){
  const canvas = document.getElementById('heroParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let DPR = window.devicePixelRatio || 1;
  function resize(){
    canvas.width = window.innerWidth * DPR;
    canvas.height = window.innerHeight * DPR;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(DPR,DPR);
  }
  window.addEventListener('resize', resize);
  resize();

  // particle data
  const particles = [];
  const count = Math.max(28, Math.floor(window.innerWidth / 40));
  for (let i=0;i<count;i++){
    particles.push({
      x: Math.random()*window.innerWidth,
      y: Math.random()*window.innerHeight,
      r: 0.8 + Math.random()*2.2,
      vx: (Math.random()-0.5)*0.2,
      vy: -0.1 - Math.random()*0.3,
      alpha: 0.06 + Math.random()*0.14,
      hue: 180 + Math.random()*120
    });
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width/DPR,canvas.height/DPR);
    // blurred background glow
    particles.forEach(p=>{
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) p.y = window.innerHeight + 10;
      if (p.x < -20) p.x = window.innerWidth + 20;
      if (p.x > window.innerWidth + 20) p.x = -20;
      // draw halo
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*12);
      g.addColorStop(0, `hsla(${p.hue}, 90%, 60%, ${p.alpha})`);
      g.addColorStop(1, `hsla(${p.hue}, 80%, 40%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r*12, 0, Math.PI*2);
      ctx.fill();
    });

    // connect close particles with lines (subtle)
    for (let i=0;i<particles.length;i++){
      for (let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if (d < 140){
          ctx.strokeStyle = `rgba(32,200,255,${Math.max(0, 0.04 - d/600)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();


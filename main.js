// ----- 3D cover-flow logic (vanilla JS) -----
const stage = document.getElementById('stage');
const cards = Array.from(stage.querySelectorAll('.card'));
let index = 0;

function layout(active){
  const gapX = 215;     // spacing
  const angle = -26;    // rotateY per step
  const depth = 110;    // push back per step
  const scaleFalloff = .09;

  cards.forEach((card,i)=>{
    const off = i - active;
    const abs = Math.abs(off);
    const z = -abs * depth;
    const x = off * gapX;
    const rot = off * angle;

    card.style.zIndex = String(100 - abs);
    card.style.opacity = abs > 3 ? 0 : 1 - Math.max(0, abs - 0.15)/3;
    card.style.filter = abs ? "blur(.15px) saturate(.95)" : "none";

    const s = 1 - (abs * scaleFalloff);
    card.style.transform =
      `translate3d(${x}px, 0, ${z}px) rotateY(${rot}deg) scale(${s})`;
    card.setAttribute('aria-hidden', abs !== 0);
  });
}

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }
function next(){ index = clamp(index+1, 0, cards.length-1); layout(index); }
function prev(){ index = clamp(index-1, 0, cards.length-1); layout(index); }

document.querySelector('.next').addEventListener('click', next);
document.querySelector('.prev').addEventListener('click', prev);

// Keyboard
window.addEventListener('keydown', e=>{
  if(e.key === 'ArrowRight') next();
  if(e.key === 'ArrowLeft')  prev();
});

// Pointer swipe/drag
let startX = null, dragging = false;

stage.addEventListener('pointerdown', e=>{
  startX = e.clientX;
  dragging = true;
  e.currentTarget.setPointerCapture(e.pointerId);
});

stage.addEventListener('pointermove', e=>{
  if(!dragging || startX===null) return;
  const dx = e.clientX - startX;
  stage.style.transform = `rotateY(${dx/90}deg)`; // tilt while dragging
});

function endDrag(e){
  if(startX===null) return;
  const dx = e.clientX - startX;
  stage.style.transform = '';
  if(Math.abs(dx) > 40){ dx < 0 ? next() : prev(); }
  startX = null; dragging = false;
}

stage.addEventListener('pointerup', endDrag);
stage.addEventListener('pointercancel', endDrag);
stage.addEventListener('mouseleave', endDrag);

// Initial render
layout(index);

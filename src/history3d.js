/**
 * history3d.js — IMAGE COVERFLOW + DETAIL PANEL
 * ───────────────────────────────────────────────
 * Layout (per user sketch):
 *   ┌─────────────────────────────────────────────┐
 *   │   [img]    [IMG]    [img]    [img]           │  ← image thumbnails row
 *   │            ┌──────────────────┐              │
 *   │            │  2010            │              │  ← detail panel (active)
 *   │            │  Dự án đầu tiên  │              │
 *   │            │  Description...  │              │
 *   │            │  2,000 tấn thép  │              │
 *   │            └──────────────────┘              │
 *   │    ● ─── ● ─── ● ─── ● ─── ● ─── ●         │  ← timeline dots
 *   └─────────────────────────────────────────────┘
 *
 * Three.js: ambient background only (starfield, particles).
 * Cards: pure HTML/CSS with 3D transforms (coverflow).
 * Hover: card scales up. Click: selects that milestone.
 */

import * as THREE from 'three';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://hafiotcabigmdpoocddu.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZmlvdGNhYmlnbWRwb29jZGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzU2NDEsImV4cCI6MjA5MDUxMTY0MX0.22BAFw0LXsomxY0PtD3V-5G5yGFa2F5gmCUNVr4tyrk';
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

// ══════════════════════════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════════════════════════
let renderer, scene, camera, starfield, animationId;
let isInitialized = false;
let activeIndex = 0;
let _milestones = [];
let _sectionEl, _overlayEl, _progressEl, _detailEl;

// ── Default milestone data ────────────────────────────────────────────────────
const DEFAULT_MILESTONES = [
  { year: 2008, title: 'Thành lập công ty',      description: 'Công ty CP Phát triển Đầu tư và Xây lắp Tiến Thịnh được thành lập tại Hà Nội với định hướng chuyên sâu về kết cấu thép công nghiệp.', stat_value: '5',       stat_label: 'Thành viên sáng lập',    color: '#f59e0b', image_url: '', link_url: '' },
  { year: 2010, title: 'Dự án đầu tiên',          description: 'Hoàn thành dự án nhà xưởng kết cấu thép đầu tiên tại Hưng Yên, đánh dấu bước đột phá trong lĩnh vực xây dựng công nghiệp PEB.', stat_value: '2,000',   stat_label: 'Tấn thép lắp đặt',       color: '#3b82f6', image_url: '', link_url: '' },
  { year: 2013, title: 'Mở rộng quy mô',          description: 'Mở rộng đội ngũ lên 50+ kỹ sư và công nhân lành nghề. Triển khai thành công các dự án tại các khu công nghiệp miền Bắc.',            stat_value: '50+',     stat_label: 'Kỹ sư & nhân viên',      color: '#8b5cf6', image_url: '', link_url: '' },
  { year: 2015, title: 'Chứng nhận ISO 9001',      description: 'Đạt chứng nhận hệ thống quản lý chất lượng ISO 9001:2015, khẳng định cam kết chất lượng quốc tế.',                                   stat_value: '3',       stat_label: 'Chứng chỉ quốc tế',      color: '#22c55e', image_url: '', link_url: '' },
  { year: 2017, title: 'Mốc 100 công trình',       description: 'Hoàn thành công trình thứ 100, bao gồm nhà xưởng, kho bãi, tòa nhà văn phòng thép trên toàn quốc.',                                  stat_value: '100+',    stat_label: 'Công trình hoàn thành',   color: '#ef4444', image_url: '', link_url: '' },
  { year: 2019, title: 'Đối tác FDI',              description: 'Trở thành đối tác tin cậy của các tập đoàn FDI lớn: Samsung, LG, Foxconn tại KCN Bắc Ninh, Thái Nguyên.',                            stat_value: '15+',     stat_label: 'Tập đoàn FDI',           color: '#06b6d4', image_url: '', link_url: '' },
  { year: 2021, title: 'Đổi mới công nghệ',        description: 'Ứng dụng công nghệ BIM (Building Information Modeling) vào thiết kế và thi công, nâng tầm chất lượng dự án.',                         stat_value: '30%',     stat_label: 'Giảm thời gian thi công', color: '#f59e0b', image_url: '', link_url: '' },
  { year: 2023, title: 'Phát triển bền vững',      description: 'Triển khai giải pháp xây dựng xanh, mở rộng dự án ra thị trường quốc tế. Tổng sản lượng thép vượt 50,000 tấn.',                       stat_value: '50,000+', stat_label: 'Tấn thép tích lũy',      color: '#10b981', image_url: '', link_url: '' },
  { year: 2025, title: 'Tầm nhìn tương lai',       description: 'Định hướng trở thành nhà thầu hàng đầu Đông Nam Á về kết cấu thép công nghiệp, mở rộng dự án ra thị trường quốc tế.',                stat_value: '200+',    stat_label: 'Dự án mục tiêu',         color: '#8b5cf6', image_url: '', link_url: '' },
];

// ── Fetch ─────────────────────────────────────────────────────────────────────
async function fetchMilestones() {
  try {
    const { data, error } = await db
      .from('history_milestones')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error || !data?.length) return DEFAULT_MILESTONES;
    return data;
  } catch { return DEFAULT_MILESTONES; }
}

// SVG icon map (used when no image_url is set)
const ICONS = {
  2008: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="14" width="32" height="24" rx="3"/><path d="M24 14V8M16 8h16"/><circle cx="24" cy="26" r="5"/></svg>`,
  2010: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 40l8-16 6 8 8-20 10 28"/><rect x="4" y="38" width="40" height="4" rx="1"/></svg>`,
  2013: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="18" cy="16" r="5"/><circle cx="32" cy="18" r="4"/><path d="M6 40c0-6 6-10 12-10 2 0 3.5.4 5 1.2M26 40c0-5 4-8 8-8s8 3 8 8"/></svg>`,
  2015: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="24" cy="24" r="18"/><path d="M16 24l5 5 11-11"/></svg>`,
  2017: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 40V20l18-12 18 12v20"/><rect x="18" y="28" width="12" height="12"/><path d="M24 28v12"/></svg>`,
  2019: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="24" cy="24" r="18"/><path d="M24 6v36M6 24h36M12 12l24 24M36 12L12 36"/></svg>`,
  2021: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="6" width="32" height="36" rx="3"/><path d="M16 18h16M16 24h10M16 30h13"/><circle cx="36" cy="36" r="8" fill="rgba(59,130,246,0.2)"/><path d="M36 32v4h4"/></svg>`,
  2023: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M24 4L6 14v20l18 10 18-10V14z"/><path d="M24 24v20M6 14l18 10M42 14L24 24"/></svg>`,
  2025: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M24 4l6 12h14l-10 8 4 14-14-8-14 8 4-14L4 16h14z"/></svg>`,
};

function getIcon(year) {
  return ICONS[year] || ICONS[2008];
}

// ══════════════════════════════════════════════════════════════════════════════
//  THREE.JS — AMBIENT BACKGROUND ONLY
// ══════════════════════════════════════════════════════════════════════════════
function createScene(canvas) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030812);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
  camera.position.set(0, 0, 20);

  // Starfield
  const count = 2000;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r     = 20 + Math.random() * 60;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.cos(phi);
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x6e8cce, size: 0.06, transparent: true, opacity: 0.3,
    sizeAttenuation: true, depthWrite: false,
  });
  starfield = new THREE.Points(geo, mat);
  scene.add(starfield);
}

let _tick = 0;
function animLoop() {
  animationId = requestAnimationFrame(animLoop);
  _tick += 0.003;
  if (starfield) starfield.rotation.y += 0.00006;
  if (camera) camera.position.y = Math.sin(_tick * 0.5) * 0.15;
  renderer.render(scene, camera);
}

// ══════════════════════════════════════════════════════════════════════════════
//  HTML: IMAGE CARDS ROW (coverflow)
// ══════════════════════════════════════════════════════════════════════════════
function buildImageCards(milestones, overlayEl) {
  overlayEl.innerHTML = '';

  // Card strip container (enables CSS 3D transforms)
  const strip = document.createElement('div');
  strip.className = 'h3d-strip';
  strip.id = 'h3dStrip';

  milestones.forEach((ms, i) => {
    const card = document.createElement('div');
    card.className = 'h3d-imgcard';
    card.dataset.index = i;
    card.style.setProperty('--accent', ms.color || '#3b82f6');

    // Image or icon placeholder
    if (ms.image_url) {
      card.innerHTML = `
        <img class="h3d-imgcard__img" src="${ms.image_url}" alt="${ms.title}" loading="lazy" />
        <div class="h3d-imgcard__overlay">
          <span class="h3d-imgcard__year">${ms.year}</span>
          <span class="h3d-imgcard__label">${ms.title}</span>
        </div>
        ${ms.link_url ? '<span class="h3d-imgcard__link-hint" title="Xem chi tiết">&#8599;</span>' : ''}
      `;
    } else {
      card.innerHTML = `
        <div class="h3d-imgcard__icon" style="color:var(--accent)">
          ${getIcon(ms.year)}
        </div>
        <div class="h3d-imgcard__overlay">
          <span class="h3d-imgcard__year">${ms.year}</span>
          <span class="h3d-imgcard__label">${ms.title}</span>
        </div>
        ${ms.link_url ? '<span class="h3d-imgcard__link-hint" title="Xem chi tiết">&#8599;</span>' : ''}
      `;
    }

    // Click → if active card AND has link → navigate, else just select
    card.addEventListener('click', () => {
      if (i === activeIndex && ms.link_url) {
        // Internal path (starts with /) → SPA navigation; external → new tab
        const url = ms.link_url.trim();
        if (url.startsWith('/') || url.startsWith(window.location.origin)) {
          window.location.href = url;
        } else {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      } else {
        setActive(i);
      }
    });

    strip.appendChild(card);
  });

  overlayEl.appendChild(strip);
}

// ══════════════════════════════════════════════════════════════════════════════
//  HTML: DETAIL PANEL (below cards)
// ══════════════════════════════════════════════════════════════════════════════
function buildDetailPanel(overlayEl) {
  const panel = document.createElement('div');
  panel.className = 'h3d-detail';
  panel.id = 'h3dDetail';
  panel.innerHTML = `
    <div class="h3d-detail__connector"></div>
    <div class="h3d-detail__body">
      <div class="h3d-detail__year"></div>
      <div class="h3d-detail__title"></div>
      <div class="h3d-detail__desc"></div>
      <div class="h3d-detail__stat">
        <span class="h3d-detail__stat-value"></span>
        <span class="h3d-detail__stat-label"></span>
      </div>
      <a class="h3d-detail__link" href="#" target="_self" style="display:none">
        <span>Xem chi tiết</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
    </div>
  `;
  overlayEl.appendChild(panel);
  _detailEl = panel;
}

// ══════════════════════════════════════════════════════════════════════════════
//  HTML: PROGRESS DOTS
// ══════════════════════════════════════════════════════════════════════════════
function buildProgressDots(milestones, progressEl) {
  progressEl.innerHTML = '';
  milestones.forEach((ms, i) => {
    const btn       = document.createElement('button');
    btn.className   = 'h3d-progress__dot';
    btn.dataset.index = i;
    btn.style.setProperty('--c', ms.color || '#3b82f6');
    btn.title       = `${ms.year} — ${ms.title}`;
    btn.addEventListener('click', () => setActive(i));
    progressEl.appendChild(btn);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  SET ACTIVE INDEX — drives everything
// ══════════════════════════════════════════════════════════════════════════════
function setActive(idx) {
  idx = Math.max(0, Math.min(_milestones.length - 1, idx));
  activeIndex = idx;
  updateStrip();
  updateDetail();
  updateDots();
}

// ── Update image strip positions (CSS coverflow) ──────────────────────────────
function updateStrip() {
  const strip = document.getElementById('h3dStrip');
  if (!strip) return;

  const cards = strip.querySelectorAll('.h3d-imgcard');
  cards.forEach((card, i) => {
    const diff = i - activeIndex; // negative = left, positive = right
    const absDiff = Math.abs(diff);

    // Remove all state classes
    card.classList.remove('h3d-imgcard--active', 'h3d-imgcard--near', 'h3d-imgcard--far', 'h3d-imgcard--hidden');

    if (absDiff === 0) {
      card.classList.add('h3d-imgcard--active');
    } else if (absDiff === 1) {
      card.classList.add('h3d-imgcard--near');
    } else if (absDiff === 2) {
      card.classList.add('h3d-imgcard--far');
    } else {
      card.classList.add('h3d-imgcard--hidden');
    }

    card.dataset.side = diff < 0 ? 'left' : diff > 0 ? 'right' : 'center';
    card.style.setProperty('--diff', diff);
    card.style.setProperty('--abs', absDiff);
  });
}

// ── Update detail panel ───────────────────────────────────────────────────────
function updateDetail() {
  if (!_detailEl || !_milestones[activeIndex]) return;
  const ms = _milestones[activeIndex];

  _detailEl.style.setProperty('--accent', ms.color || '#3b82f6');

  // Trigger slide-in animation
  const body = _detailEl.querySelector('.h3d-detail__body');
  body.classList.remove('h3d-detail--animate');
  void body.offsetWidth; // force reflow
  body.classList.add('h3d-detail--animate');

  _detailEl.querySelector('.h3d-detail__year').textContent = ms.year;
  _detailEl.querySelector('.h3d-detail__title').textContent = ms.title;
  _detailEl.querySelector('.h3d-detail__desc').textContent = ms.description || '';

  const statVal = _detailEl.querySelector('.h3d-detail__stat-value');
  const statLbl = _detailEl.querySelector('.h3d-detail__stat-label');
  if (ms.stat_value) {
    statVal.textContent = ms.stat_value;
    statLbl.textContent = ms.stat_label || '';
    _detailEl.querySelector('.h3d-detail__stat').style.display = '';
  } else {
    _detailEl.querySelector('.h3d-detail__stat').style.display = 'none';
  }

  // Link button
  const linkEl = _detailEl.querySelector('.h3d-detail__link');
  if (linkEl) {
    if (ms.link_url) {
      const url = ms.link_url.trim();
      linkEl.href = url;
      // Internal links open within SPA; external open new tab
      linkEl.target = (url.startsWith('/') || url.startsWith(window.location.origin)) ? '_self' : '_blank';
      if (linkEl.target === '_blank') linkEl.rel = 'noopener noreferrer';
      linkEl.style.display = 'flex';
    } else {
      linkEl.style.display = 'none';
    }
  }
}

// ── Update progress dots ──────────────────────────────────────────────────────
function updateDots() {
  if (!_progressEl) return;
  _progressEl.querySelectorAll('.h3d-progress__dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === activeIndex);
    dot.classList.toggle('passed', i < activeIndex);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  RESIZE HANDLER
// ══════════════════════════════════════════════════════════════════════════════
function onResize(canvas) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

// ══════════════════════════════════════════════════════════════════════════════
//  PUBLIC: init
// ══════════════════════════════════════════════════════════════════════════════
export async function initHistory3D(sectionEl) {
  if (isInitialized) return;
  _sectionEl = sectionEl;

  const canvas     = sectionEl.querySelector('#h3dCanvas');
  const overlayEl  = sectionEl.querySelector('#h3dOverlay');
  const progressEl = sectionEl.querySelector('#h3dProgress');
  if (!canvas) return;

  _overlayEl   = overlayEl;
  _progressEl  = progressEl;

  const milestones = await fetchMilestones();
  _milestones = milestones;

  // Build Three.js ambient background
  createScene(canvas);

  // Build HTML UI
  buildImageCards(milestones, overlayEl);
  buildDetailPanel(overlayEl);
  buildProgressDots(milestones, progressEl);

  // Initial state
  setActive(0);

  // ── Scroll: prev/next ──
  sectionEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY > 20) setActive(activeIndex + 1);
    else if (e.deltaY < -20) setActive(activeIndex - 1);
  }, { passive: false });

  // Debounce scroll to prevent skipping
  let scrollLocked = false;
  sectionEl.addEventListener('wheel', () => {
    if (!scrollLocked) {
      scrollLocked = true;
      setTimeout(() => { scrollLocked = false; }, 350);
    }
  }, { passive: true });

  // Touch swipe
  let startX = 0;
  sectionEl.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  sectionEl.addEventListener('touchend', e => {
    const dx = startX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) {
      setActive(activeIndex + (dx > 0 ? 1 : -1));
    }
  }, { passive: true });

  // Keyboard
  sectionEl.setAttribute('tabindex', '0');
  sectionEl.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault(); setActive(activeIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault(); setActive(activeIndex - 1);
    }
  });

  // Resize
  const ro = new ResizeObserver(() => onResize(canvas));
  ro.observe(sectionEl);

  // Hide scroll hint on first interaction
  const hint = sectionEl.querySelector('#h3dHint');
  const hideHint = () => { if (hint) { hint.style.opacity = '0'; hint.style.pointerEvents = 'none'; } };
  sectionEl.addEventListener('wheel',   hideHint, { once: true });
  sectionEl.addEventListener('touchend', hideHint, { once: true });

  animLoop();
  isInitialized = true;
}

// ══════════════════════════════════════════════════════════════════════════════
//  PUBLIC: destroy
// ══════════════════════════════════════════════════════════════════════════════
export function destroyHistory3D() {
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) { renderer.dispose(); renderer = null; }
  scene = null; camera = null; starfield = null;
  isInitialized = false;
  activeIndex = 0;
  _milestones = [];
}

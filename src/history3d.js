/**
 * history3d.js — UNIFIED MILESTONE CARD + EXPANDABLE 3D CUBES
 * ─────────────────────────────────────────────────────────────
 * Layout:
 *   ┌──────────────────────────────────────┐
 *   │  ┌────────────────────────────────┐  │
 *   │  │   2010                         │  │  ← year
 *   │  │   Dự án đầu tiên              │  │  ← title
 *   │  │   Description text...          │  │  ← desc
 *   │  │   2,000  Tấn thép lắp đặt     │  │  ← stat
 *   │  │                                │  │
 *   │  │  ▼ 3 dự án ──── hover to open  │  │  ← hint
 *   │  │  ┌────┐ ┌────┐ ┌────┐          │  │  ← 3D cubes (expanded)
 *   │  │  │cube│ │cube│ │cube│          │  │
 *   │  │  └────┘ └────┘ └────┘          │  │
 *   │  └────────────────────────────────┘  │
 *   │     ● ─── ● ─── ● ─── ● ─── ●       │  ← progress dots
 *   └──────────────────────────────────────┘
 *
 * Three.js: ambient background only (starfield, particles).
 * Single large card per milestone, cycles via scroll/swipe/dots.
 * Hover or click → cubes expand within the card.
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
let isExpanded = false;
let _milestones = [];
let _allProjects = [];
let _onProjectClick = null;
let _sectionEl, _overlayEl, _progressEl;
let _cardEl;       // the single unified card
let _cubesArea;    // cubes container inside the card

// ── Defaults ──────────────────────────────────────────────────────────────────
const DEFAULT_MILESTONES = [
  { year: 2008, title: 'Thành lập công ty',      description: 'Công ty CP Phát triển Đầu tư và Xây lắp Tiến Thịnh được thành lập tại Hà Nội với định hướng chuyên sâu về kết cấu thép công nghiệp.', stat_value: '5',       stat_label: 'Thành viên sáng lập',    color: '#f59e0b' },
  { year: 2010, title: 'Dự án đầu tiên',          description: 'Hoàn thành dự án nhà xưởng kết cấu thép đầu tiên tại Hưng Yên, đánh dấu bước đột phá trong lĩnh vực xây dựng công nghiệp PEB.', stat_value: '2,000',   stat_label: 'Tấn thép lắp đặt',       color: '#3b82f6' },
  { year: 2013, title: 'Mở rộng quy mô',          description: 'Mở rộng đội ngũ lên 50+ kỹ sư và công nhân lành nghề. Triển khai thành công các dự án tại các khu công nghiệp miền Bắc.',            stat_value: '50+',     stat_label: 'Kỹ sư & nhân viên',      color: '#8b5cf6' },
  { year: 2015, title: 'Chứng nhận ISO 9001',      description: 'Đạt chứng nhận hệ thống quản lý chất lượng ISO 9001:2015, khẳng định cam kết chất lượng quốc tế.',                                   stat_value: '3',       stat_label: 'Chứng chỉ quốc tế',      color: '#22c55e' },
  { year: 2017, title: 'Mốc 100 công trình',       description: 'Hoàn thành công trình thứ 100, bao gồm nhà xưởng, kho bãi, tòa nhà văn phòng thép trên toàn quốc.',                                  stat_value: '100+',    stat_label: 'Công trình hoàn thành',   color: '#ef4444' },
  { year: 2019, title: 'Đối tác FDI',              description: 'Trở thành đối tác tin cậy của các tập đoàn FDI lớn: Samsung, LG, Foxconn tại KCN Bắc Ninh, Thái Nguyên.',                            stat_value: '15+',     stat_label: 'Tập đoàn FDI',           color: '#06b6d4' },
  { year: 2021, title: 'Đổi mới công nghệ',        description: 'Ứng dụng công nghệ BIM (Building Information Modeling) vào thiết kế và thi công, nâng tầm chất lượng dự án.',                         stat_value: '30%',     stat_label: 'Giảm thời gian thi công', color: '#f59e0b' },
  { year: 2023, title: 'Phát triển bền vững',      description: 'Triển khai giải pháp xây dựng xanh, mở rộng dự án ra thị trường quốc tế. Tổng sản lượng thép vượt 50,000 tấn.',                       stat_value: '50,000+', stat_label: 'Tấn thép tích lũy',      color: '#10b981' },
  { year: 2025, title: 'Tầm nhìn tương lai',       description: 'Định hướng trở thành nhà thầu hàng đầu Đông Nam Á về kết cấu thép công nghiệp, mở rộng dự án ra thị trường quốc tế.',                stat_value: '200+',    stat_label: 'Dự án mục tiêu',         color: '#8b5cf6' },
];

// ══════════════════════════════════════════════════════════════════════════════
//  DATA
// ══════════════════════════════════════════════════════════════════════════════
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

async function fetchProjects() {
  try {
    const { data, error } = await db
      .from('projects')
      .select('id, title, slug, category, featured_image, images, year, subtitle, description')
      .order('year', { ascending: true });
    if (error || !data) return [];
    return data;
  } catch { return []; }
}

function getLinkedProjects(ms) {
  const ids = Array.isArray(ms.project_ids) ? ms.project_ids : [];
  if (!ids.length) return [];
  return ids.map(id => _allProjects.find(p => p.id === id)).filter(Boolean);
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
//  BUILD THE UNIFIED CARD
// ══════════════════════════════════════════════════════════════════════════════
function buildUnifiedCard(overlayEl) {
  overlayEl.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'h3d-card';
  card.id = 'h3dCard';
  card.innerHTML = `
    <div class="h3d-card__header">
      <div class="h3d-card__icon"></div>
      <div class="h3d-card__header-text">
        <div class="h3d-card__year"></div>
        <div class="h3d-card__title"></div>
      </div>
    </div>
    <div class="h3d-card__desc"></div>
    <div class="h3d-card__stat">
      <span class="h3d-card__stat-value"></span>
      <span class="h3d-card__stat-label"></span>
    </div>
    <div class="h3d-card__expand-hint">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
      <span class="h3d-card__expand-text"></span>
    </div>
    <div class="h3d-card__cubes" id="h3dCubes"></div>
    <a class="h3d-card__link" href="#" style="display:none">
      <span>Xem chi tiết</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </a>
  `;

  overlayEl.appendChild(card);
  _cardEl = card;
  _cubesArea = card.querySelector('#h3dCubes');

  // ── Hover expand/collapse ──
  card.addEventListener('mouseenter', () => {
    if (!isExpanded) expandReveal();
  });
  card.addEventListener('mouseleave', () => {
    if (isExpanded) collapseExpand();
  });

  // ── Mobile tap toggle ──
  card.addEventListener('click', (e) => {
    // Don't toggle if clicking on a cube or link
    if (e.target.closest('.space-item--3d') || e.target.closest('.h3d-card__link')) return;
    toggleExpand();
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  UPDATE CARD CONTENT — called when activeIndex changes
// ══════════════════════════════════════════════════════════════════════════════
function updateCard() {
  if (!_cardEl || !_milestones[activeIndex]) return;
  const ms = _milestones[activeIndex];

  // Collapse cubes when switching milestones
  if (isExpanded) collapseExpand();

  _cardEl.style.setProperty('--accent', ms.color || '#3b82f6');

  // Trigger entrance animation
  _cardEl.classList.remove('h3d-card--animate');
  void _cardEl.offsetWidth;
  _cardEl.classList.add('h3d-card--animate');

  // Icon
  const iconEl = _cardEl.querySelector('.h3d-card__icon');
  if (ms.image_url) {
    iconEl.innerHTML = `<img src="${ms.image_url}" alt="${ms.title}" />`;
    iconEl.classList.add('h3d-card__icon--img');
  } else {
    iconEl.innerHTML = getIcon(ms.year);
    iconEl.classList.remove('h3d-card__icon--img');
  }

  _cardEl.querySelector('.h3d-card__year').textContent = ms.year;
  _cardEl.querySelector('.h3d-card__title').textContent = ms.title;
  _cardEl.querySelector('.h3d-card__desc').textContent = ms.description || '';

  // Stat
  const statVal = _cardEl.querySelector('.h3d-card__stat-value');
  const statLbl = _cardEl.querySelector('.h3d-card__stat-label');
  const statEl = _cardEl.querySelector('.h3d-card__stat');
  if (ms.stat_value) {
    statVal.textContent = ms.stat_value;
    statLbl.textContent = ms.stat_label || '';
    statEl.style.display = '';
  } else {
    statEl.style.display = 'none';
  }

  // Link
  const linkEl = _cardEl.querySelector('.h3d-card__link');
  if (ms.link_url) {
    const url = ms.link_url.trim();
    linkEl.href = url;
    linkEl.target = (url.startsWith('/') || url.startsWith(window.location.origin)) ? '_self' : '_blank';
    if (linkEl.target === '_blank') linkEl.rel = 'noopener noreferrer';
    linkEl.style.display = 'flex';
  } else {
    linkEl.style.display = 'none';
  }

  // Expand hint
  const projects = getLinkedProjects(ms);
  const hintEl = _cardEl.querySelector('.h3d-card__expand-hint');
  const hintText = _cardEl.querySelector('.h3d-card__expand-text');
  if (projects.length > 0) {
    hintText.textContent = `${projects.length} dự án`;
    hintEl.style.display = '';
  } else {
    hintEl.style.display = 'none';
  }

  // Pre-build cubes into the cubes area
  buildCubes(ms);
}

// ══════════════════════════════════════════════════════════════════════════════
//  BUILD CUBES inside the card
// ══════════════════════════════════════════════════════════════════════════════
function buildCubes(ms) {
  if (!_cubesArea) return;
  _cubesArea.innerHTML = '';

  const projects = getLinkedProjects(ms);
  if (!projects.length) return;

  const cubeFactory = window._createCubeMiniElement;

  projects.forEach((proj, idx) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'h3d-cube-wrapper';
    wrapper.style.setProperty('--delay', `${idx * 0.1}s`);

    if (cubeFactory) {
      const cubeSize = window.innerWidth <= 480 ? 80 : window.innerWidth <= 768 ? 110 : 160;
      const { el } = cubeFactory(proj, {
        size:  cubeSize,
        rotX:  -18,
        rotY:  -30 + idx * 20,
        onClick: (p) => {
          if (_onProjectClick) _onProjectClick(p);
          else if (p.slug) window.location.href = `/du-an/${p.slug}`;
        },
      });
      el.style.position = 'relative';
      el.style.left     = 'auto';
      el.style.top      = 'auto';
      el.style.opacity  = '1';
      el.style.pointerEvents = 'auto';
      wrapper.appendChild(el);
    } else {
      wrapper.innerHTML = `
        <div class="h3d-projcard-fallback">
          <img src="${proj.featured_image || ''}" alt="${proj.title}" loading="lazy" />
          <span>${proj.title}</span>
        </div>`;
    }

    const label = document.createElement('div');
    label.className = 'h3d-cube-label';
    label.textContent = proj.title || '';
    wrapper.appendChild(label);

    _cubesArea.appendChild(wrapper);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  EXPAND / COLLAPSE cubes area
// ══════════════════════════════════════════════════════════════════════════════
function toggleExpand() {
  if (isExpanded) collapseExpand();
  else expandReveal();
}

function expandReveal() {
  const ms = _milestones[activeIndex];
  const projects = getLinkedProjects(ms);
  if (!projects.length) return;

  isExpanded = true;
  if (_cardEl) _cardEl.classList.add('h3d-card--expanded');
  if (_cubesArea) _cubesArea.classList.add('h3d-card__cubes--visible');
}

function collapseExpand() {
  isExpanded = false;
  if (_cardEl) _cardEl.classList.remove('h3d-card--expanded');
  if (_cubesArea) _cubesArea.classList.remove('h3d-card__cubes--visible');
}

// ══════════════════════════════════════════════════════════════════════════════
//  PROGRESS DOTS
// ══════════════════════════════════════════════════════════════════════════════
function buildProgressDots(milestones, progressEl) {
  progressEl.innerHTML = '';
  milestones.forEach((ms, i) => {
    const btn = document.createElement('button');
    btn.className = 'h3d-progress__dot';
    btn.dataset.index = i;
    btn.style.setProperty('--c', ms.color || '#3b82f6');
    btn.title = `${ms.year} — ${ms.title}`;
    btn.addEventListener('click', () => setActive(i));
    progressEl.appendChild(btn);
  });
}

function updateDots() {
  if (!_progressEl) return;
  _progressEl.querySelectorAll('.h3d-progress__dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === activeIndex);
    dot.classList.toggle('passed', i < activeIndex);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  SET ACTIVE INDEX — drives everything
// ══════════════════════════════════════════════════════════════════════════════
function setActive(idx) {
  idx = Math.max(0, Math.min(_milestones.length - 1, idx));
  activeIndex = idx;
  updateCard();
  updateDots();
}

// ══════════════════════════════════════════════════════════════════════════════
//  ICON MAP
// ══════════════════════════════════════════════════════════════════════════════
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
function getIcon(year) { return ICONS[year] || ICONS[2008]; }

// ══════════════════════════════════════════════════════════════════════════════
//  RESIZE
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
export async function initHistory3D(sectionEl, options = {}) {
  if (isInitialized) return;
  _sectionEl = sectionEl;
  _onProjectClick = options.onProjectClick || null;

  const canvas     = sectionEl.querySelector('#h3dCanvas');
  const overlayEl  = sectionEl.querySelector('#h3dOverlay');
  const progressEl = sectionEl.querySelector('#h3dProgress');
  if (!canvas) return;

  _overlayEl  = overlayEl;
  _progressEl = progressEl;

  // Fetch
  const [milestones, projects] = await Promise.all([
    fetchMilestones(),
    fetchProjects(),
  ]);
  _milestones  = milestones;
  _allProjects = projects;

  // Three.js
  createScene(canvas);

  // Build HTML
  buildUnifiedCard(overlayEl);
  buildProgressDots(milestones, progressEl);

  // Initial state
  setActive(0);

  // ── Scroll: prev/next ──
  let scrollLocked = false;
  sectionEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (scrollLocked) return;
    scrollLocked = true;
    setTimeout(() => { scrollLocked = false; }, 400);
    if (e.deltaY > 20) setActive(activeIndex + 1);
    else if (e.deltaY < -20) setActive(activeIndex - 1);
  }, { passive: false });

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
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIndex + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex - 1); }
  });

  // Resize
  const ro = new ResizeObserver(() => onResize(canvas));
  ro.observe(sectionEl);

  // Hide scroll hint
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

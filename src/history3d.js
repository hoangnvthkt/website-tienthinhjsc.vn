/**
 * history3d.js — Horizontal Timeline 3D
 * Three.js scroll-driven HORIZONTAL timeline — camera pans side to side
 * Cards never overlap, mouse only for hover, scroll wheel for navigation.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hafiotcabigmdpoocddu.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZmlvdGNhYmlnbWRwb29jZGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzU2NDEsImV4cCI6MjA5MDUxMTY0MX0.22BAFw0LXsomxY0PtD3V-5G5yGFa2F5gmCUNVr4tyrk';
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── State ────────────────────────────────────────────────────────────────────
let renderer, scene, camera;
let milestoneObjects = [];       // { mesh, dot, line, bar, edges, t, milestone }
let particleGroups = [];
let animationId;
let scrollProgress = 0;
let targetProgress = 0;
let isInitialized = false;
let container, scrollProxy;

// Layout constants
const SPACING   = 8;    // units between each milestone along X axis
const CAM_Y     = 2;    // camera height
const CAM_Z     = 10;   // camera distance from timeline plane
const CARD_W    = 5.0;
const CARD_H    = 3.0;

// ─── Default milestone data (fallback) ────────────────────────────────────────
const DEFAULT_MILESTONES = [
  { year: 2008, title: 'Thành lập công ty', description: 'Tiến Thịnh JSC được thành lập tại Hà Nội với định hướng chuyên sâu về kết cấu thép công nghiệp.', stat_value: '5', stat_label: 'Thành viên sáng lập', color: '#f59e0b' },
  { year: 2010, title: 'Dự án đầu tiên', description: 'Hoàn thành dự án nhà xưởng kết cấu thép đầu tiên tại Hưng Yên, đánh dấu bước đột phá PEB.', stat_value: '2,000', stat_label: 'Tấn thép lắp đặt', color: '#3b82f6' },
  { year: 2013, title: 'Mở rộng quy mô', description: 'Mở rộng đội ngũ lên 50+ kỹ sư và công nhân lành nghề trên toàn miền Bắc.', stat_value: '50+', stat_label: 'Kỹ sư & nhân viên', color: '#8b5cf6' },
  { year: 2015, title: 'Chứng nhận ISO 9001', description: 'Đạt chứng nhận ISO 9001:2015, khẳng định cam kết chất lượng quốc tế.', stat_value: '3', stat_label: 'Chứng chỉ quốc tế', color: '#22c55e' },
  { year: 2017, title: 'Mốc 100 công trình', description: 'Hoàn thành công trình thứ 100 trên toàn quốc bao gồm nhà xưởng, kho bãi, văn phòng thép.', stat_value: '100+', stat_label: 'Công trình hoàn thành', color: '#ef4444' },
  { year: 2019, title: 'Đối tác FDI', description: 'Trở thành đối tác tin cậy của các tập đoàn FDI lớn như Samsung, LG, Foxconn.', stat_value: '15+', stat_label: 'Đối tác FDI', color: '#06b6d4' },
  { year: 2021, title: 'Đổi mới công nghệ BIM', description: 'Ứng dụng BIM (Building Information Modeling) vào thiết kế và thi công hiện đại.', stat_value: '30%', stat_label: 'Giảm thời gian thi công', color: '#f59e0b' },
  { year: 2023, title: 'Phát triển bền vững', description: 'Triển khai giải pháp xây dựng xanh. Tổng sản lượng thép lắp đặt vượt 50,000 tấn.', stat_value: '50,000+', stat_label: 'Tấn thép tích lũy', color: '#10b981' },
  { year: 2025, title: 'Tầm nhìn tương lai', description: 'Định hướng trở thành nhà thầu hàng đầu Đông Nam Á về kết cấu thép công nghiệp.', stat_value: '200+', stat_label: 'Dự án mục tiêu', color: '#8b5cf6' },
];

// ─── Fetch ────────────────────────────────────────────────────────────────────
async function fetchMilestones() {
  try {
    const { data, error } = await db
      .from('history_milestones')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error || !data?.length) return DEFAULT_MILESTONES;
    return data;
  } catch {
    return DEFAULT_MILESTONES;
  }
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function createScene(canvas) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04060f);
  scene.fog = new THREE.FogExp2(0x04060f, 0.018);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // Camera — side view, looking along -Z into the scene
  camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 300);
  camera.position.set(0, CAM_Y, CAM_Z);
  camera.lookAt(0, 0, 0);

  // Lights
  scene.add(new THREE.AmbientLight(0x1a237e, 0.6));
  const dir = new THREE.DirectionalLight(0x4fc3f7, 2);
  dir.position.set(0, 10, 10);
  scene.add(dir);
  const pl1 = new THREE.PointLight(0x7c3aed, 4, 40);
  pl1.position.set(-5, 2, 5);
  scene.add(pl1);
  const pl2 = new THREE.PointLight(0x0ea5e9, 4, 40);
  pl2.position.set(5, 2, 5);
  scene.add(pl2);
}

// ─── Horizontal timeline rail ─────────────────────────────────────────────────
function createRail(total) {
  const totalWidth = (total - 1) * SPACING;

  // Main rail line
  const railPts = [
    new THREE.Vector3(-totalWidth * 0.1, 0, 0),
    new THREE.Vector3(totalWidth * 1.1, 0, 0),
  ];
  const railGeo = new THREE.BufferGeometry().setFromPoints(railPts);
  const railMat = new THREE.LineBasicMaterial({ color: 0x1e3a5f, transparent: true, opacity: 0.7 });
  scene.add(new THREE.Line(railGeo, railMat));

  // Glowing rail
  const glowMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.2 });
  scene.add(new THREE.Line(railGeo, glowMat));
}

// ─── Single milestone 3D object ───────────────────────────────────────────────
function createMilestone(milestone, index, total) {
  const x = index * SPACING;
  const color = new THREE.Color(milestone.color || '#3b82f6');

  // Alternating Y offset so cards above/below the rail
  const cardY = index % 2 === 0 ? 3.5 : -3.5;
  const cardZ = 0;

  // ── Card ──
  const cardGeo = new THREE.PlaneGeometry(CARD_W, CARD_H);
  const cardMat = new THREE.MeshStandardMaterial({
    color: 0x0a1628,
    metalness: 0.2,
    roughness: 0.8,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
  });
  const card = new THREE.Mesh(cardGeo, cardMat);
  card.position.set(x, cardY, cardZ);
  scene.add(card);

  // ── Top accent bar ──
  const barGeo = new THREE.PlaneGeometry(CARD_W, 0.1);
  const barMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, side: THREE.DoubleSide });
  const bar = new THREE.Mesh(barGeo, barMat);
  bar.position.set(x, cardY + CARD_H / 2 - 0.05, cardZ + 0.01);
  scene.add(bar);

  // ── Glow border ──
  const edgeGeo = new THREE.EdgesGeometry(cardGeo);
  const edgeMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 });
  const edges = new THREE.LineSegments(edgeGeo, edgeMat);
  edges.position.copy(card.position);
  scene.add(edges);

  // ── Connector vertical line (card to rail) ──
  const connPts = [
    new THREE.Vector3(x, 0, cardZ),
    new THREE.Vector3(x, cardY > 0 ? cardY - CARD_H / 2 : cardY + CARD_H / 2, cardZ),
  ];
  const connGeo = new THREE.BufferGeometry().setFromPoints(connPts);
  const connMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4 });
  scene.add(new THREE.Line(connGeo, connMat));

  // ── Dot on rail ──
  const dotGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const dotMat = new THREE.MeshBasicMaterial({ color });
  const dot = new THREE.Mesh(dotGeo, dotMat);
  dot.position.set(x, 0, 0);
  scene.add(dot);

  // ── Dot glow ring ──
  const ringGeo = new THREE.RingGeometry(0.22, 0.35, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.set(x, 0, 0.01);
  scene.add(ring);

  // ── Mini particles ──
  createMilestoneParticles(x, cardY, color);

  // t = normalized position 0..1
  const t = total > 1 ? index / (total - 1) : 0;

  milestoneObjects.push({
    card, bar, edges, dot, ring,
    t, x, cardY, milestone,
    isActive: false,
  });
}

// ─── Particles per milestone ──────────────────────────────────────────────────
function createMilestoneParticles(cx, cy, color) {
  const count = 80;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3]     = cx + (Math.random() - 0.5) * 5;
    pos[i * 3 + 1] = cy + (Math.random() - 0.5) * 4;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color, size: 0.055, transparent: true, opacity: 0.5,
    sizeAttenuation: true, depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  particleGroups.push({ pts, cx, cy });
}

// ─── Starfield ────────────────────────────────────────────────────────────────
function createStarfield(totalWidth) {
  const count = 2000;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.3) * (totalWidth + 40);
    pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x8ab4d4, size: 0.04, transparent: true, opacity: 0.4,
    sizeAttenuation: true, depthWrite: false,
  });
  scene.add(new THREE.Points(geo, mat));
}

// ─── HTML overlay cards ───────────────────────────────────────────────────────
function createOverlayCards(milestones, overlayEl) {
  overlayEl.innerHTML = '';
  milestones.forEach((ms, i) => {
    const div = document.createElement('div');
    div.className = 'h3d-card';
    div.dataset.index = i;
    div.dataset.side = i % 2 === 0 ? 'top' : 'bottom';
    div.style.setProperty('--accent', ms.color || '#3b82f6');
    div.innerHTML = `
      <div class="h3d-card__year">${ms.year}</div>
      <div class="h3d-card__title">${ms.title}</div>
      <div class="h3d-card__desc">${ms.description || ''}</div>
      ${ms.stat_value ? `
      <div class="h3d-card__stat">
        <span class="h3d-card__stat-value">${ms.stat_value}</span>
        <span class="h3d-card__stat-label">${ms.stat_label || ''}</span>
      </div>` : ''}
    `;
    overlayEl.appendChild(div);
  });
}

// ─── Progress dots ────────────────────────────────────────────────────────────
function createProgressDots(milestones, progressEl) {
  progressEl.innerHTML = '';
  milestones.forEach((ms, i) => {
    const dot = document.createElement('button');
    dot.className = 'h3d-progress__dot';
    dot.dataset.index = i;
    dot.style.setProperty('--c', ms.color || '#3b82f6');
    dot.title = `${ms.year} — ${ms.title}`;
    dot.addEventListener('click', () => { targetProgress = i / (milestones.length - 1); });
    progressEl.appendChild(dot);
  });
}

// ─── Camera pan (TASK 2 — horizontal side view) ───────────────────────────────
function updateCamera(milestones) {
  // Smooth lerp
  scrollProgress += (targetProgress - scrollProgress) * 0.05;
  const p = Math.max(0, Math.min(1, scrollProgress));

  const totalWidth = (milestones.length - 1) * SPACING;
  const targetX = p * totalWidth;

  // Camera pans horizontally — NEVER rotates from mouse (TASK 4)
  camera.position.x += (targetX - camera.position.x) * 0.06;
  camera.position.y += (CAM_Y - camera.position.y) * 0.04;
  camera.position.z += (CAM_Z - camera.position.z) * 0.04;

  // Always look at the current milestone position on rail
  const lookTarget = new THREE.Vector3(camera.position.x, 0, 0);
  camera.lookAt(lookTarget);
}

// ─── Card visibility (TASK 1 — one active card at a time) ────────────────────
function updateCards(overlayEl, progressEl, milestones) {
  const p = scrollProgress;
  const n = milestones.length;

  // Find the single closest milestone
  let closestIdx = 0;
  let closestDist = Infinity;
  milestoneObjects.forEach((obj, i) => {
    const dist = Math.abs(p - obj.t);
    if (dist < closestDist) { closestDist = dist; closestIdx = i; }
  });

  milestoneObjects.forEach((obj, i) => {
    const isActive = i === closestIdx;
    const isNear   = Math.abs(i - closestIdx) === 1;

    // 3D: active card glows, next cards fade
    obj.card.material.opacity  = isActive ? 0.92 : isNear ? 0.3 : 0.08;
    obj.edges.material.opacity = isActive ? 0.9 : isNear ? 0.2 : 0.05;
    obj.bar.material.opacity   = isActive ? 1.0 : isNear ? 0.3 : 0.1;

    // Scale up active card slightly
    const targetScale = isActive ? 1.05 : isNear ? 0.95 : 0.85;
    obj.card.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.1);
    obj.edges.scale.copy(obj.card.scale);
    obj.bar.scale.copy(obj.card.scale);

    // Dot pulse
    obj.dot.material.opacity = isActive ? 1 : 0.4;
    const dotS = isActive ? 1.4 : 1.0;
    obj.dot.scale.lerp(new THREE.Vector3(dotS, dotS, dotS), 0.1);
    obj.ring.material.opacity = isActive ? 0.6 : 0.1;

    // HTML overlay — only active card fully visible (TASK 1)
    const htmlCard = overlayEl.querySelector(`[data-index="${i}"]`);
    if (htmlCard) {
      htmlCard.classList.toggle('active', isActive);
      htmlCard.classList.toggle('near', isNear && !isActive);
      // Remove 'active' from all others (prevent double active)
      if (!isActive) htmlCard.classList.remove('active');
    }

    // Progress dots
    const dot = progressEl.querySelector(`[data-index="${i}"]`);
    if (dot) {
      dot.classList.toggle('active', isActive);
      dot.classList.toggle('passed', obj.t < p - 0.01);
    }
  });
}

// ─── Animate particles ────────────────────────────────────────────────────────
let tick0 = 0;
function animateParticles() {
  tick0 += 0.004;
  particleGroups.forEach(({ pts }, i) => {
    pts.rotation.z = Math.sin(tick0 + i * 0.5) * 0.04;
    pts.material.opacity = 0.35 + Math.sin(tick0 * 1.5 + i) * 0.12;
  });
}

// ─── Render loop ──────────────────────────────────────────────────────────────
let _milestones = [];
let _overlayEl, _progressEl;

function tick() {
  animationId = requestAnimationFrame(tick);
  updateCamera(_milestones);
  animateParticles();
  updateCards(_overlayEl, _progressEl, _milestones);
  renderer.render(scene, camera);
}

// ─── Resize ───────────────────────────────────────────────────────────────────
function onResize(canvas) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

// ─── PUBLIC: init ─────────────────────────────────────────────────────────────
export async function initHistory3D(sectionEl) {
  if (isInitialized) return;

  const canvas     = sectionEl.querySelector('#h3dCanvas');
  const overlayEl  = sectionEl.querySelector('#h3dOverlay');
  const progressEl = sectionEl.querySelector('#h3dProgress');
  const scrollEl   = sectionEl.querySelector('#h3dScroll');
  scrollProxy = scrollEl;

  const milestones = await fetchMilestones();
  _milestones  = milestones;
  _overlayEl   = overlayEl;
  _progressEl  = progressEl;

  const totalWidth = (milestones.length - 1) * SPACING;

  // Build scene
  createScene(canvas);
  createStarfield(totalWidth);
  createRail(milestones.length);
  milestones.forEach((ms, i) => createMilestone(ms, i, milestones.length));

  // HTML
  createOverlayCards(milestones, overlayEl);
  createProgressDots(milestones, progressEl);

  // ── TASK 4: Scroll only (wheel + touch), NO mouse rotation ──
  scrollEl.addEventListener('scroll', () => {
    const max = scrollEl.scrollHeight - scrollEl.clientHeight;
    if (max > 0) targetProgress = scrollEl.scrollTop / max;
  });

  // Mouse wheel directly on canvas (no rotation, pure scroll → progress)
  sectionEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    targetProgress = Math.max(0, Math.min(1, targetProgress + e.deltaY * 0.001));
  }, { passive: false });

  // Touch
  let lastTY = 0;
  sectionEl.addEventListener('touchstart', e => { lastTY = e.touches[0].clientY; }, { passive: true });
  sectionEl.addEventListener('touchmove', e => {
    const dy = lastTY - e.touches[0].clientY;
    lastTY = e.touches[0].clientY;
    targetProgress = Math.max(0, Math.min(1, targetProgress + dy * 0.004));
  }, { passive: true });

  // Hover: only highlight effect, NO camera rotation (TASK 4)
  sectionEl.addEventListener('mousemove', (e) => {
    // Hover detection can be used for card glow in future
  });

  // Resize
  const ro = new ResizeObserver(() => onResize(canvas));
  ro.observe(sectionEl);

  // Scroll hint
  const hint = sectionEl.querySelector('#h3dHint');
  const hideHint = () => { if (hint) hint.style.opacity = '0'; };
  sectionEl.addEventListener('wheel', hideHint, { once: true });
  sectionEl.addEventListener('touchmove', hideHint, { once: true });

  tick();
  isInitialized = true;
}

// ─── PUBLIC: destroy ──────────────────────────────────────────────────────────
export function destroyHistory3D() {
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) renderer.dispose();
  milestoneObjects = [];
  particleGroups = [];
  _milestones = [];
  isInitialized = false;
  scrollProgress = 0;
  targetProgress = 0;
}

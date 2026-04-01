import './style.css';
import { products as staticProducts } from './data.js';
import { fetchProjects, fetchPosts, fetchDocuments, fetchSettings, submitContact } from './api.js';

// ============================================
// APP STATE
// ============================================
const state = {
  currentPage: 'home',
  currentView: 'space', // 'space' | 'grid'
  currentProduct: null,
  menuOpen: false,
  searchOpen: false,
  sliderIndex: 0,
  mouseX: 0,
  mouseY: 0,
  scrollY: 0,
};

// Products data — will be replaced with Supabase data
let products = staticProducts;

// 3D Cube state
let cubeRotX = -15;
let cubeRotY = 0;
let cubeDragging = false;
let cubeStartX = 0;
let cubeStartY = 0;
let cubeLastRotX = 0;
let cubeLastRotY = 0;
let cubeAutoRotateRAF = null;
let cubeEl = null;
let cubeMoveHandler = null;
let cubeUpHandler = null;

// ============================================
// DOM REFERENCES
// ============================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const header = $('#header');
const navOverlay = $('#navOverlay');
const searchOverlay = $('#searchOverlay');
const menuToggle = $('#menuToggle');
const menuToggle2 = $('#menuToggle2');
const searchToggle = $('#searchToggle');
const searchClose = $('#searchClose');
const searchInput = $('#searchInput');

const spaceView = $('#spaceView');
const gridView = $('#gridView');
const btnSpace = $('#btnSpace');
const btnGrid = $('#btnGrid');
const viewToggle = $('#viewToggle');

const backBtn = $('#backBtn');
const productSlider = $('#productSlider');
const productTitle = $('#productTitle');
const productSubtitle = $('#productSubtitle');
const productAuthor = $('#productAuthor');
const productYear = $('#productYear');
const productVariants = $('#productVariants');
const productDesc = $('#productDesc');
const sliderPrev = $('#sliderPrev');
const sliderNext = $('#sliderNext');
const sliderCount = $('#sliderCount');

// ============================================
// NAVIGATION
// ============================================
function navigateTo(page, data = null) {
  // Close menu if open
  if (state.menuOpen) toggleMenu();

  // Hide all pages
  $$('.page').forEach(p => p.classList.remove('active'));

  // Show target page
  const targetPage = $(`#page-${page}`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  state.currentPage = page;

  // Show/hide header based on page
  const statsBar = document.getElementById('statsBar');
  if (page === 'product') {
    header.style.display = 'none';
    viewToggle.style.display = 'none';
    if (statsBar) statsBar.style.display = 'none';
    if (data) openProduct(data);
  } else if (page === 'home') {
    header.style.display = '';
    viewToggle.style.display = '';
    if (statsBar) statsBar.style.display = '';
    cleanupCube();
  } else {
    header.style.display = '';
    viewToggle.style.display = 'none';
    if (statsBar) statsBar.style.display = 'none';
    cleanupCube();
  }

  // Hide space items & stop auto-fly when leaving home
  if (page !== 'home') {
    stopAutoFly();
    spaceObjects.forEach(obj => { obj.el.style.opacity = '0'; obj.el.style.pointerEvents = 'none'; });
  }

  // Scroll to top
  window.scrollTo(0, 0);

  // Re-init scroll reveal for new page content
  if (page !== 'home') {
    setTimeout(() => setupScrollReveal(), 50);
  }

  // Re-start auto-fly if going back to home space view
  if (page === 'home' && state.currentView === 'space') {
    startAutoFly();
  }

  // Show/hide footer (visible on subpages, hidden on home & product)
  const footer = $('#siteFooter');
  if (footer) {
    const showFooter = page !== 'home' && page !== 'product';
    footer.classList.remove('footer--revealed'); // Reset reveal animation
    footer.classList.toggle('visible', showFooter);
  }

  // Reset header compact state
  header.classList.remove('header--compact');
}

// Setup nav links
function setupNavigation() {
  $$('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      navigateTo(page);
    });
  });
}

// ============================================
// MENU
// ============================================
function toggleMenu() {
  state.menuOpen = !state.menuOpen;
  document.body.classList.toggle('menu-open', state.menuOpen);
  navOverlay.classList.toggle('active', state.menuOpen);

  // Hide space items behind menu overlay
  if (state.menuOpen) {
    stopAutoFly();
    spaceObjects.forEach(obj => { obj.el.style.opacity = '0'; obj.el.style.pointerEvents = 'none'; });
  } else if (state.currentPage === 'home' && state.currentView === 'space') {
    startAutoFly();
  }
}

function setupMenu() {
  menuToggle.addEventListener('click', toggleMenu);
  if (menuToggle2) {
    menuToggle2.addEventListener('click', toggleMenu);
  }

  // Nav link clicks
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      navigateTo(page);
    });
  });
}

// ============================================
// SEARCH
// ============================================
function setupSearch() {
  searchToggle.addEventListener('click', () => {
    state.searchOpen = true;
    searchOverlay.classList.add('active');
    setTimeout(() => searchInput.focus(), 300);
  });

  searchClose.addEventListener('click', () => {
    state.searchOpen = false;
    searchOverlay.classList.remove('active');
    searchInput.value = '';
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      state.searchOpen = false;
      searchOverlay.classList.remove('active');
      searchInput.value = '';
    }
  });
}

// ============================================
// SPACE VIEW — Auto-Flying 3D Space (like Gufram)
// GPU-optimized: only transform & opacity change per frame
// ============================================

const PERSPECTIVE  = 800;
const BASE_SIZE    = window.innerWidth <= 768 ? 200 : 300; // smaller cubes on mobile
const AUTO_SPEED   = 1.2;
const BOOST_DECAY  = 0.92;
const Z_NEAR       = 100;
const Z_SPREAD     = 9000;      // wide spread to avoid overlap
const MIN_GAP_Z    = 900;       // minimum Z distance between items

const spaceObjects = [];
let cameraZ       = -200;
let speedBoost    = 0;
let autoFlyRAF    = null;
let isHovering    = false;

// Smoothed (lerped) mouse for butter-smooth parallax
let lerpMX = 0, lerpMY = 0;
let rawMX  = 0, rawMY  = 0;

// Cached viewport — updated on resize
let vpW = window.innerWidth;
let vpH = window.innerHeight;
window.addEventListener('resize', () => { vpW = window.innerWidth; vpH = window.innerHeight; });

function createSpaceView() {
  spaceView.innerHTML = '';
  spaceObjects.length = 0;
  cameraZ = -200;
  speedBoost = 0;

  products.forEach((product, i) => {
    // Even Z distribution — each item gets its own "lane"
    const z = 400 + (i / (products.length - 1)) * Z_SPREAD;

    // Golden-angle based distribution for maximally even spread
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
    const angle = i * goldenAngle;
    const radius = 0.20 + (i % 3) * 0.15; // 3 distance tiers: near/mid/far from center
    const worldX = Math.cos(angle) * radius * vpW;
    const worldY = Math.sin(angle) * radius * vpH * 0.55;

    // Per-cube fixed angle — unique so each cube looks different but static
    const rotTiltX = -15 + Math.random() * 10;        // slight downward tilt for perspective
    const rotFixedY = -25 + Math.random() * 50;       // fixed Y angle — shows 2 faces

    const obj = { product, z, worldX, worldY, el: null, cubeEl: null, rotFixedY: rotFixedY, rotTiltX };
    spaceObjects.push(obj);

    // DOM — outer wrapper (positioned/scaled by renderSpaceFrame)
    const item = document.createElement('div');
    item.className = 'space-item space-item--3d';
    item.style.width  = BASE_SIZE + 'px';
    item.style.height = BASE_SIZE + 'px';

    // Inner 3D cube scene
    const scene = document.createElement('div');
    scene.className = 'cube-scene-mini';

    const cube = document.createElement('div');
    cube.className = 'cube-mini';
    const halfSize = BASE_SIZE / 2;
    cube.style.setProperty('--cube-tz', halfSize + 'px');

    // 4 image faces
    const sideFaces = ['front', 'right', 'back', 'left'];
    const images = product.images;
    sideFaces.forEach((face, fi) => {
      const faceDiv = document.createElement('div');
      faceDiv.className = `cube-mini__face cube-mini__face--${face}`;
      const img = document.createElement('img');
      img.src = images[fi % images.length];
      img.alt = `${product.name} - ${face}`;
      img.loading = (i < 4) ? 'eager' : 'lazy';
      faceDiv.appendChild(img);
      cube.appendChild(faceDiv);
    });

    // Top & bottom faces with logo
    ['top', 'bottom'].forEach(face => {
      const faceDiv = document.createElement('div');
      faceDiv.className = `cube-mini__face cube-mini__face--${face}`;
      const logo = document.createElement('img');
      logo.src = '/images/logo.png';
      logo.alt = 'Tiến Thịnh JSC';
      faceDiv.appendChild(logo);
      cube.appendChild(faceDiv);
    });

    scene.appendChild(cube);
    item.appendChild(scene);

    // Label
    const label = document.createElement('span');
    label.className = 'space-item__label';
    label.textContent = product.name;
    item.appendChild(label);

    // --- Drag-to-rotate + click-to-navigate ---
    let dragStartX = 0, dragStartY = 0;
    let dragLastRotX = obj.rotTiltX, dragLastRotY = obj.rotFixedY;
    let isDragging = false, didDrag = false;

    const onDown = (e) => {
      const point = e.touches ? e.touches[0] : e;
      dragStartX = point.clientX;
      dragStartY = point.clientY;
      dragLastRotX = obj.rotTiltX;
      dragLastRotY = obj.rotFixedY;
      isDragging = true;
      didDrag = false;
      isHovering = true;
      item.style.cursor = 'grabbing';
      e.preventDefault();
      e.stopPropagation();
    };

    const onMove = (e) => {
      if (!isDragging) return;
      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - dragStartX;
      const dy = point.clientY - dragStartY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) didDrag = true;
      obj.rotFixedY = dragLastRotY + dx * 0.6;
      obj.rotTiltX = Math.max(-75, Math.min(75, dragLastRotX - dy * 0.5));
      cube.style.transform = `rotateX(${obj.rotTiltX}deg) rotateY(${obj.rotFixedY}deg)`;
    };

    const onUp = () => {
      if (!isDragging) return;
      isDragging = false;
      isHovering = false;
      item.style.cursor = 'pointer';
    };

    item.addEventListener('mousedown', onDown);
    item.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    // Click only if NOT a drag
    item.addEventListener('click', (e) => {
      if (didDrag) { e.preventDefault(); e.stopPropagation(); return; }
      navigateTo('product', product);
    });
    item.addEventListener('mouseenter', () => { isHovering = true; });
    item.addEventListener('mouseleave', () => { isHovering = false; isDragging = false; item.style.cursor = 'pointer'; });

    spaceView.appendChild(item);
    obj.el = item;
    obj.cubeEl = cube;
  });

  startAutoFly();
}

// Check if a position would overlap with nearby items (similar Z depth)
function isTooClose(self, newX, newY) {
  const minDist = vpW * 0.35; // minimum screen-space distance
  for (let j = 0; j < spaceObjects.length; j++) {
    const other = spaceObjects[j];
    if (other === self) continue;
    // Only check items within a similar Z range
    if (Math.abs(other.z - self.z) > MIN_GAP_Z * 2) continue;
    const dx = newX - other.worldX;
    const dy = newY - other.worldY;
    if (Math.sqrt(dx * dx + dy * dy) < minDist) return true;
  }
  return false;
}

// Render — only touches transform & opacity (GPU-composited props)
function renderSpaceFrame() {
  // Lerp mouse → silky smooth lateral drift
  lerpMX += (rawMX - lerpMX) * 0.08;
  lerpMY += (rawMY - lerpMY) * 0.08;
  const mx = lerpMX * 50;
  const my = lerpMY * 30;

  const halfW = vpW * 0.5;
  const halfH = vpH * 0.5;

  for (let i = 0; i < spaceObjects.length; i++) {
    const obj = spaceObjects[i];

    // Wrap-around: behind camera → recycle to far end with collision avoidance
    if (obj.z < cameraZ + Z_NEAR) {
      // Find furthest Z among all objects
      let maxZ = cameraZ;
      for (let j = 0; j < spaceObjects.length; j++) {
        if (spaceObjects[j].z > maxZ) maxZ = spaceObjects[j].z;
      }
      // Place beyond the furthest + gap
      obj.z = maxZ + MIN_GAP_Z + Math.random() * 400;

      // Generate position that doesn't overlap nearby items
      let attempts = 0;
      let newX, newY;
      do {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.22 + Math.random() * 0.38;
        newX = Math.cos(angle) * radius * vpW;
        newY = Math.sin(angle) * radius * vpH * 0.55;
        attempts++;
      } while (attempts < 5 && isTooClose(obj, newX, newY));
      obj.worldX = newX;
      obj.worldY = newY;

      // Randomize fixed angle on recycle for variety
      obj.rotFixedY = -25 + Math.random() * 50;
      obj.rotTiltX = -15 + Math.random() * 10;
      if (obj.cubeEl) delete obj.cubeEl.dataset.set;
    }

    const dz = obj.z - cameraZ;
    if (dz <= 10) { obj.el.style.opacity = '0'; continue; }

    const s = PERSPECTIVE / dz;                // projection scale
    if (s < 0.03 || s > 5) { obj.el.style.opacity = '0'; continue; }

    const sx = halfW + (obj.worldX + mx) * s;  // screen X
    const sy = halfH + (obj.worldY + my) * s;  // screen Y

    // Opacity: fade in/out at extremes
    let a = 1;
    if (s < 0.12) a = (s - 0.03) / 0.09;
    if (s > 3.0) a = 1 - (s - 3.0) / 2.0;
    if (a <= 0) { obj.el.style.opacity = '0'; obj.el.style.pointerEvents = 'none'; continue; }

    // Wrapper: position + scale via projection
    obj.el.style.transform = `translate3d(${sx - BASE_SIZE * 0.5 * s}px, ${sy - BASE_SIZE * 0.5 * s}px, 0) scale(${s})`;
    obj.el.style.opacity = a.toFixed(3);
    obj.el.style.zIndex  = (s * 100) | 0;
    obj.el.style.pointerEvents = a > 0.3 ? 'auto' : 'none';

    // Static cube angle (set once, or when recycled)
    if (obj.cubeEl && !obj.cubeEl.dataset.set) {
      obj.cubeEl.style.transform = `rotateX(${obj.rotTiltX}deg) rotateY(${obj.rotFixedY}deg)`;
      obj.cubeEl.dataset.set = '1';
    }
  }
}

// Auto-fly tick
function autoFlyTick() {
  if (state.currentPage !== 'home' || state.currentView !== 'space') {
    autoFlyRAF = null;
    return;
  }

  const speed = isHovering ? AUTO_SPEED * 0.15 : AUTO_SPEED + speedBoost;
  cameraZ += speed;

  speedBoost *= BOOST_DECAY;
  if (Math.abs(speedBoost) < 0.01) speedBoost = 0;

  renderSpaceFrame();
  autoFlyRAF = requestAnimationFrame(autoFlyTick);
}

function startAutoFly() {
  if (autoFlyRAF) cancelAnimationFrame(autoFlyRAF);
  autoFlyRAF = requestAnimationFrame(autoFlyTick);
}

function stopAutoFly() {
  if (autoFlyRAF) {
    cancelAnimationFrame(autoFlyRAF);
    autoFlyRAF = null;
  }
}

// Setup: scroll wheel = speed boost, mouse = lateral drift
function setupSpaceScroll() {
  // Scroll wheel → speed boost (scroll faster through space)
  window.addEventListener('wheel', (e) => {
    if (state.currentPage !== 'home' || state.currentView !== 'space') return;
    e.preventDefault();
    speedBoost += e.deltaY * 0.04;
  }, { passive: false });

  // Mouse move → feeds the lerp for smooth parallax
  document.addEventListener('mousemove', (e) => {
    rawMX = (e.clientX / vpW - 0.5) * 2;
    rawMY = (e.clientY / vpH - 0.5) * 2;
  });
}

// ============================================
// GRID VIEW
// ============================================
function createGridView() {
  gridView.innerHTML = '';

  products.forEach((product, index) => {
    const item = document.createElement('div');
    item.className = 'grid-item';
    item.setAttribute('data-product-id', product.id);

    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;
    img.loading = 'lazy';

    // Category tag
    if (product.category) {
      const tag = document.createElement('span');
      tag.className = 'grid-item__tag';
      tag.textContent = product.category;
      item.appendChild(tag);
    }

    // Info overlay (slides up on hover)
    const overlay = document.createElement('div');
    overlay.className = 'grid-item__overlay';
    const overlayName = document.createElement('div');
    overlayName.className = 'grid-item__overlay-name';
    overlayName.textContent = product.name;
    const overlaySub = document.createElement('div');
    overlaySub.className = 'grid-item__overlay-sub';
    overlaySub.textContent = [product.subtitle, product.year].filter(Boolean).join(' — ');
    overlay.appendChild(overlayName);
    overlay.appendChild(overlaySub);

    item.appendChild(img);
    item.appendChild(overlay);

    item.addEventListener('click', () => {
      navigateTo('product', product);
    });

    gridView.appendChild(item);
  });
}

// ============================================
// STATS COUNTER (count-up on first view)
// ============================================
function setupStatsCounter() {
  const statsBar = document.getElementById('statsBar');
  if (!statsBar) return;

  const numbers = statsBar.querySelectorAll('.stats-bar__number');
  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    if (hasAnimated) return;
    for (const entry of entries) {
      if (entry.isIntersecting) {
        hasAnimated = true;
        numbers.forEach(el => animateNumber(el));
        observer.unobserve(statsBar);
        break;
      }
    }
  }, { threshold: 0.5 });

  observer.observe(statsBar);
}

function animateNumber(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1800; // ms
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * ease);
    el.textContent = current.toLocaleString('vi-VN') + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ============================================
// VIEW TOGGLE
// ============================================
function setupViewToggle() {
  btnSpace.addEventListener('click', () => switchView('space'));
  btnGrid.addEventListener('click', () => switchView('grid'));
}

function switchView(view) {
  state.currentView = view;

  // Update buttons
  btnSpace.classList.toggle('active', view === 'space');
  btnGrid.classList.toggle('active', view === 'grid');

  // Update views
  spaceView.classList.toggle('active', view === 'space');
  gridView.classList.toggle('active', view === 'grid');

  if (view === 'space') {
    startAutoFly();
  } else {
    stopAutoFly();
    spaceObjects.forEach(obj => { obj.el.style.opacity = '0'; obj.el.style.pointerEvents = 'none'; });
  }
}

// ============================================
// PRODUCT DETAIL
// ============================================
function openProduct(product) {
  state.currentProduct = product;
  state.sliderIndex = 0;

  // Set info
  productTitle.textContent = product.name;
  productSubtitle.textContent = product.subtitle;
  productAuthor.textContent = product.author;
  productYear.textContent = product.year;
  productDesc.textContent = product.description;

  // Create slider
  createSlider(product);

  // Create variants
  createVariants(product);

  // Update accordion specs
  updateAccordions(product);
}

function createSlider(product) {
  // Clean up previous cube handlers
  cleanupCube();

  productSlider.innerHTML = '';
  productSlider.style.transform = '';
  productSlider.className = 'product-detail__slider cube-mode';

  // Calculate cube size based on gallery
  const gallery = document.getElementById('productGallery');
  const galleryRect = gallery.getBoundingClientRect();
  const cubeSize = Math.min(galleryRect.width * 0.52, galleryRect.height * 0.62, 420);
  const halfSize = cubeSize / 2;

  // Scene container
  const scene = document.createElement('div');
  scene.className = 'cube-scene';
  scene.style.width = cubeSize + 'px';
  scene.style.height = cubeSize + 'px';

  // The cube
  const cube = document.createElement('div');
  cube.className = 'cube';
  cube.style.setProperty('--cube-tz', halfSize + 'px');
  cubeEl = cube;

  // 6 faces
  const sideFaces = ['front', 'right', 'back', 'left'];
  const images = product.images;

  sideFaces.forEach((face, i) => {
    const faceDiv = document.createElement('div');
    faceDiv.className = `cube__face cube__face--${face}`;
    const img = document.createElement('img');
    img.src = images[i % images.length];
    img.alt = `${product.name} - Mặt ${i + 1}`;
    faceDiv.appendChild(img);
    cube.appendChild(faceDiv);
  });

  // Top & bottom faces with logo
  ['top', 'bottom'].forEach(face => {
    const faceDiv = document.createElement('div');
    faceDiv.className = `cube__face cube__face--${face}`;
    const logo = document.createElement('img');
    logo.src = '/images/logo.png';
    logo.alt = 'Tiến Thịnh JSC';
    logo.className = 'cube__logo';
    faceDiv.appendChild(logo);
    cube.appendChild(faceDiv);
  });

  // Floor shadow
  const shadow = document.createElement('div');
  shadow.className = 'cube-shadow';
  shadow.id = 'cubeShadow';

  // Drag hint
  const hint = document.createElement('div');
  hint.className = 'cube-hint';
  hint.textContent = '🔄 Kéo chuột để xoay 3D';

  scene.appendChild(shadow);
  scene.appendChild(cube);
  productSlider.appendChild(scene);
  productSlider.appendChild(hint);

  // Init cube rotation
  cubeRotX = -15;
  cubeRotY = 0;
  updateCubeTransform();

  // Setup drag interaction
  setupCubeDrag(scene);

  // Auto-rotate
  startCubeAutoRotate();

  // Hide hint after 3s
  setTimeout(() => { hint.style.opacity = '0'; }, 3000);

  state.sliderIndex = 0;
  updateSliderCount();
}

function updateCubeTransform() {
  if (!cubeEl) return;
  cubeEl.style.transform = `rotateX(${cubeRotX}deg) rotateY(${cubeRotY}deg)`;
  // Update shadow based on rotation
  const shadow = document.getElementById('cubeShadow');
  if (shadow) {
    const scale = 0.7 + Math.abs(Math.sin(cubeRotX * Math.PI / 180)) * 0.3;
    const blur = 15 + Math.abs(cubeRotX) * 0.3;
    shadow.style.transform = `translateX(-50%) scaleX(${scale})`;
    shadow.style.filter = `blur(${blur}px)`;
  }
}

function setupCubeDrag(scene) {
  const onStart = (e) => {
    cubeDragging = true;
    const point = e.touches ? e.touches[0] : e;
    cubeStartX = point.clientX;
    cubeStartY = point.clientY;
    cubeLastRotX = cubeRotX;
    cubeLastRotY = cubeRotY;
    cubeEl.classList.add('no-transition');
    stopCubeAutoRotate();
    e.preventDefault();
  };

  cubeMoveHandler = (e) => {
    if (!cubeDragging) return;
    const point = e.touches ? e.touches[0] : e;
    const dx = point.clientX - cubeStartX;
    const dy = point.clientY - cubeStartY;
    cubeRotY = cubeLastRotY + dx * 0.5;
    cubeRotX = Math.max(-75, Math.min(75, cubeLastRotX - dy * 0.4));
    updateCubeTransform();
  };

  cubeUpHandler = () => {
    if (!cubeDragging) return;
    cubeDragging = false;
    cubeEl.classList.remove('no-transition');
    // Resume auto-rotate after 2s idle
    setTimeout(() => { if (!cubeDragging) startCubeAutoRotate(); }, 2000);
  };

  scene.addEventListener('mousedown', onStart);
  scene.addEventListener('touchstart', onStart, { passive: false });
  window.addEventListener('mousemove', cubeMoveHandler);
  window.addEventListener('touchmove', cubeMoveHandler, { passive: true });
  window.addEventListener('mouseup', cubeUpHandler);
  window.addEventListener('touchend', cubeUpHandler);
}

function cleanupCube() {
  stopCubeAutoRotate();
  if (cubeMoveHandler) {
    window.removeEventListener('mousemove', cubeMoveHandler);
    window.removeEventListener('touchmove', cubeMoveHandler);
  }
  if (cubeUpHandler) {
    window.removeEventListener('mouseup', cubeUpHandler);
    window.removeEventListener('touchend', cubeUpHandler);
  }
  cubeMoveHandler = null;
  cubeUpHandler = null;
  cubeEl = null;
}

function startCubeAutoRotate() {
  if (cubeAutoRotateRAF) return;
  function tick() {
    if (cubeDragging || state.currentPage !== 'product') {
      cubeAutoRotateRAF = null;
      return;
    }
    cubeRotY += 0.3;
    updateCubeTransform();
    cubeAutoRotateRAF = requestAnimationFrame(tick);
  }
  cubeAutoRotateRAF = requestAnimationFrame(tick);
}

function stopCubeAutoRotate() {
  if (cubeAutoRotateRAF) {
    cancelAnimationFrame(cubeAutoRotateRAF);
    cubeAutoRotateRAF = null;
  }
}

function updateSliderCount() {
  if (!state.currentProduct) return;
  const total = state.currentProduct.images.length;
  sliderCount.textContent = `${state.sliderIndex + 1} / ${total}`;
}

function slideNext() {
  if (!state.currentProduct) return;
  stopCubeAutoRotate();
  const total = state.currentProduct.images.length;
  state.sliderIndex = (state.sliderIndex + 1) % total;
  cubeRotY -= 90;
  if (cubeEl) cubeEl.classList.remove('no-transition');
  updateCubeTransform();
  updateSliderCount();
  setTimeout(() => { if (!cubeDragging) startCubeAutoRotate(); }, 2000);
}

function slidePrev() {
  if (!state.currentProduct) return;
  stopCubeAutoRotate();
  const total = state.currentProduct.images.length;
  state.sliderIndex = (state.sliderIndex - 1 + total) % total;
  cubeRotY += 90;
  if (cubeEl) cubeEl.classList.remove('no-transition');
  updateCubeTransform();
  updateSliderCount();
  setTimeout(() => { if (!cubeDragging) startCubeAutoRotate(); }, 2000);
}

function createVariants(product) {
  productVariants.innerHTML = '';
  if (!product.variants || product.variants.length === 0) return;

  product.variants.forEach((variant, i) => {
    const dot = document.createElement('button');
    dot.className = `variant-dot${i === 0 ? ' active' : ''}`;
    dot.style.backgroundColor = variant.color;
    dot.title = variant.label;
    dot.setAttribute('aria-label', variant.label);

    dot.addEventListener('click', () => {
      productVariants.querySelectorAll('.variant-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });

    productVariants.appendChild(dot);
  });
}

function updateAccordions(product) {
  // Update specs accordion
  const specsAccordion = document.querySelector('[data-section="specs"] .accordion__body p');
  if (specsAccordion) {
    specsAccordion.textContent = product.specs || 'Thông số kỹ thuật sẽ được cập nhật.';
  }
}

function setupSlider() {
  sliderNext.addEventListener('click', slideNext);
  sliderPrev.addEventListener('click', slidePrev);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (state.currentPage !== 'product') return;
    if (e.key === 'ArrowRight') slideNext();
    if (e.key === 'ArrowLeft') slidePrev();
  });
}

function setupBackButton() {
  backBtn.addEventListener('click', () => {
    navigateTo('home');
  });
}

// ============================================
// ACCORDIONS
// ============================================
function setupAccordions() {
  $$('.accordion__header').forEach(header => {
    header.addEventListener('click', () => {
      const accordion = header.parentElement;
      accordion.classList.toggle('open');
    });
  });
}

// ============================================
// CONTACT FORM
// ============================================
function setupContactForm() {
  const form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('.contact-form__submit');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Đang gửi...';
      submitBtn.disabled = true;

      try {
        await submitContact({
          name: form.querySelector('#contactName').value,
          email: form.querySelector('#contactEmail').value,
          phone: form.querySelector('#contactPhone').value,
          subject: form.querySelector('#contactSubject').value,
          message: form.querySelector('#contactMessage').value,
        });

        submitBtn.textContent = '✓ Đã gửi thành công!';
        submitBtn.style.background = '#228B22';
        submitBtn.style.borderColor = '#228B22';

        setTimeout(() => {
          form.reset();
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = '';
          submitBtn.style.borderColor = '';
        }, 2000);
      } catch (err) {
        submitBtn.textContent = '✗ Lỗi gửi, thử lại';
        submitBtn.style.background = '#c0392b';
        submitBtn.disabled = false;
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.style.background = '';
          submitBtn.style.borderColor = '';
        }, 3000);
      }
    });
  }
}

// ============================================
// SCROLL REVEAL ANIMATION
// Uses Intersection Observer for performant scroll-triggered animations
// ============================================
let revealObserver = null;

function setupScrollReveal() {
  // Disconnect previous observer if exists (for page re-navigation)
  if (revealObserver) revealObserver.disconnect();

  // Selectors for elements to animate on scroll
  const revealSelectors = [
    '.content-page__title',
    '.content-page__intro',
    '.timeline__item',
    '.author-card',
    '.exhibition-card',
    '.news-card',
    '.contact-form-area',
    '.contact-info-area',
    '.contact-info__block',
    '.form-group',
    '.page-content__section',
    '.page-content__quote',
    '.page-content__signature',
    '.page-content__greeting',
    '.page-content__intro-text',
    '.value-card',
    '.footer-cta',
  ];

  const elements = document.querySelectorAll(revealSelectors.join(','));

  // Apply reveal class + staggered delay to each element
  elements.forEach(el => {
    // Skip if already set up OR if it's inside a hidden page
    if (el.classList.contains('reveal')) {
      // Reset for re-entry (page navigation)
      el.classList.remove('reveal--visible');
      return;
    }

    el.classList.add('reveal');

    // Stagger sibling elements (cards in a grid, timeline items, form groups)
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        c => c.matches(revealSelectors.join(','))
      );
      const idx = siblings.indexOf(el);
      if (idx > 0 && idx <= 5) {
        el.classList.add(`reveal--d${idx}`);
      }
    }

    // Special directional variants
    if (el.classList.contains('timeline__item')) {
      const idx = Array.from(el.parentElement.children).indexOf(el);
      el.classList.add(idx % 2 === 0 ? 'reveal--left' : 'reveal--right');
    }
  });

  // Create observer
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        // Unobserve after reveal (one-shot animation)
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  // Observe all reveal elements
  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });
}

// ============================================
// HEADER SCROLL SHRINK
// ============================================
let scrollIdleTimer = null;

function setupHeaderScroll() {
  window.addEventListener('scroll', () => {
    // Only shrink on subpages, not on home/product
    if (state.currentPage === 'home' || state.currentPage === 'product') return;

    const scrollY = window.scrollY;

    // Shrink header when scrolling past 50px
    if (scrollY > 50) {
      header.classList.add('header--compact');
    }

    // Clear previous idle timer
    clearTimeout(scrollIdleTimer);

    // When scroll stops for 600ms, restore header
    scrollIdleTimer = setTimeout(() => {
      header.classList.remove('header--compact');
    }, 600);
  }, { passive: true });
}

// ============================================
// FOOTER REVEAL ANIMATION
// ============================================
function setupFooterReveal() {
  const footer = $('#siteFooter');
  if (!footer) return;

  const footerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Small delay for dramatic effect
        setTimeout(() => {
          footer.classList.add('footer--revealed');
        }, 100);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px 0px 0px'
  });

  footerObserver.observe(footer);
}

// ============================================
// WINDOW RESIZE
// ============================================
function setupResize() {
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (state.currentView === 'space') {
        createSpaceView();
      }
    }, 300);
  });
}

// ============================================
// THEME TOGGLE (Dark Mode)
// ============================================
function setupThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  // Apply saved theme or system preference
  const savedTheme = localStorage.getItem('tt-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // Toggle on click
  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    if (next === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    localStorage.setItem('tt-theme', next);
  });

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('tt-theme')) {
      if (e.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  });
}

// ============================================
// FOOTER CTA — Navigate to contact page
// ============================================
function setupFooterCTA() {
  const ctaBtn = document.querySelector('.footer-cta__btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('contact');
    });
  }
}

// ============================================
// DYNAMIC NEWS RENDERING
// ============================================
async function renderNews() {
  const newsGrid = $('#newsGrid');
  if (!newsGrid) return;

  const posts = await fetchPosts();
  if (!posts.length) return; // Keep static HTML if no DB posts

  newsGrid.innerHTML = '';
  posts.forEach(post => {
    const article = document.createElement('article');
    article.className = 'news-card';
    article.innerHTML = `
      <div class="news-card__img">
        <img src="${post.featured_image || '/images/factory-interior.png'}" alt="${post.title}" loading="lazy" />
      </div>
      <div class="news-card__content">
        <span class="news-card__date">${post.published_at ? new Date(post.published_at).toLocaleDateString('vi-VN') : ''}</span>
        <h3 class="news-card__title">${post.title}</h3>
        <p class="news-card__excerpt">${post.excerpt || ''}</p>
      </div>
    `;
    newsGrid.appendChild(article);
  });
}

// ============================================
// DYNAMIC DOCUMENTS RENDERING
// ============================================
async function renderDocuments() {
  const docsContainer = document.querySelector('#page-documents .subpage-content');
  if (!docsContainer) return;

  const docs = await fetchDocuments();
  if (!docs.length) {
    docsContainer.innerHTML = '<p>Chưa có tài liệu nào được công bố.</p>';
    return;
  }

  const getIcon = (type) => {
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('word')) return '📝';
    if (type?.includes('excel')) return '📊';
    return '📎';
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  docsContainer.innerHTML = `
    <div class="documents-list">
      ${docs.map(doc => `
        <a href="${doc.file_url}" target="_blank" rel="noreferrer" class="doc-item">
          <span class="doc-item__icon">${getIcon(doc.file_type)}</span>
          <div class="doc-item__info">
            <span class="doc-item__title">${doc.title}</span>
            <span class="doc-item__meta">${formatSize(doc.file_size)}</span>
          </div>
          <svg class="doc-item__dl" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21 15-3 3m0 0-3-3m3 3V9"/><path d="M3 10v8a2 2 0 002 2h14"/></svg>
        </a>
      `).join('')}
    </div>
  `;
}

// ============================================
// DYNAMIC SETTINGS — Update footer/contact with DB values
// ============================================
async function applySettings() {
  const settings = await fetchSettings();
  if (!settings || !Object.keys(settings).length) return;

  // Update contact info if available
  const contactPhone = document.querySelector('.contact-info__block:nth-child(3) p');
  if (contactPhone && settings.contact_phone) {
    // Don't override hardcoded HTML, just keep it
  }

  // Update footer copyright year
  const copyright = document.querySelector('.footer__copyright');
  if (copyright) {
    const year = new Date().getFullYear();
    copyright.textContent = `© ${year} ${settings.company_name || 'Tiến Thịnh JSC'}. All rights reserved.`;
  }
}

// ============================================
// INIT
// ============================================
async function init() {
  setupThemeToggle();

  // Fetch real data from Supabase (fall back to static)
  try {
    const supabaseProducts = await fetchProjects();
    if (supabaseProducts?.length) {
      products = supabaseProducts;
    }
  } catch {
    console.log('Using static product data');
  }

  createSpaceView();
  createGridView();
  setupNavigation();
  setupMenu();
  setupSearch();
  setupViewToggle();
  setupStatsCounter();
  setupSpaceScroll();
  setupSlider();
  setupBackButton();
  setupAccordions();
  setupContactForm();
  setupResize();
  setupScrollReveal();
  setupHeaderScroll();
  setupFooterReveal();
  setupFooterCTA();

  // Default to home page
  navigateTo('home');

  // Load dynamic content in background
  renderNews();
  renderDocuments();
  applySettings();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

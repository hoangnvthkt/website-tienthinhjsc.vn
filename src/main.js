import './style.css';
import { products } from './data.js';

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
  if (page === 'product') {
    header.style.display = 'none';
    viewToggle.style.display = 'none';
    if (data) openProduct(data);
  } else if (page === 'home') {
    header.style.display = '';
    viewToggle.style.display = '';
    cleanupCube();
  } else {
    header.style.display = '';
    viewToggle.style.display = 'none';
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
const BASE_SIZE    = 300;       // fixed DOM size; actual size via scale()
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

    const obj = { product, z, worldX, worldY, el: null };
    spaceObjects.push(obj);

    // DOM — fixed size, scaled via transform
    const item = document.createElement('div');
    item.className = 'space-item space-item--3d';
    item.style.width  = BASE_SIZE + 'px';
    item.style.height = BASE_SIZE + 'px';

    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;
    img.loading = (i < 4) ? 'eager' : 'lazy';

    const label = document.createElement('span');
    label.className = 'space-item__label';
    label.textContent = product.name;

    // 3D Tilt glare overlay
    const glare = document.createElement('div');
    glare.className = 'space-item__glare';

    item.appendChild(img);
    item.appendChild(glare);
    item.appendChild(label);
    item.addEventListener('click', () => navigateTo('product', product));
    item.addEventListener('mouseenter', () => { isHovering = true; });
    item.addEventListener('mouseleave', () => {
      isHovering = false;
      // Reset 3D tilt
      img.style.transform = '';
      img.style.boxShadow = '';
      glare.style.opacity = '0';
    });

    // 3D Tilt on mousemove
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotX = (0.5 - y) * 25;
      const rotY = (x - 0.5) * 25;
      img.style.transform = `perspective(500px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.06)`;
      img.style.boxShadow = `${-rotY * 0.8}px ${rotX * 0.8}px 40px rgba(0,0,0,0.25)`;
      glare.style.opacity = '1';
      glare.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.3), transparent 50%)`;
    });

    spaceView.appendChild(item);
    obj.el = item;
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

    // Single transform: translate3d (GPU layer) + scale
    obj.el.style.transform = `translate3d(${sx - BASE_SIZE * 0.5 * s}px, ${sy - BASE_SIZE * 0.5 * s}px, 0) scale(${s})`;
    obj.el.style.opacity = a.toFixed(3);
    obj.el.style.zIndex  = (s * 100) | 0;
    obj.el.style.pointerEvents = a > 0.3 ? 'auto' : 'none';
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

    const name = document.createElement('span');
    name.className = 'grid-item__name';
    name.textContent = product.name;

    item.appendChild(img);
    item.appendChild(name);

    item.addEventListener('click', () => {
      navigateTo('product', product);
    });

    gridView.appendChild(item);
  });
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
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Simulate form submission
      const submitBtn = form.querySelector('.contact-form__submit');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Đang gửi...';
      submitBtn.disabled = true;

      setTimeout(() => {
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
      }, 1000);
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
// INIT
// ============================================
function init() {
  createSpaceView();
  createGridView();
  setupNavigation();
  setupMenu();
  setupSearch();
  setupViewToggle();
  setupSpaceScroll();
  setupSlider();
  setupBackButton();
  setupAccordions();
  setupContactForm();
  setupResize();
  setupScrollReveal();
  setupHeaderScroll();
  setupFooterReveal();

  // Default to home page
  navigateTo('home');
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

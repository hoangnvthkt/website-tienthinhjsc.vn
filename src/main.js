import './style.css';
import { products as staticProducts } from './data.js';
import { fetchProjects, fetchPosts, fetchDocuments, fetchSettings, submitContact, fetchNavigation, fetchPageSections, fetchFeaturedProjects, fetchPages } from './api.js';
import { t, getLang, setLang, initI18n, getRouteTitle, translations } from './i18n.js';

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
// URL ROUTER — Slug ↔ Page mapping
// ============================================
const ROUTES = {
  '/': { page: 'home', title: 'Trang chủ' },
  // Giới thiệu
  '/thu-ngo': { page: 'about-letter', title: 'Thư Ngỏ' },
  '/tam-nhin-su-menh': { page: 'about-vision', title: 'Tầm Nhìn & Sứ Mệnh' },
  '/gia-tri-cot-loi': { page: 'about-values', title: 'Giá Trị Cốt Lõi' },
  '/lich-su': { page: 'history', title: 'Lịch Sử Hình Thành' },
  '/so-do-to-chuc': { page: 'about-org', title: 'Sơ Đồ Tổ Chức' },
  '/chung-chi': { page: 'about-cert', title: 'Chứng Chỉ' },
  '/giai-thuong': { page: 'about-awards', title: 'Giải Thưởng' },
  // Năng lực
  '/nang-luc-nhan-su': { page: 'cap-hr', title: 'Năng Lực Nhân Sự' },
  '/nang-luc-san-xuat': { page: 'cap-prod', title: 'Năng Lực Sản Xuất' },
  '/nang-luc-thi-cong': { page: 'cap-construct', title: 'Năng Lực Thi Công' },
  '/nang-luc-nha-may': { page: 'cap-factory', title: 'Năng Lực Nhà Máy Thiết Bị' },
  '/an-toan-lao-dong': { page: 'cap-safety', title: 'Quản Lý An Toàn Lao Động' },
  // Dịch vụ
  '/tong-thau-xay-dung': { page: 'svc-general', title: 'Tổng Thầu Xây Dựng' },
  '/tu-van-dau-tu-fdi': { page: 'svc-fdi', title: 'Tư Vấn Đầu Tư Dự Án FDI' },
  '/san-xuat-ket-cau-thep': { page: 'svc-steel', title: 'Sản Xuất Kết Cấu Thép' },
  '/tu-van-thiet-ke': { page: 'svc-design', title: 'Tư Vấn Thiết Kế' },
  '/kinh-doanh-thuong-mai': { page: 'svc-trade', title: 'Kinh Doanh Thương Mại' },
  // Dự án
  '/du-an-da-trien-khai': { page: 'proj-done', title: 'Dự Án Đã Triển Khai' },
  '/du-an-dang-trien-khai': { page: 'proj-ongoing', title: 'Dự Án Đang Triển Khai' },
  '/du-an-tieu-bieu': { page: 'exhibitions', title: 'Dự Án Tiêu Biểu' },
  '/du-an-theo-quoc-gia': { page: 'proj-country', title: 'Dự Án Theo Quốc Gia' },
  '/du-an-theo-linh-vuc': { page: 'proj-field', title: 'Dự Án Theo Lĩnh Vực' },
  // Tin tức
  '/tin-cong-ty': { page: 'news', title: 'Tin Công Ty' },
  '/tin-cong-truong': { page: 'news-site', title: 'Tin Công Trường' },
  '/tuyen-dung': { page: 'news-recruit', title: 'Tin Tuyển Dụng' },
  '/kien-thuc-chuyen-mon': { page: 'news-knowledge', title: 'Kiến Thức Chuyên Môn' },
  // Khác
  '/lien-he': { page: 'contact', title: 'Liên Hệ' },
  '/tai-lieu': { page: 'documents', title: 'Tài Liệu' },
};

// Reverse lookup: page → slug
const PAGE_TO_SLUG = {};
const PAGE_TO_TITLE = {};
for (const [slug, info] of Object.entries(ROUTES)) {
  PAGE_TO_SLUG[info.page] = slug;
  PAGE_TO_TITLE[info.page] = info.title;
}

const SITE_NAME = 'Tiến Thịnh JSC';

// ============================================
// NAVIGATION
// ============================================
function navigateTo(page, data = null, { pushHistory = true } = {}) {
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

  // Update URL via History API
  if (pushHistory) {
    const slug = PAGE_TO_SLUG[page] || '/';
    const title = getRouteTitle(page);
    const fullTitle = page === 'home' ? SITE_NAME : `${title} — ${SITE_NAME}`;
    document.title = fullTitle;
    history.pushState({ page, data: null }, fullTitle, slug);
  }

  // Update document title (also for popstate)
  const title = getRouteTitle(page);
  document.title = page === 'home' ? SITE_NAME : `${title} — ${SITE_NAME}`;

  // Show/hide header based on page
  const statsBar = document.getElementById('statsBar');
  if (page === 'product') {
    header.style.display = 'none';
    viewToggle.style.display = 'none';
    if (statsBar) statsBar.style.display = 'none';
    if (data) openProduct(data);
  } else if (page === 'post-detail') {
    header.style.display = '';
    viewToggle.style.display = 'none';
    if (statsBar) statsBar.style.display = 'none';
    cleanupCube();
    if (data) renderPostDetail(data);
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

  // Hide space/road items & stop animations when leaving home
  if (page !== 'home') {
    stopAutoFly();
    stopRoadAnimation();
    setHeaderRoadMode(false);
    stopAmbientSound();
    spaceObjects.forEach(obj => { obj.el.style.opacity = '0'; obj.el.style.pointerEvents = 'none'; });
    roadObjects.forEach(obj => { obj.el.style.opacity = '0'; obj.el.style.pointerEvents = 'none'; });
    roadMilestoneEls.forEach(ms => { ms.el.style.opacity = '0'; ms.el.style.pointerEvents = 'none'; });
  }

  // Scroll to top
  window.scrollTo(0, 0);

  // Re-init scroll reveal for new page content
  if (page !== 'home') {
    setTimeout(() => setupScrollReveal(), 50);
  }

  // Re-start animations if returning to home
  if (page === 'home' && state.currentView === 'space') {
    startAutoFly();
  } else if (page === 'home' && state.currentView === 'road') {
    if (!roadInitialized) createRoadView();
    startRoadAnimation();
    setHeaderRoadMode(true);
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

  // Update active states on nav links
  $$('[data-page]').forEach(link => {
    const linkPage = link.getAttribute('data-page');
    link.classList.toggle('active', linkPage === page);
  });
}

// Handle browser Back / Forward buttons
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.page) {
    navigateTo(e.state.page, null, { pushHistory: false });
  } else {
    // Fallback: read URL
    const route = ROUTES[window.location.pathname];
    navigateTo(route ? route.page : 'home', null, { pushHistory: false });
  }
});

// Read initial URL on page load
let pendingDynamicPath = null; // For dynamic pages not yet loaded

function initRouter() {
  const path = window.location.pathname;
  const route = ROUTES[path];
  if (route && route.page !== 'home') {
    // Navigate to the page matching the URL, without pushing history (it's the initial load)
    navigateTo(route.page, null, { pushHistory: false });
    // Replace current history entry so Back button works correctly
    history.replaceState({ page: route.page }, document.title, path);
  } else if (path === '/' || path === '') {
    history.replaceState({ page: 'home' }, document.title, '/');
  } else {
    // URL not in static routes — could be a dynamic page (loaded later)
    // Store path and show home for now; loadDynamicPages will re-route
    pendingDynamicPath = path;
    navigateTo('home', null, { pushHistory: false });
    // Don't replaceState yet — keep the URL as-is
  }
}

// Setup nav links — also update href for SEO & right-click "Open in new tab"
function setupNavigation() {
  $$('[data-page]').forEach(link => {
    const page = link.getAttribute('data-page');
    const slug = PAGE_TO_SLUG[page];
    if (slug) {
      link.setAttribute('href', slug);
    }
    link.addEventListener('click', (e) => {
      e.preventDefault();
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
// HISTORY ROAD — Futuristic Winding Road 3D
// Perspective road from far (past/2005) to near (present/2024)
// Cubes float within road boundaries, milestones along sides
// ============================================

// Road constants
const ROAD_TOTAL_DEPTH  = 6000;         // total road depth (Z)
const ROAD_VANISH_Y     = 0.22;         // vanishing point Y ratio (from top)
const ROAD_AUTO_SPEED   = 0.3;
const ROAD_SCROLL_MULT  = 0.08;
const ROAD_BOOST_DECAY  = 0.94;
const ROAD_MAX_SPEED    = 30;
const ROAD_YEAR_MIN     = 2005;
const ROAD_YEAR_MAX     = 2025;
const ROAD_SEGMENTS     = 200;          // path resolution
const ROAD_WIDTH_NEAR   = 840;          // road width at bottom (px) — x2
const ROAD_WIDTH_FAR    = 24;           // road width at vanish point (px) — x2

// Road state
const roadView       = $('#roadView');
const roadCanvas     = document.getElementById('roadCanvas');
const roadMilestones = $('#roadMilestones');
const btnRoad        = $('#btnRoad');
const roadSoundToggle = $('#roadSoundToggle');
const roadScrollHint = $('#roadScrollHint');
let roadCtx          = null;
let roadCameraZ      = 0;              // camera position along road
let roadCameraZTarget = 0;
let roadSpeedBoost   = 0;
let roadRAF          = null;
let roadObjects      = [];              // project cubes on road
let roadParticles    = [];
let roadColorPhase   = 0;
let roadInitialized  = false;
let roadMilestoneEls = [];
let roadScrolledOnce = false;
let roadStars        = [];
let roadPathCache    = [];              // cached road path points
let roadFlowParticles = [];             // light trails on road

// Ambient sound
let audioCtx         = null;
let ambientGain      = null;
let roadSoundOn      = false;
let ambientNodes     = [];

// ============ TIMELINE DATA — TUỲ CHỈNH TẠI ĐÂY ============
// Mỗi năm có thể có NHIỀU sự kiện. Thêm/sửa/xóa tại đây.
// Mỗi event sẽ hiển thị 1 milestone trên con đường.
// cubeId: ID sản phẩm (từ data.js) sẽ hiển thị cube tại mốc này.
//   - Để null nếu không muốn hiển thị cube tại mốc đó.
//   - Mỗi cubeId chỉ nên dùng 1 lần để tránh trùng lặp.
const ROAD_TIMELINE = [
  { year: 2005, events: [
    { title: 'Thành lập công ty', desc: 'Tiến Thịnh JSC được thành lập, bắt đầu hành trình trong lĩnh vực kết cấu thép.', cubeId: 'doi-ngu-thi-cong' },
  ]},
  { year: 2008, events: [
    { title: 'Mở rộng quy mô', desc: 'Đầu tư nhà xưởng sản xuất hiện đại, nâng công suất lên 5.000 tấn/năm.', cubeId: 'nha-may-interior' },
  ]},
  { year: 2012, events: [
    { title: 'Đạt chứng nhận ISO', desc: 'Đạt chứng nhận ISO 9001:2008, khẳng định chất lượng quản lý.', cubeId: 'chi-tiet-ket-cau' },
    { title: 'Dự án cầu thép đầu tiên', desc: 'Hoàn thành dự án cầu thép quy mô lớn đầu tiên tại miền Trung.', cubeId: 'cau-thep-vuot-song' },
  ]},
  { year: 2015, events: [
    { title: 'Khẳng định vị thế', desc: 'Trở thành nhà thầu kết cấu thép hàng đầu khu vực, với 500+ dự án hoàn thành.', cubeId: 'nha-xuong-samsung' },
  ]},
  { year: 2018, events: [
    { title: 'Công nghệ BIM', desc: 'Áp dụng công nghệ BIM vào thiết kế và quản lý dự án.', cubeId: 'cao-oc-25-tang' },
    { title: 'Nhà máy mới', desc: 'Khánh thành nhà máy sản xuất thứ 2, nâng tổng công suất lên 15.000 tấn/năm.', cubeId: 'ket-cau-mai' },
  ]},
  { year: 2021, events: [
    { title: 'Chuyển đổi số', desc: 'Triển khai hệ thống ERP và quản lý dự án số hoá toàn diện.', cubeId: 'khung-thep-nang-luong' },
  ]},
  { year: 2024, events: [
    { title: 'Mở rộng quốc tế', desc: 'Xuất khẩu kết cấu thép sang thị trường Nhật Bản và Hàn Quốc.', cubeId: 'khung-thep-tien-che' },
    { title: 'Năng lượng tái tạo', desc: 'Thi công hệ thống khung thép cho 3 nhà máy điện mặt trời.', cubeId: null },
    { title: '50.000 tấn thép', desc: 'Cán mốc tổng sản lượng 50.000 tấn thép đã cung cấp.', cubeId: null },
  ]},
];

// Flatten timeline → flat array of milestones for rendering
function buildMilestoneList() {
  const list = [];
  ROAD_TIMELINE.forEach(yearData => {
    yearData.events.forEach((evt, i) => {
      list.push({
        year: yearData.year,
        eventIndex: i,
        totalInYear: yearData.events.length,
        title: evt.title,
        desc: evt.desc,
        cubeId: evt.cubeId || null,
      });
    });
  });
  return list;
}
const ROAD_MILESTONE_DATA = buildMilestoneList();

// Color palette
const ROAD_COLORS = [
  [79, 255, 176],    // neon emerald
  [0, 212, 170],     // teal
  [91, 180, 255],    // electric blue
  [255, 200, 60],    // warm gold
  [180, 120, 255],   // soft purple
  [255, 100, 180],   // magenta pink
];

function getRoadColor(alpha) {
  const idx = Math.floor(roadColorPhase) % ROAD_COLORS.length;
  const next = (idx + 1) % ROAD_COLORS.length;
  const frac = roadColorPhase - Math.floor(roadColorPhase);
  const r = Math.round(ROAD_COLORS[idx][0] + (ROAD_COLORS[next][0] - ROAD_COLORS[idx][0]) * frac);
  const g = Math.round(ROAD_COLORS[idx][1] + (ROAD_COLORS[next][1] - ROAD_COLORS[idx][1]) * frac);
  const b = Math.round(ROAD_COLORS[idx][2] + (ROAD_COLORS[next][2] - ROAD_COLORS[idx][2]) * frac);
  return `rgba(${r},${g},${b},${alpha})`;
}

function getColorAt(phase, alpha) {
  const idx = Math.floor(phase) % ROAD_COLORS.length;
  const next = (idx + 1) % ROAD_COLORS.length;
  const frac = phase - Math.floor(phase);
  const r = Math.round(ROAD_COLORS[idx][0] + (ROAD_COLORS[next][0] - ROAD_COLORS[idx][0]) * frac);
  const g = Math.round(ROAD_COLORS[idx][1] + (ROAD_COLORS[next][1] - ROAD_COLORS[idx][1]) * frac);
  const b = Math.round(ROAD_COLORS[idx][2] + (ROAD_COLORS[next][2] - ROAD_COLORS[idx][2]) * frac);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Convert year (2005–2025) to road Z position (0 = near/present, ROAD_TOTAL_DEPTH = far/past)
function yearToRoadZ(year) {
  const t = (year - ROAD_YEAR_MIN) / (ROAD_YEAR_MAX - ROAD_YEAR_MIN);
  // Newest year = near (small Z), oldest = far (large Z)
  return ROAD_TOTAL_DEPTH * (1 - t);
}

// Road path: winding bezier-like curve
// Returns {x, y} screen position for a given depth ratio t (0=vanish/far, 1=bottom/near)
function getRoadCenterAt(t) {
  // Multi-sine winding — road curves left and right as it recedes
  const wind = Math.sin(t * Math.PI * 3.2) * 0.18
             + Math.sin(t * Math.PI * 1.7 + 0.5) * 0.1
             + Math.sin(t * Math.PI * 5.1 + 1.2) * 0.04;
  const centerX = 0.5 + wind;
  // Y: perspective — bottom of screen at t=1, vanishing point at t=0
  const centerY = ROAD_VANISH_Y + t * (0.92 - ROAD_VANISH_Y);
  return { x: centerX, y: centerY };
}

// Get road width at depth ratio t
function getRoadWidthAt(t) {
  return ROAD_WIDTH_FAR + t * t * (ROAD_WIDTH_NEAR - ROAD_WIDTH_FAR);
}

// Build cached road path for rendering (call once per frame or on init)
function buildRoadPath() {
  roadPathCache = [];
  for (let i = 0; i <= ROAD_SEGMENTS; i++) {
    const t = i / ROAD_SEGMENTS;
    const center = getRoadCenterAt(t);
    const width = getRoadWidthAt(t);
    roadPathCache.push({ t, cx: center.x, cy: center.y, width });
  }
}

// ---- INITIALIZATION ----

function createRoadView() {
  if (!roadCanvas || !roadView) return;

  const dpr = Math.min(window.devicePixelRatio, 1.5);
  roadCanvas.width  = vpW * dpr;
  roadCanvas.height = vpH * dpr;
  roadCtx = roadCanvas.getContext('2d');

  // Build the road path
  buildRoadPath();

  // Clean up old cubes
  roadObjects = [];
  roadView.querySelectorAll('.space-item--3d').forEach(el => el.remove());
  roadView.querySelectorAll('.road-cube-year').forEach(el => el.remove());

  // Build product lookup map (id + slug → product)
  // Uses both current products (possibly Supabase) and static fallback
  const productMap = {};
  // First: static products (guaranteed to have matching IDs)
  staticProducts.forEach(p => {
    productMap[p.id] = p;
  });
  // Then: current products (possibly updated from Supabase)
  products.forEach(p => {
    productMap[p.id] = p;
    if (p.slug) productMap[p.slug] = p;
  });

  // Create cubes ONLY for milestones that have a cubeId assigned
  let cubeIndex = 0;
  ROAD_MILESTONE_DATA.forEach((ms, msIdx) => {
    if (!ms.cubeId) return; // Skip milestones without cube assignment

    const product = productMap[ms.cubeId];
    if (!product) {
      console.warn(`[Road] cubeId "${ms.cubeId}" not found in products. Available IDs:`, Object.keys(productMap).slice(0, 15));
      return;
    }

    // Position cube at its milestone's Z
    const baseZ = yearToRoadZ(ms.year);
    const stagger = ms.totalInYear > 1 ? ms.eventIndex * 180 : 0;
    const roadZ = baseZ + stagger;
    const side = (msIdx % 2 === 0) ? 1 : -1;
    const offset = 0.7 + (cubeIndex % 3) * 0.1; // 70-90% from center — near road edge

    const obj = {
      product, year: ms.year, roadZ, side, offset,
      milestoneIdx: msIdx,
      colorPhase: (cubeIndex / 8) * ROAD_COLORS.length,
      sway: cubeIndex * 1.5, // deterministic starting phase
      swaySpeed: 0.0008 + (cubeIndex % 4) * 0.0004,
      cubeSize: window.innerWidth <= 768 ? 120 : 160,
    };

    // Create cube DOM
    const item = document.createElement('div');
    item.className = 'space-item space-item--3d road-cube-item';
    item.style.width = obj.cubeSize + 'px';
    item.style.height = obj.cubeSize + 'px';
    item.style.position = 'absolute';
    item.style.transformOrigin = 'center center';

    const scene = document.createElement('div');
    scene.className = 'cube-scene-mini';
    const cube = document.createElement('div');
    cube.className = 'cube-mini';
    cube.style.setProperty('--cube-tz', (obj.cubeSize / 2) + 'px');

    const sideFaces = ['front', 'right', 'back', 'left'];
    const images = product.images;
    sideFaces.forEach((face, fi) => {
      const faceDiv = document.createElement('div');
      faceDiv.className = `cube-mini__face cube-mini__face--${face}`;
      const img = document.createElement('img');
      img.src = images[fi % images.length];
      img.alt = `${product.name} - ${face}`;
      img.loading = 'lazy';
      faceDiv.appendChild(img);
      cube.appendChild(faceDiv);
    });

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

    const label = document.createElement('span');
    label.className = 'space-item__label';
    label.textContent = product.name;
    item.appendChild(label);

    // Year label
    const yearLabel = document.createElement('div');
    yearLabel.className = 'road-cube-year';
    yearLabel.textContent = ms.year;
    yearLabel.style.cssText = `
      position: absolute; font-size: 12px; font-weight: 700; 
      color: rgba(79, 255, 176, 0.85);
      text-shadow: 0 0 10px rgba(79,255,176,0.4);
      letter-spacing: 0.15em; font-family: var(--font-primary);
      pointer-events: none; white-space: nowrap; text-align: center;
    `;

    item.addEventListener('click', () => navigateTo('product', product));
    roadView.appendChild(item);
    roadView.appendChild(yearLabel);

    obj.el = item;
    obj.cubeEl = cube;
    obj.yearEl = yearLabel;
    roadObjects.push(obj);
    cubeIndex++;
  });

  createRoadMilestoneEls();

  // Road flow particles (light streaks on road surface)
  roadFlowParticles = [];
  for (let i = 0; i < 60; i++) {
    roadFlowParticles.push(createFlowParticle());
  }

  // Ambient particles (floating in space)
  roadParticles = [];
  for (let i = 0; i < 80; i++) {
    roadParticles.push({
      x: Math.random() * vpW,
      y: Math.random() * vpH,
      size: 0.5 + Math.random() * 2,
      alpha: 0.05 + Math.random() * 0.25,
      drift: 0.1 + Math.random() * 0.3,
      driftAngle: Math.random() * Math.PI * 2,
      twinkle: Math.random() * Math.PI * 2,
      colorIdx: Math.floor(Math.random() * ROAD_COLORS.length)
    });
  }

  // Stars
  roadStars = [];
  for (let i = 0; i < 200; i++) {
    roadStars.push({
      x: Math.random() * vpW,
      y: Math.random() * vpH * 0.65,
      size: 0.3 + Math.random() * 1.5,
      alpha: 0.1 + Math.random() * 0.6,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.004 + Math.random() * 0.012
    });
  }

  roadCameraZ = 0;
  roadCameraZTarget = 0;
  roadSpeedBoost = 0;
  roadScrolledOnce = false;
  if (roadScrollHint) roadScrollHint.classList.remove('hidden');

  roadInitialized = true;
}

function createFlowParticle() {
  return {
    t: Math.random(), // position along road (0=far, 1=near)
    speed: 0.001 + Math.random() * 0.004,
    lateralOffset: (Math.random() - 0.5) * 0.8, // -0.4 to 0.4 across road
    size: 1 + Math.random() * 3,
    alpha: 0.15 + Math.random() * 0.45,
    colorIdx: Math.floor(Math.random() * ROAD_COLORS.length),
    trail: 0.02 + Math.random() * 0.04
  };
}

function createRoadMilestoneEls() {
  if (!roadMilestones) return;
  roadMilestones.innerHTML = '';
  roadMilestoneEls = [];

  // Build product lookup for milestone labels (by id + slug)
  const productMap = {};
  staticProducts.forEach(p => { productMap[p.id] = p; });
  products.forEach(p => {
    productMap[p.id] = p;
    if (p.slug) productMap[p.slug] = p;
  });

  ROAD_MILESTONE_DATA.forEach((ms, idx) => {
    const el = document.createElement('div');
    el.className = 'road-milestone';
    if (ms.cubeId) el.classList.add('road-milestone--has-cube');
    
    // Show event index if multiple events in same year
    const eventLabel = ms.totalInYear > 1 ? ` (${ms.eventIndex + 1}/${ms.totalInYear})` : '';
    const product = ms.cubeId ? productMap[ms.cubeId] : null;
    const projectLabel = product ? `<div class="road-milestone__project">${product.name}</div>` : '';
    
    el.innerHTML = `
      <div class="road-milestone__dot"></div>
      <div class="road-milestone__year">${ms.year}</div>
      <div class="road-milestone__title">${ms.title}</div>
      <div class="road-milestone__content">
        <h4>${ms.year} — ${ms.title}${eventLabel}</h4>
        <p>${ms.desc}</p>
        ${projectLabel}
      </div>
    `;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasActive = el.classList.contains('active');
      roadMilestoneEls.forEach(m => m.el.classList.remove('active'));
      if (!wasActive) el.classList.add('active');
    });

    roadMilestones.appendChild(el);
    roadMilestoneEls.push({ el, data: ms });
  });
}

// ---- CANVAS DRAWING ----

function drawRoad() {
  const ctx = roadCtx;
  const cw = roadCanvas.width;
  const ch = roadCanvas.height;
  const scaleX = cw / vpW;
  const scaleY = ch / vpH;

  ctx.fillStyle = 'rgba(6, 8, 15, 0.3)';
  ctx.fillRect(0, 0, cw, ch);

  drawStarField(ctx, cw, ch, scaleX, scaleY);
  drawRoadSurface(ctx, cw, ch, scaleX, scaleY);
  drawRoadFlowParticles(ctx, cw, ch, scaleX, scaleY);
  drawAmbientParticles(ctx, cw, ch, scaleX, scaleY);
}

// Road surface — neon edge lines with subtle fill
function drawRoadSurface(ctx, cw, ch, scaleX, scaleY) {
  if (roadPathCache.length < 2) return;

  const pulse = 0.8 + Math.sin(performance.now() * 0.0008) * 0.2;
  const camOffset = (roadCameraZ % ROAD_TOTAL_DEPTH) / ROAD_TOTAL_DEPTH;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // ---- Road fill (very subtle dark surface) ----
  ctx.beginPath();
  for (let i = 0; i < roadPathCache.length; i++) {
    const p = roadPathCache[i];
    const x = p.cx * vpW * scaleX;
    const y = p.cy * vpH * scaleY;
    const hw = p.width * 0.5 * scaleX;
    if (i === 0) ctx.moveTo(x - hw, y);
    else ctx.lineTo(x - hw, y);
  }
  for (let i = roadPathCache.length - 1; i >= 0; i--) {
    const p = roadPathCache[i];
    const x = p.cx * vpW * scaleX;
    const y = p.cy * vpH * scaleY;
    const hw = p.width * 0.5 * scaleX;
    ctx.lineTo(x + hw, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(15, 25, 40, 0.35)';
  ctx.fill();

  // ---- Left edge line (neon glow) ----
  for (const pass of [{w: 12, a: 0.06}, {w: 5, a: 0.2}, {w: 1.8, a: 0.7}]) {
    ctx.beginPath();
    for (let i = 0; i < roadPathCache.length; i++) {
      const p = roadPathCache[i];
      const x = (p.cx * vpW - p.width * 0.5) * scaleX;
      const y = p.cy * vpH * scaleY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = getRoadColor(pass.a * pulse);
    ctx.lineWidth = pass.w * scaleX;
    ctx.shadowColor = getRoadColor(0.3);
    ctx.shadowBlur = pass.w > 5 ? 20 * scaleX : 0;
    ctx.stroke();
  }

  // ---- Right edge line (neon glow) ----
  for (const pass of [{w: 12, a: 0.06}, {w: 5, a: 0.2}, {w: 1.8, a: 0.7}]) {
    ctx.beginPath();
    for (let i = 0; i < roadPathCache.length; i++) {
      const p = roadPathCache[i];
      const x = (p.cx * vpW + p.width * 0.5) * scaleX;
      const y = p.cy * vpH * scaleY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = getRoadColor(pass.a * pulse);
    ctx.lineWidth = pass.w * scaleX;
    ctx.shadowColor = getRoadColor(0.3);
    ctx.shadowBlur = pass.w > 5 ? 20 * scaleX : 0;
    ctx.stroke();
  }

  ctx.shadowBlur = 0;

  // ---- Center dashes (animated) ----
  const dashLength = 0.025;
  const gapLength = 0.025;
  const dashScroll = (performance.now() * 0.00015 + camOffset) % 1;

  ctx.setLineDash([]);
  for (let tStart = -dashScroll; tStart < 1; tStart += dashLength + gapLength) {
    const t0 = Math.max(0, tStart);
    const t1 = Math.min(1, tStart + dashLength);
    if (t1 <= t0) continue;

    const i0 = Math.floor(t0 * ROAD_SEGMENTS);
    const i1 = Math.ceil(t1 * ROAD_SEGMENTS);
    if (i0 >= roadPathCache.length || i1 >= roadPathCache.length) continue;

    ctx.beginPath();
    for (let i = i0; i <= i1 && i < roadPathCache.length; i++) {
      const p = roadPathCache[i];
      const x = p.cx * vpW * scaleX;
      const y = p.cy * vpH * scaleY;
      if (i === i0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    const midT = (t0 + t1) / 2;
    const fadeAlpha = midT < 0.15 ? midT / 0.15 : 1;
    const dashW = getRoadWidthAt(midT) * 0.015;
    ctx.strokeStyle = `rgba(255,255,255,${0.25 * pulse * fadeAlpha})`;
    ctx.lineWidth = Math.max(dashW, 0.5) * scaleX;
    ctx.stroke();
  }

  // ---- Vanishing point glow ----
  const vpx = roadPathCache[0].cx * vpW * scaleX;
  const vpy = roadPathCache[0].cy * vpH * scaleY;
  const vpGrad = ctx.createRadialGradient(vpx, vpy, 0, vpx, vpy, 80 * scaleX);
  vpGrad.addColorStop(0, getRoadColor(0.15 * pulse));
  vpGrad.addColorStop(0.4, getRoadColor(0.05 * pulse));
  vpGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = vpGrad;
  ctx.fillRect(vpx - 80 * scaleX, vpy - 80 * scaleY, 160 * scaleX, 160 * scaleY);

  ctx.restore();
}

// Flow particles — light streaks traveling along road
function drawRoadFlowParticles(ctx, cw, ch, scaleX, scaleY) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (const fp of roadFlowParticles) {
    fp.t += fp.speed;
    if (fp.t > 1) {
      fp.t = 0;
      fp.lateralOffset = (Math.random() - 0.5) * 0.8;
      fp.speed = 0.001 + Math.random() * 0.004;
    }

    const p = getRoadCenterAt(fp.t);
    const w = getRoadWidthAt(fp.t);
    const x = (p.x * vpW + fp.lateralOffset * w * 0.5) * scaleX;
    const y = p.y * vpH * scaleY;

    // Trail
    const p2 = getRoadCenterAt(Math.max(0, fp.t - fp.trail));
    const w2 = getRoadWidthAt(Math.max(0, fp.t - fp.trail));
    const x2 = (p2.x * vpW + fp.lateralOffset * w2 * 0.5) * scaleX;
    const y2 = p2.y * vpH * scaleY;

    const c = ROAD_COLORS[fp.colorIdx];
    const fadeAlpha = fp.t < 0.1 ? fp.t / 0.1 : 1;
    const a = fp.alpha * fadeAlpha;
    const sz = fp.size * fp.t * scaleX;

    if (sz < 0.3) continue;

    const grad = ctx.createLinearGradient(x2, y2, x, y);
    grad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0)`);
    grad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},${a})`);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x, y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = sz;
    ctx.stroke();

    // Bright head
    ctx.beginPath();
    ctx.arc(x, y, sz * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a * 0.8})`;
    ctx.fill();
  }

  ctx.restore();
}

// Stars
function drawStarField(ctx, cw, ch, scaleX, scaleY) {
  for (const star of roadStars) {
    star.twinkle += star.twinkleSpeed;
    const twinkle = (Math.sin(star.twinkle) + 1) * 0.5;
    const a = star.alpha * twinkle;
    if (a < 0.03) continue;
    const sx = star.x * scaleX;
    const sy = star.y * scaleY;
    ctx.beginPath();
    ctx.arc(sx, sy, star.size * scaleX, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 220, 255, ${a})`;
    ctx.fill();
  }
}

// Ambient particles — floating in space
function drawAmbientParticles(ctx, cw, ch, scaleX, scaleY) {
  for (const p of roadParticles) {
    p.driftAngle += 0.003;
    p.x += Math.cos(p.driftAngle) * p.drift;
    p.y += Math.sin(p.driftAngle) * p.drift * 0.5;
    if (p.x < -20) p.x = vpW + 20;
    if (p.x > vpW + 20) p.x = -20;
    if (p.y < -20) p.y = vpH + 20;
    if (p.y > vpH + 20) p.y = -20;

    p.twinkle += 0.02;
    const twinkle = (Math.sin(p.twinkle) + 1) * 0.5;
    const a = p.alpha * twinkle;
    if (a < 0.02) continue;

    const c = ROAD_COLORS[p.colorIdx];
    const sx = p.x * scaleX;
    const sy = p.y * scaleY;

    ctx.beginPath();
    ctx.arc(sx, sy, p.size * scaleX, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    ctx.fill();
  }
}

// ---- UPDATE: Cubes on road path ----

function updateRoadCubes() {
  const now = performance.now();

  for (const obj of roadObjects) {
    // Map object's roadZ to screen position based on camera
    // NO wrapping — cubes stay at their milestone Z
    const relZ = obj.roadZ - roadCameraZ;
    
    // For circular road behavior, wrap relative Z
    let effZ = ((relZ % ROAD_TOTAL_DEPTH) + ROAD_TOTAL_DEPTH) % ROAD_TOTAL_DEPTH;
    const t = 1 - (effZ / ROAD_TOTAL_DEPTH); // 1=near, 0=far

    // Only show objects in visible range
    if (t < 0.05 || t > 0.98) {
      obj.el.style.opacity = '0';
      obj.el.style.pointerEvents = 'none';
      obj.yearEl.style.opacity = '0';
      continue;
    }

    const center = getRoadCenterAt(t);
    const roadW = getRoadWidthAt(t);

    // Gentle sway (subtle, deterministic)
    obj.sway += obj.swaySpeed;
    const sway = Math.sin(obj.sway) * 0.03;

    // Position cube on road — offset to side (at road edge, tied to milestone)
    const lateralOff = obj.side * (obj.offset + sway) * roadW * 0.5;
    const cubeX = center.x * vpW + lateralOff;
    const cubeY = center.y * vpH;

    // Scale by depth
    const depthScale = 0.2 + t * 0.8;
    const cubeScale = depthScale * 0.75;

    // Fade at edges
    let a = 1;
    if (t < 0.15) a = (t - 0.05) / 0.1;
    if (t > 0.9) a = (0.98 - t) / 0.08;
    if (a <= 0) {
      obj.el.style.opacity = '0';
      obj.el.style.pointerEvents = 'none';
      obj.yearEl.style.opacity = '0';
      continue;
    }

    const halfCube = obj.cubeSize * 0.5 * cubeScale;
    obj.el.style.transform = `translate3d(${cubeX - halfCube}px, ${cubeY - halfCube}px, 0) scale(${cubeScale})`;
    obj.el.style.opacity = a.toFixed(3);
    obj.el.style.zIndex = Math.floor(t * 100);
    obj.el.style.pointerEvents = a > 0.3 ? 'auto' : 'none';

    // Rotate cube (slow auto-rotation)
    if (obj.cubeEl) {
      const autoRot = (now * 0.012 + obj.colorPhase * 50) % 360;
      obj.cubeEl.style.transform = `rotateX(-10deg) rotateY(${autoRot}deg)`;
    }

    // Year label
    obj.yearEl.style.transform = `translate3d(${cubeX - 20}px, ${cubeY + halfCube + 6}px, 0) scale(${Math.min(cubeScale, 1)})`;
    obj.yearEl.style.opacity = (a * 0.85).toFixed(3);
  }
}

function updateRoadMilestones() {
  for (const ms of roadMilestoneEls) {
    // Stagger events within the same year along Z
    const baseZ = yearToRoadZ(ms.data.year);
    const stagger = ms.data.totalInYear > 1 ? ms.data.eventIndex * 180 : 0;
    const msZ = baseZ + stagger;

    const relZ = msZ - roadCameraZ;
    let effZ = ((relZ % ROAD_TOTAL_DEPTH) + ROAD_TOTAL_DEPTH) % ROAD_TOTAL_DEPTH;
    const t = 1 - (effZ / ROAD_TOTAL_DEPTH);

    if (t < 0.08 || t > 0.95) {
      ms.el.style.opacity = '0';
      ms.el.style.pointerEvents = 'none';
      continue;
    }

    const center = getRoadCenterAt(t);
    const roadW = getRoadWidthAt(t);
    const depthScale = 0.3 + t * 0.7;

    // Alternate milestones left/right of road
    const msIdx = ROAD_MILESTONE_DATA.indexOf(ms.data);
    const side = (msIdx % 2 === 0) ? -1 : 1;
    const offset = roadW * 0.55 * side;

    const mx = center.x * vpW + offset;
    const my = center.y * vpH;

    let a = 1;
    if (t < 0.2) a = (t - 0.08) / 0.12;
    if (t > 0.85) a = (0.95 - t) / 0.1;
    if (a <= 0) {
      ms.el.style.opacity = '0';
      ms.el.style.pointerEvents = 'none';
      continue;
    }

    ms.el.style.transform = `translate3d(${mx - 50}px, ${my - 15}px, 0) scale(${Math.min(depthScale, 1.1)})`;
    ms.el.style.opacity = a.toFixed(3);
    ms.el.style.pointerEvents = a > 0.3 ? 'auto' : 'none';
    ms.el.style.zIndex = Math.floor(t * 100 + 50);
  }
}

// ---- ANIMATION LOOP ----

function roadAnimTick() {
  if (state.currentPage !== 'home' || state.currentView !== 'road') {
    roadRAF = null;
    return;
  }

  const speed = ROAD_AUTO_SPEED + roadSpeedBoost;
  roadCameraZTarget += speed;

  // Wrap around
  if (roadCameraZTarget > ROAD_TOTAL_DEPTH * 2) roadCameraZTarget -= ROAD_TOTAL_DEPTH;
  if (roadCameraZTarget < -ROAD_TOTAL_DEPTH) roadCameraZTarget += ROAD_TOTAL_DEPTH;

  roadCameraZ += (roadCameraZTarget - roadCameraZ) * 0.12;
  roadSpeedBoost *= ROAD_BOOST_DECAY;
  if (Math.abs(roadSpeedBoost) < 0.01) roadSpeedBoost = 0;

  roadColorPhase += 0.0006;

  drawRoad();
  updateRoadCubes();
  updateRoadMilestones();

  roadRAF = requestAnimationFrame(roadAnimTick);
}

function startRoadAnimation() {
  if (roadRAF) cancelAnimationFrame(roadRAF);
  roadRAF = requestAnimationFrame(roadAnimTick);
}

function stopRoadAnimation() {
  if (roadRAF) {
    cancelAnimationFrame(roadRAF);
    roadRAF = null;
  }
}

function setupRoadScroll() {
  window.addEventListener('wheel', (e) => {
    if (state.currentPage !== 'home' || state.currentView !== 'road') return;
    e.preventDefault();
    roadSpeedBoost += e.deltaY * ROAD_SCROLL_MULT;
    roadSpeedBoost = Math.max(-ROAD_MAX_SPEED, Math.min(ROAD_MAX_SPEED, roadSpeedBoost));
    if (!roadScrolledOnce) {
      roadScrolledOnce = true;
      if (roadScrollHint) roadScrollHint.classList.add('hidden');
    }
  }, { passive: false });
}

function setHeaderRoadMode(active) {
  if (!header) return;
  if (active) {
    header.classList.add('header--road-mode');
    document.body.classList.add('road-active');
  } else {
    header.classList.remove('header--road-mode');
    document.body.classList.remove('road-active');
  }
}


// ============================================
// CELEBRATION OVERLAY — Logo Click in Road Mode
// ============================================

let celebrationActive = false;
let celebrationRAF = null;

function initCelebration() {
  const logoLink = document.getElementById('logoLink');
  const overlay = document.getElementById('celebrationOverlay');
  if (!logoLink || !overlay) return;

  logoLink.addEventListener('click', (e) => {
    // Only trigger in road mode
    if (!header || !header.classList.contains('header--road-mode')) return;
    e.preventDefault();
    e.stopPropagation();
    if (celebrationActive) return;
    showCelebration();
  });

  overlay.addEventListener('click', () => {
    hideCelebration();
  });
}

function showCelebration() {
  const overlay = document.getElementById('celebrationOverlay');
  if (!overlay) return;
  celebrationActive = true;
  overlay.classList.add('active');
  startConfetti();
  playCelebrationSound();
}

function hideCelebration() {
  const overlay = document.getElementById('celebrationOverlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  celebrationActive = false;
  if (celebrationRAF) {
    cancelAnimationFrame(celebrationRAF);
    celebrationRAF = null;
  }
}

// Confetti particle engine
function startConfetti() {
  const canvas = document.getElementById('celebrationCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = [
    '#FFD700', '#FFA500', '#FF6347', '#FF1493',
    '#00CED1', '#7CFC00', '#FF69B4', '#4169E1',
    '#FFD700', '#FFD700', '#FFA500', '#FFFFFF'
  ];

  const particles = [];
  const PARTICLE_COUNT = 150;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      w: 4 + Math.random() * 8,
      h: 3 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: 1.5 + Math.random() * 3,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15,
      opacity: 0.7 + Math.random() * 0.3,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    });
  }

  function animate() {
    if (!celebrationActive) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.wobblePhase += p.wobbleSpeed;
      p.x += p.vx + Math.sin(p.wobblePhase) * 0.8;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.vy += 0.02; // gravity
      p.opacity -= 0.001;

      // Recycle
      if (p.y > canvas.height + 20 || p.opacity <= 0) {
        p.x = Math.random() * canvas.width;
        p.y = -10 - Math.random() * 40;
        p.vy = 1.5 + Math.random() * 3;
        p.opacity = 0.7 + Math.random() * 0.3;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    celebrationRAF = requestAnimationFrame(animate);
  }

  animate();
}

// Celebration sound using Web Audio API
function playCelebrationSound() {
  let ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) { return; }

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.25;
  masterGain.connect(ctx.destination);

  // Fanfare chord: C major with octave
  const fanfareNotes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
  fanfareNotes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05 + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5 + i * 0.15);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(ctx.currentTime + i * 0.08);
    osc.stop(ctx.currentTime + 3);
  });

  // Sparkle arpeggios — high pitched tinkles
  const sparkleNotes = [1046.5, 1318.5, 1568, 2093, 1568, 2093, 2637];
  sparkleNotes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    const startTime = ctx.currentTime + 0.3 + i * 0.12;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + 0.8);
  });

  // Warm pad swell
  const pad = ctx.createOscillator();
  pad.type = 'triangle';
  pad.frequency.value = 130.81; // C3

  const padGain = ctx.createGain();
  padGain.gain.setValueAtTime(0, ctx.currentTime);
  padGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.5);
  padGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2);
  padGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);

  pad.connect(padGain);
  padGain.connect(masterGain);
  pad.start(ctx.currentTime);
  pad.stop(ctx.currentTime + 4.5);

  // Cleanup after sound
  setTimeout(() => { try { ctx.close(); } catch(e) {} }, 5000);
}




// ============================================
// AMBIENT SOUND — Web Audio API Generative
// ============================================

function initAmbientSound() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.warn('Web Audio API not supported');
    return;
  }

  ambientGain = audioCtx.createGain();
  ambientGain.gain.value = 0;
  ambientGain.connect(audioCtx.destination);

  // Layer 1: Low drone pad — two detuned oscillators
  const drone1 = audioCtx.createOscillator();
  drone1.type = 'sine';
  drone1.frequency.value = 55; // A1

  const drone2 = audioCtx.createOscillator();
  drone2.type = 'sine';
  drone2.frequency.value = 58; // slightly detuned for warmth

  const drone3 = audioCtx.createOscillator();
  drone3.type = 'sine';
  drone3.frequency.value = 82.5; // E2 — perfect fifth

  const droneGain = audioCtx.createGain();
  droneGain.gain.value = 0.06;

  // Slow LFO on drone volume for breathing effect
  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.08; // very slow ~12s cycle
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 0.015;
  lfo.connect(lfoGain);
  lfoGain.connect(droneGain.gain);
  lfo.start();

  drone1.connect(droneGain);
  drone2.connect(droneGain);
  drone3.connect(droneGain);
  droneGain.connect(ambientGain);
  drone1.start();
  drone2.start();
  drone3.start();

  ambientNodes.push(drone1, drone2, drone3, lfo);

  // Layer 2: Shimmer — filtered white noise
  const bufferSize = audioCtx.sampleRate * 3;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.4;
  }

  const noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;

  const bandpass = audioCtx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 3000;
  bandpass.Q.value = 0.3;

  const shimmerGain = audioCtx.createGain();
  shimmerGain.gain.value = 0.008;

  noiseSource.connect(bandpass);
  bandpass.connect(shimmerGain);
  shimmerGain.connect(ambientGain);
  noiseSource.start();

  ambientNodes.push(noiseSource);

  // Layer 3: Occasional chime (scheduled)
  scheduleChime();
}

function scheduleChime() {
  if (!audioCtx || !roadSoundOn) return;

  const chimeFreqs = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
  const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];

  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = freq;

  const chimeGain = audioCtx.createGain();
  const now = audioCtx.currentTime;
  chimeGain.gain.setValueAtTime(0, now);
  chimeGain.gain.linearRampToValueAtTime(0.015, now + 0.3);
  chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3);

  osc.connect(chimeGain);
  chimeGain.connect(ambientGain);
  osc.start(now);
  osc.stop(now + 3.5);

  // Schedule next chime at random interval (4-10s)
  const nextDelay = 4000 + Math.random() * 6000;
  setTimeout(scheduleChime, nextDelay);
}

function startAmbientSound() {
  if (!audioCtx) initAmbientSound();
  if (!audioCtx || !ambientGain) return;

  roadSoundOn = true;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  // Fade in over 3 seconds
  ambientGain.gain.cancelScheduledValues(audioCtx.currentTime);
  ambientGain.gain.setValueAtTime(ambientGain.gain.value, audioCtx.currentTime);
  ambientGain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 3);

  if (roadSoundToggle) roadSoundToggle.classList.remove('muted');
}

function stopAmbientSound() {
  if (!audioCtx || !ambientGain) return;

  roadSoundOn = false;
  // Fade out over 1 second
  ambientGain.gain.cancelScheduledValues(audioCtx.currentTime);
  ambientGain.gain.setValueAtTime(ambientGain.gain.value, audioCtx.currentTime);
  ambientGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);

  if (roadSoundToggle) roadSoundToggle.classList.add('muted');
}

function setupRoadSoundToggle() {
  if (!roadSoundToggle) return;
  roadSoundToggle.classList.add('muted'); // start muted
  roadSoundToggle.addEventListener('click', () => {
    if (roadSoundOn) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
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
  if (btnRoad) btnRoad.addEventListener('click', () => switchView('road'));
  btnGrid.addEventListener('click', () => switchView('grid'));
  setupRoadSoundToggle();
  setupRoadScroll();
}

function switchView(view) {
  state.currentView = view;

  // Update buttons
  btnSpace.classList.toggle('active', view === 'space');
  if (btnRoad) btnRoad.classList.toggle('active', view === 'road');
  btnGrid.classList.toggle('active', view === 'grid');

  // Update views
  spaceView.classList.toggle('active', view === 'space');
  if (roadView) roadView.classList.toggle('active', view === 'road');
  gridView.classList.toggle('active', view === 'grid');

  // Space mode
  if (view === 'space') {
    startAutoFly();
    stopRoadAnimation();
    setHeaderRoadMode(false);
    stopAmbientSound();
    document.body.classList.remove('tree-mode');
  } else if (view === 'road') {
    // Road mode
    stopAutoFly();
    spaceObjects.forEach(obj => { obj.el.style.opacity = '0'; obj.el.style.pointerEvents = 'none'; });
    if (!roadInitialized) createRoadView();
    startRoadAnimation();
    setHeaderRoadMode(true);
    document.body.classList.add('tree-mode');
  } else {
    // Grid mode
    stopAutoFly();
    stopRoadAnimation();
    setHeaderRoadMode(false);
    stopAmbientSound();
    document.body.classList.remove('tree-mode');
    spaceObjects.forEach(obj => { obj.el.style.opacity = '0'; obj.el.style.pointerEvents = 'none'; });
    roadObjects.forEach(obj => { obj.el.style.opacity = '0'; obj.el.style.pointerEvents = 'none'; });
    roadMilestoneEls.forEach(ms => { ms.el.style.opacity = '0'; ms.el.style.pointerEvents = 'none'; });
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
  hint.textContent = t('product.dragHint', '🔄 Kéo chuột để xoay 3D');

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
    specsAccordion.textContent = product.specs || t('product.specs.desc', 'Thông số kỹ thuật sẽ được cập nhật.');
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
      submitBtn.textContent = t('contact.submitting', 'Đang gửi...');
      submitBtn.disabled = true;

      try {
        await submitContact({
          name: form.querySelector('#contactName').value,
          email: form.querySelector('#contactEmail').value,
          phone: form.querySelector('#contactPhone').value,
          subject: form.querySelector('#contactSubject').value,
          message: form.querySelector('#contactMessage').value,
        });

        submitBtn.textContent = t('contact.success', '✓ Đã gửi thành công!');
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
        submitBtn.textContent = t('contact.error', '✗ Lỗi gửi, thử lại');
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
    '.project-card',
    '.doc-item',
    '.project-filters',
    '.empty-state',
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
// HEADER SCROLL SHRINK + GLASS MORPHISM
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

    // Glass morphism effect when scrolled
    if (scrollY > 10) {
      header.classList.add('header--glass');
    } else {
      header.classList.remove('header--glass');
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
// SKELETON LOADING HELPERS
// ============================================
function createSkeletonCards(container, count = 6) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    card.innerHTML = `
      <div class="skeleton-card__img skeleton"></div>
      <div class="skeleton-card__line skeleton skeleton-card__line--long"></div>
      <div class="skeleton-card__line skeleton skeleton-card__line--medium"></div>
      <div class="skeleton-card__line skeleton skeleton-card__line--short"></div>
    `;
    container.appendChild(card);
  }
}

// ============================================
// DYNAMIC NEWS RENDERING — Magazine Layout
// ============================================

// Static fallback posts (used when no DB data)
const staticPosts = [
  {
    id: 'static-1',
    title: 'Khánh thành xưởng sản xuất mới 20.000m²',
    excerpt: 'Tiến Thịnh JSC khánh thành xưởng sản xuất kết cấu thép mới tại KCN Đông Anh với dây chuyền CNC tự động hóa nhập khẩu từ Đức và công suất hàng nghìn tấn thép mỗi năm.',
    content: '<p>Tiến Thịnh JSC khánh thành xưởng sản xuất kết cấu thép mới tại KCN Đông Anh với dây chuyền CNC tự động hóa nhập khẩu từ Đức.</p><p>Xưởng mới có diện tích 20.000m² với công nghệ tiên tiến nhất Đông Nam Á, nâng tổng công suất sản xuất lên 30.000 tấn/năm.</p>',
    featured_image: '/images/factory-interior.png',
    category: 'Tin công trường',
    published_at: '2024-03-15T00:00:00Z',
  },
  {
    id: 'static-2',
    title: 'Tuyển dụng 50 kỹ sư và thợ hàn lành nghề',
    excerpt: 'Mở rộng đội ngũ để đáp ứng nhu cầu tăng trưởng, Tiến Thịnh JSC tuyển dụng kỹ sư kết cấu, kỹ sư giám sát và thợ hàn chứng chỉ quốc tế.',
    content: '<p>Mở rộng đội ngũ để đáp ứng nhu cầu tăng trưởng, Tiến Thịnh JSC tuyển dụng kỹ sư kết cấu, kỹ sư giám sát và thợ hàn chứng chỉ quốc tế.</p>',
    featured_image: '/images/construction-team.png',
    category: 'Tuyển dụng',
    published_at: '2024-01-28T00:00:00Z',
  },
  {
    id: 'static-3',
    title: 'Ký hợp đồng dự án nhà máy LG Display — Hải Phòng',
    excerpt: 'Tiến Thịnh JSC trúng thầu gói kết cấu thép nhà xưởng sản xuất cho dự án LG Display, với khối lượng 5.000 tấn thép.',
    content: '<p>Tiến Thịnh JSC trúng thầu gói kết cấu thép nhà xưởng sản xuất cho dự án LG Display, với khối lượng 5.000 tấn thép được gia công và lắp dựng trong vòng 8 tháng.</p>',
    featured_image: '/images/steel-roof-structure.png',
    category: 'Tin công trường',
    published_at: '2023-12-10T00:00:00Z',
  },
  {
    id: 'static-4',
    title: 'Đạt chứng nhận ISO 14001:2015 về Môi trường',
    excerpt: 'Tiến Thịnh JSC hoàn thành đánh giá và nhận chứng nhận ISO 14001:2015, khẳng định cam kết phát triển bền vững.',
    content: '<p>Tiến Thịnh JSC hoàn thành đánh giá và nhận chứng nhận ISO 14001:2015, khẳng định cam kết phát triển bền vững và bảo vệ môi trường.</p>',
    featured_image: '/images/steel-structure-detail.png',
    category: 'Kiến thức',
    published_at: '2023-09-05T00:00:00Z',
  },
];

// Store all posts for detail page access
let allPosts = [];

async function renderNews() {
  const featuredContainer = $('#newsFeatured');
  const newsGrid = $('#newsGrid');
  if (!featuredContainer || !newsGrid) return;

  // Try DB first, fall back to static
  const dbPosts = await fetchPosts();
  allPosts = dbPosts.length ? dbPosts : staticPosts;

  const [featured, ...rest] = allPosts;

  // === Featured Article (Split: Gallery Left + Content Right) ===
  const images = featured.images?.length ? featured.images : [featured.featured_image || '/images/factory-interior.png'];
  const dateStr = featured.published_at ? new Date(featured.published_at).toLocaleDateString(getLang() === 'en' ? 'en-US' : 'vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  featuredContainer.innerHTML = `
    <div class="news-featured reveal" data-post-id="${featured.id}">
      <div class="news-featured__gallery">
        ${images.map((src, i) => `<img src="${src}" alt="${featured.title}" loading="${i === 0 ? 'eager' : 'lazy'}" class="${i === 0 ? 'active' : ''}" />`).join('')}
        ${images.length > 1 ? `
          <div class="news-featured__gallery-nav">
            <button class="news-featured__gallery-btn" data-dir="prev" aria-label="Ảnh trước">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span class="news-featured__gallery-counter">1 / ${images.length}</span>
            <button class="news-featured__gallery-btn" data-dir="next" aria-label="Ảnh sau">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        ` : ''}
      </div>
      <div class="news-featured__content">
        ${featured.category ? `<span class="news-featured__badge">${featured.category}</span>` : ''}
        <h2 class="news-featured__title">${featured.title}</h2>
        <p class="news-featured__excerpt">${featured.excerpt || ''}</p>
        <div class="news-featured__meta">
          ${dateStr ? `
            <span class="news-featured__meta-item">
              <svg viewBox="0 0 24 24" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              ${dateStr}
            </span>
          ` : ''}
          <span class="news-featured__meta-item">
            <svg viewBox="0 0 24 24" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Tiến Thịnh JSC
          </span>
        </div>
        <a class="news-featured__cta" data-post-id="${featured.id}">
          ${t('news.readArticle', 'Đọc bài viết')}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  `;

  // Gallery navigation
  setupGalleryNav(featuredContainer.querySelector('.news-featured__gallery'));

  // Click CTA → post detail
  featuredContainer.querySelector('.news-featured__cta')?.addEventListener('click', () => {
    navigateTo('post-detail', featured);
  });
  // Click entire featured → post detail
  featuredContainer.querySelector('.news-featured')?.addEventListener('click', (e) => {
    if (e.target.closest('.news-featured__gallery-btn') || e.target.closest('.news-featured__cta')) return;
    navigateTo('post-detail', featured);
  });

  // === Grid Cards (remaining posts) ===
  newsGrid.innerHTML = '';
  rest.forEach(post => {
    const dateDisplay = post.published_at ? new Date(post.published_at).toLocaleDateString(getLang() === 'en' ? 'en-US' : 'vi-VN') : '';
    const article = document.createElement('article');
    article.className = 'news-card reveal';
    article.dataset.postId = post.id;
    article.innerHTML = `
      <div class="news-card__img">
        <img src="${post.featured_image || '/images/factory-interior.png'}" alt="${post.title}" loading="lazy" />
        ${post.category ? `<span class="news-card__category">${post.category}</span>` : ''}
      </div>
      <div class="news-card__content">
        <span class="news-card__date">${dateDisplay}</span>
        <h3 class="news-card__title">${post.title}</h3>
        <p class="news-card__excerpt">${post.excerpt || ''}</p>
        <div class="news-card__footer">
          <span class="news-card__readmore">
            ${t('news.readMore', 'Đọc thêm')}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </span>
        </div>
      </div>
    `;
    article.addEventListener('click', () => navigateTo('post-detail', post));
    newsGrid.appendChild(article);
  });
}

// Gallery navigation helper (reusable)
function setupGalleryNav(gallery) {
  if (!gallery) return;
  const imgs = gallery.querySelectorAll('img');
  if (imgs.length <= 1) return;

  let current = 0;
  const counter = gallery.querySelector('.news-featured__gallery-counter, .post-detail__gallery-counter');
  const update = () => {
    imgs.forEach((img, i) => img.classList.toggle('active', i === current));
    if (counter) counter.textContent = `${current + 1} / ${imgs.length}`;
  };

  gallery.querySelectorAll('[data-dir]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (btn.dataset.dir === 'next') current = (current + 1) % imgs.length;
      else current = (current - 1 + imgs.length) % imgs.length;
      update();
    });
  });
}

// ============================================
// POST DETAIL PAGE
// ============================================
function renderPostDetail(post) {
  const container = $('#postDetailContent');
  if (!container || !post) return;

  const images = post.images?.length ? post.images : [post.featured_image || '/images/factory-interior.png'];
  const dateStr = post.published_at ? new Date(post.published_at).toLocaleDateString(getLang() === 'en' ? 'en-US' : 'vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  // Get related posts (same category, exclude current)
  const related = allPosts.filter(p => p.id !== post.id).slice(0, 4);

  container.innerHTML = `
    <nav class="post-detail__breadcrumb">
      <a data-page="news">${t('news.breadcrumb', 'Tin Tức')}</a>
      <span>›</span>
      ${post.category ? `<a data-page="news">${post.category}</a><span>›</span>` : ''}
      <span>${post.title}</span>
    </nav>

    <div class="post-detail__split">
      <div class="post-detail__gallery">
        ${images.map((src, i) => `<img src="${src}" alt="${post.title}" class="${i === 0 ? 'active' : ''}" />`).join('')}
        ${images.length > 1 ? `
          <div class="post-detail__gallery-nav">
            <button class="post-detail__gallery-btn" data-dir="prev" aria-label="Ảnh trước">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span class="post-detail__gallery-counter">1 / ${images.length}</span>
            <button class="post-detail__gallery-btn" data-dir="next" aria-label="Ảnh sau">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        ` : ''}
      </div>
      <div class="post-detail__header">
        ${post.category ? `<span class="post-detail__category-badge">${post.category}</span>` : ''}
        <h1 class="post-detail__title">${post.title}</h1>
        <div class="post-detail__meta">
          ${dateStr ? `
            <span class="post-detail__meta-item">
              <svg viewBox="0 0 24 24" stroke-width="2" fill="none"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              ${dateStr}
            </span>
          ` : ''}
          <span class="post-detail__meta-item">
            <svg viewBox="0 0 24 24" stroke-width="2" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Tiến Thịnh JSC
          </span>
        </div>
        ${post.excerpt ? `<p class="post-detail__excerpt">${post.excerpt}</p>` : ''}
      </div>
    </div>

    ${post.content ? `
      <hr class="post-detail__divider">
      <div class="post-detail__body">${post.content}</div>
    ` : ''}

    ${related.length ? `
      <div class="post-detail__related">
        <h3 class="post-detail__related-title">${t('news.relatedPosts', 'Bài viết liên quan')}</h3>
        <div class="news-grid">
          ${related.map(r => {
            const rDate = r.published_at ? new Date(r.published_at).toLocaleDateString(getLang() === 'en' ? 'en-US' : 'vi-VN') : '';
            return `
              <article class="news-card" data-post-id="${r.id}">
                <div class="news-card__img">
                  <img src="${r.featured_image || '/images/factory-interior.png'}" alt="${r.title}" loading="lazy" />
                  ${r.category ? `<span class="news-card__category">${r.category}</span>` : ''}
                </div>
                <div class="news-card__content">
                  <span class="news-card__date">${rDate}</span>
                  <h3 class="news-card__title">${r.title}</h3>
                  <p class="news-card__excerpt">${r.excerpt || ''}</p>
                  <div class="news-card__footer">
                    <span class="news-card__readmore">
                      ${t('news.readMore', 'Đọc thêm')}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </span>
                  </div>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}
  `;

  // Setup gallery nav in detail
  setupGalleryNav(container.querySelector('.post-detail__gallery'));

  // Breadcrumb navigation
  container.querySelectorAll('.post-detail__breadcrumb a').forEach(a => {
    a.addEventListener('click', () => navigateTo(a.dataset.page));
  });

  // Related post clicks
  container.querySelectorAll('.news-card[data-post-id]').forEach(card => {
    card.addEventListener('click', () => {
      const p = allPosts.find(x => x.id === card.dataset.postId || x.id?.toString() === card.dataset.postId);
      if (p) navigateTo('post-detail', p);
    });
  });

  // Scroll reveals
  setTimeout(() => setupScrollReveal(), 50);
}

// ============================================
// DYNAMIC DOCUMENTS RENDERING
// ============================================
async function renderDocuments() {
  const docsContainer = document.querySelector('#page-documents .subpage-content');
  if (!docsContainer) return;

  const docs = await fetchDocuments();
  if (!docs.length) {
    docsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📄</div>
        <h3 class="empty-state__title">${t('docs.empty', 'Chưa có tài liệu')}</h3>
        <p class="empty-state__desc">${t('docs.emptyDesc', 'Tài liệu kỹ thuật sẽ sớm được cập nhật. Vui lòng quay lại sau.')}</p>
      </div>
    `;
    return;
  }

  const getIcon = (type) => {
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('excel') || type?.includes('spreadsheet')) return '📊';
    if (type?.includes('powerpoint') || type?.includes('presentation')) return '📊';
    if (type?.includes('word') || type?.includes('document')) return '📝';
    if (type?.includes('acad') || type?.includes('dwg')) return '📐';
    if (type?.includes('zip') || type?.includes('rar')) return '📦';
    return '📎';
  };

  const getFileExt = (type) => {
    if (type?.includes('pdf')) return 'PDF';
    if (type?.includes('excel') || type?.includes('spreadsheet')) return 'XLSX';
    if (type?.includes('powerpoint') || type?.includes('presentation')) return 'PPTX';
    if (type?.includes('word') || type?.includes('document')) return 'DOCX';
    if (type?.includes('acad') || type?.includes('dwg')) return 'DWG';
    if (type?.includes('zip')) return 'ZIP';
    return 'FILE';
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  docsContainer.innerHTML = `
    <div class="documents-grid">
      ${docs.map(doc => `
        <a href="${doc.file_url}" target="_blank" rel="noreferrer" class="doc-card" data-reveal>
          <div class="doc-card__header">
            <span class="doc-card__icon">${getIcon(doc.file_type)}</span>
            <span class="doc-card__badge">${getFileExt(doc.file_type)}</span>
          </div>
          <div class="doc-card__body">
            <h3 class="doc-card__title">${doc.title}</h3>
            ${doc.description ? `<p class="doc-card__desc">${doc.description}</p>` : ''}
            <div class="doc-card__meta">
              <span>${formatSize(doc.file_size)}</span>
            </div>
          </div>
          <div class="doc-card__footer">
            <span class="doc-card__dl-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Tải xuống
            </span>
          </div>
        </a>
      `).join('')}
    </div>
  `;
}

// ============================================
// DYNAMIC PROJECT PAGES — "Dự Án Đã Triển Khai"
// ============================================
async function renderProjectsPage() {
  const container = document.querySelector('#page-proj-done .subpage-content');
  if (!container) return;

  // Show skeleton immediately
  container.innerHTML = '<div class="projects-grid" id="projDoneGrid"></div>';
  const grid = container.querySelector('#projDoneGrid');
  createSkeletonCards(grid, 6);

  try {
    const projectData = await fetchProjects();
    if (!projectData?.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🏗️</div>
          <h3 class="empty-state__title">Chưa có dự án</h3>
          <p class="empty-state__desc">Các dự án đã triển khai sẽ sớm được cập nhật.</p>
        </div>
      `;
      return;
    }

    // Get unique categories
    const categories = [...new Set(projectData.map(p => p.category).filter(Boolean))];

    // Build filter buttons — minimal pill style
    let filtersHTML = '';
    if (categories.length > 1) {
      filtersHTML = `
        <div class="project-filters">
          <button class="project-filter-btn active" data-filter="all">Tất cả</button>
          ${categories.map(cat => `<button class="project-filter-btn" data-filter="${cat}">${cat}</button>`).join('')}
        </div>
      `;
    }

    // Featured hero project (first item) + remaining grid cards
    const [featured, ...rest] = projectData;

    const heroHTML = `
      <div class="project-hero reveal" data-category="${featured.category || ''}" data-product-id="${featured.id}">
        <div class="project-hero__image">
          <img src="${featured.image}" alt="${featured.name}" loading="lazy" />
          <div class="project-hero__overlay">
            ${featured.category ? `<span class="project-hero__tag">${featured.category}</span>` : ''}
            <h2 class="project-hero__title">${featured.name}</h2>
            <p class="project-hero__sub">${featured.subtitle || ''} ${featured.year ? `— ${featured.year}` : ''}</p>
            <span class="project-hero__cta">Xem chi tiết →</span>
          </div>
        </div>
      </div>
    `;

    // Build image-overlay cards for remaining projects
    const cardsHTML = rest.map(p => `
      <div class="project-card reveal" data-category="${p.category || ''}" data-product-id="${p.id}">
        <div class="project-card__image">
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
          <div class="project-card__overlay">
            ${p.category ? `<span class="project-card__tag">${p.category}</span>` : ''}
            <div class="project-card__info">
              <h3 class="project-card__title">${p.name}</h3>
              <p class="project-card__subtitle">${p.subtitle || ''} ${p.year ? `— ${p.year}` : ''}</p>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      ${filtersHTML}
      ${heroHTML}
      <div class="projects-grid" id="projDoneGrid">${cardsHTML}</div>
    `;

    // Setup filter buttons
    const filterBtns = container.querySelectorAll('.project-filter-btn');
    const allItems = container.querySelectorAll('.project-card, .project-hero');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        allItems.forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    // Click to navigate to product detail
    allItems.forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.productId;
        const product = projectData.find(p => p.id === id || p.id?.toString() === id);
        if (product) navigateTo('product', product);
      });
    });

    // Re-init scroll reveals for new elements
    setTimeout(() => setupScrollReveal(), 100);

  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <h3 class="empty-state__title">Không tải được dữ liệu</h3>
        <p class="empty-state__desc">Vui lòng thử lại sau.</p>
      </div>
    `;
  }
}

// ============================================
// DYNAMIC OTHER PROJECT SUB-PAGES
// ============================================
async function renderOtherProjectPages() {
  const projectData = await fetchProjects();
  if (!projectData?.length) return;

  // Helper to build a small project grid — uses overlay-style hover (matches grid-item)
  function buildProjectGrid(items) {
    return `
      <div class="projects-grid">
        ${items.map(p => `
          <div class="project-card reveal" data-category="${p.category || ''}" data-product-id="${p.id}">
            <div class="project-card__image">
              <img src="${p.image}" alt="${p.name}" loading="lazy" />
              <div class="project-card__overlay">
                ${p.category ? `<span class="project-card__tag">${p.category}</span>` : ''}
                <div class="project-card__info">
                  <h3 class="project-card__title">${p.name}</h3>
                  <p class="project-card__subtitle">${p.subtitle || p.description || ''} ${p.year ? `— ${p.year}` : ''}</p>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // "Dự Án Đang Triển Khai" — show recent projects as ongoing
  const ongoingContainer = document.querySelector('#page-proj-ongoing .subpage-content');
  if (ongoingContainer) {
    const recent = projectData.slice(0, 4);
    ongoingContainer.innerHTML = recent.length ? buildProjectGrid(recent) : `
      <div class="empty-state">
        <div class="empty-state__icon">🔨</div>
        <h3 class="empty-state__title">Chưa có dự án đang triển khai</h3>
        <p class="empty-state__desc">Thông tin sẽ sớm được cập nhật.</p>
      </div>
    `;
  }

  // "Theo Quốc Gia" — show all projects grouped
  const countryContainer = document.querySelector('#page-proj-country .subpage-content');
  if (countryContainer) {
    countryContainer.innerHTML = buildProjectGrid(projectData.slice(0, 6));
  }

  // "Theo Lĩnh Vực" — show all projects with category badges
  const fieldContainer = document.querySelector('#page-proj-field .subpage-content');
  if (fieldContainer) {
    fieldContainer.innerHTML = buildProjectGrid(projectData);
  }

  // Attach click handlers for navigation
  document.querySelectorAll('#page-proj-ongoing .project-card, #page-proj-country .project-card, #page-proj-field .project-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.productId;
      const product = projectData.find(p => p.id === id || p.id?.toString() === id);
      if (product) navigateTo('product', product);
    });
  });

  // Re-init scroll reveals
  setTimeout(() => setupScrollReveal(), 150);
}

// ============================================
// DYNAMIC SUB-PAGE NEWS — Filter by Category
// ============================================
async function renderNewsSubpages() {
  const subpages = [
    { id: 'page-news-site', label: 'Tin Công Trường', category: 'Tin công trường' },
    { id: 'page-news-recruit', label: 'Tin Tuyển Dụng', category: 'Tuyển dụng' },
    { id: 'page-news-knowledge', label: 'Kiến Thức Chuyên Môn', category: 'Kiến thức' },
  ];

  // Use allPosts (loaded by renderNews) or fetch fresh
  if (!allPosts.length) {
    const dbPosts = await fetchPosts();
    allPosts = dbPosts.length ? dbPosts : staticPosts;
  }

  subpages.forEach(({ id, label, category }) => {
    const container = document.querySelector(`#${id} .subpage-content`);
    if (!container) return;

    // Filter posts by category
    const filtered = allPosts.filter(p =>
      p.category?.toLowerCase().includes(category.toLowerCase())
    );

    if (!filtered.length) {
      container.innerHTML = `
        <div class="news-empty-state">
          <div class="news-empty-state__icon">📰</div>
          <h3 class="news-empty-state__title">Chưa có bài viết trong mục "${label}"</h3>
          <p class="news-empty-state__desc">Nội dung sẽ sớm được cập nhật. Vui lòng quay lại sau.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="news-grid">
        ${filtered.map(post => {
          const dateDisplay = post.published_at ? new Date(post.published_at).toLocaleDateString('vi-VN') : '';
          return `
            <article class="news-card reveal" data-post-id="${post.id}">
              <div class="news-card__img">
                <img src="${post.featured_image || '/images/factory-interior.png'}" alt="${post.title}" loading="lazy" />
                ${post.category ? `<span class="news-card__category">${post.category}</span>` : ''}
              </div>
              <div class="news-card__content">
                <span class="news-card__date">${dateDisplay}</span>
                <h3 class="news-card__title">${post.title}</h3>
                <p class="news-card__excerpt">${post.excerpt || ''}</p>
                <div class="news-card__footer">
                  <span class="news-card__readmore">
                    Đọc thêm
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </span>
                </div>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;

    // Click → post detail
    container.querySelectorAll('.news-card[data-post-id]').forEach(card => {
      card.addEventListener('click', () => {
        const p = allPosts.find(x => x.id === card.dataset.postId || x.id?.toString() === card.dataset.postId);
        if (p) navigateTo('post-detail', p);
      });
    });
  });
}

// ============================================
// ENHANCED LAZY-LOADING WITH SHIMMER
// ============================================
function setupLazyImages() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '100px' });

    images.forEach(img => {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('loaded'));
        imageObserver.observe(img);
      }
    });
  }
}

// ============================================
// DYNAMIC SETTINGS — Update footer/contact with DB values
// ============================================
async function applySettings() {
  const settings = await fetchSettings();
  if (!settings || !Object.keys(settings).length) return;

  const year = new Date().getFullYear();
  const companyName = settings.company_name || 'Tiến Thịnh JSC';

  // === Footer Tagline ===
  const tagline = document.getElementById('footerTagline');
  if (tagline && settings.company_description) {
    tagline.textContent = `${companyName} — ${settings.company_description}`;
  }

  // === Footer Contact Info ===
  const footerAddress = document.getElementById('footerAddress');
  if (footerAddress && settings.contact_address) {
    footerAddress.textContent = settings.contact_address;
  }

  const footerPhone = document.getElementById('footerPhone');
  if (footerPhone && settings.contact_phone) {
    footerPhone.textContent = settings.contact_phone;
  }

  const footerEmail = document.getElementById('footerEmail');
  if (footerEmail && settings.contact_email) {
    footerEmail.textContent = settings.contact_email;
  }

  // === Footer Copyright ===
  const copyright = document.getElementById('footerCopyright');
  if (copyright) {
    copyright.textContent = `© ${year} ${companyName}. All rights reserved.`;
  }

  // === Social Links ===
  const socialFb = document.getElementById('socialFacebook');
  if (socialFb && settings.social_facebook) {
    socialFb.href = settings.social_facebook;
    socialFb.target = '_blank';
    socialFb.rel = 'noopener';
  }

  const socialLi = document.getElementById('socialLinkedin');
  if (socialLi && settings.social_linkedin) {
    socialLi.href = settings.social_linkedin;
    socialLi.target = '_blank';
    socialLi.rel = 'noopener';
  }

  const socialYt = document.getElementById('socialYoutube');
  if (socialYt && settings.social_youtube) {
    socialYt.href = settings.social_youtube;
    socialYt.target = '_blank';
    socialYt.rel = 'noopener';
  }

  // === Contact Page Info ===
  // Update contact page phone/email/address if they exist
  const contactPhoneEl = document.querySelector('.contact-info__block:nth-child(3) p');
  if (contactPhoneEl && (settings.contact_phone || settings.contact_email)) {
    const parts = [];
    if (settings.contact_phone) parts.push(`<strong>Tel:</strong> ${settings.contact_phone}`);
    if (settings.contact_hotline) parts.push(`<strong>Hotline:</strong> ${settings.contact_hotline}`);
    if (settings.contact_email) parts.push(`<strong>Email:</strong> ${settings.contact_email}`);
    if (parts.length) contactPhoneEl.innerHTML = parts.join('<br/>');
  }

  // === SEO Meta Tags ===
  if (settings.seo_title) {
    document.title = settings.seo_title;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = settings.seo_title;
  }

  if (settings.seo_description) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = settings.seo_description;
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = settings.seo_description;
  }

  // === Google Analytics ===
  if (settings.google_analytics && !document.getElementById('ga-script')) {
    const gaScript = document.createElement('script');
    gaScript.id = 'ga-script';
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics}`;
    document.head.appendChild(gaScript);

    const gaInit = document.createElement('script');
    gaInit.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${settings.google_analytics}');`;
    document.head.appendChild(gaInit);
  }

  console.log('✅ Settings applied from Supabase');
}

// ============================================
// NAV i18n — Translate dynamically loaded nav items
// ============================================
// Maps data-page values to i18n keys for header nav
const NAV_I18N_MAP = {
  'home': 'nav.home',
  'about-letter': 'nav.about.letter',
  'about-vision': 'nav.about.vision',
  'about-values': 'nav.about.values',
  'history': 'nav.about.history',
  'about-org': 'nav.about.org',
  'about-cert': 'nav.about.cert',
  'about-awards': 'nav.about.awards',
  'cap-hr': 'nav.cap.hr',
  'cap-prod': 'nav.cap.prod',
  'cap-construct': 'nav.cap.construct',
  'cap-factory': 'nav.cap.factory',
  'cap-safety': 'nav.cap.safety',
  'svc-general': 'nav.svc.general',
  'svc-fdi': 'nav.svc.fdi',
  'svc-steel': 'nav.svc.steel',
  'svc-design': 'nav.svc.design',
  'svc-trade': 'nav.svc.trade',
  'proj-done': 'nav.proj.done',
  'proj-ongoing': 'nav.proj.ongoing',
  'exhibitions': 'nav.proj.featured',
  'proj-country': 'nav.proj.country',
  'proj-field': 'nav.proj.field',
  'news': 'nav.news.company',
  'news-site': 'nav.news.site',
  'news-recruit': 'nav.news.recruit',
  'news-knowledge': 'nav.news.knowledge',
  'contact': 'nav.contact',
  'documents': 'nav.documents',
};

// Parent nav group titles mapped by known titles in all languages
const NAV_GROUP_I18N = {
  // Vietnamese
  'Giới thiệu': 'nav.about',
  'GIỚI THIỆU': 'nav.about',
  'Năng lực': 'nav.capability',
  'NĂNG LỰC': 'nav.capability',
  'Dịch vụ': 'nav.services',
  'DỊCH VỤ': 'nav.services',
  'Dự án': 'nav.projects',
  'DỰ ÁN': 'nav.projects',
  'Tin tức': 'nav.news',
  'TIN TỨC': 'nav.news',
  // English
  'About Us': 'nav.about',
  'ABOUT US': 'nav.about',
  'Capability': 'nav.capability',
  'CAPABILITY': 'nav.capability',
  'Services': 'nav.services',
  'SERVICES': 'nav.services',
  'Projects': 'nav.projects',
  'PROJECTS': 'nav.projects',
  'News': 'nav.news',
  'NEWS': 'nav.news',
  // Chinese
  '关于我们': 'nav.about',
  '实力': 'nav.capability',
  '服务': 'nav.services',
  '项目': 'nav.projects',
  '新闻': 'nav.news',
};

function applyNavI18n() {
  // Translate header nav links with data-page
  document.querySelectorAll('.header__nav-link[data-page], .header__sub-link[data-page]').forEach(el => {
    const page = el.getAttribute('data-page');
    const key = NAV_I18N_MAP[page];
    if (key) {
      // For parent links that contain svg, only update text node
      const svg = el.querySelector('svg');
      if (svg) {
        const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === 3);
        if (textNodes.length) {
          textNodes[0].textContent = t(key) + ' ';
        }
      } else {
        el.textContent = t(key);
      }
    }
  });

  // Translate parent group titles (e.g., "GIỚI THIỆU" → "ABOUT US" and vice versa)
  document.querySelectorAll('.header__nav-link:not([data-page])').forEach(el => {
    const svg = el.querySelector('svg');
    if (svg) {
      // Collect group titles from ALL languages
      const allGroupTitles = {};
      const langs = Object.keys(translations); // ['vi', 'en', 'zh']
      const uniqueKeys = [...new Set(Object.values(NAV_GROUP_I18N))];
      for (const key of uniqueKeys) {
        for (const lang of langs) {
          const val = translations[lang]?.[key];
          if (val) allGroupTitles[val.toUpperCase()] = key;
        }
      }

      const textContent = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim().toUpperCase();

      // Use exact match (after trimming) to avoid false positives with short CJK chars
      if (allGroupTitles[textContent]) {
        const key = allGroupTitles[textContent];
        const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === 3);
        if (textNodes.length) {
          textNodes[0].textContent = t(key) + ' ';
        }
      }
    }
  });

  // Translate mobile overlay nav group titles
  document.querySelectorAll('.nav-overlay__group-title').forEach(el => {
    const txt = el.textContent.trim();
    const allGroupTitles = {};
    const langs = Object.keys(translations);
    const uniqueKeys = [...new Set(Object.values(NAV_GROUP_I18N))];
    for (const key of uniqueKeys) {
      for (const lang of langs) {
        const val = translations[lang]?.[key];
        if (val) allGroupTitles[val] = key;
      }
    }
    const key = allGroupTitles[txt] || NAV_GROUP_I18N[txt];
    if (key) el.textContent = t(key);
  });

  // Translate mobile overlay nav links
  document.querySelectorAll('.nav-overlay__sub a[data-page], .nav-overlay__links > li > a[data-page]').forEach(el => {
    const page = el.getAttribute('data-page');
    const key = NAV_I18N_MAP[page];
    if (key) el.textContent = t(key);
  });
}

// ============================================
// DYNAMIC NAVIGATION — Build menu from Supabase
// ============================================
async function renderNavigation() {
  const navItems = await fetchNavigation('header');
  if (!navItems || !navItems.length) return; // Keep hardcoded HTML

  // Split items: first half → left nav, second half → right nav
  // Based on current layout: items 0-3 are left (Trang chủ, Giới thiệu, Năng lực, Dịch vụ)
  // items 4-7 are right (Dự án, Tin tức, Liên hệ, Tài liệu)
  const midpoint = Math.ceil(navItems.length / 2);
  const leftItems = navItems.slice(0, midpoint);
  const rightItems = navItems.slice(midpoint);

  // Build a nav link
  function buildNavLink(item) {
    const dataPage = item.link_type === 'page' ? item.link_value : null;
    const href = item.link_type === 'custom' ? (item.link_value || '#') : '#';
    const target = item.target || '_self';
    const attrs = dataPage ? `data-page="${dataPage}"` : '';
    const targetAttr = target === '_blank' ? 'target="_blank" rel="noopener"' : '';
    return `<a href="${href}" ${attrs} class="header__nav-link" ${targetAttr}>${item.title}${
      item.children?.length
        ? ' <svg class="header__chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>'
        : ''
    }</a>`;
  }

  // Build submenu (supports nested sub-sub-menus)
  function buildSubmenu(children) {
    if (!children?.length) return '';
    const lis = children.map(child => {
      const dataPage = child.link_type === 'page' ? child.link_value : null;
      const href = child.link_type === 'custom' ? (child.link_value || '#') : '#';
      const attrs = dataPage ? `data-page="${dataPage}"` : '';
      const hasNested = child.children?.length > 0;
      const cls = hasNested ? 'header__sub-item header__sub-item--has-sub' : 'header__sub-item';
      const chevron = hasNested ? ' <svg class="header__sub-chevron" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 6 6 6-6 6"/></svg>' : '';
      const nestedMenu = hasNested ? buildSubmenu(child.children) : '';
      return `<li class="${cls}"><a href="${href}" ${attrs} class="header__sub-link">${child.title}${chevron}</a>${nestedMenu}</li>`;
    }).join('');
    return `<ul class="header__submenu">${lis}</ul>`;
  }

  // Build nav list HTML
  function buildNavList(items) {
    return items.map(item => {
      const hasSub = item.children?.length > 0;
      const cls = hasSub ? 'header__nav-item header__nav-item--has-sub' : 'header__nav-item';
      return `<li class="${cls}">${buildNavLink(item)}${buildSubmenu(item.children)}</li>`;
    }).join('');
  }

  // Update header left nav
  const leftNav = document.getElementById('headerNavLeft');
  if (leftNav) {
    leftNav.innerHTML = `<ul class="header__nav-list">${buildNavList(leftItems)}</ul>`;
  }

  // Update header right nav
  const rightNav = document.getElementById('headerNavRight');
  if (rightNav) {
    rightNav.innerHTML = `<ul class="header__nav-list">${buildNavList(rightItems)}</ul>`;
  }

  // Update mobile nav overlay
  const overlayContent = document.querySelector('.nav-overlay__content');
  if (overlayContent) {
    const overlayLinks = navItems.map(item => {
      if (item.children?.length) {
        const subLinks = item.children.map(child => {
          const dataPage = child.link_type === 'page' ? child.link_value : null;
          const href = child.link_type === 'custom' ? (child.link_value || '#') : '#';
          const attrs = dataPage ? `data-page="${dataPage}"` : '';
          return `<li><a href="${href}" ${attrs} class="nav-link">${child.title}</a></li>`;
        }).join('');
        return `<li class="nav-overlay__group">
          <span class="nav-overlay__group-title">${item.title}</span>
          <ul class="nav-overlay__sub">${subLinks}</ul>
        </li>`;
      } else {
        const dataPage = item.link_type === 'page' ? item.link_value : null;
        const href = item.link_type === 'custom' ? (item.link_value || '#') : '#';
        const attrs = dataPage ? `data-page="${dataPage}"` : '';
        return `<li><a href="${href}" ${attrs} class="nav-link">${item.title}</a></li>`;
      }
    }).join('');

    // Keep existing footer section of overlay
    const existingFooter = overlayContent.querySelector('.nav-overlay__footer');
    const footerHTML = existingFooter ? existingFooter.outerHTML : '';

    overlayContent.innerHTML = `<ul class="nav-overlay__links">${overlayLinks}</ul>${footerHTML}`;
  }

  // Re-bind navigation events on new links
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      navigateTo(page);
    });
  });

  // Apply i18n translations to dynamically rendered nav items
  applyNavI18n();

  // Re-bind overlay nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      if (page) navigateTo(page);
    });
  });

  console.log(`✅ Navigation loaded: ${navItems.length} items from Supabase`);
}

// ============================================
// DYNAMIC FOOTER NAV — Build footer link columns from Supabase
// ============================================
async function renderFooterNav() {
  const footerItems = await fetchNavigation('footer');
  if (!footerItems || !footerItems.length) return; // Keep hardcoded

  const footerLinksContainer = document.querySelector('.footer__links');
  if (!footerLinksContainer) return;

  // Keep the contact column (last one) — it's handled by applySettings
  const contactCol = footerLinksContainer.querySelector('.footer__col:last-child');
  const contactHTML = contactCol ? contactCol.outerHTML : '';

  // Build columns from footer nav items (each root = a column)
  const columnsHTML = footerItems.map(group => {
    if (!group.children?.length) return '';
    const links = group.children.map(child => {
      const dataPage = child.link_type === 'page' ? child.link_value : null;
      const href = child.link_type === 'custom' ? (child.link_value || '#') : '#';
      const attrs = dataPage ? `data-page="${dataPage}"` : '';
      return `<li><a href="${href}" ${attrs}>${child.title}</a></li>`;
    }).join('');
    return `<div class="footer__col">
      <h4 class="footer__heading">${group.title}</h4>
      <ul class="footer__list">${links}</ul>
    </div>`;
  }).join('');

  footerLinksContainer.innerHTML = columnsHTML + contactHTML;

  // Re-bind nav events on new footer links
  footerLinksContainer.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.getAttribute('data-page'));
    });
  });

  console.log(`✅ Footer nav loaded: ${footerItems.length} groups from Supabase`);
}

// ============================================
// DYNAMIC PAGE LOADER
// Fetches pages from Admin (Supabase) and creates them on the frontend
// ============================================

/**
 * Load all published pages from Supabase.
 * For pages that don't already have a static HTML element, create one dynamically.
 * Register them in the URL router so direct URL access works.
 */
async function loadDynamicPages() {
  try {
    const pages = await fetchPages();
    if (!pages || pages.length === 0) return;

    // Build parent lookup for breadcrumbs & nested URLs
    const pageMap = {};
    pages.forEach(p => { pageMap[p.id] = p; });

    // Helper: build full slug path from parent chain (e.g. /tam-nhin-su-menh/test-seo-page)
    function buildFullPath(page) {
      const parts = [];
      let current = page;
      while (current) {
        parts.unshift(current.slug);
        current = current.parent_id ? pageMap[current.parent_id] : null;
      }
      return '/' + parts.join('/');
    }

    for (const page of pages) {
      const slug = page.slug;
      if (!slug) continue;

      // Build full hierarchical path
      const fullPath = buildFullPath(page);

      // Check if this page already has a static element (skip if yes — handled by tryRenderDynamicPage)
      const existingStaticPageId = PAGE_SLUG_MAP[slug];
      if (existingStaticPageId && document.getElementById(existingStaticPageId)) {
        // Even for static pages, register the hierarchical route if it has a parent
        if (page.parent_id && fullPath !== `/${slug}`) {
          const staticPage = ROUTES[`/${slug}`]?.page || existingStaticPageId.replace('page-', '');
          ROUTES[fullPath] = ROUTES[`/${slug}`] || { page: staticPage, title: page.meta_title || page.title };
        }
        continue;
      }

      // Check if we already created a dynamic element for this slug
      const dynamicPageId = `page-dynamic-${slug}`;
      if (document.getElementById(dynamicPageId)) continue;

      // Create a new page DOM element
      const pageEl = document.createElement('main');
      pageEl.className = 'page page--subpage page--dynamic';
      pageEl.id = dynamicPageId;

      // Add loading state
      pageEl.innerHTML = `
        <div class="dynamic-page-loading">
          <div class="dynamic-page-loading__spinner"></div>
          <p>Đang tải trang...</p>
        </div>
      `;

      // Insert before footer
      const footer = document.getElementById('siteFooter');
      if (footer) {
        footer.parentNode.insertBefore(pageEl, footer);
      } else {
        document.body.appendChild(pageEl);
      }

      // Register in ROUTES for URL routing — use hierarchical path
      const pageKey = `dynamic-${slug}`;
      if (!ROUTES[fullPath]) {
        ROUTES[fullPath] = { page: pageKey, title: page.meta_title || page.title };
      }
      // Also register flat path as fallback
      if (!ROUTES[`/${slug}`]) {
        ROUTES[`/${slug}`] = { page: pageKey, title: page.meta_title || page.title };
      }
      PAGE_TO_SLUG[pageKey] = fullPath;
      PAGE_TO_TITLE[pageKey] = page.meta_title || page.title;

      // Also register in PAGE_SLUG_MAP for tryRenderDynamicPage compatibility
      PAGE_SLUG_MAP[slug] = dynamicPageId;

      // Update nav link hrefs (if any nav links point to this slug via data-page)
      $$(`[data-page="${pageKey}"]`).forEach(link => {
        link.setAttribute('href', fullPath);
      });

      // Fetch and render sections
      loadDynamicPageContent(page, pageEl, pageMap);
    }

    // Re-check the URL after loading dynamic pages (user might have navigated to a dynamic page directly)
    const pathToCheck = pendingDynamicPath || window.location.pathname;
    const route = ROUTES[pathToCheck];
    if (route && route.page.startsWith('dynamic-') && state.currentPage !== route.page) {
      navigateTo(route.page, null, { pushHistory: false });
      history.replaceState({ page: route.page }, document.title, pathToCheck);
      pendingDynamicPath = null;
    }

    console.log(`✅ ${pages.length} pages loaded from Admin`);
  } catch (err) {
    console.warn('Failed to load dynamic pages:', err);
  }
}

/**
 * Load and render content for a single dynamic page
 */
async function loadDynamicPageContent(page, pageEl, pageMap) {
  const slug = page.slug;

  try {
    const sections = await fetchPageSections(slug);

    // Build breadcrumb trail with hierarchical paths
    const breadcrumbs = [];
    let current = page;
    while (current) {
      breadcrumbs.unshift({ title: current.title, slug: current.slug, id: current.id });
      current = current.parent_id ? pageMap[current.parent_id] : null;
    }

    // Build hierarchical paths for each breadcrumb
    breadcrumbs.forEach((bc, i) => {
      const pathParts = breadcrumbs.slice(0, i + 1).map(b => b.slug);
      bc.path = '/' + pathParts.join('/');
    });

    // Build page HTML
    let html = '';

    // Breadcrumb — always show for dynamic pages
    html += `<nav class="dynamic-page__breadcrumb" aria-label="Breadcrumb">
      <a href="/" data-page="home">Trang chủ</a>`;
    breadcrumbs.forEach((bc, i) => {
      const isLast = i === breadcrumbs.length - 1;
      if (isLast) {
        html += ` <span class="dynamic-page__breadcrumb-sep">›</span> <span class="dynamic-page__breadcrumb-current">${bc.title}</span>`;
      } else {
        // Check if parent is a static page or dynamic page
        const pageKey = PAGE_SLUG_MAP[bc.slug] ? bc.slug : `dynamic-${bc.slug}`;
        const linkPath = PAGE_TO_SLUG[pageKey] || PAGE_TO_SLUG[bc.slug] || bc.path;
        html += ` <span class="dynamic-page__breadcrumb-sep">›</span> <a href="${linkPath}" data-page="${PAGE_SLUG_MAP[bc.slug] ? ROUTES[`/${bc.slug}`]?.page || bc.slug : `dynamic-${bc.slug}`}">${bc.title}</a>`;
      }
    });
    html += `</nav>`;

    // If sections exist, render them
    if (sections && sections.length > 0) {
      html += '<div class="dynamic-page__sections">';
      for (const section of sections) {
        const sectionEl = await renderSection(section);
        if (sectionEl) {
          html += sectionEl.outerHTML;
        }
      }
      html += '</div>';
    } else {
      // No sections — show page title at minimum
      html += `
        <div class="dynamic-page__empty">
          <div class="subpage-header">
            <h1 class="subpage-header__title">${page.title}</h1>
            ${page.meta_description ? `<p class="subpage-header__desc">${page.meta_description}</p>` : ''}
          </div>
          <div class="dynamic-page__no-content">
            <p>Trang này chưa có nội dung. Vui lòng thêm sections trong Admin Panel.</p>
          </div>
        </div>
      `;
    }

    pageEl.innerHTML = html;

    // Setup click handlers for breadcrumb links
    pageEl.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.getAttribute('data-page'));
      });
    });

    // Setup scroll reveal for dynamic sections
    setTimeout(() => {
      pageEl.querySelectorAll('.dynamic-section[data-reveal]').forEach(el => {
        const observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            el.classList.add('revealed');
            observer.disconnect();
          }
        }, { threshold: 0.1 });
        observer.observe(el);
      });
    }, 100);

  } catch (err) {
    console.warn(`Failed to load page content: ${slug}`, err);
    pageEl.innerHTML = `
      <div class="dynamic-page__error">
        <h1>${page.title}</h1>
        <p>Không thể tải nội dung trang. Vui lòng thử lại sau.</p>
      </div>
    `;
  }
}

// ============================================
// DYNAMIC SECTION RENDERER
// Fetches page_sections from Supabase and renders them
// ============================================

// Map of page slug to its HTML page ID
const PAGE_SLUG_MAP = {
  // Giới thiệu
  'thu-ngo': 'page-about-letter',
  'tam-nhin-su-menh': 'page-about-vision',
  'gia-tri-cot-loi': 'page-about-values',
  'so-do-to-chuc': 'page-about-org',
  'chung-chi': 'page-about-cert',
  'giai-thuong': 'page-about-awards',
  // Năng lực
  'nang-luc-san-xuat': 'page-cap-prod',
  'nang-luc-thi-cong': 'page-cap-construct',
  'an-toan-lao-dong': 'page-cap-safety',
  // Trang chính
  'lich-su': 'page-history',
  'tin-tuc': 'page-news',
  'lien-he': 'page-contact',
};

/**
 * Try to render dynamic sections for a page slug.
 * Returns true if sections were found and rendered, false otherwise (fallback to static).
 */
async function tryRenderDynamicPage(pageSlug) {
  const sections = await fetchPageSections(pageSlug);
  if (!sections || sections.length === 0) return false;

  const pageId = PAGE_SLUG_MAP[pageSlug];
  if (!pageId) return false;

  const pageEl = document.getElementById(pageId);
  if (!pageEl) return false;

  // Clear existing static content and render dynamic sections
  const dynamicContainer = document.createElement('div');
  dynamicContainer.className = 'dynamic-page';
  dynamicContainer.setAttribute('data-slug', pageSlug);

  for (const section of sections) {
    const sectionEl = await renderSection(section);
    if (sectionEl) {
      dynamicContainer.appendChild(sectionEl);
    }
  }

  // Keep existing static content as fallback, add dynamic at top
  const existingContent = pageEl.innerHTML;
  pageEl.innerHTML = '';
  pageEl.appendChild(dynamicContainer);

  // Setup scroll reveal for new sections
  setTimeout(() => {
    dynamicContainer.querySelectorAll('.dynamic-section[data-reveal]').forEach(el => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.disconnect();
        }
      }, { threshold: 0.1 });
      observer.observe(el);
    });
  }, 100);

  return true;
}

/**
 * Render a single section based on its type
 */
async function renderSection(section) {
  const { section_type, title, content, media_urls, config } = section;
  const cfg = config || {};
  // Normalize: add media_url shorthand (first item from media_urls array)
  section._media_url = Array.isArray(media_urls) && media_urls.length > 0 ? media_urls[0] : null;

  const renderers = {
    hero: renderHeroSection,
    text: renderTextSection,
    image_gallery: renderGallerySection,
    features: renderFeaturesSection,
    stats: renderStatsSection,
    cta: renderCtaSection,
    testimonial: renderTestimonialSection,
    faq: renderFaqSection,
    video: renderVideoSection,
    contact_form: renderContactFormSection,
    divider: renderDividerSection,
    featured_projects: renderFeaturedProjectsSection,
    partners: renderPartnersSection,
    timeline: renderTimelineSection,
    team: renderTeamSection,
  };

  const renderer = renderers[section_type];
  if (!renderer) {
    console.warn(`Unknown section type: ${section_type}`);
    return null;
  }

  return await renderer(section);
}

// === Section Render Functions ===

function renderHeroSection({ title, content, media_urls, _media_url, config }) {
  const cfg = config || {};
  const bgUrl = _media_url || (cfg.background_image) || null;
  const el = document.createElement('section');
  el.className = 'dynamic-section dynamic-hero';
  el.setAttribute('data-reveal', '');
  if (bgUrl) el.style.setProperty('--hero-bg', `url(${bgUrl})`);

  el.innerHTML = `
    <div class="dynamic-hero__overlay"></div>
    <div class="dynamic-hero__content">
      ${title ? `<h1 class="dynamic-hero__title">${title}</h1>` : ''}
      ${content ? `<p class="dynamic-hero__subtitle">${content}</p>` : ''}
      ${cfg.cta_text ? `<a href="${cfg.cta_url || '#'}" class="dynamic-cta__btn" style="margin-top:2rem;color:#fff;border-color:rgba(255,255,255,0.5);">${cfg.cta_text}</a>` : ''}
    </div>
  `;
  return el;
}

function renderTextSection({ title, content }) {
  const el = document.createElement('section');
  el.className = 'dynamic-section dynamic-text';
  el.setAttribute('data-reveal', '');
  el.innerHTML = `
    ${title ? `<h2>${title}</h2>` : ''}
    <div class="dynamic-text__body">${content || ''}</div>
  `;
  return el;
}

function renderGallerySection({ title, media_urls, config }) {
  const cfg = config || {};
  const images = (cfg.media_urls || media_urls || []);
  const el = document.createElement('section');
  el.className = 'dynamic-section dynamic-gallery';
  el.setAttribute('data-reveal', '');
  el.innerHTML = `
    ${title ? `<h2>${title}</h2>` : ''}
    <div class="dynamic-gallery__grid">
      ${images.map(img => `
        <div class="dynamic-gallery__item">
          <img src="${img}" alt="" loading="lazy">
        </div>
      `).join('')}
    </div>
  `;
  return el;
}

function renderFeaturesSection({ title, content, config }) {
  const cfg = config || {};
  const items = cfg.items || [];
  const el = document.createElement('section');
  el.className = 'dynamic-section dynamic-features';
  el.setAttribute('data-reveal', '');
  el.innerHTML = `
    ${title ? `<h2>${title}</h2>` : ''}
    ${content ? `<p style="text-align:center;max-width:600px;margin:0 auto 3rem;color:var(--color-text-muted);">${content}</p>` : ''}
    <div class="dynamic-features__grid">
      ${items.map(item => `
        <div class="dynamic-features__item">
          ${item.icon ? `<div class="dynamic-features__icon">${item.icon}</div>` : ''}
          <h3>${item.title || item.text || ''}</h3>
          <p>${item.description || item.subtitle || ''}</p>
        </div>
      `).join('')}
    </div>
  `;
  return el;
}

function renderStatsSection({ title, config }) {
  const cfg = config || {};
  const items = cfg.items || [];
  const el = document.createElement('section');
  el.className = 'dynamic-section dynamic-stats';
  el.setAttribute('data-reveal', '');
  el.innerHTML = `
    ${title ? `<h2>${title}</h2>` : ''}
    <div class="dynamic-stats__grid">
      ${items.map(item => `
        <div class="dynamic-stats__item">
          <div class="dynamic-stats__number">${item.icon || item.title || ''}</div>
          <div class="dynamic-stats__label">${item.text || item.description || ''}</div>
        </div>
      `).join('')}
    </div>
  `;
  return el;
}

function renderCtaSection({ title, content, config }) {
  const cfg = config || {};
  const el = document.createElement('section');
  el.className = 'dynamic-section dynamic-cta';
  el.setAttribute('data-reveal', '');
  el.innerHTML = `
    ${title ? `<h2>${title}</h2>` : ''}
    ${content ? `<p>${content}</p>` : ''}
    ${cfg.cta_text ? `<a href="${cfg.cta_url || '#'}" class="dynamic-cta__btn">${cfg.cta_text}</a>` : ''}
  `;
  return el;
}

function renderTestimonialSection({ title, config }) {
  const cfg = config || {};
  const items = cfg.items || [];
  const el = document.createElement('section');
  el.className = 'dynamic-section dynamic-testimonial';
  el.setAttribute('data-reveal', '');
  el.innerHTML = `
    ${title ? `<h2>${title}</h2>` : ''}
    ${items.map(item => `
      <div class="dynamic-testimonial__item">
        <p class="dynamic-testimonial__quote">"${item.text || item.title || ''}"</p>
        <div class="dynamic-testimonial__author">${item.icon || item.subtitle || ''}</div>
        <div class="dynamic-testimonial__role">${item.description || ''}</div>
      </div>
    `).join('')}
  `;
  return el;
}

function renderFaqSection({ title, config }) {
  const cfg = config || {};
  const items = cfg.items || [];
  const el = document.createElement('section');
  el.className = 'dynamic-section dynamic-faq';
  el.setAttribute('data-reveal', '');
  el.innerHTML = `
    ${title ? `<h2>${title}</h2>` : ''}
    ${items.map(item => `
      <div class="dynamic-faq__item">
        <button class="dynamic-faq__question">
          <span>${item.title || item.text || ''}</span>
          <span>+</span>
        </button>
        <div class="dynamic-faq__answer">${item.description || item.subtitle || ''}</div>
      </div>
    `).join('')}
  `;

  // Attach click handlers for accordion
  el.querySelectorAll('.dynamic-faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.dynamic-faq__item');
      item.classList.toggle('open');
      const icon = btn.querySelector('span:last-child');
      icon.textContent = item.classList.contains('open') ? '−' : '+';
    });
  });

  return el;
}

function renderVideoSection({ title, content, config }) {
  const cfg = config || {};
  const videoUrl = cfg.video_url || '';
  const el = document.createElement('section');
  el.className = 'dynamic-section dynamic-video';
  el.setAttribute('data-reveal', '');

  // Convert YouTube URL to embed format
  let embedUrl = videoUrl;
  const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;

  el.innerHTML = `
    ${title ? `<h2>${title}</h2>` : ''}
    <div class="dynamic-video__wrapper">
      <iframe src="${embedUrl}" allowfullscreen loading="lazy"></iframe>
    </div>
    ${content ? `<p style="text-align:center;margin-top:1rem;color:var(--color-text-muted);">${content}</p>` : ''}
  `;
  return el;
}

function renderContactFormSection({ title, content }) {
  const el = document.createElement('section');
  el.className = 'dynamic-section dynamic-contact';
  el.setAttribute('data-reveal', '');
  el.innerHTML = `
    ${title ? `<h2>${title}</h2>` : ''}
    ${content ? `<p style="text-align:center;margin-bottom:2rem;color:var(--color-text-muted);">${content}</p>` : ''}
    <form class="dynamic-contact__form" id="dynamicContactForm">
      <div class="dynamic-contact__field">
        <label>Họ và tên</label>
        <input type="text" name="full_name" required placeholder="Nhập họ tên...">
      </div>
      <div class="dynamic-contact__field">
        <label>Email</label>
        <input type="email" name="email" required placeholder="email@example.com">
      </div>
      <div class="dynamic-contact__field">
        <label>Số điện thoại</label>
        <input type="tel" name="phone" placeholder="0901 234 567">
      </div>
      <div class="dynamic-contact__field">
        <label>Nội dung</label>
        <textarea name="message" required placeholder="Nội dung liên hệ..."></textarea>
      </div>
      <button type="submit" class="dynamic-contact__submit">Gửi liên hệ</button>
    </form>
  `;

  // Attach form submit handler
  const form = el.querySelector('#dynamicContactForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const result = await submitContact(data);
    if (result) {
      form.innerHTML = '<p style="text-align:center;padding:3rem;font-weight:600;">✓ Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.</p>';
    }
  });

  return el;
}

function renderDividerSection({ config }) {
  const cfg = config || {};
  const el = document.createElement('div');
  el.className = `dynamic-section dynamic-divider${cfg.style === 'thick' ? ' dynamic-divider--thick' : ''}${cfg.spacing === 'large' ? ' dynamic-divider--spaced' : ''}`;
  return el;
}

async function renderFeaturedProjectsSection({ title, content, config }) {
  const cfg = config || {};
  const count = cfg.count || 6;
  const displayMode = cfg.display_mode || 'grid';
  const projects = await fetchFeaturedProjects(count);

  const el = document.createElement('section');
  el.className = 'dynamic-section dynamic-projects';
  el.setAttribute('data-reveal', '');

  const cardsHTML = projects.map(p => `
    <div class="dynamic-projects__card" data-project-id="${p.id}">
      <img src="${p.image}" alt="${p.title}" loading="lazy">
      <div class="dynamic-projects__card-info">
        <div class="dynamic-projects__card-title">${p.title}</div>
        ${cfg.show_category !== false ? `<div class="dynamic-projects__card-category">${p.category}</div>` : ''}
      </div>
    </div>
  `).join('');

  el.innerHTML = `
    ${title ? `<h2>${title}</h2>` : ''}
    ${content ? `<p style="text-align:center;max-width:600px;margin:-1rem auto 3rem;color:var(--color-text-muted);">${content}</p>` : ''}
    <div class="${displayMode === 'slider' ? 'dynamic-projects__slider' : 'dynamic-projects__grid'}">
      ${cardsHTML}
    </div>
  `;

  // Click handler for project cards
  el.querySelectorAll('.dynamic-projects__card').forEach(card => {
    card.addEventListener('click', () => {
      const projectId = card.dataset.projectId;
      const product = products.find(p => p.id === projectId);
      if (product) navigateTo('product', product);
    });
  });

  return el;
}

function renderPartnersSection({ title, config }) {
  const cfg = config || {};
  const logos = cfg.logos || [];
  const el = document.createElement('section');
  el.className = 'dynamic-section dynamic-partners';
  el.setAttribute('data-reveal', '');
  el.innerHTML = `
    ${title ? `<h2>${title}</h2>` : ''}
    <div class="dynamic-partners__grid">
      ${logos.map(logo => `
        <div class="dynamic-partners__item">
          <img src="${logo}" alt="Partner" loading="lazy">
        </div>
      `).join('')}
    </div>
  `;
  return el;
}

function renderTimelineSection({ title, config }) {
  const cfg = config || {};
  const items = cfg.items || [];
  const el = document.createElement('section');
  el.className = 'dynamic-section dynamic-timeline';
  el.setAttribute('data-reveal', '');
  el.innerHTML = `
    ${title ? `<h2>${title}</h2>` : ''}
    <div class="dynamic-timeline__line">
      ${items.map(item => `
        <div class="dynamic-timeline__item">
          <div class="dynamic-timeline__dot"></div>
          <div class="dynamic-timeline__year">${item.icon || ''}</div>
          <h3>${item.title || item.text || ''}</h3>
          <p>${item.description || item.subtitle || ''}</p>
        </div>
      `).join('')}
    </div>
  `;
  return el;
}

function renderTeamSection({ title, content, config }) {
  const cfg = config || {};
  const items = cfg.items || [];
  const el = document.createElement('section');
  el.className = 'dynamic-section dynamic-team';
  el.setAttribute('data-reveal', '');
  el.innerHTML = `
    ${title ? `<h2>${title}</h2>` : ''}
    ${content ? `<p style="text-align:center;max-width:600px;margin:-1rem auto 3rem;color:var(--color-text-muted);">${content}</p>` : ''}
    <div class="dynamic-team__grid">
      ${items.map(item => `
        <div class="dynamic-team__card">
          ${item.icon ? `<img src="${item.icon}" class="dynamic-team__avatar" alt="${item.title || ''}">` : ''}
          <div class="dynamic-team__name">${item.title || item.text || ''}</div>
          <div class="dynamic-team__role">${item.subtitle || ''}</div>
          <div class="dynamic-team__bio">${item.description || ''}</div>
        </div>
      `).join('')}
    </div>
  `;
  return el;
}

// ============================================
// INIT
// ============================================
async function init() {
  // Initialize i18n system
  initI18n();
  setupThemeToggle();

  // Listen for language changes to re-render dynamic content
  window.addEventListener('langchange', () => {
    // Re-render dynamic content with new language
    renderNews();
    renderDocuments();
    renderProjectsPage();
    renderOtherProjectPages();
    renderNewsSubpages();
    // Translate navigation items
    applyNavI18n();
    // Re-navigate to update title
    const page = state.currentPage;
    const title = getRouteTitle(page);
    document.title = page === 'home' ? SITE_NAME : `${title} — ${SITE_NAME}`;
  });

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
  initCelebration();

  // Route based on current URL (instead of always going to home)
  initRouter();

  // Load dynamic content in background
  renderNavigation();
  renderFooterNav();
  renderNews();
  renderDocuments();
  renderProjectsPage();
  renderOtherProjectPages();
  renderNewsSubpages();
  applySettings();

  // Try to load dynamic sections for subpages (replaces static if found)
  const dynamicSlugs = Object.keys(PAGE_SLUG_MAP);
  for (const slug of dynamicSlugs) {
    tryRenderDynamicPage(slug).then(loaded => {
      if (loaded) console.log(`✅ Dynamic page loaded: ${slug}`);
    });
  }

  // Load pages created from Admin Panel (creates DOM elements for new pages)
  loadDynamicPages();

  // Enhanced lazy-loading after initial render
  setTimeout(() => setupLazyImages(), 500);
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

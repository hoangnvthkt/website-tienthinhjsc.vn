/**
 * Background Music Player
 * Fetches bg_music_url / bg_music_enabled / bg_music_volume from Supabase site_settings
 * and renders a floating music player widget on the homepage.
 */

import { supabase } from './supabase.js';

// ── State ──────────────────────────────────────────────────────────────────
let audio = null;
let playerEl = null;
let isPlaying = false;
let volumeLevel = 0.3;
let trackLabel = '';
let hasUserInteracted = false;

// ── Supabase helper (vanilla JS version) ───────────────────────────────────
async function fetchMusicSettings() {
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['bg_music_url', 'bg_music_enabled', 'bg_music_volume', 'bg_music_label']);

    const map = {};
    (data || []).forEach(s => { map[s.key] = s.value; });
    return map;
  } catch {
    return {};
  }
}

// ── Build player DOM ───────────────────────────────────────────────────────
function buildPlayer() {
  if (playerEl) return;

  playerEl = document.createElement('div');
  playerEl.id = 'bgMusicPlayer';
  playerEl.className = 'music-player';
  playerEl.innerHTML = `
    <button class="music-player__btn" id="musicToggle" title="Nhạc nền" aria-label="Nhạc nền">
      <span class="music-player__icon music-player__icon--play">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </span>
      <span class="music-player__bars" aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </span>
    </button>
    <div class="music-player__panel" id="musicPanel">
      <div class="music-player__header">
        <span class="music-player__note">♪</span>
        <span class="music-player__label" id="musicLabel">Nhạc nền</span>
        <button class="music-player__close" id="musicPanelClose" aria-label="Đóng">✕</button>
      </div>
      <div class="music-player__controls">
        <button class="music-player__play-btn" id="musicPlayBtn" aria-label="Phát / dừng">
          <svg class="music-player__play-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg class="music-player__pause-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display:none">
            <path d="M6 19h4V5H6zm8-14v14h4V5z"/>
          </svg>
        </button>
        <div class="music-player__volume">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="opacity:.5">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
          <input type="range" class="music-player__vol-slider" id="musicVolume"
            min="0" max="1" step="0.05" value="0.3" aria-label="Âm lượng">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="opacity:.5">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z"/>
          </svg>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(playerEl);

  // Bind events
  const toggleBtn = playerEl.querySelector('#musicToggle');
  const panel = playerEl.querySelector('#musicPanel');
  const closeBtn = playerEl.querySelector('#musicPanelClose');
  const playBtn = playerEl.querySelector('#musicPlayBtn');
  const volSlider = playerEl.querySelector('#musicVolume');

  // Toggle panel
  toggleBtn.addEventListener('click', () => {
    playerEl.classList.toggle('music-player--open');
    // First click — try autoplay
    if (!hasUserInteracted) {
      hasUserInteracted = true;
      playAudio();
    }
  });

  closeBtn.addEventListener('click', () => {
    playerEl.classList.remove('music-player--open');
  });

  // Play / Pause
  playBtn.addEventListener('click', () => {
    if (isPlaying) pauseAudio();
    else playAudio();
  });

  // Volume
  volSlider.addEventListener('input', (e) => {
    volumeLevel = parseFloat(e.target.value);
    if (audio) audio.volume = volumeLevel;
  });

  // Close panel when clicking outside
  document.addEventListener('click', (e) => {
    if (!playerEl.contains(e.target)) {
      playerEl.classList.remove('music-player--open');
    }
  });
}

// ── Audio control ──────────────────────────────────────────────────────────
function playAudio() {
  if (!audio) return;
  const p = audio.play();
  if (p !== undefined) {
    p.then(() => {
      isPlaying = true;
      updatePlayState();
    }).catch(() => {
      // Autoplay blocked — user needs to click
    });
  }
}

function pauseAudio() {
  if (!audio) return;
  audio.pause();
  isPlaying = false;
  updatePlayState();
}

function updatePlayState() {
  if (!playerEl) return;
  const playIcon = playerEl.querySelector('.music-player__play-icon');
  const pauseIcon = playerEl.querySelector('.music-player__pause-icon');
  const bars = playerEl.querySelector('.music-player__bars');
  const playBtnIcon = playerEl.querySelector('.music-player__icon--play');

  if (isPlaying) {
    if (playIcon) playIcon.style.display = 'none';
    if (pauseIcon) pauseIcon.style.display = '';
    if (bars) bars.classList.add('music-player__bars--playing');
    if (playBtnIcon) playBtnIcon.style.display = 'none';
    playerEl.classList.add('music-player--playing');
  } else {
    if (playIcon) playIcon.style.display = '';
    if (pauseIcon) pauseIcon.style.display = 'none';
    if (bars) bars.classList.remove('music-player__bars--playing');
    if (playBtnIcon) playBtnIcon.style.display = '';
    playerEl.classList.remove('music-player--playing');
  }
}

// ── Public init function ───────────────────────────────────────────────────
export async function initMusicPlayer() {
  const settings = await fetchMusicSettings();

  const enabled = settings.bg_music_enabled === 'true';
  const url = settings.bg_music_url;
  const vol = parseFloat(settings.bg_music_volume || '0.3');
  const label = settings.bg_music_label || 'Nhạc nền';

  if (!enabled || !url) return; // Nothing to do

  volumeLevel = vol;
  trackLabel = label;

  // Create audio element
  audio = new Audio(url);
  audio.loop = true;
  audio.volume = vol;
  audio.preload = 'none'; // Don't preload until user interacts

  audio.addEventListener('play', () => {
    isPlaying = true;
    updatePlayState();
  });
  audio.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayState();
  });
  audio.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayState();
  });

  // Build UI
  buildPlayer();

  // Set label
  const labelEl = playerEl?.querySelector('#musicLabel');
  if (labelEl) labelEl.textContent = trackLabel;

  // Set volume slider
  const slider = playerEl?.querySelector('#musicVolume');
  if (slider) slider.value = String(vol);

  // Try silent autoplay (many browsers block this)
  audio.muted = true;
  const autoplayAttempt = audio.play();
  if (autoplayAttempt !== undefined) {
    autoplayAttempt.then(() => {
      // Autoplay succeeded — unmute and set volume
      audio.muted = false;
      audio.volume = vol;
      isPlaying = true;
      hasUserInteracted = true;
      updatePlayState();
    }).catch(() => {
      // Blocked — wait for user click on the player button
      audio.muted = false;
    });
  }

  console.log('🎵 Music player initialized:', url);
}

export function destroyMusicPlayer() {
  if (audio) {
    audio.pause();
    audio.src = '';
    audio = null;
  }
  if (playerEl) {
    playerEl.remove();
    playerEl = null;
  }
  isPlaying = false;
}

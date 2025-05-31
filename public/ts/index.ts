// Import the WebAssembly module
import init, { AudioProcessor } from '../../src/wasm/pkg/podcast_player.js';
import { Auth } from './auth';

// Sample podcast data - in a real app, this would come from an API
const podcastEpisodes = [
  {
    id: 1,
    title: 'Introduction to WebAssembly',
    description: 'Learn the basics of WebAssembly and how it can improve web performance',
    audioUrl: 'https://example.com/podcast1.mp3',
    duration: 1850 // in seconds
  },
  {
    id: 2,
    title: 'Building Audio Applications with Rust',
    description: 'Discover how to use Rust to build high-performance audio applications',
    audioUrl: 'https://example.com/podcast2.mp3',
    duration: 2340
  },
  {
    id: 3,
    title: 'The Future of Web Development',
    description: 'Exploring upcoming technologies that will shape the future of web development',
    audioUrl: 'https://example.com/podcast3.mp3',
    duration: 1620
  }
];

// DOM elements and state
let audioProcessor: AudioProcessor;
let audioElement: HTMLAudioElement;
let currentEpisode: any = null;
let isPlaying = false;
let currentTab = 'episodes';
let focusableElements: HTMLElement[] = [];
let currentFocusIndex = 0;

// Initialize the application
async function init_app() {
  try {

    const auth = Auth.getInstance();
    const isLoggedIn = await auth.checkAuth();

    if (!isLoggedIn) {
        window.location.href = './login.html';
        return;
    }

    // Initialize the WebAssembly module
    await init();
    
    // Create audio processor
    audioProcessor = new AudioProcessor();
    audioProcessor.log_message('Audio processor initialized');
    
    // Create audio element
    audioElement = new Audio();
    
    // Set up the UI
    setupUI();
    
    // Load episodes
    loadEpisodes();
    
    // Initialize console controls
    initConsoleControls();
    
    // Check if running on a gaming console
    if (isGamingConsole()) {
      enableConsoleMode();
    }
    
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
}

function isGamingConsole(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('playstation') || userAgent.includes('nintendo') || userAgent.includes('xbox');
}



function enableConsoleMode() {
  document.body.classList.add('console-mode');
  updateFocusableElements();
  setInitialFocus();
}

function updateFocusableElements() {
  focusableElements = Array.from(document.querySelectorAll('.focusable'));
}

function setInitialFocus() {
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
    currentFocusIndex = 0;
  }
}

function setupUI() {
  // Tab navigation
  const tabsContainer = document.querySelector('.console-tabs');
  const tabs = document.querySelectorAll('.console-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.getAttribute('data-tab') || 'episodes'));
  });
  
  // Console mode toggle
  const consoleModeToggle = document.getElementById('console-mode-toggle');
  updateConsoleTabs(consoleModeToggle, tabsContainer);  
  consoleModeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('console-mode');
    updateConsoleTabs(consoleModeToggle, tabsContainer);
    updateFocusableElements();
  });
  
  // Play/Pause button
  const playButton = document.getElementById('btn-play');
  playButton?.addEventListener('click', togglePlayPause);
  
  // Skip buttons
  document.getElementById('btn-backward')?.addEventListener('click', () => skipTime(-15));
  document.getElementById('btn-forward')?.addEventListener('click', () => skipTime(30));
  
  // Volume control
  const volumeSlider = document.getElementById('volume-slider') as HTMLInputElement;
  volumeSlider?.addEventListener('input', () => {
    const volume = parseInt(volumeSlider.value) / 100;
    setVolume(volume);
  });
  
  // Playback speed
  const speedSelect = document.getElementById('playback-speed') as HTMLSelectElement;
  speedSelect?.addEventListener('change', () => {
    const speed = parseFloat(speedSelect.value);
    setPlaybackSpeed(speed);
  });
  
  // Progress bar
  const progressBar = document.querySelector<HTMLDivElement>('.progress-bar');
  progressBar?.addEventListener('click', (e: MouseEvent) => {
    if (!currentEpisode) return;
    
    const rect = (progressBar as HTMLElement).getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = pos * audioElement.duration;
    audioElement.currentTime = seekTime;
  });
  
  // Audio element events
  audioElement.addEventListener('timeupdate', updateProgress);
  audioElement.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayButton();
  });
}

function updateConsoleTabs(consoleModeToggle: Element | null, tabsContainer: Element | null) {
  const isConsoleMode = document.body.classList.contains('console-mode');
  tabsContainer?.classList.toggle('hidden', !isConsoleMode);
  if (consoleModeToggle) {
    consoleModeToggle.textContent = isConsoleMode ? 'Disable' : 'Enable';
  }
}

function switchTab(tabName: string) {
  currentTab = tabName;
  
  // Hide all sections
  document.querySelectorAll('.nav-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Show selected section
  const selectedSection = document.getElementById(`${tabName}-section`);
  selectedSection?.classList.add('active');
  
  // Update tab styling
  document.querySelectorAll('.console-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
  });
  
  updateFocusableElements();
}

function initConsoleControls() {
  // Gamepad navigation
  window.addEventListener('gamepadconnected', (e) => {
    console.log('Gamepad connected:', e.gamepad);
  });
  
  // Keyboard navigation for testing
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':
        navigateFocus('prev');
        break;
      case 'ArrowDown':
        navigateFocus('next');
        break;
      case 'ArrowLeft':
      case 'BrowserBack':
        navigateTab('prev');
        break;
      case 'ArrowRight':
      case 'BrowserForward':
        navigateTab('next');
        break;
      case 'Enter':
      case ' ':
        activateFocusedElement();
        break;
    }
  });
}

function navigateFocus(direction: 'prev' | 'next') {
  if (focusableElements.length === 0) return;
  
  currentFocusIndex = direction === 'next'
    ? (currentFocusIndex + 1) % focusableElements.length
    : (currentFocusIndex - 1 + focusableElements.length) % focusableElements.length;
  
  focusableElements[currentFocusIndex].focus();
}

function navigateTab(direction: 'prev' | 'next') {
  const tabs = ['episodes', 'player', 'settings'];
  const currentIndex = tabs.indexOf(currentTab);
  const newIndex = direction === 'next'
    ? (currentIndex + 1) % tabs.length
    : (currentIndex - 1 + tabs.length) % tabs.length;
  
  switchTab(tabs[newIndex]);
}

function activateFocusedElement() {
  const focused = document.activeElement as HTMLElement;
  focused?.click();
}

function loadEpisodes() {
  const container = document.getElementById('episodes-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  podcastEpisodes.forEach(episode => {
    const episodeEl = document.createElement('div');
    episodeEl.className = 'episode-item focusable';
    episodeEl.tabIndex = 0;
    episodeEl.innerHTML = `
      <h3>${episode.title}</h3>
      <p>${episode.description}</p>
      <p>${formatTime(episode.duration)}</p>
    `;
    
    episodeEl.addEventListener('click', () => {
      loadEpisode(episode);
    });
    
    container.appendChild(episodeEl);
  });
  
  updateFocusableElements();
}

function loadEpisode(episode: any) {
  currentEpisode = episode;
  
  // Update UI
  const titleEl = document.getElementById('current-title');
  const descriptionEl = document.getElementById('current-description');
  if (titleEl) titleEl.textContent = episode.title;
  if (descriptionEl) descriptionEl.textContent = episode.description;
  
  // Set a placeholder for the image
  const imgElement = document.getElementById('current-image') as HTMLImageElement;
  if (imgElement) {
    imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTIwIDEyMCI+PHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiM0YTg2ZTgiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmZmZmYiPlBvZGNhc3Q8L3RleHQ+PC9zdmc+';
  }
  
  // Load audio
  audioElement.src = episode.audioUrl;
  audioElement.load();
  
  // Highlight the selected episode
  const episodeItems = document.querySelectorAll('.episode-item');
  episodeItems.forEach(item => {
    item.classList.toggle('active', item.querySelector('h3')?.textContent === episode.title);
  });
  
  // Switch to player tab
  switchTab('player');
  
  // Start playing
  playAudio();
}

function togglePlayPause() {
  if (!currentEpisode) return;
  
  if (isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

function playAudio() {
  audioElement.play()
    .then(() => {
      isPlaying = true;
      updatePlayButton();
    })
    .catch(error => {
      console.error('Error playing audio:', error);
      // In a real app, show a user-friendly error message
    });
}

function pauseAudio() {
  audioElement.pause();
  isPlaying = false;
  updatePlayButton();
}

function updatePlayButton() {
  const playButton = document.getElementById('btn-play');
  if (playButton) {
    playButton.textContent = isPlaying ? 'Pause' : 'Play';
  }
}

function skipTime(seconds: number) {
  if (!audioElement) return;
  audioElement.currentTime += seconds;
}

function setVolume(volume: number) {
  if (!audioProcessor) return;
  
  try {
    audioProcessor.set_volume(volume);
    audioElement.volume = volume;
  } catch (error) {
    console.error('Error setting volume:', error);
  }
}

function setPlaybackSpeed(speed: number) {
  if (!audioElement || !audioProcessor) return;
  
  try {
    const adjustedSpeed = audioProcessor.adjust_playback_speed(speed);
    audioElement.playbackRate = adjustedSpeed;
  } catch (error) {
    console.error('Error setting playback speed:', error);
  }
}

function updateProgress() {
  const currentTimeEl = document.getElementById('current-time');
  const totalTimeEl = document.getElementById('total-time');
  const progressFill = document.querySelector<HTMLDivElement>('.progress');
  
  if (currentTimeEl && totalTimeEl && progressFill && !isNaN(audioElement.duration)) {
    currentTimeEl.textContent = formatTime(audioElement.currentTime);
    totalTimeEl.textContent = formatTime(audioElement.duration);
    
    const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
    progressFill.style.width = `${progressPercent}%`;
  }
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Initialize the app when the page loads
window.addEventListener('DOMContentLoaded', init_app);
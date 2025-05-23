// Import the WebAssembly module
import init, { AudioProcessor } from '../../src/wasm/pkg/podcast_player.js';

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

// DOM elements
let audioProcessor;
let audioElement;
let currentEpisode = null;
let isPlaying = false;

// Initialize the application
async function init_app() {
  try {
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
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
}

function setupUI() {
  // Play/Pause button
  const playButton = document.getElementById('btn-play');
  playButton.addEventListener('click', togglePlayPause);
  
  // Skip buttons
  document.getElementById('btn-backward').addEventListener('click', () => skipTime(-15));
  document.getElementById('btn-forward').addEventListener('click', () => skipTime(30));
  
  // Volume control
  const volumeSlider = document.getElementById('volume-slider');
  volumeSlider.addEventListener('input', () => {
    const volume = volumeSlider.value / 100;
    setVolume(volume);
  });
  
  // Playback speed
  const speedSelect = document.getElementById('playback-speed');
  speedSelect.addEventListener('change', () => {
    const speed = parseFloat(speedSelect.value);
    setPlaybackSpeed(speed);
  });
  
  // Progress bar
  const progressBar = document.querySelector('.progress-bar');
  progressBar.addEventListener('click', (e) => {
    if (!currentEpisode) return;
    
    const rect = progressBar.getBoundingClientRect();
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

function loadEpisodes() {
  const container = document.getElementById('episodes-container');
  container.innerHTML = '';
  
  podcastEpisodes.forEach(episode => {
    const episodeEl = document.createElement('div');
    episodeEl.className = 'episode-item';
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
}

function loadEpisode(episode) {
  currentEpisode = episode;
  
  // Update UI
  document.getElementById('current-title').textContent = episode.title;
  document.getElementById('current-description').textContent = episode.description;
  
  // Set a placeholder for the image
  const imgElement = document.getElementById('current-image');
  // Use a data URI for the default podcast image
  imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTIwIDEyMCI+PHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiM0YTg2ZTgiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmZmZmYiPlBvZGNhc3Q8L3RleHQ+PC9zdmc+';
  
  // Load audio
  audioElement.src = episode.audioUrl;
  audioElement.load();
  
  // Highlight the selected episode
  const episodeItems = document.querySelectorAll('.episode-item');
  episodeItems.forEach(item => {
    if (item.querySelector('h3').textContent === episode.title) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
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
  playButton.innerHTML = isPlaying ? '<span>❚❚</span>' : '<span>▶</span>';
}

function skipTime(seconds) {
  if (!audioElement || !currentEpisode) return;
  
  audioElement.currentTime += seconds;
}

function setVolume(volume) {
  if (!audioProcessor) return;
  
  try {
    audioProcessor.set_volume(volume);
    audioElement.volume = volume;
  } catch (error) {
    console.error('Error setting volume:', error);
  }
}

function setPlaybackSpeed(speed) {
  if (!audioElement || !audioProcessor) return;
  
  try {
    const adjustedSpeed = audioProcessor.adjust_playback_speed(speed);
    audioElement.playbackRate = adjustedSpeed;
  } catch (error) {
    console.error('Error setting playback speed:', error);
  }
}

function updateProgress() {
  if (!audioElement || !currentEpisode) return;
  
  const currentTime = audioElement.currentTime;
  const duration = audioElement.duration || currentEpisode.duration;
  
  // Update progress bar
  const progressEl = document.getElementById('progress');
  const progress = (currentTime / duration) * 100;
  progressEl.style.width = `${progress}%`;
  
  // Update time displays
  document.getElementById('current-time').textContent = formatTime(currentTime);
  document.getElementById('duration').textContent = formatTime(duration);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Initialize the app when the page loads
window.addEventListener('DOMContentLoaded', init_app);
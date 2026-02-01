// ============================================
// SPOTDOWN SPOTIFY DOWNLOADER - MAIN SCRIPT
// ============================================

// DOM Elements
const darkModeToggle = document.getElementById('darkModeToggle');
const mobileDarkModeToggle = document.getElementById('mobileDarkModeToggle');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const closeMobileMenu = document.getElementById('closeMobileMenu');
const pasteBtn = document.getElementById('pasteBtn');
const downloadBtn = document.getElementById('downloadBtn');
const searchBtn = document.getElementById('searchBtn');
const spotifyUrlInput = document.getElementById('spotifyUrl');
const searchQueryInput = document.getElementById('searchQuery');
const downloadModal = document.getElementById('downloadModal');
const closeModal = document.getElementById('closeModal');
const cancelDownload = document.getElementById('cancelDownload');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const downloadFileName = document.getElementById('downloadFileName');
const downloadQuality = document.getElementById('downloadQuality');
const faqQuestions = document.querySelectorAll('.faq-question');
const resultsSection = document.getElementById('resultsSection');
const resultsContainer = document.getElementById('resultsContainer');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const contactModal = document.getElementById('contactModal');
const closeContactModal = document.getElementById('closeContactModal');
const contactLinks = document.querySelectorAll('#contactLink, #contactLink2');
const submitContactBtn = document.getElementById('submitContact');

// State Management
let currentDownload = null;
let isProcessing = false;

// Sample Data for Demo (Extended)
const sampleData = {
    songs: [
        {
            id: 1,
            title: "Shape of You",
            artist: "Ed Sheeran",
            album: "÷ (Divide)",
            duration: "3:53",
            year: "2017",
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
            url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
            popularity: 98
        },
        {
            id: 2,
            title: "Blinding Lights",
            artist: "The Weeknd",
            album: "After Hours",
            duration: "3:20",
            year: "2020",
            image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop",
            url: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b",
            popularity: 96
        },
        {
            id: 3,
            title: "Bad Guy",
            artist: "Billie Eilish",
            album: "When We All Fall Asleep, Where Do We Go?",
            duration: "3:14",
            year: "2019",
            image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop",
            url: "https://open.spotify.com/track/2Fxmhks0bxGSBdJ92vM42m",
            popularity: 95
        },
        {
            id: 4,
            title: "Dance Monkey",
            artist: "Tones and I",
            album: "The Kids Are Coming",
            duration: "3:29",
            year: "2019",
            image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=400&fit=crop",
            url: "https://open.spotify.com/track/2XU0oxnq2qxCpomAAuJY8K",
            popularity: 94
        },
        {
            id: 5,
            title: "Stay",
            artist: "The Kid LAROI, Justin Bieber",
            album: "F*CK LOVE 3: OVER YOU",
            duration: "2:21",
            year: "2021",
            image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=400&fit=crop",
            url: "https://open.spotify.com/track/5PjdY0CKGZdEuoNab3yDmX",
            popularity: 97
        },
        {
            id: 6,
            title: "As It Was",
            artist: "Harry Styles",
            album: "Harry's House",
            duration: "2:47",
            year: "2022",
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
            url: "https://open.spotify.com/track/4LRPiXqCikLlN15c3yImP7",
            popularity: 99
        },
        {
            id: 7,
            title: "Flowers",
            artist: "Miley Cyrus",
            album: "Endless Summer Vacation",
            duration: "3:20",
            year: "2023",
            image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop",
            url: "https://open.spotify.com/track/0yLdNVWF3Srea0uzk55zFn",
            popularity: 100
        },
        {
            id: 8,
            title: "Heat Waves",
            artist: "Glass Animals",
            album: "Dreamland",
            duration: "3:58",
            year: "2020",
            image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop",
            url: "https://open.spotify.com/track/3USxtqRwSYz57Ewm6wWRMp",
            popularity: 97
        }
    ],
    
    playlists: [
        {
            id: 1,
            name: "Top Hits 2024",
            description: "The hottest tracks of 2024",
            image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
            totalTracks: 50,
            owner: "Spotify",
            tracks: [1, 2, 3, 4, 5]
        },
        {
            id: 2,
            name: "Chill Vibes",
            description: "Relaxing music for your downtime",
            image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=400&fit=crop",
            totalTracks: 30,
            owner: "Spotify",
            tracks: [1, 3, 6, 8]
        }
    ],
    
    albums: [
        {
            id: 1,
            name: "÷ (Divide)",
            artist: "Ed Sheeran",
            year: "2017",
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
            totalTracks: 12,
            tracks: [1]
        },
        {
            id: 2,
            name: "After Hours",
            artist: "The Weeknd",
            year: "2020",
            image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop",
            totalTracks: 14,
            tracks: [2]
        }
    ],
    
    artists: [
        {
            id: 1,
            name: "Ed Sheeran",
            followers: "109M",
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
            topTracks: [1]
        },
        {
            id: 2,
            name: "The Weeknd",
            followers: "87M",
            image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop",
            topTracks: [2]
        }
    ]
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Show notification
function showNotification(message, type = 'info', duration = 4000) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    let bgColor = '#d1ecf1';
    let textColor = '#0c5460';
    let borderColor = '#0c5460';
    
    if (type === 'success') {
        icon = 'check-circle';
        bgColor = '#d4edda';
        textColor = '#155724';
        borderColor = '#155724';
    } else if (type === 'error') {
        icon = 'exclamation-circle';
        bgColor = '#f8d7da';
        textColor = '#721c24';
        borderColor = '#721c24';
    } else if (type === 'warning') {
        icon = 'exclamation-triangle';
        bgColor = '#fff3cd';
        textColor = '#856404';
        borderColor = '#856404';
    }
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // Add inline styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 350px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        background-color: ${bgColor};
        color: ${textColor};
        border-left: 4px solid ${borderColor};
    `;
    
    // Add keyframes for animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Remove notification after duration
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
                style.remove();
            }
        }, 300);
    }, duration);
}

// Show loading state
function showLoading(message = 'Memproses permintaan...') {
    resultsSection.classList.add('show');
    resultsContainer.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>${message}</p>
        </div>
    `;
}

// Clear results
function clearResults() {
    resultsSection.classList.remove('show');
    resultsContainer.innerHTML = '';
}

// Validate Spotify URL
function validateSpotifyUrl(url) {
    if (!url.trim()) {
        return { valid: false, message: 'URL tidak boleh kosong' };
    }
    
    // Basic URL pattern check
    const urlPattern = /^(https?:\/\/)?(open\.spotify\.com)\/(track|playlist|album|artist|episode|show)\/[a-zA-Z0-9]+(\?.*)?$/;
    
    if (!urlPattern.test(url)) {
        return { 
            valid: false, 
            message: 'URL Spotify tidak valid. Format: https://open.spotify.com/{track|playlist|album|artist}/ID' 
        };
    }
    
    return { valid: true, type: url.match(/\/(track|playlist|album|artist|episode|show)\//)[1] };
}

// Simulate API delay
function simulateAPIDelay() {
    return new Promise(resolve => {
        setTimeout(resolve, 1000 + Math.random() * 1000);
    });
}

// Format time
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// DARK MODE FUNCTIONS
// ============================================

function initDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        if (mobileDarkModeToggle) mobileDarkModeToggle.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        if (mobileDarkModeToggle) mobileDarkModeToggle.checked = false;
    }
}

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    if (isDarkMode) {
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        if (mobileDarkModeToggle) mobileDarkModeToggle.checked = true;
        showNotification('Mode gelap diaktifkan', 'info', 2000);
    } else {
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        if (mobileDarkModeToggle) mobileDarkModeToggle.checked = false;
        showNotification('Mode terang diaktifkan', 'info', 2000);
    }
}

// ============================================
// MOBILE MENU FUNCTIONS
// ============================================

function openMobileMenu() {
    mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenuHandler() {
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ============================================
// TAB FUNCTIONS
// ============================================

function initTabs() {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current tab
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Clear results when switching tabs
            clearResults();
            
            // Focus on input
            if (tabId === 'url-tab') {
                spotifyUrlInput.focus();
            } else {
                searchQueryInput.focus();
            }
        });
    });
}

// ============================================
// EXAMPLE HANDLERS
// ============================================

function initExampleHandlers() {
    // URL examples
    document.querySelectorAll('.example-link').forEach(link => {
        link.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            spotifyUrlInput.value = url;
            
            // Switch to URL tab if not already
            if (!document.querySelector('[data-tab="url-tab"]').classList.contains('active')) {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                document.querySelector('[data-tab="url-tab"]').classList.add('active');
                document.getElementById('url-tab').classList.add('active');
            }
            
            spotifyUrlInput.focus();
            showNotification('Contoh URL telah dimasukkan', 'info', 2000);
        });
    });
    
    // Search examples
    document.querySelectorAll('.search-example').forEach(example => {
        example.addEventListener('click', function() {
            const query = this.getAttribute('data-query');
            searchQueryInput.value = query;
            
            // Switch to search tab if not already
            if (!document.querySelector('[data-tab="search-tab"]').classList.contains('active')) {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                document.querySelector('[data-tab="search-tab"]').classList.add('active');
                document.getElementById('search-tab').classList.add('active');
            }
            
            searchQueryInput.focus();
            showNotification('Contoh pencarian telah dimasukkan', 'info', 2000);
        });
    });
}

// ============================================
// PASTE FUNCTIONALITY
// ============================================

async function pasteUrl() {
    try {
        const text = await navigator.clipboard.readText();
        
        // Check if it looks like a Spotify URL
        const validation = validateSpotifyUrl(text);
        if (validation.valid) {
            spotifyUrlInput.value = text;
            showNotification('URL Spotify berhasil ditempel!', 'success', 2000);
        } else {
            spotifyUrlInput.value = text;
            showNotification('Teks berhasil ditempel. ' + validation.message, 'warning', 3000);
        }
        
    } catch (err) {
        // Fallback for browsers that don't support clipboard API
        try {
            spotifyUrlInput.focus();
            document.execCommand('paste');
            const pastedText = spotifyUrlInput.value;
            
            const validation = validateSpotifyUrl(pastedText);
            if (validation.valid) {
                showNotification('URL Spotify berhasil ditempel!', 'success', 2000);
            } else {
                showNotification('Teks berhasil ditempel. ' + validation.message, 'warning', 3000);
            }
        } catch (fallbackErr) {
            showNotification('Gagal menempel. Silakan paste manual (Ctrl+V)', 'error', 3000);
        }
    }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

async function performSearch() {
    if (isProcessing) {
        showNotification('Sedang memproses permintaan sebelumnya...', 'warning', 2000);
        return;
    }
    
    const query = searchQueryInput.value.trim();
    
    if (!query) {
        showNotification('Masukkan kata kunci pencarian terlebih dahulu', 'error', 3000);
        searchQueryInput.focus();
        return;
    }
    
    if (query.length < 2) {
        showNotification('Kata kunci minimal 2 karakter', 'warning', 3000);
        return;
    }
    
    isProcessing = true;
    showLoading(`Mencari "${query}"...`);
    
    try {
        await simulateAPIDelay();
        
        // Simulate search results
        const searchResults = searchInSampleData(query);
        
        if (searchResults.length === 0) {
            displayNoResults(query);
        } else {
            displaySearchResults(query, searchResults);
        }
        
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Terjadi kesalahan saat mencari. Coba lagi.', 'error', 3000);
        clearResults();
    } finally {
        isProcessing = false;
    }
}

function searchInSampleData(query) {
    const searchTerm = query.toLowerCase();
    const results = [];
    
    // Search in songs
    sampleData.songs.forEach(song => {
        if (song.title.toLowerCase().includes(searchTerm) ||
            song.artist.toLowerCase().includes(searchTerm) ||
            song.album.toLowerCase().includes(searchTerm)) {
            results.push({
                type: 'song',
                data: song,
                relevance: calculateRelevance(song, searchTerm)
            });
        }
    });
    
    // Search in playlists
    sampleData.playlists.forEach(playlist => {
        if (playlist.name.toLowerCase().includes(searchTerm) ||
            playlist.description.toLowerCase().includes(searchTerm)) {
            results.push({
                type: 'playlist',
                data: playlist,
                relevance: playlist.name.toLowerCase().includes(searchTerm) ? 1 : 0.5
            });
        }
    });
    
    // Search in albums
    sampleData.albums.forEach(album => {
        if (album.name.toLowerCase().includes(searchTerm) ||
            album.artist.toLowerCase().includes(searchTerm)) {
            results.push({
                type: 'album',
                data: album,
                relevance: album.name.toLowerCase().includes(searchTerm) ? 1 : 0.5
            });
        }
    });
    
    // Search in artists
    sampleData.artists.forEach(artist => {
        if (artist.name.toLowerCase().includes(searchTerm)) {
            results.push({
                type: 'artist',
                data: artist,
                relevance: 1
            });
        }
    });
    
    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    
    return results.slice(0, 20); // Limit results
}

function calculateRelevance(song, searchTerm) {
    let relevance = 0;
    
    if (song.title.toLowerCase().includes(searchTerm)) relevance += 2;
    if (song.artist.toLowerCase().includes(searchTerm)) relevance += 1.5;
    if (song.album.toLowerCase().includes(searchTerm)) relevance += 1;
    
    // Boost popularity
    relevance += song.popularity / 100;
    
    return relevance;
}

function displayNoResults(query) {
    resultsContainer.innerHTML = `
        <div class="no-results">
            <i class="fas fa-search"></i>
            <h4>Tidak ada hasil untuk "${query}"</h4>
            <p>Coba dengan kata kunci yang berbeda</p>
            <div class="search-tips">
                <p><strong>Tips pencarian:</strong></p>
                <ul>
                    <li>Gunakan kata kunci yang lebih spesifik</li>
                    <li>Coba nama artis atau judul lagu lengkap</li>
                    <li>Pastikan ejaan benar</li>
                </ul>
            </div>
        </div>
    `;
}

function displaySearchResults(query, results) {
    let resultsHTML = `
        <div class="search-info">
            <h4>Hasil untuk "${query}" (${results.length} ditemukan)</h4>
        </div>
    `;
    
    results.forEach(result => {
        if (result.type === 'song') {
            const song = result.data;
            resultsHTML += `
                <div class="result-item" data-id="${song.id}" data-type="song">
                    <img src="${song.image}" alt="${song.title}" class="result-image">
                    <div class="result-info">
                        <div class="result-title">${song.title}</div>
                        <div class="result-artist">${song.artist} • ${song.album}</div>
                        <div class="result-meta">
                            <span class="result-duration">
                                <i class="far fa-clock"></i> ${song.duration}
                            </span>
                            <span class="result-year">
                                <i class="far fa-calendar"></i> ${song.year}
                            </span>
                            <span class="result-popularity">
                                <i class="fas fa-fire"></i> ${song.popularity}%
                            </span>
                        </div>
                    </div>
                    <div class="result-actions">
                        <button class="btn-play" data-id="${song.id}">
                            <i class="fas fa-play"></i> Play
                        </button>
                        <button class="btn-download" data-id="${song.id}" data-url="${song.url}">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </div>
                </div>
            `;
        } else if (result.type === 'playlist') {
            const playlist = result.data;
            const trackCount = playlist.tracks.length;
            resultsHTML += `
                <div class="result-item playlist-item" data-id="${playlist.id}" data-type="playlist">
                    <img src="${playlist.image}" alt="${playlist.name}" class="result-image">
                    <div class="result-info">
                        <div class="result-title">
                            <i class="fas fa-list"></i> ${playlist.name}
                        </div>
                        <div class="result-artist">${playlist.description}</div>
                        <div class="result-meta">
                            <span class="result-tracks">
                                <i class="fas fa-music"></i> ${trackCount} lagu
                            </span>
                            <span class="result-owner">
                                <i class="fas fa-user"></i> ${playlist.owner}
                            </span>
                        </div>
                    </div>
                    <div class="result-actions">
                        <button class="btn-view-playlist" data-id="${playlist.id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-download-all" data-id="${playlist.id}">
                            <i class="fas fa-download"></i> Download All
                        </button>
                    </div>
                </div>
            `;
        }
    });
    
    resultsContainer.innerHTML = resultsHTML;
    attachResultListeners();
}

// ============================================
// URL DOWNLOAD FUNCTIONALITY
// ============================================

async function processUrlDownload() {
    if (isProcessing) {
        showNotification('Sedang memproses permintaan sebelumnya...', 'warning', 2000);
        return;
    }
    
    const url = spotifyUrlInput.value.trim();
    
    if (!url) {
        showNotification('Masukkan URL Spotify terlebih dahulu', 'error', 3000);
        spotifyUrlInput.focus();
        return;
    }
    
    const validation = validateSpotifyUrl(url);
    if (!validation.valid) {
        showNotification(validation.message, 'error', 4000);
        return;
    }
    
    isProcessing = true;
    showLoading(`Memproses ${validation.type}...`);
    
    try {
        await simulateAPIDelay();
        
        switch (validation.type) {
            case 'track':
                displaySingleTrack(url);
                break;
            case 'playlist':
                displayPlaylist(url);
                break;
            case 'album':
                displayAlbum(url);
                break;
            case 'artist':
                displayArtistTracks(url);
                break;
            default:
                showNotification(`Tipe ${validation.type} belum didukung`, 'warning', 3000);
                clearResults();
        }
        
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Terjadi kesalahan saat memproses URL', 'error', 3000);
        clearResults();
    } finally {
        isProcessing = false;
    }
}

function displaySingleTrack(url) {
    // Use first song as example
    const song = sampleData.songs[0];
    
    resultsContainer.innerHTML = `
        <div class="result-item" data-id="${song.id}">
            <img src="${song.image}" alt="${song.title}" class="result-image">
            <div class="result-info">
                <div class="result-title">${song.title}</div>
                <div class="result-artist">${song.artist} • ${song.album} • ${song.year}</div>
                <div class="result-duration">
                    <i class="far fa-clock"></i> ${song.duration}
                </div>
                <div class="download-options">
                    <h4><i class="fas fa-cog"></i> Pilihan Download:</h4>
                    <div class="quality-options">
                        <div class="quality-option">
                            <input type="radio" id="quality-high" name="quality" value="320" checked>
                            <label for="quality-high">
                                <i class="fas fa-star"></i> High Quality
                                <small>320kbps • Best</small>
                            </label>
                        </div>
                        <div class="quality-option">
                            <input type="radio" id="quality-medium" name="quality" value="192">
                            <label for="quality-medium">
                                <i class="fas fa-balance-scale"></i> Medium Quality
                                <small>192kbps • Balanced</small>
                            </label>
                        </div>
                        <div class="quality-option">
                            <input type="radio" id="quality-low" name="quality" value="128">
                            <label for="quality-low">
                                <i class="fas fa-compress"></i> Low Quality
                                <small>128kbps • Fast</small>
                            </label>
                        </div>
                    </div>
                    <div class="format-options">
                        <h5>Format File:</h5>
                        <div class="format-buttons">
                            <button class="format-btn active" data-format="mp3">MP3</button>
                            <button class="format-btn" data-format="flac">FLAC</button>
                            <button class="format-btn" data-format="wav">WAV</button>
                        </div>
                    </div>
                    <div class="download-action">
                        <button class="btn-download-file" data-url="${url}">
                            <i class="fas fa-download"></i> Download Sekarang
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    attachDownloadListeners();
}

function displayPlaylist(url) {
    const playlist = sampleData.playlists[0];
    const tracks = playlist.tracks.map(id => sampleData.songs.find(s => s.id === id));
    
    let resultsHTML = `
        <div class="playlist-info">
            <img src="${playlist.image}" alt="${playlist.name}" class="playlist-image">
            <div class="playlist-details">
                <h4>${playlist.name}</h4>
                <p>${playlist.description}</p>
                <p><i class="fas fa-user"></i> ${playlist.owner}</p>
                <p><i class="fas fa-music"></i> ${playlist.totalTracks} lagu</p>
                <div class="playlist-actions">
                    <button class="btn-download-all">
                        <i class="fas fa-download"></i> Download Semua (${tracks.length} lagu)
                    </button>
                    <button class="btn-select-tracks">
                        <i class="fas fa-check-circle"></i> Pilih Lagu
                    </button>
                </div>
            </div>
        </div>
        <h4>Daftar Lagu:</h4>
    `;
    
    tracks.forEach((song, index) => {
        resultsHTML += `
            <div class="result-item" data-id="${song.id}">
                <div class="result-info">
                    <div class="result-title">${index + 1}. ${song.title}</div>
                    <div class="result-artist">${song.artist} • ${song.duration}</div>
                </div>
                <div class="result-actions">
                    <button class="btn-play" data-id="${song.id}">
                        <i class="fas fa-play"></i> Play
                    </button>
                    <button class="btn-download" data-id="${song.id}" data-url="${song.url}">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = resultsHTML;
    attachResultListeners();
}

function displayAlbum(url) {
    const album = sampleData.albums[0];
    
    let resultsHTML = `
        <div class="playlist-info">
            <img src="${album.image}" alt="${album.name}" class="playlist-image">
            <div class="playlist-details">
                <h4>${album.name}</h4>
                <p><i class="fas fa-user"></i> ${album.artist}</p>
                <p><i class="far fa-calendar"></i> ${album.year}</p>
                <p><i class="fas fa-music"></i> ${album.totalTracks} lagu</p>
                <button class="btn-download-all">
                    <i class="fas fa-download"></i> Download Album
                </button>
            </div>
        </div>
        <h4>Daftar Lagu:</h4>
    `;
    
    const tracks = album.tracks.map(id => sampleData.songs.find(s => s.id === id));
    tracks.forEach((song, index) => {
        resultsHTML += `
            <div class="result-item" data-id="${song.id}">
                <div class="result-info">
                    <div class="result-title">${index + 1}. ${song.title}</div>
                    <div class="result-artist">${song.duration}</div>
                </div>
                <div class="result-actions">
                    <button class="btn-download" data-id="${song.id}" data-url="${song.url}">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = resultsHTML;
    attachResultListeners();
}

function displayArtistTracks(url) {
    const artist = sampleData.artists[0];
    const tracks = artist.topTracks.map(id => sampleData.songs.find(s => s.id === id));
    
    let resultsHTML = `
        <div class="playlist-info">
            <img src="${artist.image}" alt="${artist.name}" class="playlist-image">
            <div class="playlist-details">
                <h4>${artist.name}</h4>
                <p><i class="fas fa-users"></i> ${artist.followers} followers</p>
                <p><i class="fas fa-music"></i> ${tracks.length} lagu populer</p>
                <button class="btn-download-all">
                    <i class="fas fa-download"></i> Download Semua
                </button>
            </div>
        </div>
        <h4>Lagu Populer:</h4>
    `;
    
    tracks.forEach((song, index) => {
        resultsHTML += `
            <div class="result-item" data-id="${song.id}">
                <div class="result-info">
                    <div class="result-title">${index + 1}. ${song.title}</div>
                    <div class="result-artist">${song.duration}</div>
                </div>
                <div class="result-actions">
                    <button class="btn-download" data-id="${song.id}" data-url="${song.url}">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = resultsHTML;
    attachResultListeners();
}

// ============================================
// RESULT LISTENERS
// ============================================

function attachResultListeners() {
    // Play buttons
    document.querySelectorAll('.btn-play').forEach(btn => {
        btn.addEventListener('click', function() {
            const songId = this.getAttribute('data-id');
            const song = sampleData.songs.find(s => s.id == songId);
            if (song) {
                showNotification(`Memutar preview: "${song.title}" - ${song.artist}`, 'info', 2000);
                // In a real app, this would play audio preview
            }
        });
    });
    
    // Download buttons
    document.querySelectorAll('.btn-download').forEach(btn => {
        btn.addEventListener('click', function() {
            const songId = this.getAttribute('data-id');
            const url = this.getAttribute('data-url');
            const song = sampleData.songs.find(s => s.id == songId);
            
            if (song) {
                startDownload(song.title, url);
            }
        });
    });
    
    // Download all buttons
    document.querySelectorAll('.btn-download-all').forEach(btn => {
        btn.addEventListener('click', function() {
            const container = this.closest('.playlist-info');
            const title = container ? container.querySelector('h4').textContent : 'Playlist';
            startBatchDownload(title);
        });
    });
    
    // View playlist buttons
    document.querySelectorAll('.btn-view-playlist').forEach(btn => {
        btn.addEventListener('click', function() {
            const playlistId = this.getAttribute('data-id');
            const playlist = sampleData.playlists.find(p => p.id == playlistId);
            if (playlist) {
                showNotification(`Membuka playlist: ${playlist.name}`, 'info', 2000);
                // In a real app, this would show playlist details
            }
        });
    });
    
    // Format buttons
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            showNotification(`Format dipilih: ${this.textContent}`, 'info', 2000);
        });
    });
}

function attachDownloadListeners() {
    document.querySelectorAll('.btn-download-file').forEach(btn => {
        btn.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            const quality = document.querySelector('input[name="quality"]:checked').value;
            const format = document.querySelector('.format-btn.active')?.getAttribute('data-format') || 'mp3';
            
            const qualityText = quality === '320' ? 'High (320kbps)' : 
                               quality === '192' ? 'Medium (192kbps)' : 'Low (128kbps)';
            const formatText = format.toUpperCase();
            
            const fileName = `spotdown_${Date.now()}`;
            startDownload(fileName, url, qualityText, formatText);
        });
    });
}

// ============================================
// DOWNLOAD FUNCTIONS
// ============================================

function startDownload(fileName, url, quality = "High (320kbps)", format = "MP3") {
    // Show download modal
    downloadModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Set download details
    downloadFileName.textContent = `Downloading: ${fileName}.${format.toLowerCase()}`;
    downloadQuality.textContent = `Quality: ${quality} • Format: ${format}`;
    
    // Simulate download progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress > 100) progress = 100;
        
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
        
        if (progress === 100) {
            clearInterval(interval);
            
            // Simulate completion
            setTimeout(() => {
                downloadModal.classList.remove('active');
                document.body.style.overflow = 'auto';
                
                // Reset progress
                setTimeout(() => {
                    progressBar.style.width = '0%';
                    progressText.textContent = '0%';
                }, 300);
                
                // Create and trigger actual download
                triggerFileDownload(fileName, quality, format);
                
                // Show success message
                showNotification(`Download berhasil! ${fileName}.${format.toLowerCase()}`, 'success', 3000);
            }, 1000);
        }
    }, 200);
    
    // Store interval for cancellation
    currentDownload = interval;
}

function startBatchDownload(title) {
    showNotification(`Menyiapkan download batch: ${title}`, 'info', 2000);
    
    // Simulate batch download preparation
    setTimeout(() => {
        showNotification(`Mengunduh ${title}...`, 'info', 2000);
        
        // Start download
        setTimeout(() => {
            startDownload(title.replace(/\s+/g, '_').toLowerCase(), 'https://open.spotify.com/playlist/sample');
        }, 1500);
    }, 1000);
}

function triggerFileDownload(fileName, quality, format) {
    // Create a more realistic dummy MP3 file content
    const dummyContent = `
        This is a dummy ${format} file generated by Spotdown.
        
        File: ${fileName}.${format.toLowerCase()}
        Quality: ${quality}
        Generated: ${new Date().toLocaleString()}
        
        In a real implementation, this would be the actual audio file
        downloaded from Spotify servers.
        
        Disclaimer: This is a demonstration only.
        Actual Spotify downloading requires proper licensing.
    `;
    
    const blob = new Blob([dummyContent], { 
        type: format === 'MP3' ? 'audio/mpeg' : 
               format === 'FLAC' ? 'audio/flac' : 'audio/wav'
    });
    
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_${quality.replace(/[^a-zA-Z0-9]/g, '_')}.${format.toLowerCase()}`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

function cancelDownloadHandler() {
    if (currentDownload) {
        clearInterval(currentDownload);
        currentDownload = null;
    }
    
    downloadModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Reset progress
    setTimeout(() => {
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
    }, 300);
    
    showNotification('Download dibatalkan', 'warning', 2000);
}

// ============================================
// CONTACT MODAL FUNCTIONS
// ============================================

function initContactModal() {
    // Open contact modal
    contactLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            contactModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            document.getElementById('contactName').focus();
        });
    });
    
    // Close contact modal
    closeContactModal.addEventListener('click', function() {
        contactModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    // Close modal when clicking outside
    contactModal.addEventListener('click', function(e) {
        if (e.target === this) {
            contactModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Submit contact form
    submitContactBtn.addEventListener('click', function() {
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const message = document.getElementById('contactMessage').value.trim();
        
        if (!name || !email || !message) {
            showNotification('Harap isi semua field', 'error', 3000);
            return;
        }
        
        if (!validateEmail(email)) {
            showNotification('Email tidak valid', 'error', 3000);
            return;
        }
        
        // Simulate form submission
        showNotification('Mengirim pesan...', 'info', 2000);
        
        setTimeout(() => {
            contactModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Clear form
            document.getElementById('contactName').value = '';
            document.getElementById('contactEmail').value = '';
            document.getElementById('contactMessage').value = '';
            
            showNotification('Pesan berhasil dikirim! Kami akan membalas segera.', 'success', 4000);
        }, 2000);
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ============================================
// FAQ ACCORDION
// ============================================

function initFAQAccordion() {
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(faqItem => {
                faqItem.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ============================================
// SMOOTH SCROLLING
// ============================================

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                // Close mobile menu if open
                if (mobileMenuOverlay.classList.contains('active')) {
                    closeMobileMenuHandler();
                }
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// INPUT VALIDATION
// ============================================

function initInputValidation() {
    // URL input validation
    spotifyUrlInput.addEventListener('input', function() {
        const url = this.value.trim();
        if (url) {
            const validation = validateSpotifyUrl(url);
            if (validation.valid) {
                this.style.borderColor = 'var(--success-color)';
                downloadBtn.disabled = false;
            } else {
                this.style.borderColor = 'var(--error-color)';
                downloadBtn.disabled = false;
            }
        } else {
            this.style.borderColor = 'var(--border-color)';
            downloadBtn.disabled = false;
        }
    });
    
    // Search input validation
    searchQueryInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (query) {
            this.style.borderColor = 'var(--primary-color)';
            searchBtn.disabled = false;
        } else {
            this.style.borderColor = 'var(--border-color)';
            searchBtn.disabled = false;
        }
    });
    
    // Enter key handlers
    spotifyUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            processUrlDownload();
        }
    });
    
    searchQueryInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
    // Initialize dark mode
    initDarkMode();
    
    // Add event listeners
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    if (mobileDarkModeToggle) {
        mobileDarkModeToggle.addEventListener('change', toggleDarkMode);
    }
    
    mobileMenuBtn.addEventListener('click', openMobileMenu);
    closeMobileMenu.addEventListener('click', closeMobileMenuHandler);
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.mobile-menu-link').forEach(link => {
        link.addEventListener('click', closeMobileMenuHandler);
    });
    
    // Initialize tabs
    initTabs();
    
    // Initialize example handlers
    initExampleHandlers();
    
    // Initialize paste functionality
    pasteBtn.addEventListener('click', pasteUrl);
    
    // Initialize download functionality
    downloadBtn.addEventListener('click', processUrlDownload);
    
    // Initialize search functionality
    searchBtn.addEventListener('click', performSearch);
    
    // Initialize input validation
    initInputValidation();
    
    // Download modal events
    closeModal.addEventListener('click', cancelDownloadHandler);
    cancelDownload.addEventListener('click', cancelDownloadHandler);
    
    // Close modal when clicking outside
    downloadModal.addEventListener('click', function(e) {
        if (e.target === this) {
            cancelDownloadHandler();
        }
    });
    
    // Initialize contact modal
    initContactModal();
    
    // Initialize FAQ accordion
    initFAQAccordion();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize footer links (basic functionality)
    document.querySelectorAll('#privacyLink, #termsLink, #supportLink').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification(`Halaman ${this.textContent} akan tersedia segera`, 'info', 3000);
        });
    });
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('Selamat datang di Spotdown! Download lagu Spotify dengan mudah.', 'info', 4000);
    }, 1000);
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

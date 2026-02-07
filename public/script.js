// Referensi Elemen UI
const ui = {
    inputView: document.getElementById('view-input'),
    loadingView: document.getElementById('view-loading'),
    resultView: document.getElementById('view-result'),
    
    urlInput: document.getElementById('spotifyUrl'),
    searchBtn: document.getElementById('searchBtn'),
    finalDownloadBtn: document.getElementById('finalDownloadBtn'),
    resetBtn: document.getElementById('resetBtn'),
    
    // Elemen Hasil
    img: document.getElementById('albumArt'),
    title: document.getElementById('trackTitle'),
    artist: document.getElementById('artistName'),
    duration: document.getElementById('durationTxt'),
    size: document.getElementById('sizeTxt')
};

// Variabel Global
let currentDownloadUrl = "";
let currentFileName = "music.mp3";

// Fungsi Navigasi Tampilan
function showView(viewName) {
    ui.inputView.classList.add('hidden');
    ui.loadingView.classList.add('hidden');
    ui.resultView.classList.add('hidden');

    if (viewName === 'input') {
        ui.inputView.classList.remove('hidden');
        ui.urlInput.focus();
    }
    if (viewName === 'loading') ui.loadingView.classList.remove('hidden');
    if (viewName === 'result') ui.resultView.classList.remove('hidden');
}

// Fungsi untuk menampilkan custom alert
function showCustomAlert(message, type = "warning") {
    // Hapus alert sebelumnya jika ada
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Buat element alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert alert-${type}`;
    
    // Tentukan ikon berdasarkan type
    let icon, bgColor;
    switch(type) {
        case "success":
            icon = '<i class="fas fa-check-circle"></i>';
            bgColor = '#1DB954';
            break;
        case "error":
            icon = '<i class="fas fa-exclamation-circle"></i>';
            bgColor = '#FF3333';
            break;
        case "warning":
        default:
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            bgColor = '#FFCC00';
            break;
    }
    
    alertDiv.innerHTML = `
        <div class="alert-content">
            <span class="alert-icon">${icon}</span>
            <span class="alert-message">${message}</span>
            <button class="alert-close">&times;</button>
        </div>
    `;
    
    // Tambahkan ke body
    document.body.appendChild(alertDiv);
    
    // Animasi masuk
    setTimeout(() => {
        alertDiv.classList.add('show');
    }, 10);
    
    // Auto hide setelah 5 detik (kecuali untuk error)
    const hideTime = type === "error" ? 7000 : 5000;
    const autoHide = setTimeout(() => {
        hideAlert(alertDiv);
    }, hideTime);
    
    // Event listener untuk tombol close
    const closeBtn = alertDiv.querySelector('.alert-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoHide);
        hideAlert(alertDiv);
    });
    
    // Click outside untuk close
    alertDiv.addEventListener('click', (e) => {
        if (e.target === alertDiv) {
            clearTimeout(autoHide);
            hideAlert(alertDiv);
        }
    });
    
    return alertDiv;
}

function hideAlert(alertElement) {
    alertElement.classList.remove('show');
    setTimeout(() => {
        if (alertElement.parentNode) {
            alertElement.remove();
        }
    }, 300);
}

// Fungsi untuk preload gambar
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
    });
}

// Fungsi untuk sanitize filename
function sanitizeFilename(filename) {
    return filename
        .replace(/[<>:"/\\|?*]+/g, '_') // Ganti karakter ilegal dengan underscore
        .replace(/\s+/g, ' ') // Normalize spasi
        .trim()
        .substring(0, 100); // Batasi panjang
}

// Fungsi untuk memformat durasi
function formatDuration(seconds) {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Fungsi untuk memformat ukuran file
function formatFileSize(bytes) {
    if (!bytes) return "Unknown";
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Update loading text dengan efek typing
function updateLoadingText() {
    const texts = [
        "Fetching track data...",
        "Extracting audio information...",
        "Preparing download...",
        "Almost there..."
    ];
    const loadingText = document.querySelector('.loader-container p');
    let index = 0;
    
    const interval = setInterval(() => {
        if (ui.loadingView.classList.contains('hidden')) {
            clearInterval(interval);
            return;
        }
        
        loadingText.textContent = texts[index];
        index = (index + 1) % texts.length;
    }, 2000);
    
    return interval;
}

// 1. EVENT: KLIK TOMBOL CARI/DOWNLOAD AWAL
ui.searchBtn.addEventListener('click', async () => {
    const url = ui.urlInput.value.trim();
    
    if (!url) {
        showCustomAlert("Please paste a Spotify URL first!", "warning");
        ui.urlInput.focus();
        return;
    }

    // Validasi URL Spotify
    const spotifyRegex = /(open\.spotify\.com|spotify\.link)\/(track|album|playlist|artist)\/[a-zA-Z0-9]+/;
    if (!spotifyRegex.test(url)) {
        showCustomAlert("Please enter a valid Spotify track URL!", "warning");
        ui.urlInput.focus();
        ui.urlInput.select();
        return;
    }

    // Nonaktifkan tombol sementara
    ui.searchBtn.disabled = true;
    ui.searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    showView('loading');
    
    // Mulai update loading text
    const loadingInterval = updateLoadingText();

    try {
        // --- REQUEST KE BACKEND (api/index.js) ---
        const response = await fetch('/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        
        const data = await response.json();

        // Cek jika status dari backend true
        if (response.ok && data.status === true) {
            
            // --- 1. SET GAMBAR (COVER) ---
            if (data.cover) {
                // Optimalkan gambar Spotify
                let coverUrl = data.cover;
                
                // Ganti ukuran gambar menjadi lebih besar untuk kualitas baik
                if (coverUrl.includes('?size=')) {
                    coverUrl = coverUrl.replace(/\?size=\d+/, '?size=640');
                } else if (coverUrl.includes('?')) {
                    coverUrl += '&size=640';
                } else {
                    coverUrl += '?size=640';
                }
                
                // Tambahkan efek loading pada gambar
                ui.img.classList.add('loading');
                
                try {
                    await preloadImage(coverUrl);
                    ui.img.src = coverUrl;
                    ui.img.style.display = 'block';
                    ui.img.alt = `Cover: ${data.title || 'Track'}`;
                    
                    // Hapus class loading setelah gambar dimuat
                    ui.img.onload = () => {
                        ui.img.classList.remove('loading');
                    };
                    
                } catch (error) {
                    console.warn('Failed to load cover image:', error);
                    ui.img.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=640&h=640&fit=crop&crop=face';
                    ui.img.alt = 'Default music cover';
                }
                
            } else {
                ui.img.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=640&h=640&fit=crop&crop=face';
                ui.img.style.display = 'block';
                ui.img.alt = 'Default music cover';
            }

            // --- 2. SET JUDUL DAN ARTIS ---
            ui.title.innerText = data.title || "Unknown Title";
            ui.artist.innerText = data.artist || "Unknown Artist";
            
            // --- 3. SET METADATA ---
            if (data.duration) {
                ui.duration.innerHTML = `<i class="fas fa-clock"></i> ${formatDuration(data.duration)}`;
            }
            
            if (data.size) {
                ui.size.innerHTML = `<i class="fas fa-hdd"></i> ${formatFileSize(data.size)}`;
            }
            
            // --- 4. SIAPKAN LINK DOWNLOAD ---
            currentDownloadUrl = data.download_url;
            
            // Buat nama file yang lebih rapi
            const safeTitle = sanitizeFilename(data.title || "audio");
            const safeArtist = sanitizeFilename(data.artist || "Unknown Artist");
            currentFileName = `${safeArtist} - ${safeTitle}.mp3`;

            // Tampilkan hasil dengan sedikit delay untuk animasi
            setTimeout(() => {
                showView('result');
                showCustomAlert("Track ready for download!", "success");
            }, 500);

        } else {
            throw new Error(data.message || data.error || "Failed to process track");
        }
    } catch (error) {
        console.error("Error fetching track:", error);
        showCustomAlert(`Failed to process track: ${error.message}`, "error");
        showView('input');
    } finally {
        // Hentikan interval loading
        clearInterval(loadingInterval);
        
        // Reset tombol
        ui.searchBtn.disabled = false;
        ui.searchBtn.innerHTML = '<i class="fas fa-bolt"></i> Download Music';
    }
});

// 2. EVENT: KLIK TOMBOL DOWNLOAD FINAL (Direct Download)
ui.finalDownloadBtn.addEventListener('click', (e) => {
    e.preventDefault(); 

    if (!currentDownloadUrl) {
        showCustomAlert("Download link is not ready yet.", "warning");
        return;
    }

    // Tampilkan loading pada tombol download
    const originalText = ui.finalDownloadBtn.innerHTML;
    ui.finalDownloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
    ui.finalDownloadBtn.disabled = true;

    // Trik download otomatis
    const link = document.createElement('a');
    link.href = currentDownloadUrl;
    link.setAttribute('download', currentFileName);
    link.target = "_blank"; // Buka di tab baru agar tidak mengganggu UI
    link.style.display = 'none';

    // Event saat download selesai/error
    link.onclick = () => {
        setTimeout(() => {
            ui.finalDownloadBtn.innerHTML = originalText;
            ui.finalDownloadBtn.disabled = false;
            showCustomAlert("Download started!", "success");
        }, 1000);
    };

    document.body.appendChild(link);
    link.click();
    
    // Hapus elemen link setelah diklik
    setTimeout(() => {
        if (link.parentNode) {
            document.body.removeChild(link);
        }
    }, 2000);
});

// Fitur Reset
ui.resetBtn.addEventListener('click', () => {
    ui.urlInput.value = '';
    ui.img.src = '';
    ui.img.classList.remove('loading');
    showView('input');
});

// Support tombol Enter
ui.urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        ui.searchBtn.click();
    }
});

// Auto-paste dari clipboard
ui.urlInput.addEventListener('paste', (e) => {
    setTimeout(() => {
        if (ui.urlInput.value.trim()) {
            showCustomAlert("URL pasted! Click Download to continue.", "success");
        }
    }, 100);
});

// Init
showView('input');
// DOM Elements
const darkModeToggle = document.getElementById('darkModeToggle');
const mobileDarkModeToggle = document.getElementById('mobileDarkModeToggle');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const closeMobileMenu = document.getElementById('closeMobileMenu');
const pasteBtn = document.getElementById('pasteBtn');
const downloadBtn = document.getElementById('downloadBtn');
const spotifyUrlInput = document.getElementById('spotifyUrl');
const downloadModal = document.getElementById('downloadModal');
const closeModal = document.getElementById('closeModal');
const cancelDownload = document.getElementById('cancelDownload');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const downloadFileName = document.getElementById('downloadFileName');
const faqQuestions = document.querySelectorAll('.faq-question');

// Dark Mode Functionality
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
    } else {
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        if (mobileDarkModeToggle) mobileDarkModeToggle.checked = false;
    }
}

// Mobile Menu Functionality
function openMobileMenu() {
    mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenuHandler() {
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Paste URL Functionality
async function pasteUrl() {
    try {
        const text = await navigator.clipboard.readText();
        spotifyUrlInput.value = text;
        
        // Show success feedback
        const originalText = pasteBtn.innerHTML;
        pasteBtn.innerHTML = '<i class="fas fa-check"></i> Pasted!';
        pasteBtn.style.backgroundColor = '#2ecc71';
        
        setTimeout(() => {
            pasteBtn.innerHTML = originalText;
            pasteBtn.style.backgroundColor = '';
        }, 1500);
    } catch (err) {
        // Fallback for browsers that don't support clipboard API
        spotifyUrlInput.focus();
        document.execCommand('paste');
        
        // Show feedback anyway
        const originalText = pasteBtn.innerHTML;
        pasteBtn.innerHTML = '<i class="fas fa-check"></i> Pasted!';
        pasteBtn.style.backgroundColor = '#2ecc71';
        
        setTimeout(() => {
            pasteBtn.innerHTML = originalText;
            pasteBtn.style.backgroundColor = '';
        }, 1500);
    }
}

// Download Simulation
function simulateDownload() {
    const url = spotifyUrlInput.value.trim();
    
    if (!url) {
        // Show error if input is empty
        spotifyUrlInput.style.borderColor = '#e74c3c';
        spotifyUrlInput.placeholder = 'Please enter a Spotify URL or search term';
        setTimeout(() => {
            spotifyUrlInput.style.borderColor = '';
            spotifyUrlInput.placeholder = 'Paste Spotify URL or search song, artist, album...';
        }, 3000);
        return;
    }
    
    // Show download modal
    downloadModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Set download file name based on input
    let fileName = 'spotify_track';
    if (url.includes('spotify.com')) {
        if (url.includes('track')) fileName = 'spotify_track';
        else if (url.includes('playlist')) fileName = 'spotify_playlist';
        else if (url.includes('album')) fileName = 'spotify_album';
        else if (url.includes('artist')) fileName = 'artist_songs';
    } else {
        fileName = 'searched_song';
    }
    
    downloadFileName.textContent = `Downloading: ${fileName}.mp3`;
    
    // Simulate download progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10 + 5;
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
                
                // Show download success message
                showNotification('Download completed successfully!', 'success');
            }, 1000);
        }
    }, 200);
    
    // Store interval for cancellation
    window.downloadInterval = interval;
}

function cancelDownloadHandler() {
    if (window.downloadInterval) {
        clearInterval(window.downloadInterval);
        window.downloadInterval = null;
    }
    
    downloadModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Reset progress
    setTimeout(() => {
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
    }, 300);
    
    showNotification('Download cancelled', 'info');
}

// FAQ Accordion Functionality
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

// Notification Function
function showNotification(message, type = 'info') {
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
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // Add styles for notification
    const style = document.createElement('style');
    style.textContent = `
        .notification {
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
        }
        
        .notification-info {
            background-color: #d1ecf1;
            color: #0c5460;
            border-left: 4px solid #0c5460;
        }
        
        .notification-success {
            background-color: #d4edda;
            color: #155724;
            border-left: 4px solid #155724;
        }
        
        .notification-error {
            background-color: #f8d7da;
            color: #721c24;
            border-left: 4px solid #721c24;
        }
        
        .dark-mode .notification-info {
            background-color: #0c5460;
            color: #d1ecf1;
        }
        
        .dark-mode .notification-success {
            background-color: #155724;
            color: #d4edda;
        }
        
        .dark-mode .notification-error {
            background-color: #721c24;
            color: #f8d7da;
        }
        
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
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Remove notification after 4 seconds
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
    }, 4000);
}

// Form Submission Handler
function handleFormSubmit(e) {
    e.preventDefault();
    simulateDownload();
    return false;
}

// Input validation for Spotify URLs
function validateSpotifyInput() {
    const url = spotifyUrlInput.value.trim();
    
    if (url && (url.includes('spotify.com') || url.length > 3)) {
        downloadBtn.disabled = false;
        downloadBtn.style.opacity = '1';
        downloadBtn.style.cursor = 'pointer';
    } else {
        downloadBtn.disabled = true;
        downloadBtn.style.opacity = '0.7';
        downloadBtn.style.cursor = 'not-allowed';
    }
}

// Smooth scrolling for anchor links
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

// Initialize all functionality
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
    
    pasteBtn.addEventListener('click', pasteUrl);
    downloadBtn.addEventListener('click', simulateDownload);
    
    // Handle form submission on Enter key
    spotifyUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            simulateDownload();
        }
    });
    
    // Validate input in real-time
    spotifyUrlInput.addEventListener('input', validateSpotifyInput);
    
    // Initialize download button state
    validateSpotifyInput();
    
    closeModal.addEventListener('click', cancelDownloadHandler);
    cancelDownload.addEventListener('click', cancelDownloadHandler);
    
    // Close modal when clicking outside
    downloadModal.addEventListener('click', function(e) {
        if (e.target === this) {
            cancelDownloadHandler();
        }
    });
    
    // Initialize FAQ accordion
    initFAQAccordion();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('Welcome to Spotdown! Paste a Spotify URL to start downloading.', 'info');
    }, 1000);
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
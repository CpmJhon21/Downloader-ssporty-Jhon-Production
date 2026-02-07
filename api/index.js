// =============================================
// SPOTIFY DOWNLOADER BACKEND API
// =============================================

const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const cors = require('cors');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting middleware
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Spotify URL validation regex patterns
const SPOTIFY_PATTERNS = {
    TRACK: /^(https?:\/\/)?(open\.spotify\.com\/track\/[a-zA-Z0-9]{22})(\?.*)?$/,
    ALBUM: /^(https?:\/\/)?(open\.spotify\.com\/album\/[a-zA-Z0-9]{22})(\?.*)?$/,
    PLAYLIST: /^(https?:\/\/)?(open\.spotify\.com\/playlist\/[a-zA-Z0-9]{22})(\?.*)?$/,
    ARTIST: /^(https?:\/\/)?(open\.spotify\.com\/artist\/[a-zA-Z0-9]{22})(\?.*)?$/,
    LINK: /^(https?:\/\/)?(spotify\.link\/[a-zA-Z0-9]+)$/
};

// Validate Spotify URL
function isValidSpotifyUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    return Object.values(SPOTIFY_PATTERNS).some(pattern => 
        pattern.test(url.trim())
    );
}

// Extract Spotify ID from URL
function extractSpotifyId(url) {
    const match = url.match(/\/(track|album|playlist|artist)\/([a-zA-Z0-9]{22})/);
    return match ? match[2] : null;
}

// Format duration from seconds to MM:SS
function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Estimate file size based on duration
function estimateFileSize(durationSeconds) {
    const bitrate = 320; // kbps
    const sizeMB = (bitrate * durationSeconds) / (8 * 1024);
    return sizeMB < 1 ? '< 1 MB' : `${sizeMB.toFixed(1)} MB`;
}

// Main Spotify download function
async function spotifyDownloader(url) {
    try {
        // Validate URL
        if (!isValidSpotifyUrl(url)) {
            throw new Error('Invalid Spotify URL. Please provide a valid track, album, playlist, or artist URL.');
        }

        console.log(`Processing Spotify URL: ${url}`);

        // Step 1: Fetch initial page to get CSRF token
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        };

        const initialResponse = await axios.get('https://spotmate.online/', {
            headers,
            timeout: 10000
        });

        if (initialResponse.status !== 200) {
            throw new Error(`Failed to fetch initial page: HTTP ${initialResponse.status}`);
        }

        const $ = cheerio.load(initialResponse.data);
        const csrfToken = $('meta[name="csrf-token"]').attr('content');

        if (!csrfToken) {
            throw new Error('Could not retrieve CSRF token from the service.');
        }

        // Step 2: Create API client with cookies and CSRF token
        const cookies = initialResponse.headers['set-cookie'] || [];
        const cookieString = cookies.map(cookie => cookie.split(';')[0]).join('; ');

        const apiClient = axios.create({
            baseURL: 'https://spotmate.online',
            headers: {
                'Cookie': cookieString,
                'Content-Type': 'application/json',
                'User-Agent': headers['User-Agent'],
                'X-CSRF-Token': csrfToken,
                'Accept': 'application/json',
                'Referer': 'https://spotmate.online/',
                'Origin': 'https://spotmate.online'
            },
            timeout: 30000
        });

        // Step 3: Fetch track metadata and download URL in parallel
        const [metadataResponse, downloadResponse] = await Promise.allSettled([
            apiClient.post('/getTrackData', { spotify_url: url }),
            apiClient.post('/convert', { urls: url })
        ]);

        // Handle metadata response
        let metadata = {};
        if (metadataResponse.status === 'fulfilled' && metadataResponse.value.data) {
            metadata = metadataResponse.value.data;
        } else {
            console.warn('Failed to fetch metadata:', metadataResponse.reason?.message);
        }

        // Handle download response
        let downloadUrl = '';
        if (downloadResponse.status === 'fulfilled' && downloadResponse.value.data?.url) {
            downloadUrl = downloadResponse.value.data.url;
        } else {
            throw new Error('Failed to get download URL. The service might be temporarily unavailable.');
        }

        if (!downloadUrl) {
            throw new Error('Download URL not found in response.');
        }

        // Step 4: Construct response data
        const spotifyId = extractSpotifyId(url);
        const durationSeconds = metadata.duration || 180; // Default 3 minutes if unknown
        const fileSize = estimateFileSize(durationSeconds);

        const result = {
            status: true,
            title: metadata.title || 'Unknown Track',
            artist: metadata.artist || 'Unknown Artist',
            album: metadata.album || 'Unknown Album',
            cover: metadata.cover || `https://via.placeholder.com/300/1DB954/FFFFFF?text=Spotify+Track`,
            duration: formatDuration(durationSeconds),
            duration_seconds: durationSeconds,
            size: fileSize,
            download_url: downloadUrl,
            spotify_id: spotifyId,
            type: url.includes('/track/') ? 'track' : 
                  url.includes('/album/') ? 'album' : 
                  url.includes('/playlist/') ? 'playlist' : 'artist',
            timestamp: new Date().toISOString()
        };

        console.log(`Successfully processed: ${result.title} - ${result.artist}`);
        return result;

    } catch (error) {
        console.error('Spotify downloader error:', error.message);
        
        // Enhanced error messages
        let errorMessage = error.message;
        
        if (error.code === 'ECONNABORTED') {
            errorMessage = 'Request timeout. Please try again.';
        } else if (error.response) {
            if (error.response.status === 404) {
                errorMessage = 'The track or service was not found.';
            } else if (error.response.status === 429) {
                errorMessage = 'Too many requests. Please wait a moment.';
            } else if (error.response.status >= 500) {
                errorMessage = 'Service temporarily unavailable. Please try again later.';
            }
        } else if (error.request) {
            errorMessage = 'Network error. Please check your internet connection.';
        }

        return {
            status: false,
            error: errorMessage,
            code: error.code || 'UNKNOWN_ERROR'
        };
    }
}

// API Routes

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Spotify Downloader API',
        version: '1.0.0'
    });
});

// Main download endpoint
app.post('/api', async (req, res) => {
    try {
        const { url } = req.body;

        // Validate request
        if (!url) {
            return res.status(400).json({
                status: false,
                error: 'URL parameter is required.'
            });
        }

        // Validate Spotify URL
        if (!isValidSpotifyUrl(url)) {
            return res.status(400).json({
                status: false,
                error: 'Invalid Spotify URL. Please provide a valid track, album, playlist, or artist URL.'
            });
        }

        // Process the URL
        const result = await spotifyDownloader(url);

        if (!result.status) {
            return res.status(500).json(result);
        }

        // Successful response
        res.json(result);

    } catch (error) {
        console.error('API endpoint error:', error);
        res.status(500).json({
            status: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Batch download endpoint (for multiple tracks)
app.post('/api/batch', async (req, res) => {
    try {
        const { urls } = req.body;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({
                status: false,
                error: 'URLs array is required and must not be empty.'
            });
        }

        if (urls.length > 10) {
            return res.status(400).json({
                status: false,
                error: 'Maximum 10 URLs allowed per batch request.'
            });
        }

        // Process URLs in parallel with limit
        const results = await Promise.allSettled(
            urls.map(url => spotifyDownloader(url))
        );

        const formattedResults = results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                return {
                    status: false,
                    error: result.reason?.message || 'Failed to process URL',
                    url: urls[index]
                };
            }
        });

        res.json({
            status: true,
            results: formattedResults,
            total: urls.length,
            successful: formattedResults.filter(r => r.status).length
        });

    } catch (error) {
        console.error('Batch endpoint error:', error);
        res.status(500).json({
            status: false,
            error: 'Internal server error'
        });
    }
});

// Serve static files (for frontend)
app.use(express.static('public'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        status: false,
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: false,
        error: 'Endpoint not found'
    });
});

// Server configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Start server
const server = app.listen(PORT, HOST, () => {
    console.log(`
╔══════════════════════════════════════════╗
║   Spotify Downloader API                ║
║   Server is running!                    ║
║                                          ║
║   Local: http://localhost:${PORT}           ║
║   Network: http://${HOST}:${PORT}          ║
║                                          ║
║   Health: http://localhost:${PORT}/health  ║
║   API: http://localhost:${PORT}/api       ║
╚══════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export for testing
module.exports = {
    app,
    spotifyDownloader,
    isValidSpotifyUrl,
    formatDuration,
    estimateFileSize
};
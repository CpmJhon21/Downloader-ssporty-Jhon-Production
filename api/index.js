// api/index.js - Spotify Downloader Backend API
const axios = require('axios');
const cheerio = require('cheerio');

// Fungsi utama untuk mendapatkan data dari Spotify
async function spotifydl(url) {
    try {
        console.log('Processing Spotify URL:', url);
        
        // Validasi URL
        if (!url || typeof url !== 'string') {
            throw new Error('URL is required');
        }
        
        // Pastikan ini URL Spotify
        if (!url.includes('spotify.com') && !url.startsWith('spotify:')) {
            throw new Error('Invalid Spotify URL. Please provide a valid Spotify link.');
        }
        
        // Bersihkan URL
        let cleanUrl = url.trim();
        
        // Konversi URI spotify: ke URL web
        if (cleanUrl.startsWith('spotify:')) {
            const uriParts = cleanUrl.split(':');
            if (uriParts.length >= 3) {
                cleanUrl = `https://open.spotify.com/${uriParts[1]}/${uriParts[2]}`;
            }
        }
        
        // Hapus parameter query
        cleanUrl = cleanUrl.split('?')[0];
        
        console.log('Cleaned URL:', cleanUrl);
        
        // Langkah 1: Dapatkan session dan CSRF token dari spotmate.online
        console.log('Fetching initial session...');
        const sessionResponse = await axios.get('https://spotmate.online/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0'
            },
            timeout: 15000
        });
        
        // Parse CSRF token dari HTML
        const $ = cheerio.load(sessionResponse.data);
        const csrfToken = $('meta[name="csrf-token"]').attr('content');
        
        if (!csrfToken) {
            throw new Error('Could not retrieve CSRF token from service');
        }
        
        console.log('CSRF Token found');
        
        // Dapatkan cookies dari response
        const cookies = sessionResponse.headers['set-cookie'];
        const cookieString = cookies ? cookies.join('; ') : '';
        
        // Setup API client
        const apiClient = axios.create({
            baseURL: 'https://spotmate.online',
            headers: {
                'Cookie': cookieString,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'X-CSRF-Token': csrfToken,
                'Accept': 'application/json',
                'Referer': 'https://spotmate.online/',
                'Origin': 'https://spotmate.online',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin'
            },
            timeout: 20000
        });
        
        // Langkah 2: Dapatkan metadata track
        console.log('Fetching track metadata...');
        const metadataResponse = await apiClient.post('/getTrackData', {
            spotify_url: cleanUrl
        });
        
        const metadata = metadataResponse.data;
        
        if (!metadata || !metadata.title) {
            throw new Error('Could not retrieve track information');
        }
        
        console.log('Metadata received:', {
            title: metadata.title,
            artist: metadata.artist,
            duration: metadata.duration
        });
        
        // Langkah 3: Dapatkan URL download
        console.log('Fetching download URL...');
        const downloadResponse = await apiClient.post('/convert', {
            urls: cleanUrl
        });
        
        const downloadData = downloadResponse.data;
        
        if (!downloadData || !downloadData.url) {
            throw new Error('Could not retrieve download URL');
        }
        
        console.log('Download URL received');
        
        // Format response yang lengkap
        const result = {
            status: true,
            title: metadata.title || 'Unknown Track',
            artist: metadata.artist || 'Unknown Artist',
            cover: metadata.cover || metadata.image || '',
            duration: metadata.duration || 0,
            quality: '320kbps',
            size: metadata.size || 5000000, // Default ~5MB
            download_url: downloadData.url,
            source_url: cleanUrl
        };
        
        // Pastikan URL cover lengkap
        if (result.cover && !result.cover.startsWith('http')) {
            result.cover = 'https:' + result.cover;
        }
        
        return result;
        
    } catch (error) {
        console.error('Error in spotifydl function:', error.message);
        
        // Log lebih detail untuk debugging
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        }
        
        // Fallback ke API alternatif jika spotmate.online gagal
        console.log('Trying alternative method...');
        
        try {
            // Alternatif 1: spotify-downloader-api (contoh)
            const altResponse = await axios.get(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://spotify-downloader-api.vercel.app/api/download?url=${url}`)}`, {
                timeout: 10000
            });
            
            const altData = JSON.parse(altResponse.data.contents);
            
            if (altData && altData.downloadUrl) {
                return {
                    status: true,
                    title: altData.title || 'Track',
                    artist: altData.artist || 'Artist',
                    cover: altData.cover || '',
                    duration: altData.duration || 0,
                    quality: '320kbps',
                    size: altData.size || 5000000,
                    download_url: altData.downloadUrl,
                    source_url: url
                };
            }
        } catch (altError) {
            console.error('Alternative method also failed:', altError.message);
        }
        
        // Return error yang informatif
        let errorMessage = error.message;
        
        if (error.message.includes('timeout')) {
            errorMessage = 'Service timeout. Please try again later.';
        } else if (error.message.includes('Network Error')) {
            errorMessage = 'Network error. Please check your connection.';
        } else if (error.message.includes('CSRF')) {
            errorMessage = 'Service authentication failed. Please refresh and try again.';
        }
        
        return {
            status: false,
            message: errorMessage,
            error: error.message
        };
    }
}

// Vercel Serverless Handler
module.exports = async (req, res) => {
    console.log('API Request received:', req.method, req.url);
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    
    // Handle OPTIONS request untuk CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Hanya terima POST request
    if (req.method !== 'POST') {
        return res.status(405).json({
            status: false,
            error: 'Method Not Allowed. Please use POST method.'
        });
    }
    
    // Validasi content type
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
        return res.status(400).json({
            status: false,
            error: 'Content-Type must be application/json'
        });
    }
    
    try {
        // Parse request body
        const body = req.body;
        
        if (!body || !body.url) {
            return res.status(400).json({
                status: false,
                error: 'URL parameter is required in the request body'
            });
        }
        
        const { url } = body;
        
        // Validasi URL
        if (typeof url !== 'string' || url.trim().length === 0) {
            return res.status(400).json({
                status: false,
                error: 'URL must be a non-empty string'
            });
        }
        
        // Validasi ini URL Spotify
        if (!url.includes('spotify.com') && !url.startsWith('spotify:')) {
            return res.status(400).json({
                status: false,
                error: 'Please provide a valid Spotify URL (spotify.com or spotify: URI)'
            });
        }
        
        console.log('Processing URL:', url);
        
        // Panggil fungsi utama
        const result = await spotifydl(url);
        
        // Jika fungsi mengembalikan status false
        if (!result.status) {
            return res.status(500).json({
                status: false,
                error: result.message || 'Failed to process the Spotify URL',
                details: result.error
            });
        }
        
        // Validasi response
        if (!result.download_url) {
            return res.status(500).json({
                status: false,
                error: 'Download URL not available. The track might be restricted or unavailable.'
            });
        }
        
        // Response sukses
        console.log('Successfully processed track:', result.title);
        
        return res.status(200).json(result);
        
    } catch (error) {
        console.error('Server error:', error);
        
        return res.status(500).json({
            status: false,
            error: 'Internal server error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
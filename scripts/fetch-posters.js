const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

// Load environment variables
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const MOVIES_JSON_PATH = path.join(process.cwd(), 'data', 'movies.json');
const POSTERS_DIR = path.join(process.cwd(), 'public', 'posters');

// --- Configuration ---
const OMDB_API_KEY = process.env.OMDB_API_KEY; // Add this to your .env.local
const CONCURRENCY_LIMIT = 5; // How many requests at once
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

// --- Helpers ---

const downloadImage = async (url, filepath) => {
    try {
        const res = await fetch(url, { headers: HEADERS });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const fileStream = fs.createWriteStream(filepath);
        await finished(Readable.fromWeb(res.body).pipe(fileStream));
        return true;
    } catch (error) {
        // console.error(`Download failed: ${error.message}`);
        return false;
    }
};

const fetchFromOMDb = async (imdbID) => {
    if (!OMDB_API_KEY) return null;
    try {
        const url = `http://www.omdbapi.com/?i=${imdbID}&apikey=${OMDB_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.Poster && data.Poster.startsWith('http')) {
            return data.Poster;
        }
    } catch (e) {
        console.error(`OMDb Error for ${imdbID}:`, e.message);
    }
    return null;
};

const fetchFromIMDbScrape = async (imdbID) => {
    try {
        const url = `https://www.imdb.com/title/${imdbID}/`;
        const res = await fetch(url, { headers: HEADERS });
        if (!res.ok) return null;
        const html = await res.text();
        
        // Look for og:image
        const match = html.match(/<meta property="og:image" content="(.*?)"/);
        if (match && match[1]) {
            // IMDb sometimes serves a generic 'nopicture' image. Filter it if needed.
            if (match[1].includes('nopicture')) return null;
            return match[1];
        }
    } catch (e) {
        console.error(`IMDb Scrape Error for ${imdbID}:`, e.message);
    }
    return null;
};

const processMovie = async (movie) => {
    if (!movie.id || !movie.id.startsWith('tt')) return; // Skip invalid IMDb IDs

    const filename = `${movie.id}.jpg`;
    const filepath = path.join(POSTERS_DIR, filename);

    // 1. Check if it already exists
    try {
        await fsPromises.access(filepath);
        // console.log(`Skipping ${movie.title} (already exists)`);
        return; 
    } catch {
        // Does not exist, proceed
    }

    console.log(`Fetching poster for: ${movie.title} (${movie.id})...`);

    let posterUrl = null;

    // 2. Try OMDb
    posterUrl = await fetchFromOMDb(movie.id);

    // 3. Try IMDb Scrape if OMDb failed
    if (!posterUrl) {
        posterUrl = await fetchFromIMDbScrape(movie.id);
    }

    // 4. Download if URL found
    if (posterUrl) {
        const success = await downloadImage(posterUrl, filepath);
        if (success) {
            console.log(`✅ Saved poster for ${movie.title}`);
        } else {
            console.log(`❌ Failed to download poster for ${movie.title}`);
        }
    } else {
        console.log(`⚠️  No poster found for ${movie.title}`);
    }
};

const main = async () => {
    if (!fs.existsSync(MOVIES_JSON_PATH)) {
        console.error("data/movies.json not found. Run 'npm run build' first.");
        return;
    }

    // Ensure directory
    await fsPromises.mkdir(POSTERS_DIR, { recursive: true });

    const content = await fsPromises.readFile(MOVIES_JSON_PATH, 'utf-8');
    const movies = JSON.parse(content);

    console.log(`Checking ${movies.length} movies...`);
    if (!OMDB_API_KEY) {
        console.log("ℹ️  OMDB_API_KEY not found in .env.local. Falling back to IMDb scraping (slower/less reliable).");
    }

    // Process in batches
    for (let i = 0; i < movies.length; i += CONCURRENCY_LIMIT) {
        const batch = movies.slice(i, i + CONCURRENCY_LIMIT);
        await Promise.all(batch.map(processMovie));
    }

    console.log("Done.");
};

main();

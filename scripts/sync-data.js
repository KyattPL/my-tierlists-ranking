const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

// Load environment variables from .env.local
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const POSTERS_DIR = path.join(process.cwd(), 'public', 'posters');
const DATA_DIR = path.join(process.cwd(), 'data');

const downloadImage = async (url, filepath) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    const fileStream = fs.createWriteStream(filepath);
    await finished(Readable.fromWeb(res.body).pipe(fileStream));
    return true;
  } catch (error) {
    console.error(`Failed to download image from ${url}:`, error.message);
    return false;
  }
};

const syncMovieData = async () => {
  console.log('Syncing movie data...');

  const vaultPath = process.env.OBSIDIAN_VAULT_PATH;
  if (!vaultPath) {
    console.error('ERROR: OBSIDIAN_VAULT_PATH is not defined in your .env.local file.');
    // Create empty JSON to prevent build fail
    await fsPromises.mkdir(DATA_DIR, { recursive: true });
    await fsPromises.writeFile(path.join(DATA_DIR, 'movies.json'), '[]');
    return;
  }

  const sourceFile = path.join(vaultPath, 'movies-series-db.csv');
  
  if (!fs.existsSync(sourceFile)) {
      console.error(`Source file not found: ${sourceFile}`);
      await fsPromises.mkdir(DATA_DIR, { recursive: true });
      await fsPromises.writeFile(path.join(DATA_DIR, 'movies.json'), '[]');
      return;
  }

  // Ensure directories exist
  await fsPromises.mkdir(DATA_DIR, { recursive: true });
  await fsPromises.mkdir(POSTERS_DIR, { recursive: true });

  const movies = [];

  // Read and parse CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(sourceFile)
      .pipe(csv())
      .on('data', (data) => movies.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Processing ${movies.length} movies...`);

  const processedMovies = await Promise.all(movies.map(async (movie) => {
    // Map CSV headers to our internal keys if needed, or just normalize
    // The current app does mapping in page.tsx. Let's do it here to clean up page.tsx
    // Mapping based on app/collection/movies/page.tsx logic
    
    // Helper to get case-insensitive prop
    const getVal = (obj, key) => {
        const k = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
        return k ? obj[k] : null;
    };

    const id = getVal(movie, 'imdbID') || getVal(movie, 'id') || `generated-${Math.random()}`;
    const posterUrl = getVal(movie, 'Poster');
    
    let localPosterPath = posterUrl;

    if (posterUrl && posterUrl.startsWith('http') && id) {
        const ext = path.extname(new URL(posterUrl).pathname) || '.jpg';
        const filename = `${id}${ext}`;
        const localFilepath = path.join(POSTERS_DIR, filename);
        const publicPath = `/posters/${filename}`;

        // Check if file exists
        try {
            await fsPromises.access(localFilepath);
            // File exists, use it
            localPosterPath = publicPath;
        } catch {
            // File doesn't exist, download
            // console.log(`Downloading poster for ${getVal(movie, 'Title')}...`);
            const success = await downloadImage(posterUrl, localFilepath);
            if (success) {
                localPosterPath = publicPath;
            }
        }
    }

    // Return normalized object
    return {
        id: id,
        title: getVal(movie, 'Title') || 'No Title',
        year: parseFloat(getVal(movie, 'Year')) || 0,
        genre: getVal(movie, 'Genre') || '',
        director: getVal(movie, 'Director') || '',
        actors: getVal(movie, 'Actors') || '',
        imdbRating: parseFloat(getVal(movie, 'imdbRating')) || 0,
        runtime: getVal(movie, 'Runtime') || '',
        poster: localPosterPath,
        totalSeasons: parseFloat(getVal(movie, 'totalSeasons')) || 0,
        country: getVal(movie, 'Country') || '',
        rating: parseFloat(getVal(movie, 'Rating')) || 0,
        status: (getVal(movie, 'Status') || 'undefined').toLowerCase(),
        myComment: getVal(movie, 'MyComment') || '',
        remember: (getVal(movie, 'Remember') || '').toLowerCase() === 'true',
    };
  }));

  // Write JSON
  await fsPromises.writeFile(path.join(DATA_DIR, 'movies.json'), JSON.stringify(processedMovies, null, 2));
  
  // Write timestamp
  const timestamp = new Date().toISOString();
  await fsPromises.writeFile(path.join(DATA_DIR, 'last-sync.txt'), timestamp, 'utf-8');

  console.log(`Successfully processed and saved ${processedMovies.length} movies to data/movies.json`);
};

syncMovieData();
// This script copies the movie collection JSON from your Obsidian vault
// into the project's /data directory. It's run at build time.

const fs = require('fs/promises');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const syncMovieData = async () => {
  console.log('Syncing movie data...');

  const vaultPath = process.env.OBSIDIAN_VAULT_PATH;
  if (!vaultPath) {
    console.error('ERROR: OBSIDIAN_VAULT_PATH is not defined in your .env.local file.');
    console.error('Skipping movie data sync. The collection page will not be built.');
    // Create an empty file to prevent the build from crashing if the page expects it
    const destDir = path.join(process.cwd(), 'data');
    await fs.mkdir(destDir, { recursive: true });
    await fs.writeFile(path.join(destDir, 'movies.json'), '[]');
    return;
  }

  // IMPORTANT: Change 'movies.json' if your file has a different name
  const sourceFile = path.join(vaultPath, 'movies-series-db.csv');
  const destFile = path.join(process.cwd(), 'data', 'movies.csv');
  const destDir = path.dirname(destFile);

  try {
    // Ensure the /data directory exists
    await fs.mkdir(destDir, { recursive: true });
    // Copy the file
    await fs.copyFile(sourceFile, destFile);
    console.log(`Successfully copied movie data from ${sourceFile} to ${destFile}`);
  } catch (error) {
    console.error(`Error syncing movie data: ${error.message}`);
    console.error('Please ensure the path is correct and the file exists.');
    // Write an empty array to the destination to allow the build to succeed
    await fs.writeFile(destFile, '[]');
    // We don't exit with 1, to allow builds to succeed even without the file.
    // The page will just show "No movies found".
  }
};

syncMovieData();
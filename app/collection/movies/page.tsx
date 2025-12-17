import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import MovieCollectionClient from './MovieCollectionClient';
import CollectionHeader from './CollectionHeader';

// Define the type for a single movie object
export type ItemStatus = "undefined" | "undecided" | "in-progress";

export interface CollectionItem {
  id: string; // Mapped from imdbID
  title: string;
  year: number;
  genre: string;
  director: string;
  actors: string;
  imdbRating: number;
  runtime: string;
  poster: string; // URL to the poster image
  totalSeasons: number; // Optional for TV series
  country: string;
  rating: number; // Your personal rating
  status: ItemStatus;
  myComment: string;
  remember: boolean;
}

// This is a Server Component. It runs on the server at build time.
// Its job is to fetch data and pass it to the Client Component.
async function getMovieData(): Promise<CollectionItem[]> {
  const filePath = path.join(process.cwd(), 'data', 'movies.csv');
  const results: CollectionItem[] = [];

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      console.error("movies.csv not found. Returning empty array.");
      return resolve([]);
    }

    fs.createReadStream(filePath)
      .pipe(csv({
        // This maps your exact CSV headers to our CollectionItem keys.
        mapHeaders: ({ header }) => {
          const headerMap: { [key: string]: keyof CollectionItem | null } = {
            'title': 'title',
            'year': 'year',
            'genre': 'genre',
            'director': 'director',
            'actors': 'actors',
            'imdbrating': 'imdbRating',
            'imdbid': 'id', // Map imdbID to our unique id
            'runtime': 'runtime',
            'poster': 'poster',
            'totalseasons': 'totalSeasons',
            'country': 'country',
            'rating': 'rating',
            'status': 'status',
            'mycomment': 'myComment',
            'remember': 'remember',
          };
          return headerMap[header.trim().toLowerCase()] || null;
        },
        // This converts string values from the CSV to their correct types.
        mapValues: ({ header, value }) => {
          const lowerHeader = header.toLowerCase();
          // Convert to Number
          if (['year', 'imdbrating', 'totalseasons', 'rating'].includes(lowerHeader)) {
            const num = parseFloat(value);
            return isNaN(num) ? 0 : num;
          }
          // Convert to Boolean
          if (lowerHeader === 'remember') {
            return value.toLowerCase() === 'true';
          }
          // Ensure status is one of the allowed types
          if (lowerHeader === 'status') {
            const lowerValue = value.toLowerCase();
            if (["undefined", "undecided", "in-progress"].includes(lowerValue)) {
              return lowerValue as ItemStatus;
            }
            return "undefined"; // Default value if invalid
          }
          return value;
        }
      }))
      .on('data', (data) => {
        // Ensure essential fields have defaults if they are missing from a row
        const completeItem: CollectionItem = {
          id: 'N/A',
          title: 'No Title',
          year: 0,
          rating: 0,
          imdbRating: 0,
          remember: false,
          status: 'undefined',
          ...data,
        };
        results.push(completeItem);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function getLastSyncTime(): Promise<string | null> {
  const timestampPath = path.join(process.cwd(), 'data', 'last-sync.txt');
  
  try {
    if (fs.existsSync(timestampPath)) {
      const timestamp = fs.readFileSync(timestampPath, 'utf-8').trim();
      return timestamp;
    }
  } catch (error) {
    console.error('Error reading last-sync.txt:', error);
  }
  
  return null;
}

export default async function MovieCollectionPage() {
  const movies = await getMovieData();
  const lastSync = await getLastSyncTime();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header (No changes here) */}
      <CollectionHeader lastSync={lastSync} />

      {/* Content Area (No changes here) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
        <MovieCollectionClient initialMovies={movies} />
      </div>
    </div>
  );
}
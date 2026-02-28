import fs from 'fs/promises';
import path from 'path';
import MovieCollectionClient from './MovieCollectionClient';
import CollectionHeader from './CollectionHeader';

export type ItemStatus = "undefined" | "undecided" | "in-progress";

export interface CollectionItem {
  id: string;
  title: string;
  year: number;
  genre: string;
  director: string;
  actors: string;
  imdbRating: number;
  runtime: string;
  poster: string;
  totalSeasons: number;
  country: string;
  rating: number;
  status: ItemStatus;
  myComment: string;
  remember: boolean;
}

async function getMovieData(): Promise<CollectionItem[]> {
  const filePath = path.join(process.cwd(), 'data', 'movies.json');
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return data as CollectionItem[];
  } catch (error) {
    console.error("Error reading movies.json:", error);
    return [];
  }
}

async function getLastSyncTime(): Promise<string | null> {
  const timestampPath = path.join(process.cwd(), 'data', 'last-sync.txt');
  
  try {
    const timestamp = await fs.readFile(timestampPath, 'utf-8');
    return timestamp.trim();
  } catch (error) {
    console.error('Error reading last-sync.txt:', error);
  }
  
  return null;
}

export default async function MovieCollectionPage() {
  const movies = await getMovieData();
  const lastSync = await getLastSyncTime();

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <CollectionHeader lastSync={lastSync} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8">
            <MovieCollectionClient initialMovies={movies} />
        </div>
      </main>
    </div>
  );
}

import type { PhotoWithTags, SearchParams, Collection } from './types';
import { v4 as uuidv4 } from 'uuid';

// Bildeliste Source Types
export type BildelisteSource = 
  | { type: 'collection'; id: number; name: string }
  | { type: 'search'; params: SearchParams; description?: string }
  | { type: 'saved-search'; id: number; name: string }
  | { type: 'import-session'; id: number; name: string }
  | { type: 'manual'; number: number }; // "Liste 1", "Liste 2", etc.

// Main Bildeliste Interface
export interface Bildeliste {
  id: string;                      // UUID v4
  label: string;                   // Display name
  photos: PhotoWithTags[];         // Photo data
  totalCount: number;              // Total available (for pagination)
  source: BildelisteSource;
  modified: boolean;               // Changed since load?
  createdAt: Date;
  lastAccessedAt: Date;
}

// Serialized format for LocalStorage
export interface SerializedBildeliste {
  id: string;
  label: string;
  photos: PhotoWithTags[];
  totalCount: number;
  source: BildelisteSource;
  modified: boolean;
  createdAt: string;               // ISO string
  lastAccessedAt: string;          // ISO string
}

// LocalStorage key
const STORAGE_KEY = 'imalink_bildelister';
const MAX_BILDELISTER = 10;

// Utility functions
export function createBildeliste(
  label: string,
  source: BildelisteSource,
  photos: PhotoWithTags[] = [],
  totalCount?: number
): Bildeliste {
  return {
    id: uuidv4(),
    label,
    photos,
    totalCount: totalCount ?? photos.length,
    source,
    modified: false,
    createdAt: new Date(),
    lastAccessedAt: new Date(),
  };
}

export function serializeBildeliste(bildeliste: Bildeliste): SerializedBildeliste {
  return {
    ...bildeliste,
    createdAt: bildeliste.createdAt.toISOString(),
    lastAccessedAt: bildeliste.lastAccessedAt.toISOString(),
  };
}

export function deserializeBildeliste(data: SerializedBildeliste): Bildeliste {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    lastAccessedAt: new Date(data.lastAccessedAt),
  };
}

// LocalStorage operations
export function saveBildelisterToStorage(bildelister: Bildeliste[]): void {
  try {
    const serialized = bildelister.map(serializeBildeliste);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error('Failed to save bildelister to localStorage:', error);
  }
}

export function loadBildelisterFromStorage(): Bildeliste[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const serialized: SerializedBildeliste[] = JSON.parse(data);
    return serialized.map(deserializeBildeliste);
  } catch (error) {
    console.error('Failed to load bildelister from localStorage:', error);
    return [];
  }
}

export function enforceBildelisteLimit(bildelister: Bildeliste[]): Bildeliste[] {
  if (bildelister.length <= MAX_BILDELISTER) {
    return bildelister;
  }
  
  // Sort by lastAccessedAt (oldest first) and remove oldest
  const sorted = [...bildelister].sort(
    (a, b) => a.lastAccessedAt.getTime() - b.lastAccessedAt.getTime()
  );
  
  return sorted.slice(sorted.length - MAX_BILDELISTER);
}

// Generate label for manual bildelister
export function generateManualLabel(existingBildelister: Bildeliste[]): string {
  const manualLists = existingBildelister.filter(b => b.source.type === 'manual');
  const numbers = manualLists.map(b => {
    if (b.source.type === 'manual') return b.source.number;
    return 0;
  });
  
  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `Liste ${nextNumber}`;
}

// Generate label from source
export function getLabelFromSource(source: BildelisteSource): string {
  switch (source.type) {
    case 'collection':
      return source.name;
    case 'saved-search':
      return source.name;
    case 'import-session':
      return source.name;
    case 'search':
      return source.description || `Søkeresultat ${new Date().toLocaleTimeString('nb-NO')}`;
    case 'manual':
      return `Liste ${source.number}`;
  }
}

// Photo operations
export function addPhotosToBildeliste(
  bildeliste: Bildeliste, 
  photos: PhotoWithTags[]
): Bildeliste {
  const existingHashes = new Set(bildeliste.photos.map(p => p.hothash));
  const newPhotos = photos.filter(p => !existingHashes.has(p.hothash));
  
  return {
    ...bildeliste,
    photos: [...bildeliste.photos, ...newPhotos],
    totalCount: bildeliste.totalCount + newPhotos.length,
    modified: true,
    lastAccessedAt: new Date(),
  };
}

export function removePhotosFromBildeliste(
  bildeliste: Bildeliste,
  hothashes: string[]
): Bildeliste {
  const hashSet = new Set(hothashes);
  const newPhotos = bildeliste.photos.filter(p => !hashSet.has(p.hothash));
  
  return {
    ...bildeliste,
    photos: newPhotos,
    totalCount: newPhotos.length,
    modified: true,
    lastAccessedAt: new Date(),
  };
}

export function updateBildelistePhotos(
  bildeliste: Bildeliste,
  photos: PhotoWithTags[]
): Bildeliste {
  return {
    ...bildeliste,
    photos,
    totalCount: photos.length,
    lastAccessedAt: new Date(),
  };
}

export function markBildelisteAccessed(bildeliste: Bildeliste): Bildeliste {
  return {
    ...bildeliste,
    lastAccessedAt: new Date(),
  };
}

export function markBildelisteModified(bildeliste: Bildeliste, modified: boolean = true): Bildeliste {
  return {
    ...bildeliste,
    modified,
    lastAccessedAt: new Date(),
  };
}

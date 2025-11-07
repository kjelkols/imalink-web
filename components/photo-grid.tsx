'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { PhotoWithTags, SearchParams } from '@/lib/types';
import { PhotoCard } from './photo-card';
import { Button } from './ui/button';

interface PhotoGridProps {
  searchParams?: SearchParams;
  onPhotoClick?: (photo: PhotoWithTags) => void;
}

export function PhotoGrid({ searchParams, onPhotoClick }: PhotoGridProps) {
  const [photos, setPhotos] = useState<PhotoWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 30;

  const loadPhotos = async (append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentOffset = append ? offset : 0;
      const response = await apiClient.getPhotos({
        ...searchParams,
        limit,
        offset: currentOffset,
      });

      console.log('Photos response:', response);

      const items = (response.data || []) as PhotoWithTags[];
      const total = response.meta?.total || items.length;

      if (append) {
        setPhotos((prev) => [...prev, ...items]);
      } else {
        setPhotos(items);
      }

      setOffset(currentOffset + items.length);
      setHasMore(currentOffset + items.length < total);
    } catch (err) {
      console.error('Failed to load photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    loadPhotos(false);
  }, [searchParams]);

  const handleLoadMore = () => {
    loadPhotos(true);
  };

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => loadPhotos(false)}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (loading && photos.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-zinc-500">Loading photos...</p>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center text-zinc-500">
          <p className="text-lg">No photos found</p>
          <p className="text-sm mt-2">Try adjusting your search filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {photos.map((photo) => (
          <PhotoCard key={photo.hothash} photo={photo} onClick={onPhotoClick} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            variant="outline"
            size="lg"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}

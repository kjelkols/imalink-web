'use client';

import { useMemo } from 'react';
import { useBildeliste } from '@/lib/bildeliste-context';
import { PhotoCard } from './photo-card';
import type { PhotoWithTags } from '@/lib/types';

interface BildelisteViewerProps {
  bildelisteId: string;
  mode?: 'grid' | 'list';
  onPhotoClick?: (photo: PhotoWithTags) => void;
  className?: string;
}

export function BildelisteViewer({ 
  bildelisteId, 
  mode = 'grid',
  onPhotoClick,
  className = ''
}: BildelisteViewerProps) {
  const { getBildeliste } = useBildeliste();
  const bildeliste = getBildeliste(bildelisteId);

  const gridClass = mode === 'grid'
    ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
    : 'flex flex-col gap-2';

  if (!bildeliste) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Bildeliste ikke funnet</p>
        </div>
      </div>
    );
  }

  if (bildeliste.photos.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Ingen bilder i denne listen</p>
          <p className="text-sm mt-2">Legg til bilder for å komme i gang</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={gridClass}>
        {bildeliste.photos.map((photo) => (
          <PhotoCard 
            key={photo.hothash} 
            photo={photo} 
            onClick={onPhotoClick} 
          />
        ))}
      </div>
    </div>
  );
}

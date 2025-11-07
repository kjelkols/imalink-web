'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Image as ImageIcon } from 'lucide-react';
import type { Collection } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const coverImageUrl = collection.cover_photo_hothash
    ? apiClient.getHotPreviewUrl(collection.cover_photo_hothash)
    : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link href={`/collections/${collection.id}`}>
      <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
        {/* Cover Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={collection.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-2 text-lg font-semibold line-clamp-1">{collection.name}</h3>
          
          {collection.description && (
            <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
              {collection.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              <span>{collection.photo_count} {collection.photo_count === 1 ? 'bilde' : 'bilder'}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(collection.created_at)}</span>
            </div>
          </div>

          {collection.updated_at !== collection.created_at && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                Oppdatert {formatDate(collection.updated_at)}
              </Badge>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

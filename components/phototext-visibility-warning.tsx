'use client';

import { useState, useEffect } from 'react';
import { VisibilityLevel } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface PhotoTextVisibilityWarningProps {
  photoTextId?: string;
  newVisibility: VisibilityLevel;
  content: any; // PhotoTextContent
  className?: string;
}

export function PhotoTextVisibilityWarning({
  photoTextId,
  newVisibility,
  content,
  className,
}: PhotoTextVisibilityWarningProps) {
  const [affectedPhotoCount, setAffectedPhotoCount] = useState(0);
  const [affectedPhotoHashes, setAffectedPhotoHashes] = useState<string[]>([]);

  useEffect(() => {
    // Extract all image hashes from content
    const extractImageHashes = (blocks: any[]): string[] => {
      if (!blocks) return [];
      
      const hashes: string[] = [];
      
      for (const block of blocks) {
        if (block.type === 'image' && block.imageId) {
          hashes.push(block.imageId);
        }
        if (block.type === 'images' && Array.isArray(block.images)) {
          hashes.push(...block.images.map((img: any) => img.imageId).filter(Boolean));
        }
      }
      
      return [...new Set(hashes)]; // Remove duplicates
    };

    const hashes = extractImageHashes(content?.blocks || []);
    setAffectedPhotoHashes(hashes);
    setAffectedPhotoCount(hashes.length);
  }, [content]);

  if (affectedPhotoCount === 0) {
    return null;
  }

  return (
    <Alert className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Visibility Sync</AlertTitle>
      <AlertDescription>
        Changing this document's visibility to <strong>{newVisibility}</strong> will
        also update <strong>{affectedPhotoCount}</strong> photo{affectedPhotoCount !== 1 ? 's' : ''}{' '}
        referenced in this document to match.
        {affectedPhotoCount <= 10 && (
          <div className="mt-2 text-xs space-y-1">
            <div className="font-medium">Affected photos:</div>
            {affectedPhotoHashes.map((hash) => (
              <div key={hash} className="font-mono text-muted-foreground">
                {hash.substring(0, 16)}...
              </div>
            ))}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

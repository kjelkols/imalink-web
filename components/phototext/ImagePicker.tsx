'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useBildeliste } from '@/lib/bildeliste-context';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image as ImageIcon, 
  Check, 
  FolderOpen, 
  Search as SearchIcon,
  X 
} from 'lucide-react';
import type { PhotoWithTags } from '@/lib/types';

interface ImagePickerProps {
  onImageSelect: (hothash: string, photo: PhotoWithTags) => void;
  selectedHash?: string;
  onClose?: () => void;
}

export function ImagePicker({ onImageSelect, selectedHash, onClose }: ImagePickerProps) {
  const { bildelister } = useBildeliste();
  const [selectedBildelisteId, setSelectedBildelisteId] = useState<string | null>(
    bildelister.length > 0 ? bildelister[0].id : null
  );

  const selectedBildeliste = bildelister.find(b => b.id === selectedBildelisteId);

  // Group bildelister by source type
  const collectionLists = bildelister.filter(b => b.source.type === 'collection');
  const searchLists = bildelister.filter(b => b.source.type === 'search');
  const otherLists = bildelister.filter(
    b => b.source.type === 'manual' || b.source.type === 'saved-search' || b.source.type === 'import-session'
  );

  const handlePhotoClick = (photo: PhotoWithTags) => {
    onImageSelect(photo.hothash, photo);
  };

  if (bildelister.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
        <h3 className="text-lg font-semibold mb-2">Ingen bildelister tilgjengelig</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Åpne en samling eller gjør et søk for å velge bilder
        </p>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Lukk
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Velg bilde</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Bildeliste selector */}
      <Tabs 
        value={selectedBildelisteId || undefined} 
        onValueChange={setSelectedBildelisteId}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          {collectionLists.map((bl) => (
            <TabsTrigger key={bl.id} value={bl.id} className="gap-2">
              <FolderOpen className="h-3 w-3" />
              {bl.label}
              <Badge variant="secondary" className="ml-1 text-xs">
                {bl.photos.length}
              </Badge>
            </TabsTrigger>
          ))}
          {searchLists.map((bl) => (
            <TabsTrigger key={bl.id} value={bl.id} className="gap-2">
              <SearchIcon className="h-3 w-3" />
              {bl.label}
              <Badge variant="secondary" className="ml-1 text-xs">
                {bl.photos.length}
              </Badge>
            </TabsTrigger>
          ))}
          {otherLists.map((bl) => (
            <TabsTrigger key={bl.id} value={bl.id} className="gap-2">
              <ImageIcon className="h-3 w-3" />
              {bl.label}
              <Badge variant="secondary" className="ml-1 text-xs">
                {bl.photos.length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Photo grid for each bildeliste */}
        {bildelister.map((bl) => (
          <TabsContent key={bl.id} value={bl.id} className="mt-4">
            {bl.photos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Ingen bilder i denne listen</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[400px] overflow-y-auto">
                {bl.photos.map((photo) => (
                  <button
                    key={photo.hothash}
                    onClick={() => handlePhotoClick(photo)}
                    className={`
                      relative aspect-square overflow-hidden rounded-lg border-2 transition-all
                      hover:border-primary hover:scale-105
                      ${selectedHash === photo.hothash 
                        ? 'border-primary ring-2 ring-primary ring-offset-2' 
                        : 'border-transparent'
                      }
                    `}
                  >
                    <Image
                      src={apiClient.getHotPreviewUrl(photo.hothash)}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover"
                    />
                    {selectedHash === photo.hothash && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Info footer */}
      {selectedBildeliste && (
        <div className="text-xs text-muted-foreground">
          <p>
            {selectedBildeliste.photos.length} bilder fra{' '}
            <strong>{selectedBildeliste.label}</strong>
            {selectedBildeliste.modified && (
              <Badge variant="outline" className="ml-2 text-xs">
                Endret
              </Badge>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

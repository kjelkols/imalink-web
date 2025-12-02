'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import type { Collection } from '@/lib/types';
import { CollectionCard } from '@/components/collection-card';
import { CreateCollectionDialog } from '@/components/create-collection-dialog';
import { Button } from '@/components/ui/button';
import { Plus, FolderOpen } from 'lucide-react';

export default function CollectionsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadCollections();
    }
  }, [isAuthenticated]);

  const loadCollections = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getCollections();
      setCollections(response.collections);
    } catch (err) {
      console.error('Failed to load collections:', err);
      setError(err instanceof Error ? err.message : 'Kunne ikke laste samlinger');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionCreated = () => {
    loadCollections();
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="text-muted-foreground">Laster...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Du må være logget inn</h1>
          <p className="mt-2 text-muted-foreground">Logg inn for å se dine samlinger</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mine samlinger</h1>
            <p className="mt-2 text-muted-foreground">
              Organiser bildene dine i samlinger
            </p>
          </div>
          
          <Button onClick={() => setShowCreateDialog(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Ny samling
          </Button>
        </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-md bg-destructive/15 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <p className="text-muted-foreground">Laster samlinger...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && collections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h2 className="mb-2 text-xl font-semibold">Ingen samlinger ennå</h2>
          <p className="mb-6 text-center text-muted-foreground">
            Opprett din første samling for å begynne å organisere bildene dine
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Opprett samling
          </Button>
        </div>
      )}

      {/* Collections grid */}
      {!loading && !error && collections.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}

        {/* Create dialog */}
      <CreateCollectionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCollectionCreated={handleCollectionCreated}
      />
    </div>
  );
}

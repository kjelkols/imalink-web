'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import type { ImportSession, PhotoWithTags } from '@/lib/types';
import { EditImportSessionDialog } from '@/components/edit-import-session-dialog';
import { PhotoGrid } from '@/components/photo-grid';
import { PhotoDetailDialog } from '@/components/photo-detail-dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Image as ImageIcon, Pencil } from 'lucide-react';

export default function ImportSessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = parseInt(params.id as string);

  const [session, setSession] = useState<ImportSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithTags | null>(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getImportSession(sessionId);
      setSession(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load import session:', err);
      setError('Kunne ikke laste importøkt');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSession = async (id: number, data: any) => {
    await apiClient.updateImportSession(id, data);
    await loadSession();
  };

  const handlePhotoClick = (photo: PhotoWithTags) => {
    setSelectedPhoto(photo);
    setPhotoDialogOpen(true);
  };

  const handlePhotoUpdated = (updatedPhoto: PhotoWithTags) => {
    // Trigger PhotoGrid refresh by updating session
    loadSession();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/import-sessions')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tilbake til importer
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {session.title || `Import #${session.id}`}
            </h1>
            {session.description && (
              <p className="text-muted-foreground mb-4">{session.description}</p>
            )}

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(session.imported_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span>{session.images_count} bilder</span>
              </div>
            </div>
          </div>

          <Button onClick={() => setEditDialogOpen(true)} variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Rediger
          </Button>
        </div>
      </div>

      {/* Photos */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        </div>
      ) : (
        <PhotoGrid
          searchParams={{ import_session_id: sessionId }}
          onPhotoClick={handlePhotoClick}
        />
      )}

      {/* Dialogs */}
      <EditImportSessionDialog
        session={session}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleUpdateSession}
      />

      <PhotoDetailDialog
        photo={selectedPhoto}
        open={photoDialogOpen}
        onOpenChange={setPhotoDialogOpen}
        onPhotoUpdated={handlePhotoUpdated}
      />
    </div>
  );
}

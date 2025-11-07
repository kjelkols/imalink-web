'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { useBildeliste } from '@/lib/bildeliste-context';
import { apiClient } from '@/lib/api-client';
import type { Collection, PhotoWithTags } from '@/lib/types';
import { BildelisteViewer } from '@/components/bildeliste-viewer';
import { PhotoDetailDialog } from '@/components/photo-detail-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Image as ImageIcon,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { loadFromCollection, getBildeliste, saveAsCollection, deleteBildeliste } = useBildeliste();
  
  const collectionId = parseInt(params.id as string);
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [bildelisteId, setBildelisteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithTags | null>(null);
  const [showPhotoDetail, setShowPhotoDetail] = useState(false);

  const bildeliste = bildelisteId ? getBildeliste(bildelisteId) : null;

  useEffect(() => {
    if (isAuthenticated && collectionId) {
      loadCollectionData();
    }
  }, [isAuthenticated, collectionId]);

  const loadCollectionData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.getCollection(collectionId);
      setCollection(data);
      setEditName(data.name);
      setEditDescription(data.description || '');
      
      // Load collection into bildeliste
      const bId = await loadFromCollection(collectionId);
      setBildelisteId(bId);
    } catch (err) {
      console.error('Failed to load collection:', err);
      setError(err instanceof Error ? err.message : 'Kunne ikke laste samling');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!bildelisteId || !bildeliste || !editName.trim()) return;

    setSaving(true);
    try {
      // If bildeliste is modified, save changes to server
      if (bildeliste.modified) {
        await saveAsCollection(bildelisteId, editName.trim(), editDescription.trim() || undefined);
      } else {
        // Just update metadata
        await apiClient.updateCollection(collectionId, {
          name: editName.trim(),
          description: editDescription.trim() || undefined,
        });
      }
      
      await loadCollectionData();
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update collection:', err);
      alert('Kunne ikke oppdatere samling');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (collection) {
      setEditName(collection.name);
      setEditDescription(collection.description || '');
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.deleteCollection(collectionId);
      if (bildelisteId) {
        deleteBildeliste(bildelisteId);
      }
      router.push('/collections');
    } catch (err) {
      console.error('Failed to delete collection:', err);
      alert('Kunne ikke slette samling');
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const checkForUnsavedChanges = () => {
    if (bildeliste?.modified) {
      setShowSaveDialog(true);
      return true;
    }
    return false;
  };

  const handleBack = () => {
    if (!checkForUnsavedChanges()) {
      router.push('/collections');
    }
  };

  const handleSaveAndExit = async () => {
    if (bildelisteId && bildeliste) {
      await saveAsCollection(bildelisteId, collection?.name || 'Samling', collection?.description || undefined);
      router.push('/collections');
    }
  };

  const handleDiscardAndExit = () => {
    if (bildelisteId) {
      deleteBildeliste(bildelisteId);
    }
    router.push('/collections');
  };

  const handlePhotoClick = (photo: PhotoWithTags) => {
    setSelectedPhoto(photo);
    setShowPhotoDetail(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (authLoading || loading) {
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
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!collection) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake til samlinger
          </Button>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Navn</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={255}
                disabled={saving}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Beskrivelse</Label>
              <textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={saving}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !editName.trim()}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Lagrer...' : 'Lagre'}
              </Button>
              <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                <X className="mr-2 h-4 w-4" />
                Avbryt
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{collection.name}</h1>
                {collection.description && (
                  <p className="mt-2 text-muted-foreground">{collection.description}</p>
                )}
                
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" />
                    <span>{collection.photo_count} {collection.photo_count === 1 ? 'bilde' : 'bilder'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Opprettet {formatDate(collection.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {bildeliste?.modified && (
                  <Button variant="default" onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Lagrer...' : 'Lagre endringer'}
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Rediger
                </Button>
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Slett
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Photos grid */}
      {bildelisteId ? (
        <BildelisteViewer
          bildelisteId={bildelisteId}
          onPhotoClick={handlePhotoClick}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <ImageIcon className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h2 className="mb-2 text-xl font-semibold">Laster bilder...</h2>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett samling?</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på at du vil slette &quot;{collection.name}&quot;?
              Bildene vil ikke bli slettet, bare samlingen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Sletter...' : 'Slett samling'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsaved changes dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Ulagrede endringer
            </AlertDialogTitle>
            <AlertDialogDescription>
              Du har gjort endringer i samlingen som ikke er lagret.
              Vil du lagre endringene før du går tilbake?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardAndExit}>
              Forkast endringer
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveAndExit}>
              Lagre og gå tilbake
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

        {/* Photo detail dialog */}
        <PhotoDetailDialog
          photo={selectedPhoto}
          open={showPhotoDetail}
          onOpenChange={setShowPhotoDetail}
        />
      </div>
    </div>
  );
}

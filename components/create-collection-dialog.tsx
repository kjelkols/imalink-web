'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { CollectionCreate } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCollectionCreated?: () => void;
}

export function CreateCollectionDialog({
  open,
  onOpenChange,
  onCollectionCreated,
}: CreateCollectionDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Navn er påkrevd');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const data: CollectionCreate = {
        name: name.trim(),
        description: description.trim() || undefined,
      };

      await apiClient.createCollection(data);
      
      // Reset form
      setName('');
      setDescription('');
      onOpenChange(false);
      onCollectionCreated?.();
    } catch (err) {
      console.error('Failed to create collection:', err);
      setError(err instanceof Error ? err.message : 'Kunne ikke opprette samling');
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Opprett ny samling</DialogTitle>
          <DialogDescription>
            Lag en samling for å organisere bildene dine
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="name">
              Navn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Min samling"
              maxLength={255}
              disabled={creating}
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Beskrivelse</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Valgfri beskrivelse..."
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={creating}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={creating}>
            Avbryt
          </Button>
          <Button onClick={handleCreate} disabled={creating || !name.trim()}>
            {creating ? 'Oppretter...' : 'Opprett samling'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

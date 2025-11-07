'use client';

import { useState } from 'react';
import { ImportSession, ImportSessionUpdate } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditImportSessionDialogProps {
  session: ImportSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: number, data: ImportSessionUpdate) => Promise<void>;
}

export function EditImportSessionDialog({
  session,
  open,
  onOpenChange,
  onSave,
}: EditImportSessionDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Update state when session changes
  useState(() => {
    if (session) {
      setTitle(session.title || '');
      setDescription(session.description || '');
    }
  });

  const handleSave = async () => {
    if (!session) return;

    setSaving(true);
    try {
      await onSave(session.id, {
        title: title.trim() || null,
        description: description.trim() || null,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update import session:', error);
      alert(`Kunne ikke lagre: ${error instanceof Error ? error.message : 'Ukjent feil'}`);
    } finally {
      setSaving(false);
    }
  };

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rediger Import</DialogTitle>
          <DialogDescription>
            Oppdater tittel og beskrivelse for denne importøkten
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Tittel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Import #${session.id}`}
            />
          </div>

          <div>
            <Label htmlFor="description">Beskrivelse</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Legg til en beskrivelse..."
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Lagrer...' : 'Lagre'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

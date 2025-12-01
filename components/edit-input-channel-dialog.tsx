'use client';

import { useState } from 'react';
import { InputChannel, InputChannelUpdate } from '@/lib/types';
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

interface EditInputChannelDialogProps {
  channel: InputChannel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: number, data: InputChannelUpdate) => Promise<void>;
}

export function EditInputChannelDialog({
  channel,
  open,
  onOpenChange,
  onSave,
}: EditInputChannelDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Update state when channel changes
  useState(() => {
    if (channel) {
      setTitle(channel.title || '');
      setDescription(channel.description || '');
    }
  });

  const handleSave = async () => {
    if (!channel) return;

    setSaving(true);
    try {
      await onSave(channel.id, {
        title: title.trim() || null,
        description: description.trim() || null,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update input channel:', error);
      alert(`Kunne ikke lagre: ${error instanceof Error ? error.message : 'Ukjent feil'}`);
    } finally {
      setSaving(false);
    }
  };

  if (!channel) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rediger Import</DialogTitle>
          <DialogDescription>
            Oppdater tittel og beskrivelse for denne kanalen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Tittel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Import #${channel.id}`}
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

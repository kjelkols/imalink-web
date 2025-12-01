'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { InputChannel } from '@/lib/types';
import { InputChannelCard } from '@/components/input-channel-card';
import { Package } from 'lucide-react';

export default function InputChannelsPage() {
  const [channels, setChannels] = useState<InputChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getInputChannels(0, 100);
      // Sort by imported_at descending (newest first)
      const sorted = data.channels.sort(
        (a, b) => new Date(b.imported_at).getTime() - new Date(a.imported_at).getTime()
      );
      setChannels(sorted);
      setError(null);
    } catch (err) {
      console.error('Failed to load input channels:', err);
      setError('Kunne ikke laste kanaler');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Input Channels</h1>
        <p className="text-muted-foreground">
          Oversikt over alle bildekanaler som er importert til Imalink
        </p>
      </div>

      {channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ingen kanaler ennå</h2>
          <p className="text-muted-foreground max-w-md">
            Bilder importeres via desktop-appen. Når du importerer bilder, vil de vises her.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <InputChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      )}
    </div>
  );
}

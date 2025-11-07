'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { ImportSession } from '@/lib/types';
import { ImportSessionCard } from '@/components/import-session-card';
import { Package } from 'lucide-react';

export default function ImportSessionsPage() {
  const [sessions, setSessions] = useState<ImportSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getImportSessions(0, 100);
      // Sort by imported_at descending (newest first)
      const sorted = data.sessions.sort(
        (a, b) => new Date(b.imported_at).getTime() - new Date(a.imported_at).getTime()
      );
      setSessions(sorted);
      setError(null);
    } catch (err) {
      console.error('Failed to load import sessions:', err);
      setError('Kunne ikke laste importøkter');
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
        <h1 className="text-3xl font-bold mb-2">Importer</h1>
        <p className="text-muted-foreground">
          Oversikt over alle bildebatcher som er importert til Imalink
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Ingen importer ennå</h2>
          <p className="text-muted-foreground max-w-md">
            Bilder importeres via desktop-appen. Når du importerer bilder, vil de vises her.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <ImportSessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}

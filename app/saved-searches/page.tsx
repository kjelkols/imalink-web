'use client';

import { useAuth } from '@/lib/auth-context';
import { Search } from 'lucide-react';

export default function SavedSearchesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();

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
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Lagrede søk</h1>
        <p className="mt-2 text-muted-foreground">
          Smart album som oppdateres automatisk basert på søkekriterier
        </p>
      </div>

      {/* Coming soon state */}
      <div className="flex flex-col items-center justify-center py-12">
        <Search className="mb-4 h-16 w-16 text-muted-foreground/30" />
        <h2 className="mb-2 text-xl font-semibold">Kommer snart</h2>
        <p className="text-center text-muted-foreground">
          Funksjonen for lagrede søk er under utvikling
        </p>
      </div>
    </div>
  );
}

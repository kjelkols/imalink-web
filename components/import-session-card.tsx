'use client';

import { ImportSession } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ImportSessionCardProps {
  session: ImportSession;
}

export function ImportSessionCard({ session }: ImportSessionCardProps) {
  const router = useRouter();

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

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/import-sessions/${session.id}`)}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-1">
                {session.title || `Import #${session.id}`}
              </h3>
              {session.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {session.description}
                </p>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(session.imported_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" />
              <span>{session.images_count} bilder</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

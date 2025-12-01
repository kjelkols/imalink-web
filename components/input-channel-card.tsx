'use client';

import { InputChannel } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InputChannelCardProps {
  channel: InputChannel;
}

export function InputChannelCard({ channel }: InputChannelCardProps) {
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
      onClick={() => router.push(`/input-channels/${channel.id}`)}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-1">
                {channel.title || `Kanal #${channel.id}`}
              </h3>
              {channel.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {channel.description}
                </p>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(channel.imported_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" />
              <span>{channel.images_count} bilder</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

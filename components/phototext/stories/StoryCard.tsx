'use client';

import { PhotoTextDocumentSummary, VisibilityLevel } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VisibilityBadge } from '@/components/visibility-badge';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';

interface StoryCardProps {
  story: PhotoTextDocumentSummary & { visibility?: string };
}

export function StoryCard({ story }: StoryCardProps) {
  const coverImageUrl = story.cover_image_hash 
    ? apiClient.getHotPreviewUrl(story.cover_image_hash)
    : null;

  const publishDate = story.published_at 
    ? new Date(story.published_at).toLocaleDateString('nb-NO', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : null;

  const updatedDate = new Date(story.updated_at).toLocaleDateString('nb-NO', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  // Estimate read time from abstract (rough approximation: 200 words/min)
  const wordCount = story.abstract ? story.abstract.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <Link href={`/stories/${story.id}`} className="block group">
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        {coverImageUrl && (
          <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
            <img
              src={coverImageUrl}
              alt={story.cover_image_alt || story.title}
              className="object-cover w-full h-full transition-transform group-hover:scale-105"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <VisibilityBadge 
                visibility={(story.visibility as VisibilityLevel) || 'private'} 
                className="bg-background/80 backdrop-blur"
              />
              {!story.is_published && (
                <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                  Utkast
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {publishDate || updatedDate}
            {story.abstract && (
              <>
                <span>•</span>
                <Clock className="h-3 w-3" />
                {readTime} min lesing
              </>
            )}
          </div>
          
          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
            {story.title}
          </CardTitle>
          
          {story.abstract && (
            <CardDescription className="line-clamp-3">
              {story.abstract}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}

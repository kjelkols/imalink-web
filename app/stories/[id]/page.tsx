'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { PhotoTextDocument } from '@/lib/types';
import { StoryViewer } from '@/components/phototext/stories/StoryViewer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Eye, EyeOff, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [story, setStory] = useState<PhotoTextDocument | null>(null);
  const [loading, setLoading] = useState(true);

  const storyId = Number(params.id);

  useEffect(() => {
    loadStory();
  }, [storyId]);

  async function loadStory() {
    setLoading(true);
    try {
      const data = await apiClient.getPhotoText(storyId);
      setStory(data);
    } catch (error) {
      console.error('Failed to load story:', error);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish() {
    if (!story) return;
    
    try {
      await apiClient.updatePhotoText(storyId, {
        is_published: !story.is_published,
      });
      await loadStory(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
    }
  }

  async function deleteStory() {
    if (!confirm('Er du sikker på at du vil slette denne historien?')) return;
    
    try {
      await apiClient.deletePhotoText(storyId);
      router.push('/stories');
    } catch (error) {
      console.error('Failed to delete story:', error);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center py-12 text-muted-foreground">
          Laster historie...
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Historie ikke funnet</h2>
          <Link href="/stories">
            <Button variant="outline">Tilbake til historier</Button>
          </Link>
        </div>
      </div>
    );
  }

  const publishDate = story.published_at 
    ? new Date(story.published_at).toLocaleDateString('nb-NO', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-5xl py-3">
          <div className="flex items-center justify-between">
            <Link href="/stories">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Tilbake
              </Button>
            </Link>
            
            <div className="flex items-center gap-2">
              <Badge variant={story.is_published ? 'default' : 'secondary'} className="gap-1">
                {story.is_published ? (
                  <>
                    <Eye className="h-3 w-3" />
                    Publisert
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3" />
                    Utkast
                  </>
                )}
              </Badge>
              
              <Link href={`/stories/${storyId}/edit`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Rediger
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-destructive hover:text-destructive"
                onClick={deleteStory}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Container */}
      <div className="container mx-auto px-4 max-w-3xl py-12">
        <StoryViewer story={story} />
      </div>
    </div>
  );
}

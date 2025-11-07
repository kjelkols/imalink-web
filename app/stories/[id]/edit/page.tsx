'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { StoryEditor } from '@/components/phototext/stories/StoryEditor';
import { PhotoTextDocument, PhotoTextDocumentCreate, PhotoTextDocumentUpdate } from '@/lib/types';

export default function EditStoryPage() {
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

  async function handleSave(data: PhotoTextDocumentCreate | PhotoTextDocumentUpdate) {
    await apiClient.updatePhotoText(storyId, data as PhotoTextDocumentUpdate);
    router.push(`/stories/${storyId}`);
  }

  function handleCancel() {
    router.push(`/stories/${storyId}`);
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12 text-muted-foreground">
          Laster historie...
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Historie ikke funnet</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Rediger historie</h1>
        <p className="text-muted-foreground">
          Oppdater din fotoriske fortelling
        </p>
      </div>

      <StoryEditor
        initialData={{
          title: story.title,
          abstract: story.abstract || undefined,
          content: story.content as any,
          cover_image_hash: story.cover_image_hash || undefined,
          cover_image_alt: story.cover_image_alt || undefined,
        }}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}

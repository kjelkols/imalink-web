'use client';

import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { StoryEditor } from '@/components/phototext/stories/StoryEditor';
import { PhotoTextDocumentCreate, PhotoTextDocumentUpdate } from '@/lib/types';

export default function NewStoryPage() {
  const router = useRouter();

  async function handleSave(data: PhotoTextDocumentCreate | PhotoTextDocumentUpdate) {
    // For new stories, we know it's a create
    const result = await apiClient.createPhotoText(data as PhotoTextDocumentCreate);
    router.push(`/stories/${result.id}`);
  }

  function handleCancel() {
    router.push('/stories');
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Skriv ny historie</h1>
        <p className="text-muted-foreground">
          Lag en fotorisk fortelling med tekst og bilder
        </p>
      </div>

      <StoryEditor onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}

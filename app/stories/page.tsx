'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { PhotoTextDocumentSummary } from '@/lib/types';
import { StoryCard } from '@/components/phototext/stories/StoryCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenLine, FileText } from 'lucide-react';
import Link from 'next/link';

type FilterType = 'all' | 'published' | 'draft';
type SortType = 'newest' | 'oldest' | 'title';

export default function StoriesPage() {
  const [stories, setStories] = useState<PhotoTextDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');

  useEffect(() => {
    loadStories();
  }, [filter, sort]);

  async function loadStories() {
    setLoading(true);
    try {
      const isPublished = filter === 'published' ? true : filter === 'draft' ? false : undefined;
      const sortBy = sort === 'title' ? 'title' : 'created_at';
      const sortOrder = sort === 'oldest' ? 'asc' : 'desc';

      const { documents } = await apiClient.getPhotoTexts({
        document_type: 'general',
        is_published: isPublished,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit: 100,
      });

      setStories(documents);
    } catch (error) {
      console.error('Failed to load stories:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Historier</h1>
          <p className="text-muted-foreground">
            Dine fotorrike fortellinger og blogginnlegg
          </p>
        </div>
        <Link href="/stories/new">
          <Button size="lg" className="gap-2">
            <PenLine className="h-4 w-4" />
            Skriv ny historie
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-8">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <TabsList>
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="published">Publisert</TabsTrigger>
            <TabsTrigger value="draft">Utkast</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={sort} onValueChange={(v) => setSort(v as SortType)}>
          <TabsList>
            <TabsTrigger value="newest">Nyeste</TabsTrigger>
            <TabsTrigger value="oldest">Eldste</TabsTrigger>
            <TabsTrigger value="title">Tittel</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Laster historier...
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold mb-2">Ingen historier ennå</h3>
          <p className="text-muted-foreground mb-6">
            Begynn å skrive din første fotorrike historie
          </p>
          <Link href="/stories/new">
            <Button className="gap-2">
              <PenLine className="h-4 w-4" />
              Skriv ny historie
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}

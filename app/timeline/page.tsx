'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimelineYear } from '@/components/timeline/timeline-nodes';
import { PhotoGrid } from '@/components/photo-grid';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import type { TimelineBucket, SearchParams } from '@/lib/types';

export default function TimelinePage() {
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState<TimelineBucket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPhotoGrid, setShowPhotoGrid] = useState(false);
  const [gridTitle, setGridTitle] = useState('');
  const [gridSearchParams, setGridSearchParams] = useState<SearchParams | null>(null);

  useEffect(() => {
    async function loadYears() {
      try {
        setLoading(true);
        const response = await apiClient.getTimeline({ granularity: 'year' });
        setYears(response.data);
      } catch (err) {
        console.error('Failed to load timeline years:', err);
        setError('Failed to load timeline. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadYears();
  }, []);

  const handleViewPhotos = (title: string, searchParams: SearchParams) => {
    setGridTitle(title);
    setGridSearchParams(searchParams);
    setShowPhotoGrid(true);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Timeline</h1>
        <p className="text-muted-foreground">
          Browse your photos organized by year, month, day, and hour
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Photo Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading timeline...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
            </div>
          ) : years.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No photos found in timeline.</p>
            </div>
          ) : (
            <div className="divide-y">
              {years.map((bucket) => (
                <TimelineYear
                  key={bucket.year}
                  year={bucket.year}
                  count={bucket.count}
                  firstPhoto={bucket.preview_hothash}
                  onViewPhotos={handleViewPhotos}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PhotoGrid Dialog */}
      <Dialog open={showPhotoGrid} onOpenChange={setShowPhotoGrid}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] h-[95vh]">
          <DialogHeader>
            <DialogTitle>{gridTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto -mx-6 px-6">
            {gridSearchParams && (
              <PhotoGrid
                searchParams={gridSearchParams}
                enableBatchOperations={true}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

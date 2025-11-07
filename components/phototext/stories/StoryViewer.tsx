'use client';

import { PhotoTextDocument } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';

interface StoryViewerProps {
  story: PhotoTextDocument;
}

interface PhotoTextBlock {
  type: 'heading' | 'paragraph' | 'image' | 'images' | 'list';
  level?: number;
  content?: Array<{ type: 'text' | 'bold' | 'italic' | 'link'; text: string; url?: string }>;
  images?: Array<{ imageId: string; caption?: string; alt?: string }>;
  imageId?: string;
  caption?: string;
  alt?: string;
  items?: string[];
  ordered?: boolean;
}

interface PhotoTextContent {
  documentType: 'general';
  title?: string;
  abstract?: string;
  blocks: PhotoTextBlock[];
}

export function StoryViewer({ story }: StoryViewerProps) {
  const [content, setContent] = useState<PhotoTextContent | null>(null);

  useEffect(() => {
    // Parse JSONB content
    if (story.content && typeof story.content === 'object') {
      setContent(story.content as unknown as PhotoTextContent);
    }
  }, [story.content]);

  if (!content || !content.blocks) {
    return (
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground italic">Ingen innhold tilgjengelig</p>
      </div>
    );
  }

  return (
    <article className="space-y-8">
      {/* Title */}
      {content.title && (
        <h1 className="font-sans text-5xl font-bold tracking-tight">
          {content.title}
        </h1>
      )}
      
      {/* Cover Image - wide, not too tall */}
      {story.cover_image_hash && (
        <div className="w-full aspect-[21/9] relative overflow-hidden rounded-lg bg-muted -mx-4 sm:mx-0">
          <img
            src={apiClient.getColdPreviewUrl(story.cover_image_hash)}
            alt={story.cover_image_alt || content.title || ''}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Abstract */}
      {content.abstract && (
        <p className="text-lg italic text-muted-foreground leading-relaxed border-l-4 border-primary/30 pl-4 py-2">
          {content.abstract}
        </p>
      )}
      
      {/* Blocks */}
      <div className="space-y-6">
        {content.blocks.map((block, index) => (
          <Block key={index} block={block} />
        ))}
      </div>
    </article>
  );
}

function Block({ block }: { block: PhotoTextBlock }) {
  switch (block.type) {
    case 'heading':
      return <Heading level={block.level || 1} content={block.content} />;
    
    case 'paragraph':
      return <Paragraph content={block.content} />;
    
    case 'image':
      return <SingleImage imageId={block.imageId!} caption={block.caption} alt={block.alt} />;
    
    case 'images':
      return <ImageGallery images={block.images || []} caption={block.caption} />;
    
    case 'list':
      return <List items={block.items || []} ordered={block.ordered} />;
    
    default:
      return null;
  }
}

function Heading({ level, content }: { level: number; content?: Array<any> }) {
  const text = content?.map(c => c.text).join('') || '';
  const baseClass = "font-sans font-bold tracking-tight";
  
  switch (level) {
    case 1: return <h1 className={`${baseClass} text-4xl mt-12 mb-4`}>{text}</h1>;
    case 2: return <h2 className={`${baseClass} text-3xl mt-10 mb-3`}>{text}</h2>;
    case 3: return <h3 className={`${baseClass} text-2xl mt-8 mb-3`}>{text}</h3>;
    case 4: return <h4 className={`${baseClass} text-xl mt-6 mb-2`}>{text}</h4>;
    case 5: return <h5 className={`${baseClass} text-lg mt-4 mb-2`}>{text}</h5>;
    default: return <h6 className={`${baseClass} text-base mt-4 mb-2`}>{text}</h6>;
  }
}

function Paragraph({ content }: { content?: Array<any> }) {
  if (!content) return null;

  return (
    <p className="text-base leading-relaxed text-foreground my-4">
      {content.map((item, i) => {
        if (item.type === 'bold') {
          return <strong key={i}>{item.text}</strong>;
        }
        if (item.type === 'italic') {
          return <em key={i}>{item.text}</em>;
        }
        if (item.type === 'link') {
          return (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
              {item.text}
            </a>
          );
        }
        return <span key={i}>{item.text}</span>;
      })}
    </p>
  );
}

function SingleImage({ imageId, caption, alt }: { imageId: string; caption?: string; alt?: string }) {
  const imageUrl = apiClient.getColdPreviewUrl(imageId);
  
  return (
    <figure className="my-8 border rounded-lg p-4 bg-muted/20">
      <img 
        src={imageUrl} 
        alt={alt || caption || ''} 
        className="w-full rounded"
      />
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function ImageGallery({ images, caption }: { images: Array<any>; caption?: string }) {
  const gridClass = images.length === 2 
    ? 'grid-cols-2' 
    : images.length === 3 
    ? 'grid-cols-3' 
    : 'grid-cols-2 lg:grid-cols-3';

  return (
    <figure className="my-8 border rounded-lg p-4 bg-muted/20">
      <div className={`grid ${gridClass} gap-4`}>
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded">
            <img
              src={apiClient.getColdPreviewUrl(img.imageId)}
              alt={img.alt || img.caption || ''}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function List({ items, ordered }: { items: string[]; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul';
  
  return (
    <Tag className={ordered ? 'list-decimal list-inside space-y-2 my-4' : 'list-disc list-inside space-y-2 my-4'}>
      {items.map((item, i) => (
        <li key={i} className="text-base leading-relaxed">{item}</li>
      ))}
    </Tag>
  );
}

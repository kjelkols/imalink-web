# Stories (PhotoText) Implementation Guide

## Overview

Stories is a block-based content editor for creating articles with integrated photos. Built using the PhotoText API, it provides a blog-style layout with professional typography.

---

## Features

### ✅ Implemented
- Block-based editor (Heading, Paragraph, Image, List)
- Visual image picker from bildelister
- Cover image with alt text
- Title and abstract meta fields
- Blog-style viewer with professional typography
- Hotpreview for thumbnails, coldpreview for large images
- Coldpreview caching (Object URLs)
- Auto-save to drafts
- List view with filter/sort
- Move blocks up/down

### ⏳ Not Yet Implemented
- Publishing workflow (all stories saved as drafts)
- Rich text formatting (bold, italic, links)
- Image galleries (multi-image blocks)
- Drag-and-drop block reordering
- Album document type
- Slideshow document type

---

## Content Structure

### PhotoTextDocument (Backend)
```typescript
interface PhotoTextDocument {
  id: string;
  user_id: string;
  title: string;
  document_type: 'general' | 'album' | 'slideshow';
  abstract?: string;
  cover_image_hash?: string;      // 64-char SHA256 (pure hothash, no prefix)
  cover_image_alt?: string;
  is_published: boolean;          // Currently always false
  content: PhotoTextContent;
  created_at: string;             // ISO 8601
  updated_at: string;             // ISO 8601
}
```

### PhotoTextContent (Nested in document)
```typescript
interface PhotoTextContent {
  version: '1.0';                 // Required
  documentType: 'general' | 'album' | 'slideshow';
  title: string;                  // Required (duplicated from root)
  abstract?: string;              // Optional (duplicated from root)
  blocks: PhotoTextBlock[];
}
```

### Block Types
```typescript
// Heading
{
  id: string;
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

// Paragraph
{
  id: string;
  type: 'paragraph';
  text: string;
}

// Image (single)
{
  id: string;
  type: 'image';
  imageId: string;        // hothash (64-char SHA256)
  caption?: string;
  alt?: string;
}

// List
{
  id: string;
  type: 'list';
  ordered: boolean;       // true = numbered, false = bullets
  items: string[];        // Array of text items
}
```

---

## Components

### StoryEditor (`components/phototext/stories/StoryEditor.tsx`)

**Purpose:** Block-based content editor

**Features:**
- Add new blocks (dropdown menu)
- Edit block content (inline)
- Move blocks up/down (arrow buttons)
- Delete blocks (trash button)
- Visual image picker (ImagePicker component)
- Cover image selection
- Title and abstract editing
- Auto-save to drafts

**State:**
```typescript
const [title, setTitle] = useState('');
const [abstract, setAbstract] = useState('');
const [coverImage, setCoverImage] = useState<{hash: string; alt: string} | null>(null);
const [blocks, setBlocks] = useState<PhotoTextBlock[]>([]);
const [coldPreviewUrls, setColdPreviewUrls] = useState<Map<string, string>>(new Map());
```

**Coldpreview Caching:**
```typescript
useEffect(() => {
  const loadPreviews = async () => {
    const urls = new Map<string, string>();
    
    // Load cover image
    if (coverImage?.hash) {
      const url = await apiClient.fetchColdPreview(coverImage.hash);
      urls.set(coverImage.hash, url);
    }
    
    // Load all image blocks
    for (const block of blocks) {
      if (block.type === 'image' && block.imageId) {
        const url = await apiClient.fetchColdPreview(block.imageId);
        urls.set(block.imageId, url);
      }
    }
    
    setColdPreviewUrls(urls);
  };
  
  loadPreviews();
}, [coverImage, blocks]);
```

**Save Logic:**
```typescript
const handleSave = async () => {
  const content: PhotoTextContent = {
    version: '1.0',
    documentType: 'general',
    title,
    abstract: abstract || undefined,
    blocks
  };

  const document: Partial<PhotoTextDocument> = {
    title,
    document_type: 'general',
    abstract: abstract || undefined,
    cover_image_hash: coverImage?.hash,
    cover_image_alt: coverImage?.alt,
    is_published: false,  // Always draft
    content
  };

  if (isEditMode) {
    await apiClient.updatePhotoText(id, document);
  } else {
    await apiClient.createPhotoText(document);
  }
};
```

**Move Buttons:**
- Always visible (not opacity-based)
- Positioned inside card (not `absolute -left-12`)
- Outline variant for subtle appearance
- Disabled when at top/bottom

**Block Editor UI:**
```tsx
<Card>
  <CardContent className="pt-6">
    <div className="flex gap-2 mb-4">
      {/* Move buttons */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleMoveBlock(index, 'up')}
        disabled={index === 0}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleMoveBlock(index, 'down')}
        disabled={index === blocks.length - 1}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
      
      {/* Block content */}
      <div className="flex-1">
        {renderBlockEditor(block)}
      </div>
      
      {/* Delete button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleDeleteBlock(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </CardContent>
</Card>
```

---

### StoryViewer (`components/phototext/stories/StoryViewer.tsx`)

**Purpose:** Blog-style article viewer

**Layout Structure:**
```tsx
<article className="max-w-3xl mx-auto px-6 py-12">
  {/* Title */}
  <h1 className="text-5xl font-sans font-bold tracking-tight mb-8">
    {story.title}
  </h1>
  
  {/* Cover Image */}
  {story.cover_image_hash && (
    <div className="mb-8">
      <img
        src={apiClient.getColdPreviewUrl(story.cover_image_hash)}
        alt={story.cover_image_alt || ''}
        className="w-full aspect-[21/9] object-cover rounded-lg"
      />
    </div>
  )}
  
  {/* Abstract */}
  {story.content.abstract && (
    <p className="text-lg italic text-muted-foreground border-l-4 border-primary pl-4 mb-12">
      {story.content.abstract}
    </p>
  )}
  
  {/* Blocks */}
  <div className="prose prose-lg max-w-none">
    {story.content.blocks.map(block => renderBlock(block))}
  </div>
</article>
```

**Typography System:**

| Element | Classes |
|---------|---------|
| Title | `text-5xl font-sans font-bold tracking-tight` |
| Cover | `aspect-[21/9] object-cover rounded-lg` |
| Abstract | `text-lg italic text-muted-foreground border-l-4 border-primary pl-4` |
| H1 | `text-4xl font-sans font-bold mt-12 mb-4` |
| H2 | `text-3xl font-sans font-bold mt-10 mb-3` |
| H3 | `text-2xl font-sans font-bold mt-8 mb-3` |
| H4 | `text-xl font-sans font-bold mt-6 mb-2` |
| H5 | `text-lg font-sans font-bold mt-4 mb-2` |
| H6 | `text-base font-sans font-bold mt-4 mb-2` |
| Paragraph | `text-base leading-relaxed mb-4` |
| Image | `border rounded-lg p-4 bg-muted/20` |
| Caption | `text-sm text-muted-foreground text-center mt-2` |
| List | `ml-6 mb-4 space-y-1` |

**Block Rendering:**
```typescript
const renderBlock = (block: PhotoTextBlock) => {
  switch (block.type) {
    case 'heading':
      const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
      const headingClasses = {
        1: 'text-4xl font-sans font-bold mt-12 mb-4',
        2: 'text-3xl font-sans font-bold mt-10 mb-3',
        3: 'text-2xl font-sans font-bold mt-8 mb-3',
        4: 'text-xl font-sans font-bold mt-6 mb-2',
        5: 'text-lg font-sans font-bold mt-4 mb-2',
        6: 'text-base font-sans font-bold mt-4 mb-2',
      };
      return (
        <HeadingTag className={headingClasses[block.level]}>
          {block.text}
        </HeadingTag>
      );

    case 'paragraph':
      return (
        <p className="text-base leading-relaxed mb-4">
          {block.text}
        </p>
      );

    case 'image':
      return (
        <figure className="my-8">
          <img
            src={apiClient.getColdPreviewUrl(block.imageId)}
            alt={block.alt || ''}
            className="w-full border rounded-lg p-4 bg-muted/20"
          />
          {block.caption && (
            <figcaption className="text-sm text-muted-foreground text-center mt-2">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'list':
      const ListTag = block.ordered ? 'ol' : 'ul';
      const listClass = block.ordered ? 'list-decimal' : 'list-disc';
      return (
        <ListTag className={`${listClass} ml-6 mb-4 space-y-1`}>
          {block.items.map((item, i) => (
            <li key={i} className="text-base leading-relaxed">
              {item}
            </li>
          ))}
        </ListTag>
      );
  }
};
```

---

### StoryCard (`components/phototext/stories/StoryCard.tsx`)

**Purpose:** List view card

**Features:**
- Cover image thumbnail (hotpreview)
- Title and abstract preview
- Created/updated dates
- Click to view story

**Implementation:**
```tsx
<Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleClick}>
  <CardContent className="p-0">
    {story.cover_image_hash && (
      <div className="relative w-full aspect-video">
        <Image
          src={apiClient.getHotPreviewUrl(story.cover_image_hash)}
          alt={story.cover_image_alt || ''}
          fill
          className="object-cover rounded-t-lg"
        />
      </div>
    )}
    <div className="p-4">
      <h3 className="text-xl font-bold mb-2">{story.title}</h3>
      {story.abstract && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {story.abstract}
        </p>
      )}
      <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
        <span>Created: {formatDate(story.created_at)}</span>
        <span>Updated: {formatDate(story.updated_at)}</span>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## Image Preview URLs

### Policy

**hotpreview** (`/api/v1/photos/{hothash}/hotpreview`)
- **When to use:** Thumbnails, cards, grids, list views
- **Characteristics:** Fast, cached, no authentication required
- **Access method:** `apiClient.getHotPreviewUrl(hothash, width?, height?)`

**coldpreview** (`/api/v1/photos/{hothash}/coldpreview`)
- **When to use:** Large images in articles, editor previews, detailed viewing
- **Characteristics:** High quality, requires authentication (Bearer token)
- **Access methods:**
  - `apiClient.getColdPreviewUrl(hothash, width?, height?)` - Returns URL string
  - `apiClient.fetchColdPreview(hothash, width?, height?)` - Returns cached Object URL

### Coldpreview Caching

**Implementation in ApiClient:**
```typescript
class ApiClient {
  private coldPreviewCache = new Map<string, string>();

  async fetchColdPreview(
    hothash: string,
    width?: number,
    height?: number
  ): Promise<string> {
    const cacheKey = `${hothash}-${width}-${height}`;
    
    // Return cached URL if exists
    if (this.coldPreviewCache.has(cacheKey)) {
      return this.coldPreviewCache.get(cacheKey)!;
    }

    try {
      const url = this.getColdPreviewUrl(hothash, width, height);
      const token = this.getToken();
      
      if (!token) {
        throw new Error('No auth token');
      }

      // Fetch with authentication
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch coldpreview: ${response.status}`);
      }

      // Create Object URL from blob
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      // Cache the Object URL
      this.coldPreviewCache.set(cacheKey, objectUrl);
      
      return objectUrl;
    } catch (error) {
      console.error('Error fetching coldpreview:', error);
      // Fallback to hotpreview
      return this.getHotPreviewUrl(hothash, width, height);
    }
  }

  clearColdPreviewCache(): void {
    // Revoke all Object URLs to free memory
    this.coldPreviewCache.forEach(url => URL.revokeObjectURL(url));
    this.coldPreviewCache.clear();
  }
}
```

**Benefits:**
- Reduces server load (images fetched once)
- Improves performance (instant display on re-render)
- Automatic fallback to hotpreview on error
- Memory cleanup with `clearColdPreviewCache()`

**Usage in Components:**
```typescript
// In StoryEditor
const [coldPreviewUrls, setColdPreviewUrls] = useState<Map<string, string>>(new Map());

useEffect(() => {
  const loadPreviews = async () => {
    const urls = new Map<string, string>();
    
    for (const block of blocks) {
      if (block.type === 'image') {
        const url = await apiClient.fetchColdPreview(block.imageId);
        urls.set(block.imageId, url);
      }
    }
    
    setColdPreviewUrls(urls);
  };
  
  loadPreviews();
}, [blocks]);

// Later in render
<img src={coldPreviewUrls.get(block.imageId)} />
```

---

## Bildeliste System

### Overview
Bildelister is a frontend-only abstraction for organizing images temporarily. It provides a unified interface for selecting images from various sources.

### Types
```typescript
type BildelisteType = 'collection' | 'search' | 'saved-search' | 'manual';

interface Bildeliste {
  id: string;
  name: string;
  type: BildelisteType;
  items: string[];           // Array of hothashes
  sourceId?: string;         // Collection ID or SavedSearch ID
  searchParams?: any;        // For 'search' type
  createdAt: string;
  lastAccessedAt: string;
  modified: boolean;         // True if items added/removed
}
```

### Storage
- **Location:** LocalStorage (key: `imalink-bildelister`)
- **Limit:** Max 10 lists
- **Cleanup:** Auto-remove oldest by `lastAccessedAt` when over limit

### BildelisteContext
```typescript
interface BildelisteContextType {
  bildelister: Bildeliste[];
  selectedBildelisteId?: string;
  createBildeliste: (name: string, type: BildelisteType, items?: string[]) => Bildeliste;
  updateBildeliste: (id: string, updates: Partial<Bildeliste>) => void;
  deleteBildeliste: (id: string) => void;
  accessBildeliste: (id: string) => void;  // Updates lastAccessedAt
}

// Provider wraps entire app
<BildelisteProvider>
  <App />
</BildelisteProvider>
```

### BildelisteViewer Component
```tsx
interface BildelisteViewerProps {
  bildelisteId: string;
  onSelectImage?: (hothash: string) => void;
  selectedHothash?: string;
}

<BildelisteViewer
  bildelisteId={bildeliste.id}
  onSelectImage={(hash) => handleImageSelect(hash)}
  selectedHothash={currentSelection}
/>
```

**Features:**
- Thumbnail grid (3-5 columns, responsive)
- Uses hotpreview for fast loading
- Click-to-select with visual feedback (border highlight)
- Empty state messaging

### ImagePicker Component
```tsx
interface ImagePickerProps {
  onSelect: (hothash: string) => void;
  currentSelection?: string;
}

<ImagePicker
  onSelect={(hash) => setCoverImage({hash, alt: ''})}
  currentSelection={coverImage?.hash}
/>
```

**Features:**
- Tabbed interface (Collection, Search, Saved Search, Manual)
- Each tab shows BildelisteViewer for that type
- No manual hothash entry
- Visual selection only

---

## API Integration

### Endpoints Used

**GET /phototext**
```typescript
// List all stories
const stories = await apiClient.getPhotoTextList({
  document_type: 'general',
  is_published: false  // Drafts only
});
```

**POST /phototext**
```typescript
// Create new story
const story = await apiClient.createPhotoText({
  title: 'My Story',
  document_type: 'general',
  abstract: 'A short description',
  cover_image_hash: 'a1b2c3...',  // 64-char SHA256
  cover_image_alt: 'Cover image',
  is_published: false,
  content: {
    version: '1.0',
    documentType: 'general',
    title: 'My Story',
    abstract: 'A short description',
    blocks: [...]
  }
});
```

**GET /phototext/{id}**
```typescript
// Get story by ID
const story = await apiClient.getPhotoText(id);
```

**PUT /phototext/{id}**
```typescript
// Update story
const updated = await apiClient.updatePhotoText(id, {
  title: 'Updated Title',
  content: { ... }
});
```

**DELETE /phototext/{id}**
```typescript
// Delete story
await apiClient.deletePhotoText(id);
```

---

## Common Issues & Solutions

### Issue: 404 on Preview URLs
**Problem:** Hardcoded relative URLs (`/api/v1/photos/...`) point to localhost instead of API server

**Solution:** Always use `apiClient` methods:
```typescript
// ❌ Wrong
<img src="/api/v1/photos/abc123/coldpreview" />

// ✅ Correct
<img src={apiClient.getColdPreviewUrl('abc123')} />
```

### Issue: 401 Unauthorized on Coldpreview
**Problem:** No authentication token in request

**Solution:** Use `fetchColdPreview()` which includes Bearer token:
```typescript
// ❌ Wrong (no auth)
<img src={apiClient.getColdPreviewUrl(hash)} />

// ✅ Correct (includes auth)
const url = await apiClient.fetchColdPreview(hash);
<img src={url} />
```

### Issue: 422 Validation Error on Save
**Problem:** Content missing required fields (`version`, `title`)

**Solution:** Always include in content object:
```typescript
const content = {
  version: '1.0',        // Required
  documentType: 'general',
  title: title,          // Required (duplicate from root)
  abstract: abstract,    // Optional (duplicate from root)
  blocks: blocks
};
```

### Issue: Hash Format Error
**Problem:** Using `sha256_` prefix instead of pure hothash

**Solution:** Hothash is pure 64-character SHA256, no prefix:
```typescript
// ❌ Wrong
cover_image_hash: 'sha256_a1b2c3d4...'

// ✅ Correct
cover_image_hash: 'a1b2c3d4e5f6...'  // 64 hex chars
```

### Issue: Move Buttons Not Clickable
**Problem:** Positioned outside card with `absolute -left-12`

**Solution:** Place inside card with normal positioning:
```tsx
<Card>
  <CardContent>
    <div className="flex gap-2">
      <Button onClick={moveUp}>↑</Button>
      <Button onClick={moveDown}>↓</Button>
      <div className="flex-1">{content}</div>
      <Button onClick={delete}>🗑</Button>
    </div>
  </CardContent>
</Card>
```

---

## Future Enhancements

### Publishing Workflow
- Add publish/unpublish toggle
- Preview mode before publishing
- Published stories list (separate from drafts)

### Rich Text Formatting
- Bold, italic, underline in paragraphs
- Inline links
- Code blocks with syntax highlighting

### Image Galleries
- Multi-image blocks
- Grid layout options
- Lightbox viewer

### Drag-and-Drop
- Reorder blocks by dragging
- Visual drop zones
- Better mobile support

### Album & Slideshow Types
- Album: Photo-focused with minimal text
- Slideshow: Auto-advancing presentation mode
- Template selection on create

---

## Testing Checklist

### Create Story
- [ ] Navigate to `/stories/new`
- [ ] Enter title and abstract
- [ ] Select cover image
- [ ] Add heading block
- [ ] Add paragraph block
- [ ] Add image block with caption
- [ ] Add list block (ordered and unordered)
- [ ] Move blocks up/down
- [ ] Delete a block
- [ ] Save draft
- [ ] Verify redirect to story view

### View Story
- [ ] Open story from list
- [ ] Verify title displays correctly (5xl)
- [ ] Verify cover image (21:9 aspect)
- [ ] Verify abstract (italic, border-left)
- [ ] Verify headings (decreasing sizes)
- [ ] Verify paragraphs (serif body)
- [ ] Verify images (border, padding, caption)
- [ ] Verify lists (proper bullets/numbers)

### Edit Story
- [ ] Click "Edit" from story view
- [ ] Verify all content loads correctly
- [ ] Modify existing blocks
- [ ] Add new blocks
- [ ] Save changes
- [ ] Verify changes in view mode

### Image Selection
- [ ] Open ImagePicker
- [ ] Switch between tabs (Collection, Search, etc.)
- [ ] Click image to select
- [ ] Verify visual feedback (border)
- [ ] Confirm selection

### Preview URLs
- [ ] Verify thumbnails load (hotpreview)
- [ ] Verify large images load (coldpreview)
- [ ] Check browser Network tab for auth headers
- [ ] Verify caching (no duplicate requests)

---

## Developer Notes

### Code Organization
```
app/stories/
  page.tsx              # List view
  new/page.tsx          # Create new
  [id]/page.tsx         # View story
  [id]/edit/page.tsx    # Edit story

components/phototext/
  ImagePicker.tsx                # Image selection
  BildelisteViewer.tsx           # Grid viewer
  BildelisteContext.tsx          # State management
  stories/
    StoryEditor.tsx              # Block editor
    StoryViewer.tsx              # Article viewer
    StoryCard.tsx                # List card
```

### Key Dependencies
- `next/image` - Optimized image loading
- `react-hook-form` - Form management (if used)
- `@tanstack/react-query` - Data fetching and caching
- `shadcn/ui` - UI components (Button, Card, Dialog, etc.)

### Performance Considerations
- Use hotpreview for all thumbnails (fast, cached)
- Lazy-load coldpreview only when needed
- Cache coldpreview as Object URLs
- Clear cache on unmount to prevent memory leaks
- Use Next.js Image component with `fill` prop for responsive images

### Accessibility
- Provide alt text for all images
- Use semantic HTML (`<article>`, `<figure>`, `<figcaption>`)
- Ensure keyboard navigation works
- Test with screen readers

### Browser Compatibility
- Object URLs supported in all modern browsers
- LocalStorage has 5-10MB limit (sufficient for bildelister)
- Test in Chrome, Firefox, Safari, Edge

---

## Conclusion

The Stories implementation provides a solid foundation for creating and viewing articles with integrated photos. The block-based editor is intuitive, the blog layout is professional, and the bildeliste system makes image selection seamless.

Future enhancements will add publishing, rich text formatting, and additional document types (Album, Slideshow).

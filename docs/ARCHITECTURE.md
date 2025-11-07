# ImaLink Web - Frontend Arkitektur og Spesifikasjon

## Oversikt

ImaLink Web er en multi-page applikasjon (MPA) bygget med Next.js App Router som gir brukere full kontroll over sitt bildegalleri. Applikasjonen følger en streng state management-strategi med sentralisert tilstand og tydelig dataflyt.

---

## Navigasjonsstruktur

### Hovednivå
```
/                   - Home (Landing/Dashboard)
/browse             - Bildesøk og utforsking
/searches           - Lagrede søk (CRUD)
/collections        - Samlinger/Collections (CRUD)
/tags               - Tag-administrasjon
/organize           - Dual-pane organizer (drag & drop)
/statistics         - Statistikk og oversikt
/settings           - Brukerinnstillinger
```

### Fremtidige utvidelser (planlagt)
```
/stacks             - PhotoStack administrasjon
/map                - Kartvisning med GPS-data
/timeline           - Tidslinjevisning
/imports            - Import-historikk
```

### Implementerte utvidelser
```
/stories            - PhotoText Stories (artikler med bilder og tekst)
/stories/new        - Story editor (opprett ny)
/stories/[id]       - Story viewer (blog-layout)
/stories/[id]/edit  - Story editor (rediger)
```

---

## Side-for-side Spesifikasjon

### 1. Home (`/`)
**Formål**: Oversiktsside med viktig informasjon og snarveier

**Komponenter**:
- Hero-seksjon med velkomst
- Quick stats (total photos, recent uploads, tags, collections)
- Recent activity (siste 10 handlinger)
- Quick actions (New collection, Browse photos, View statistics)
- Siste brukte searches (5 stk)
- Featured collections (3-4 stk med cover images)

**State**: Read-only fra API (dashboard stats endpoint)

**API Calls**:
- `GET /api/v1/statistics/dashboard` (ny endpoint)

---

### 2. Browse (`/browse`)
**Formål**: Hovedvisning for å utforske og søke i bilder

**Layout**:
```
┌─────────────────────────────────────────┐
│ [Filters Sidebar] │ [Photo Grid]        │
│                   │                     │
│ Quick Filters     │  [Photo] [Photo]    │
│ - Search          │  [Photo] [Photo]    │
│ - Tags            │  [Photo] [Photo]    │
│ - Rating          │                     │
│ - Date Range      │  [Load More]        │
│                   │                     │
│ [Save Search]     │ [Selection: 0]      │
└─────────────────────────────────────────┘
```

**Features**:
- Real-time søk (debounced)
- Multi-select mode (checkbox overlay)
- Bulk actions (tag, rate, add to collection)
- Save current search
- Sort options (date, rating, name)
- View modes (grid, list, compact)

**State Management**:
```typescript
interface BrowseState {
  filters: SearchParams;
  photos: Photo[];
  selectedPhotos: Set<string>; // hothashes
  viewMode: 'grid' | 'list' | 'compact';
  sortBy: 'date' | 'rating' | 'name';
  sortOrder: 'asc' | 'desc';
  pagination: PaginationState;
}
```

**API Calls**:
- `GET /api/v1/photos` (with params)
- `POST /api/v1/photos/search` (advanced search)

---

### 3. Searches (`/searches`)
**Formål**: Administrere lagrede søk for rask gjenbruk

**Layout**:
```
┌─────────────────────────────────────────┐
│ Saved Searches                          │
│ ┌───────────────────────────────────┐   │
│ │ [+] New Search                    │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📁 Sunset Photos (45 results)       │ │
│ │    tags: sunset, landscape          │ │
│ │    rating: 4+                       │ │
│ │    [Run] [Edit] [Delete]            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📁 Norway Trip 2024 (234 results)   │ │
│ │    tags: norway, vacation           │ │
│ │    date: 2024-06-01 to 2024-06-30   │ │
│ │    [Run] [Edit] [Delete]            │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Data Model** (ny API-ressurs):
```typescript
interface SavedSearch {
  id: number;
  name: string;
  description?: string;
  search_params: SearchParams;
  result_count?: number; // cached
  created_at: string;
  updated_at: string;
  last_used_at?: string;
}
```

**Features**:
- CRUD for searches
- Run search → redirect to /browse with params
- Auto-update result count (background job)
- Sort by name, date, usage
- Search within searches (name/description)

**API Calls** (nye endpoints):
- `GET /api/v1/saved-searches`
- `POST /api/v1/saved-searches`
- `PUT /api/v1/saved-searches/{id}`
- `DELETE /api/v1/saved-searches/{id}`
- `POST /api/v1/saved-searches/{id}/run` → returns search results

---

### 4. Collections (`/collections`)
**Formål**: Organisere bilder i logiske grupper (albums)

**Layout**:
```
┌─────────────────────────────────────────┐
│ Collections                             │
│ ┌───────────────────────────────────┐   │
│ │ [+] New Collection                │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │ [Cover] │ │ [Cover] │ │ [Cover] │   │
│ │ Norway  │ │ Family  │ │ Best of │   │
│ │ 234 ph. │ │ 89 ph.  │ │ 56 ph.  │   │
│ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
```

**Detail View** (`/collections/{id}`):
```
┌─────────────────────────────────────────┐
│ ← Back to Collections                   │
│                                         │
│ Norway Trip 2024          [Edit] [⋮]   │
│ Summer vacation in beautiful Norway     │
│ 234 photos • Created Jun 1, 2024        │
│                                         │
│ [Photo Grid with collection photos]     │
│                                         │
│ [+ Add Photos] [Remove Selected]        │
└─────────────────────────────────────────┘
```

**Data Model** (ny API-ressurs):
```typescript
interface PhotoCollection {
  id: number;
  name: string;
  description?: string;
  cover_photo_hothash?: string;
  photo_count: number;
  created_at: string;
  updated_at: string;
  is_smart?: boolean; // future: auto-populate based on rules
  smart_rules?: SearchParams; // future
}

// Association table
interface CollectionPhoto {
  collection_id: number;
  photo_hothash: string;
  added_at: string;
  position?: number; // manual ordering
}
```

**Features**:
- CRUD for collections
- Add/remove photos (drag & drop, bulk select)
- Set cover photo
- Reorder photos (manual sorting)
- Smart collections (future: auto-populate based on search criteria)
- Export collection (future)

**API Calls** (nye endpoints):
- `GET /api/v1/collections`
- `POST /api/v1/collections`
- `GET /api/v1/collections/{id}`
- `PUT /api/v1/collections/{id}`
- `DELETE /api/v1/collections/{id}`
- `GET /api/v1/collections/{id}/photos`
- `POST /api/v1/collections/{id}/photos` (body: {photo_hothashes: []})
- `DELETE /api/v1/collections/{id}/photos/{hothash}`
- `PUT /api/v1/collections/{id}/photos/reorder` (body: {ordered_hothashes: []})

---

### 5. Tags (`/tags`)
**Formål**: Administrere tag-vokabularet

**Layout**:
```
┌─────────────────────────────────────────┐
│ Tags Management                         │
│ ┌───────────────────────────────────┐   │
│ │ 🔍 Search tags...                 │   │
│ └───────────────────────────────────┘   │
│                                         │
│ Sort by: [Name ▼] [Count] [Recent]     │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ landscape          [245 photos] [✎] │ │
│ │ sunset            [89 photos]   [✎] │ │
│ │ norway            [67 photos]   [✎] │ │
│ │ family            [45 photos]   [✎] │ │
│ │ vacation          [34 photos]   [✎] │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Merge Tags] [Delete Unused]            │
└─────────────────────────────────────────┘
```

**Features**:
- List all tags with photo counts
- Rename tag (affects all photos)
- Delete tag (removes from all photos)
- Merge tags (combine two tags)
- Bulk operations
- Click tag → browse photos with that tag
- Find similar tags (fuzzy matching)

**State**:
```typescript
interface TagsState {
  tags: Tag[];
  sortBy: 'name' | 'count' | 'date';
  searchQuery: string;
  selectedTags: Set<number>;
}
```

**API Calls** (existing):
- `GET /api/v1/tags`
- `PUT /api/v1/tags/{id}` (rename)
- `DELETE /api/v1/tags/{id}`
- New: `POST /api/v1/tags/merge` (body: {source_tag_id, target_tag_id})

---

### 6. Organize (`/organize`)
**Formål**: Dual-pane interface for å flytte bilder mellom collections

**Layout**:
```
┌─────────────────────────────────────────┐
│ Organize Collections                    │
│                                         │
│ Left Pane:  [Select Collection ▼]      │
│ Right Pane: [Select Collection ▼]      │
│                                         │
│ ┌─────────────┬─────────────┐          │
│ │ Collection A│Collection B │          │
│ │             │             │          │
│ │ [Photo]     │ [Photo]     │          │
│ │ [Photo] ━━━━━→ [Photo]    │          │
│ │ [Photo]     │ [Photo]     │          │
│ │             │             │          │
│ │ 45 photos   │ 23 photos   │          │
│ └─────────────┴─────────────┘          │
│                                         │
│ Selected: 3 photos                      │
│ [Move →] [← Move] [Copy →] [← Copy]    │
└─────────────────────────────────────────┘
```

**Features**:
- Select collection for each pane (dropdown)
- Drag & drop between panes
- Multi-select (cmd/ctrl + click)
- Move vs Copy operations
- Bulk actions
- Undo last operation
- Quick switch (swap left/right)

**State**:
```typescript
interface OrganizeState {
  leftPane: {
    collectionId: number | null;
    photos: Photo[];
    selectedPhotos: Set<string>;
  };
  rightPane: {
    collectionId: number | null;
    photos: Photo[];
    selectedPhotos: Set<string>;
  };
  operationHistory: Operation[]; // for undo
}
```

**Operations**:
- Move: Remove from source, add to target
- Copy: Add to target, keep in source
- Drag & drop: Automatic move/copy based on modifier key (shift = copy)

---

### 7. Statistics (`/statistics`)
**Formål**: Oversikt over galleristatistikk

**Layout**:
```
┌─────────────────────────────────────────┐
│ Gallery Statistics                      │
│                                         │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │ 1,234   │ │ 456 MB  │ │ 45      │   │
│ │ Photos  │ │ Storage │ │ Tags    │   │
│ └─────────┘ └─────────┘ └─────────┘   │
│                                         │
│ Photos by Rating                        │
│ ★★★★★ ████████████ 245                 │
│ ★★★★☆ ███████ 189                      │
│ ★★★☆☆ ████ 98                          │
│                                         │
│ Top Tags (by photo count)               │
│ 1. landscape (245)                      │
│ 2. sunset (189)                         │
│ 3. norway (167)                         │
│                                         │
│ Photos by Year                          │
│ [Bar chart: 2020-2025]                  │
│                                         │
│ Collections                             │
│ Total: 12 collections                   │
│ Largest: "Norway Trip" (234 photos)     │
└─────────────────────────────────────────┘
```

**Data**:
```typescript
interface GalleryStats {
  total_photos: number;
  total_size_bytes: number;
  total_tags: number;
  total_collections: number;
  photos_by_rating: Record<number, number>;
  photos_by_year: Record<number, number>;
  top_tags: Array<{name: string; count: number}>;
  largest_collection: {name: string; count: number};
  photos_with_gps: number;
  photos_without_tags: number;
}
```

**API Calls** (ny endpoint):
- `GET /api/v1/statistics/gallery`

---

## State Management Strategi

### Prinsipper

1. **Single Source of Truth**: All tilstand kommer fra API-et
2. **Optimistic Updates**: UI oppdateres umiddelbart, reverseres ved feil
3. **Immutable State**: Aldri mutere state direkte
4. **Local State**: Kun for UI-tilstand (modals, dropdown åpen, etc.)
5. **Server State**: Håndteres med React Query/SWR eller custom hooks

### State-hierarki

```
Global State (Context)
├── auth: AuthState (user, token)
├── ui: UIState (theme, sidebar collapsed)
└── [No application state here]

Page State (React Query)
├── photos (cached, auto-refetch)
├── collections (cached)
├── tags (cached)
├── searches (cached)
└── statistics (cached, stale-while-revalidate)

Component State (useState)
├── form inputs
├── modal visibility
├── dropdown open/closed
└── selection state (temporary)
```

### Data Fetching Pattern

```typescript
// Use React Query for all API calls
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Example: Fetch photos
function usePhotos(params: SearchParams) {
  return useQuery({
    queryKey: ['photos', params],
    queryFn: () => apiClient.getPhotos(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Example: Add photo to collection
function useAddToCollection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({collectionId, hothashes}: {collectionId: number, hothashes: string[]}) =>
      apiClient.addPhotosToCollection(collectionId, hothashes),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['collections', variables.collectionId]);
      queryClient.invalidateQueries(['photos']); // if they show collection membership
    },
  });
}
```

---

## URL State & Deep Linking

### Browse URL Format
```
/browse?q=sunset&tags=landscape,norway&rating_min=4&sort=date&order=desc&page=2
```

**Fordeler**:
- Shareable URLs
- Browser back/forward virker
- Bookmarkable searches
- URL er single source of truth for filters

### Implementation
```typescript
// Use Next.js searchParams
function BrowsePage({ searchParams }: { searchParams: Record<string, string> }) {
  const filters = parseSearchParams(searchParams);
  const { data, isLoading } = usePhotos(filters);
  
  function updateFilters(newFilters: Partial<SearchParams>) {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
      else params.delete(key);
    });
    router.push(`/browse?${params.toString()}`);
  }
  
  // ...
}
```

---

## Feilhåndtering

### Strategi

1. **Optimistic Updates**: Oppdater UI først, reverser ved feil
2. **Toast Notifications**: Vis feilmeldinger (non-blocking)
3. **Retry Logic**: Automatisk retry for nettverksfeil (3 forsøk)
4. **Fallback UI**: Vis feilmelding med "Try again" knapp
5. **Error Boundaries**: Fang React-feil og vis fallback

### Error Boundary Component
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <PhotoGrid />
</ErrorBoundary>
```

### Toast System
```typescript
import { toast } from 'sonner'; // eller react-hot-toast

// Success
toast.success('Photo added to collection');

// Error
toast.error('Failed to update photo', {
  action: {
    label: 'Retry',
    onClick: () => retry(),
  },
});
```

---

## Skalerbarhet & Fremtidige Utvidelser

### PhotoStacks (planlagt)

**Integrasjon**:
- Browse: Vis stack som "grouped" med badge (e.g., "📚 5 photos")
- Nytt view: `/stacks/{id}` for å se/administrere stack-innhold
- Organize: Støtte for å flytte hele stacks
- UI: Stack-indikator på PhotoCard

**API**: Allerede støttet i backend (`/api/v1/photo-stacks`)

### Map View (planlagt)

**Route**: `/map`
- Leaflet/Mapbox integration
- Cluster markers for mange bilder
- Click marker → photo preview
- Draw rectangle → select photos in area

### Timeline View (planlagt)

**Route**: `/timeline`
- Vertical timeline grouped by date
- Zoom levels (year/month/day/hour)
- Click to expand date range

### Import Management (planlagt)

**Route**: `/imports`
- List import sessions
- Re-run failed imports
- Batch operations on import

---

## Performance Optimisering

### Bilder
- Hotpreview (150x150) for grid view
- Coldpreview (800-1200) for detail view
- Lazy loading (react-intersection-observer)
- Virtual scrolling for large lists (react-window)

### Data
- Pagination (30-50 items per page)
- Infinite scroll option
- Cache med React Query (5 min stale time)
- Debounced search (300ms)

### Rendering
- React.memo for PhotoCard
- useMemo/useCallback for expensive operations
- Code splitting per route (automatic with Next.js)
- Lazy load heavy components (e.g., image editor)

---

## Testing Strategi

### Unit Tests
- Utility functions (date formatting, URL parsing)
- Custom hooks (usePhotos, useTags)
- State management logic

### Integration Tests
- API client methods
- Form submissions
- Multi-step workflows (e.g., create collection → add photos)

### E2E Tests (Playwright)
- Critical user journeys:
  1. Login → Browse → Select photos → Add to collection
  2. Create saved search → Run search
  3. Organize: Move photos between collections
  4. Tag management: Rename tag

---

## Teknisk Stack

### Core
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui

### State Management
- **Server State**: @tanstack/react-query
- **Global State**: React Context (minimal - auth only)
- **Form State**: react-hook-form + zod validation
- **URL State**: Next.js searchParams

### Data Fetching
- **HTTP Client**: Custom wrapper around fetch (lib/api-client.ts)
- **Caching**: React Query
- **Optimistic Updates**: React Query mutations

### UX Enhancements
- **Notifications**: sonner (toast)
- **Drag & Drop**: @dnd-kit/core
- **Date Picker**: react-day-picker
- **Icons**: lucide-react

---

## Mappestruktur

```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── (dashboard)/
│   ├── layout.tsx           # Shared layout with nav
│   ├── page.tsx             # Home/Dashboard
│   ├── browse/
│   │   ├── page.tsx
│   │   └── components/
│   ├── searches/
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── components/
│   ├── collections/
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── components/
│   ├── tags/
│   │   ├── page.tsx
│   │   └── components/
│   ├── organize/
│   │   ├── page.tsx
│   │   └── components/
│   └── statistics/
│       ├── page.tsx
│       └── components/
├── api/                     # API routes (if needed)
├── globals.css
└── layout.tsx

components/
├── ui/                      # shadcn components
├── layout/
│   ├── app-nav.tsx          # Main navigation
│   ├── app-sidebar.tsx
│   └── app-header.tsx
├── photos/
│   ├── photo-card.tsx
│   ├── photo-grid.tsx
│   ├── photo-detail-dialog.tsx
│   └── photo-selector.tsx
└── shared/
    ├── error-boundary.tsx
    ├── loading-spinner.tsx
    └── empty-state.tsx

lib/
├── api-client.ts            # API wrapper
├── types.ts                 # TypeScript types
├── hooks/
│   ├── use-photos.ts        # React Query hooks
│   ├── use-collections.ts
│   ├── use-tags.ts
│   └── use-searches.ts
├── utils/
│   ├── format.ts            # Formatting helpers
│   ├── url.ts               # URL parsing
│   └── validation.ts        # Zod schemas
└── contexts/
    ├── auth-context.tsx
    └── ui-context.tsx

docs/
├── ARCHITECTURE.md          # This file
├── API_INTEGRATION.md       # API endpoint mapping
└── DEVELOPMENT.md           # Development guide
```

---

## Prioritert Implementeringsplan

### Fase 1: Foundation (Uke 1-2)
- [x] Oppsett av prosjekt
- [x] API-klient
- [x] Autentisering
- [ ] React Query setup
- [ ] Ny layout med navigasjon
- [ ] Home-side (dashboard)

### Fase 2: Core Features (Uke 3-4)
- [ ] Browse-side (forbedret versjon)
- [ ] Collections (backend + frontend)
- [ ] Tags-administrasjon

### Fase 3: Advanced Features (Uke 5-6)
- [ ] Saved Searches (backend + frontend)
- [ ] Organize (dual-pane)
- [ ] Statistics-side

### Fase 4: Polish (Uke 7-8)
- [ ] Performance-optimalisering
- [ ] Error handling & toasts
- [ ] Testing (E2E critical flows)
- [ ] Dokumentasjon

### Fase 5: Future (Later)
- [ ] PhotoStacks support
- [ ] Map view
- [ ] Timeline view
- [ ] Import management

---

## PhotoText / Stories Implementation

### Overview
PhotoText er et system for å skrive artikler med integrerte bilder. Frontend bruker en block-basert editor med visuell bildevelger.

### Navigation
- `/stories` - List all stories (filter: all/drafts, sort: created/updated/title)
- `/stories/new` - Create new story
- `/stories/[id]` - View story (blog-style layout)
- `/stories/[id]/edit` - Edit story

### Content Structure
```typescript
interface PhotoTextDocument {
  id: string;
  user_id: string;
  title: string;
  document_type: 'general' | 'album' | 'slideshow';
  abstract?: string;
  cover_image_hash?: string;
  cover_image_alt?: string;
  is_published: boolean;
  content: PhotoTextContent;
  created_at: string;
  updated_at: string;
}

interface PhotoTextContent {
  version: '1.0';
  documentType: 'general' | 'album' | 'slideshow';
  title: string;           // Required, duplicated from root
  abstract?: string;       // Optional, duplicated from root
  blocks: PhotoTextBlock[];
}

type PhotoTextBlock = 
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | ListBlock;

interface HeadingBlock {
  id: string;
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

interface ParagraphBlock {
  id: string;
  type: 'paragraph';
  text: string;
}

interface ImageBlock {
  id: string;
  type: 'image';
  imageId: string;        // hothash (64-char SHA256)
  caption?: string;
  alt?: string;
}

interface ListBlock {
  id: string;
  type: 'list';
  ordered: boolean;
  items: string[];
}
```

### Block Editor (StoryEditor.tsx)
**Features:**
- Add blocks: Heading, Paragraph, Image, List
- Move blocks up/down (arrow buttons, always visible)
- Delete blocks
- Visual image picker from bildelister
- Cover image selection
- Coldpreview caching (lazy-loaded Object URLs)
- Auto-save to drafts

**Implementation Notes:**
- Move buttons inside card (not positioned absolutely)
- No drag-and-drop (uses up/down arrows)
- GripVertical icon removed (was non-functional)
- Content includes `version: "1.0"`, `title`, and `abstract`

### Story Viewer (StoryViewer.tsx)
**Layout (Blog-style):**
1. **Title** - Large sans-serif (5xl), bold, top of page
2. **Cover Image** - Wide format (21:9 aspect ratio)
3. **Abstract** - Italic, muted, left border, distinct styling
4. **Blocks**:
   - Headings: Sans-serif, decreasing sizes (H1: 4xl → H6: xl)
   - Paragraphs: Serif body text, relaxed leading
   - Images: Border + padding + caption in unified `<figure>`
   - Lists: Proper spacing, bullet/number styling

**Typography System:**
- Title: `text-5xl font-sans font-bold tracking-tight`
- Cover: `aspect-[21/9] object-cover`
- Abstract: `text-lg italic text-muted-foreground border-l-4 pl-4`
- H1: `text-4xl font-sans font-bold mt-12 mb-4`
- H2: `text-3xl font-sans font-bold mt-10 mb-3`
- H3: `text-2xl font-sans font-bold mt-8 mb-3`
- H4-H6: Decreasing sizes
- Body: `text-base leading-relaxed` (serif via prose)
- Images: `border rounded-lg p-4 bg-muted/20` with caption

### Image Preview URLs
**Policy:**
- **hotpreview** (`/api/v1/photos/{hothash}/hotpreview`)
  - Fast, cached, no authentication required
  - Used for: thumbnails, cards, grids, list views
  - Access: `apiClient.getHotPreviewUrl(hothash)`

- **coldpreview** (`/api/v1/photos/{hothash}/coldpreview`)
  - High quality, requires authentication (Bearer token)
  - Used for: large images in articles, editor previews, detailed viewing
  - Access: `apiClient.getColdPreviewUrl(hothash)` or `apiClient.fetchColdPreview(hothash)`

**Coldpreview Caching:**
```typescript
// In ApiClient class
private coldPreviewCache = new Map<string, string>();

async fetchColdPreview(hothash: string, width?: number, height?: number): Promise<string> {
  const cacheKey = `${hothash}-${width}-${height}`;
  if (this.coldPreviewCache.has(cacheKey)) {
    return this.coldPreviewCache.get(cacheKey)!;
  }

  try {
    // Fetch with Bearer token
    const blob = await fetch(coldpreviewUrl, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.blob());
    const objectUrl = URL.createObjectURL(blob);
    this.coldPreviewCache.set(cacheKey, objectUrl);
    return objectUrl;
  } catch (error) {
    // Fallback to hotpreview
    return this.getHotPreviewUrl(hothash, width, height);
  }
}

clearColdPreviewCache(): void {
  this.coldPreviewCache.forEach(url => URL.revokeObjectURL(url));
  this.coldPreviewCache.clear();
}
```

### Bildeliste System (Frontend-only)
**Purpose:** Temporary organization of images for selection in editors

**Types:**
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

**Storage:**
- LocalStorage (max 10 lists)
- Auto-cleanup by `lastAccessedAt` when over limit
- Key: `imalink-bildelister`

**BildelisteContext:**
- Global React Context managing all bildelister
- Methods: `createBildeliste()`, `updateBildeliste()`, `deleteBildeliste()`, `accessBildeliste()`
- Provides: `bildelister: Bildeliste[]`, `selectedBildelisteId?: string`

**BildelisteViewer Component:**
- Unified viewer for all types
- Thumbnail grid (3-5 columns, responsive)
- Uses hotpreview for thumbnails
- Click-to-select with visual feedback
- Integration with ImagePicker

**ImagePicker Component:**
- Tabbed interface (Collection, Search, Saved Search, Manual)
- Each tab shows BildelisteViewer for that type
- Click image → returns hothash to parent
- No manual hothash entry

### Current Limitations
- **Publishing**: Not implemented (all stories saved as drafts with `is_published: false`)
- **Album document type**: Defined but not implemented
- **Slideshow document type**: Defined but not implemented
- **Rich text formatting**: Bold, italic, links not yet in editor
- **Image galleries**: Multi-image blocks not yet in editor
- **Drag-and-drop blocks**: Uses up/down arrows instead

---

## Konklusjon

Denne arkitekturen gir:

✅ **Tydelig struktur**: Hver side har ett ansvar  
✅ **Skalerbar state**: React Query håndterer kompleksitet  
✅ **URL-drevet**: Deep linking og browser history virker  
✅ **Feilsikker**: Optimistic updates med rollback  
✅ **Utvidbar**: Enkel å legge til nye features  
✅ **Testbar**: Hver del kan testes isolert  
✅ **Performant**: Caching, lazy loading, virtualisering  

Neste steg er å implementere fase 1 og etablere fundamentet.

# ImaLink API Complete Specification v2.1

> **VIKTIG**: Dette er den komplette API-spesifikasjonen basert på eksisterende backend-implementasjon.  
> **Alle implementasjoner i frontend må følge denne spesifikasjonen nøyaktig.**

**Base URL**: `https://api.trollfjell.com/api/v1`  
**Authentication**: JWT Bearer tokens (påkrevd for alle endepunkter utenom auth/register og auth/login)

---

## 📑 Innholdsfortegnelse

1. [Authentication](#authentication)
2. [Photos](#photos)
3. [Tags](#tags)
4. [PhotoCollections](#photocollections) ⭐ **NYE ENDEPUNKTER**
5. [SavedPhotoSearches](#savedphotosearches) ⭐ **NYE ENDEPUNKTER**
6. [PhotoStacks](#photostacks)
7. [Authors](#authors)
8. [Import Sessions](#import-sessions)
9. [PhotoText Documents](#phototext-documents) ⭐ **NYE ENDEPUNKTER**
10. [Common Response Structures](#common-response-structures)

---

## 🔐 Authentication

### Register New User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123",
  "display_name": "John Doe"
}
```

**Response** (`201 Created`):
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "display_name": "John Doe",
  "is_active": true,
  "created_at": "2025-10-20T10:00:00Z",
  "updated_at": "2025-10-20T10:00:00Z"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepass123"
}
```

**Response** (`200 OK`):
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "display_name": "John Doe",
    "is_active": true
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

---

## 📸 Photos

### List Photos
```http
GET /photos?offset=0&limit=100
Authorization: Bearer <token>
```

**Query Parameters:**
- `offset` (int, default=0): Skip N photos
- `limit` (int, default=100, max=1000): Number of photos to return
- `author_id` (int, optional): Filter by author ID

**Response:**
```json
{
  "data": [
    {
      "hothash": "abc123def456...",
      "width": 4000,
      "height": 3000,
      "taken_at": "2025-10-15T14:30:00Z",
      "gps_latitude": 59.9139,
      "gps_longitude": 10.7522,
      "rating": 4,
      "author_id": 1,
      "stack_id": null,
      "tags": [
        {"id": 1, "name": "landscape"},
        {"id": 2, "name": "norway"}
      ],
      "image_files": [
        {
          "id": 123,
          "filename": "IMG_001.jpg",
          "file_size": 2048576,
          "file_type": "jpeg"
        }
      ],
      "created_at": "2025-10-20T10:00:00Z",
      "updated_at": "2025-10-20T10:00:00Z"
    }
  ],
  "meta": {
    "total": 250,
    "offset": 0,
    "limit": 100,
    "page": 1,
    "pages": 3
  }
}
```

### Search Photos (Ad-hoc)
```http
POST /photo-searches/ad-hoc
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "sunset beach",
  "rating_min": 3,
  "rating_max": 5,
  "taken_after": "2025-01-01T00:00:00Z",
  "taken_before": "2025-12-31T23:59:59Z",
  "author_id": 1,
  "tag_ids": [1, 5],
  "has_gps": true,
  "has_raw": false,
  "offset": 0,
  "limit": 50
}
```

**Response:** Same structure as List Photos

**Note:** Legacy endpoint `POST /photos/search` is deprecated but still works.

### Get Photo by Hash
```http
GET /photos/{hothash}
Authorization: Bearer <token>
```

**Response:** Single photo object (same structure as in list)

### Update Photo Metadata
```http
PUT /photos/{hothash}
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "author_id": 2,
  "gps_latitude": 60.0,
  "gps_longitude": 11.0
}
```

### Delete Photo
```http
DELETE /photos/{hothash}
Authorization: Bearer <token>
```

**Note:** Deletes the Photo record and all associated ImageFiles.

### Get Photo Hotpreview
```http
GET /photos/{hothash}/hotpreview
Authorization: Bearer <token>
```

**Returns:** JPEG image (150x150px thumbnail) as binary data

### Get Photo Coldpreview
```http
GET /photos/{hothash}/coldpreview?width=800&height=600
Authorization: Bearer <token>
```

**Query Parameters:**
- `width` (int, optional, 100-2000): Target width
- `height` (int, optional, 100-2000): Target height

**Returns:** JPEG image (medium-size preview) as binary data

---

## 🏷️ Tags

### List All Tags
```http
GET /tags?sort_by=name&order=asc
Authorization: Bearer <token>
```

**Response:**
```json
{
  "tags": [
    {
      "id": 1,
      "name": "landscape",
      "photo_count": 245,
      "created_at": "2024-10-20T10:00:00Z",
      "updated_at": "2024-10-22T15:30:00Z"
    }
  ],
  "total": 15
}
```

### Tag Autocomplete
```http
GET /tags/autocomplete?q=land&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "suggestions": [
    {
      "id": 1,
      "name": "landscape",
      "photo_count": 245
    }
  ]
}
```

### Add Tags to Photo
```http
POST /photos/{hothash}/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "tags": ["landscape", "sunset", "norway"]
}
```

### Remove Tag from Photo
```http
DELETE /photos/{hothash}/tags/{tag_name}
Authorization: Bearer <token>
```

### Rename Tag
```http
PUT /tags/{tag_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "new_name": "seascape"
}
```

### Delete Tag Completely
```http
DELETE /tags/{tag_id}
Authorization: Bearer <token>
```

---

## 📁 PhotoCollections

> **PhotoCollections** er statiske samlinger av bilder. Brukeren velger spesifikke bilder og lagrer dem i en samling med navn. Rekkefølgen på bildene er viktig og kan endres.

### Data Model

```typescript
interface PhotoCollection {
  id: number;
  user_id: number;
  name: string;                    // "Best of Italy 2024"
  description: string | null;      // Optional description
  hothashes: string[];             // Array of photo hothashes in order
  photo_count: number;             // Number of photos
  cover_photo_hothash: string | null;  // First photo (cover)
  created_at: string;              // ISO 8601
  updated_at: string;              // ISO 8601
}
```

### Create Collection
```http
POST /collections
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Best of Italy 2024",
  "description": "Favorite shots from our Italy trip",
  "hothashes": ["abc123...", "def456..."]  // Optional initial photos
}
```

**Response** (`201 Created`):
```json
{
  "id": 1,
  "user_id": 42,
  "name": "Best of Italy 2024",
  "description": "Favorite shots from our Italy trip",
  "hothashes": ["abc123...", "def456..."],
  "photo_count": 2,
  "cover_photo_hothash": "abc123...",
  "created_at": "2024-11-02T10:30:00Z",
  "updated_at": "2024-11-02T10:30:00Z"
}
```

**Validation:**
- ✅ `name`: Required, 1-255 characters, must be unique per user
- ✅ `description`: Optional, text
- ✅ `hothashes`: Optional array, photos must exist and belong to user
- ❌ **409 Conflict** if collection name already exists

### List Collections
```http
GET /collections?skip=0&limit=100
Authorization: Bearer <token>
```

**Response:**
```json
{
  "collections": [
    {
      "id": 1,
      "user_id": 42,
      "name": "Best of Italy 2024",
      "description": "...",
      "hothashes": ["abc123...", "def456..."],
      "photo_count": 2,
      "cover_photo_hothash": "abc123...",
      "created_at": "2024-11-02T10:30:00Z",
      "updated_at": "2024-11-02T10:30:00Z"
    }
  ],
  "total": 15
}
```

### Get Collection
```http
GET /collections/{collection_id}
Authorization: Bearer <token>
```

**Response:** Single collection object (same structure as in list)

### Update Collection Metadata
```http
PATCH /collections/{collection_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Italy Highlights 2024",      // optional
  "description": "Updated description"  // optional
}
```

**Note:** This endpoint only updates name/description, not photos.

### Delete Collection
```http
DELETE /collections/{collection_id}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

**Note:** Photos themselves are not deleted, only the collection.

### Add Photos to Collection
```http
POST /collections/{collection_id}/photos
Authorization: Bearer <token>
Content-Type: application/json

{
  "hothashes": ["ghi789...", "jkl012..."]
}
```

**Response:**
```json
{
  "collection_id": 1,
  "photo_count": 4,           // new count after addition
  "affected_count": 2,        // number actually added
  "cover_photo_hothash": "abc123..."
}
```

**Notes:**
- Photos appended to end of array
- Duplicates automatically skipped
- Photos must exist and belong to user

### Remove Photos from Collection
```http
DELETE /collections/{collection_id}/photos
Authorization: Bearer <token>
Content-Type: application/json

{
  "hothashes": ["def456..."]
}
```

**Response:**
```json
{
  "collection_id": 1,
  "photo_count": 3,
  "affected_count": 1,
  "cover_photo_hothash": "abc123..."
}
```

### Reorder Photos in Collection
```http
PUT /collections/{collection_id}/photos/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "hothashes": ["ghi789...", "abc123...", "jkl012..."]
}
```

**Response:**
```json
{
  "collection_id": 1,
  "photo_count": 3,
  "affected_count": 3,
  "cover_photo_hothash": "ghi789..."  // new first photo
}
```

**Requirements:**
- Must contain exactly same hothashes as current collection
- Only order changes, no additions/removals
- First photo becomes new cover photo
- ❌ **400 Bad Request** if hothashes don't match

### Get Collection Photos
```http
GET /collections/{collection_id}/photos?skip=0&limit=100
Authorization: Bearer <token>
```

**Response:** Array of Photo objects in collection order
```json
[
  {
    "hothash": "...",
    "width": 4000,
    ...
  }
]
```

### Cleanup Collection
```http
POST /collections/{collection_id}/cleanup
Authorization: Bearer <token>
```

**Response:**
```json
{
  "collection_id": 1,
  "removed_count": 2
}
```

**Note:** Removes hothashes that no longer exist in database (e.g., photos deleted).

---

## 🔍 SavedPhotoSearches

> **SavedPhotoSearches** er dynamiske søk som kan kjøres på nytt. Brukeren definerer søkekriterier (rating, tags, datoer, etc.) og lagrer dem for gjenbruk. Resultatet oppdateres hver gang søket kjøres.

### Data Model

```typescript
interface SavedPhotoSearch {
  id: number;
  user_id: number;
  name: string;                    // "Summer 2024 RAW files"
  description: string | null;      // Optional longer description
  search_criteria: PhotoSearchRequest;  // Search parameters as JSON
  is_favorite: boolean;            // Quick access
  result_count: number | null;     // Cached count from last execution
  last_executed: string | null;    // ISO 8601 timestamp
  created_at: string;              // ISO 8601
  updated_at: string;              // ISO 8601
}

interface PhotoSearchRequest {
  query?: string;                  // Text search
  rating_min?: number;             // 1-5
  rating_max?: number;             // 1-5
  taken_after?: string;            // ISO 8601
  taken_before?: string;           // ISO 8601
  author_id?: number;
  import_session_id?: number;
  tag_ids?: number[];              // Array of tag IDs
  has_gps?: boolean;
  has_raw?: boolean;
  offset?: number;                 // Pagination
  limit?: number;                  // Pagination
  sort_by?: string;                // "taken_at", "rating", "created_at"
  sort_order?: "asc" | "desc";
}
```

### Create Saved Search
```http
POST /photo-searches
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Summer 2024 RAW files",
  "description": "High quality RAW photos from summer vacation",
  "is_favorite": true,
  "search_criteria": {
    "author_id": 1,
    "import_session_id": 3,
    "tag_ids": [5],
    "rating_min": 4,
    "has_raw": true,
    "has_gps": true,
    "taken_after": "2024-06-01T00:00:00",
    "taken_before": "2024-08-31T23:59:59",
    "offset": 0,
    "limit": 100,
    "sort_by": "taken_at",
    "sort_order": "desc"
  }
}
```

**Response** (`201 Created`):
```json
{
  "id": 1,
  "user_id": 42,
  "name": "Summer 2024 RAW files",
  "description": "High quality RAW photos from summer vacation",
  "search_criteria": { ... },
  "is_favorite": true,
  "result_count": null,
  "last_executed": null,
  "created_at": "2024-11-02T10:30:00Z",
  "updated_at": "2024-11-02T10:30:00Z"
}
```

**Validation:**
- ✅ `name`: Required, 1-100 characters
- ✅ `description`: Optional, max 500 characters
- ✅ `search_criteria`: Must be valid PhotoSearchRequest dict
- ❌ **400 Bad Request** if search_criteria is invalid

### List Saved Searches
```http
GET /photo-searches?offset=0&limit=100&favorites_only=false
Authorization: Bearer <token>
```

**Query Parameters:**
- `offset` (int, default=0)
- `limit` (int, default=100, max=1000)
- `favorites_only` (bool, default=false): Show only favorites

**Response:**
```json
{
  "searches": [
    {
      "id": 1,
      "name": "Summer 2024 RAW files",
      "description": "...",
      "is_favorite": true,
      "result_count": 145,
      "last_executed": "2024-11-05T14:30:00Z",
      "created_at": "2024-11-02T10:30:00Z"
    }
  ],
  "total": 8,
  "offset": 0,
  "limit": 100
}
```

**Sorting:** Results ordered by:
1. `is_favorite` DESC (favorites first)
2. `last_executed` DESC NULLS LAST (recently used)
3. `created_at` DESC (newest first)

### Get Saved Search
```http
GET /photo-searches/{search_id}
Authorization: Bearer <token>
```

**Response:** Full SavedPhotoSearch object with all fields

### Update Saved Search
```http
PUT /photo-searches/{search_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Summer 2024 RAW files (5 stars only)",
  "search_criteria": {
    "author_id": 1,
    "rating_min": 5,
    "has_raw": true,
    "taken_after": "2024-06-01T00:00:00"
  }
}
```

**Fields:** All optional (name, description, search_criteria, is_favorite)

### Delete Saved Search
```http
DELETE /photo-searches/{search_id}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

### Execute Saved Search
```http
POST /photo-searches/{search_id}/execute?override_offset=0&override_limit=50
Authorization: Bearer <token>
```

**Query Parameters (optional):**
- `override_offset` (int, optional): Override pagination offset
- `override_limit` (int, optional, max=1000): Override pagination limit

**Response:** Same as ad-hoc search (paginated photo list)

**Side Effects:**
- Updates `result_count` with total results
- Updates `last_executed` to current timestamp

**Notes:**
- Override parameters don't modify the saved search
- Useful for pagination without changing saved criteria

---

## 🗂️ PhotoStacks

### List PhotoStacks
```http
GET /photo-stacks?offset=0&limit=50
Authorization: Bearer <token>
```

### Get PhotoStack Details
```http
GET /photo-stacks/{stack_id}
Authorization: Bearer <token>
```

### Create PhotoStack
```http
POST /photo-stacks
Authorization: Bearer <token>
Content-Type: application/json

{
  "stack_type": "panorama",
  "cover_photo_hothash": "abc123..."
}
```

### Update PhotoStack
```http
PUT /photo-stacks/{stack_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "stack_type": "burst",
  "cover_photo_hothash": "def456..."
}
```

### Delete PhotoStack
```http
DELETE /photo-stacks/{stack_id}
Authorization: Bearer <token>
```

### Add Photo to Stack
```http
POST /photo-stacks/{stack_id}/photo
Authorization: Bearer <token>
Content-Type: application/json

{
  "photo_hothash": "xyz789..."
}
```

### Remove Photo from Stack
```http
DELETE /photo-stacks/{stack_id}/photo/{photo_hothash}
Authorization: Bearer <token>
```

---

## 📚 Authors

### List Authors
```http
GET /authors?offset=0&limit=100
Authorization: Bearer <token>
```

### Get Author
```http
GET /authors/{author_id}
Authorization: Bearer <token>
```

### Create Author
```http
POST /authors
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "bio": "Professional landscape photographer"
}
```

### Update Author
```http
PUT /authors/{author_id}
Authorization: Bearer <token>
```

### Delete Author
```http
DELETE /authors/{author_id}
Authorization: Bearer <token>
```

---

## 📦 Import Sessions

### Create Import Session
```http
POST /import-sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "source_path": "/media/sdcard/DCIM",
  "description": "Birthday party photos",
  "author_id": 1
}
```

### Get Import Session
```http
GET /import-sessions/{import_id}
Authorization: Bearer <token>
```

### List Import Sessions
```http
GET /import-sessions?offset=0&limit=50
Authorization: Bearer <token>
```

### Update Import Session Status
```http
PATCH /import-sessions/{import_id}
Authorization: Bearer <token>
```

### Delete Import Session
```http
DELETE /import-sessions/{import_id}
Authorization: Bearer <token>
```

---

## � PhotoText Documents

PhotoText is a structured document format for photo-rich storytelling. Documents combine text and images using content-addressed storage (hothash references).

**Document Types:**
- `general` - Full-featured documents with text and images (blog posts, travel stories)
- `album` - Image-focused documents without free text (photo galleries, portfolios)
- `slideshow` - Single images for presentations

**Key Concepts:**
- All document processing happens in frontend using `@imalink/phototext` library
- Backend only stores/serves JSON (no processing required)
- Images referenced by `hothash` (same SHA256 as Photos)
- Content stored as JSONB with full PhotoText document structure

### List PhotoText Documents
```http
GET /phototext?document_type=general&is_published=true&sort_by=created_at&sort_order=desc&limit=20&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**
- `document_type` (optional): Filter by type (`general`, `album`, `slideshow`)
- `is_published` (optional): Filter by published status (boolean)
- `sort_by` (optional): Field to sort by (`created_at`, `modified_at`, `title`)
- `sort_order` (optional): Sort direction (`asc`, `desc`)
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "documents": [
    {
      "id": 1,
      "title": "Summer Vacation 2024",
      "document_type": "general",
      "abstract": "Our memorable trip to Italy",
      "cover_image_hash": "sha256_a1b2c3d4...",
      "cover_image_alt": "Rome skyline at sunset",
      "created_at": "2024-07-15T10:30:00Z",
      "modified_at": "2024-07-20T14:22:00Z",
      "is_published": true,
      "published_at": "2024-07-20T15:00:00Z"
    }
  ],
  "total": 42
}
```

### Get PhotoText Document
```http
GET /phototext/{document_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "title": "Summer Vacation 2024",
  "document_type": "general",
  "abstract": "Our memorable trip to Italy",
  "cover_image_hash": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
  "cover_image_alt": "Rome skyline at sunset",
  "content": {
    "version": "1.0",
    "documentType": "general",
    "title": "Summer Vacation 2024",
    "abstract": "Our memorable trip to Italy",
    "blocks": [
      {
        "type": "heading",
        "level": 1,
        "content": [{"type": "text", "text": "Rome"}]
      },
      {
        "type": "paragraph",
        "content": [
          {"type": "text", "text": "We visited the "},
          {"type": "bold", "text": "Colosseum"},
          {"type": "text", "text": "!"}
        ]
      },
      {
        "type": "image",
        "imageId": "photo_hothash_1",
        "alt": "Colosseum exterior",
        "caption": "The ancient amphitheater"
      }
    ]
  },
  "created_at": "2024-07-15T10:30:00Z",
  "updated_at": "2024-07-20T14:22:00Z",
  "is_published": true,
  "published_at": "2024-07-20T15:00:00Z"
}
```

### Create PhotoText Document
```http
POST /phototext
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Beach Photoshoot 2024",
  "document_type": "general",
  "abstract": "Professional portrait session",
  "cover_image": {
    "hash": "fedcba098765432109876543210987654321098765432109876543210987654",
    "alt": "Main portrait"
  },
  "content": {
    "version": "1.0",
    "documentType": "general",
    "title": "Beach Photoshoot 2024",
    "abstract": "Professional portrait session",
    "blocks": [
      {
        "type": "heading",
        "level": 2,
        "content": [{"type": "text", "text": "Morning Session"}]
      },
      {
        "type": "paragraph",
        "content": [{"type": "text", "text": "Started at sunrise with natural lighting."}]
      },
      {
        "type": "image",
        "imageId": "photo_hothash_1",
        "alt": "Portrait 1",
        "caption": "Golden hour portrait"
      }
    ]
  },
  "is_published": false
}
```

**Response** (`201 Created`):
```json
{
  "id": 2,
  "created_at": "2024-08-01T12:00:00Z"
}
```

### Update PhotoText Document
```http
PUT /phototext/{document_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "abstract": "Updated abstract",
  "cover_image": {
    "hash": "sha256_newcoverhash...",
    "alt": "New cover"
  },
  "content": { /* full PhotoText content structure */ },
  "is_published": true
}
```

**Response:**
```json
{
  "success": true
}
```

### Delete PhotoText Document
```http
DELETE /phototext/{document_id}
Authorization: Bearer <token>
```

**Response** (`204 No Content`)

**Notes:**
- `imageId` in PhotoText content blocks should reference photo `hothash`
- Frontend resolves hothash to image URLs via `/photos/{hothash}/coldpreview`
- `content` field contains complete PhotoText JSON structure
- Use `@imalink/phototext` library for document creation/editing/rendering
- Backend performs basic validation but does not process PhotoText content

---

## �📊 Common Response Structures

### PaginatedResponse
```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;    // Total number of items
    offset: number;   // Current offset
    limit: number;    // Items per page
    page: number;     // Current page (1-indexed)
    pages: number;    // Total number of pages
  };
}
```

### Error Response
```json
{
  "detail": "Error message here",
  "status_code": 400
}
```

### Common HTTP Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success with no response body
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Authenticated but not allowed
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

---

## 🔒 Authentication Headers

All protected endpoints require JWT token:
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Token Lifetime:** 30 minutes (configurable)  
**Refresh Strategy:** Re-login when token expires (refresh tokens not yet implemented)

---

## 🎯 Key Architectural Points

### Photo Identification
- Photos are identified by `hothash` (64-character SHA256 hash of hotpreview)
- NOT by numeric ID

### User Isolation
- All data operations automatically scoped to authenticated user
- Users cannot access other users' data

### Photo vs ImageFile
- **Photo**: Logical representation with visual data (hothash, dimensions, EXIF)
- **ImageFile**: Physical file metadata (filename, file_size, file_type)
- One Photo can have multiple ImageFiles (e.g., RAW + JPEG)

### Collections vs Saved Searches
- **PhotoCollections**: Static list of specific photos (like an album)
  - Manual curation
  - Ordered array
  - Photos can be deleted from database without breaking collection
- **SavedPhotoSearches**: Dynamic query criteria (like a smart album)
  - Automatic filtering
  - Results update when executed
  - Criteria-based, not photo-specific

---

## 📝 Implementation Notes

### Frontend Requirements

1. **TypeScript Types**: Create type definitions matching all data models
2. **API Client**: Centralized client with JWT token management
3. **Error Handling**: Proper handling of all HTTP status codes
4. **Pagination**: Support for offset/limit pagination
5. **Image Loading**: Configure for external images from api.trollfjell.com
6. **Date Handling**: All dates in ISO 8601 format

### State Management Strategy

- Use React Query for server state
- Photo list: `useQuery(['photos', params])`
- Collections: `useQuery(['collections'])`
- Saved searches: `useQuery(['savedSearches'])`
- Mutations: `useMutation` with optimistic updates
- URL-based state for filters and pagination

---

## Frontend Implementation Status

### Implemented Features

#### PhotoText / Stories
- **Stories Editor** (`/stories/new`, `/stories/[id]/edit`)
  - Block-based content editor with drag-and-drop reordering
  - Block types: Heading (H1-H6), Paragraph, Image, List (ordered/unordered)
  - Visual image picker with thumbnail preview (hotpreview)
  - Cover image selection with alt text
  - Title and abstract meta fields
  - Auto-save to drafts (is_published: false)
  
- **Stories Viewer** (`/stories/[id]`)
  - Blog-style layout with professional typography
  - Cover image: Wide format (21:9 aspect ratio)
  - Title: Large sans-serif (5xl)
  - Abstract: Italic with left border, distinct styling
  - Headings: Sans-serif, decreasing sizes (4xl → 3xl → 2xl...)
  - Body text: Serif font, relaxed leading
  - Images: Border + padding + caption in unified figure
  - Lists: Proper spacing and bullet/number styling
  
- **Stories List** (`/stories`)
  - Card grid with cover images (hotpreview)
  - Filter: All / Drafts only
  - Sort: Created date, Updated date, Title
  - Empty state messaging
  
- **Image Preview URLs**
  - **hotpreview**: Thumbnails, cards, grids (fast, cached, no auth required)
  - **coldpreview**: Large images, article content, editor previews (authenticated, lazy-loaded, cached as Object URLs)
  - Cache implementation: `apiClient.fetchColdPreview()` with Map<string, ObjectURL>
  
- **Bildeliste System** (Frontend-only abstraction)
  - Types: collection, search, saved-search, manual
  - LocalStorage persistence (max 10, auto-cleanup by lastAccessedAt)
  - Modified tracking for unsaved changes
  - Unified BildelisteViewer component
  - React Context for global state management
  - Integration with ImagePicker for visual selection
  
- **Image Selection**
  - Visual picker from bildelister (tabbed by type)
  - Thumbnail grid (3-5 columns, responsive)
  - Click-to-select with visual feedback
  - No manual hothash entry required

#### Photo Management
- Search with filters (date range, tags, rating, camera)
- Photo detail modal with EXIF data
- Collections (create, edit, add/remove photos)
- Photo stacks (view, unstack)
- Drag-and-drop import with progress tracking

### Known Limitations

- **Publishing**: Not yet implemented (all stories saved as drafts)
- **Album document type**: Planned but not implemented
- **Slideshow document type**: Planned but not implemented
- **Rich text formatting**: Bold, italic, links in editor not yet implemented
- **Image galleries**: Multi-image blocks not yet in editor
- **Drag-and-drop block reordering**: Uses up/down arrows instead

### Future Expansion

Features planned but not yet implemented:
- Refresh tokens for authentication
- Collection sharing between users
- Map view for GPS-tagged photos
- Timeline view
- Similar image search
- Batch operations
- PhotoText publishing workflow
- Album and Slideshow document types
- Bildeliste Organizer (drag-and-drop between lists)

---

**Last Updated:** November 5, 2025  
**API Version:** 2.1 (100% Photo-Centric)  
**Backend Version:** Fase 1 (Multi-User + PhotoStacks + PhotoCollections + SavedPhotoSearches)

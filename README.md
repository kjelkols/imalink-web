# ImaLink Web Frontend

Next.js frontend for ImaLink bildegalleri-system.

## 📋 Dokumentasjon

> **VIKTIG**: Les disse før implementering:
> - **[Komplett API-spesifikasjon](./docs/COMPLETE_API_SPECIFICATION.md)** - Full API-referanse basert på eksisterende backend
> - **[Arkitektur](./docs/ARCHITECTURE.md)** - Applikasjonsarkitektur og designbeslutninger

## Funksjoner

✅ **Autentisering**
- Login og registrering
- JWT bearer token håndtering
- Auth context med React hooks

✅ **Bildevisning**
- Responsiv photo grid med hot/cold preview
- Timeline visning
- Image lazy loading med Next.js Image
- Paginering (load more)

✅ **Metadata Redigering**
- Rating (1-5 stjerner)
- Tags (add/remove)
- Lokasjon (navn + koordinater)
- Stacks (grupper av bilder)

✅ **Søk & Filtrering**
- Tekst søk
- Tag filtering
- Rating range
- Dato range
- Avanserte filtre

✅ **Collections** (Photo Collections)
- Opprett og administrer samlinger
- Legg til/fjern bilder i samlinger
- Rediger samlingsnavn og beskrivelse
- Slett samlinger
- Vise cover photo og antall bilder

✅ **PhotoText / Stories** (Artikler med bilder og tekst)
- Block-basert editor (Heading, Paragraph, Image, List)
- Visual image picker fra bildelister
- Cover image med alt-tekst
- Title og abstract meta-felt
- Blog-stil layout med profesjonell typografi
- Hotpreview for thumbnails, coldpreview for store bilder
- Auto-save til drafts

✅ **Bildelister** (Frontend-only abstraksjon)
- Typer: collection, search, saved-search, manual
- LocalStorage persistence (max 10, auto-cleanup)
- React Context for global state
- Integration med ImagePicker
- Modified tracking for unsaved changes

⚠️ **Under Implementering** (API finnes, frontend mangler)
- 🔖 Saved Searches (dynamiske smart album)
- 📝 PhotoText publishing workflow
- 📚 Album document type
- 🎬 Slideshow document type

## Teknologier

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI komponenter
- **FastAPI Backend** - https://api.trollfjell.com

## Struktur

```
app/
  layout.tsx               # Root layout med AuthProvider
  page.tsx                 # Hovedside med photo grid
  stories/
    page.tsx               # Stories list med filter/sort
    new/page.tsx           # Story editor (new)
    [id]/page.tsx          # Story viewer
    [id]/edit/page.tsx     # Story editor (edit)

components/
  auth-form.tsx                          # Login/Register form
  photo-card.tsx                         # Enkelt bildekort
  photo-grid.tsx                         # Grid av bilder med paginering
  photo-detail-dialog.tsx                # Modal for redigering av metadata
  search-filters.tsx                     # Søk og filterkomponenter
  phototext/
    ImagePicker.tsx                      # Visual image picker fra bildelister
    BildelisteViewer.tsx                 # Unified bildeliste viewer
    BildelisteContext.tsx                # React Context for bildelister
    stories/
      StoryEditor.tsx                    # Block-basert content editor
      StoryViewer.tsx                    # Blog-style article viewer
      StoryCard.tsx                      # Story card for list view
  ui/                                    # shadcn/ui komponenter

lib/
  types.ts                 # TypeScript types for API
  api-client.ts            # API client med JWT + coldpreview caching
  auth-context.tsx         # Auth context og hooks
  utils.ts                 # Utility funksjoner
```

## Komme i gang

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Endpoints (Backend)

**Autentisering:**
- `POST /auth/login` - Login
- `POST /auth/register` - Registrering
- `GET /auth/me` - Hent current user

**Bilder:**
- `GET /photos` - Hent bilder (med paginering)
- `GET /photos/{id}` - Hent enkelt bilde
- `PATCH /photos/{id}/metadata` - Oppdater metadata
- `POST /photos/search` - Søk bilder
- `GET /api/v1/photos/{hothash}/hotpreview` - Fast cached thumbnail
- `GET /api/v1/photos/{hothash}/coldpreview` - Authenticated large preview

**Collections:**
- `GET /collections` - List all collections
- `POST /collections` - Create new collection
- `GET /collections/{id}` - Get collection details
- `PUT /collections/{id}` - Update collection
- `DELETE /collections/{id}` - Delete collection
- `POST /collections/{id}/photos` - Add photos to collection
- `DELETE /collections/{id}/photos/{photo_id}` - Remove photo from collection

**PhotoText:**
- `GET /phototext` - List all documents (filter by document_type, is_published)
- `POST /phototext` - Create new document
- `GET /phototext/{id}` - Get document by ID
- `PUT /phototext/{id}` - Update document
- `DELETE /phototext/{id}` - Delete document

**Tags & Stacks:**
- `GET /tags` - Hent alle tags
- `GET /stacks` - Hent alle stacks
- `POST /stacks` - Opprett ny stack

## Bruk

### Bildegalleri
1. **Login/Register:** Første gang du åpner appen vil du se login-skjermen
2. **Browse Photos:** Etter innlogging ser du alle bildene dine i et grid
3. **Search/Filter:** Bruk sidebar til venstre for å søke og filtrere
4. **Edit Metadata:** Klikk på et bilde for å åpne detaljvisning og redigere metadata
5. **Collections:** Opprett samlinger og organiser bilder i grupper

### Stories (PhotoText)
1. **Create Story:** Naviger til `/stories` og klikk "New Story"
2. **Add Content:** Bruk block editor til å legge til overskrifter, tekst, bilder og lister
3. **Select Images:** Klikk "Select Image" for å velge fra dine bildelister
4. **Save Draft:** Stories lagres automatisk som drafts (is_published: false)
5. **View Story:** Klikk på en story i listen for å se den i blog-layout

### Bildelister (Frontend-only)
Bildelister er en frontend-abstraksjon som lar deg organisere bilder midlertidig:
- **Collection bildeliste:** Basert på eksisterende collection fra backend
- **Search bildeliste:** Midlertidig søkeresultat
- **Saved-search bildeliste:** Basert på lagrede søk fra backend
- **Manual bildeliste:** Brukerdefinert liste med manuelt valgte bilder

Bildelister lagres i LocalStorage (max 10), sortert etter sist aksessert.

### Preview URL Policy
- **hotpreview:** Brukes for thumbnails, cards, grids - fast, cached, ingen autentisering
- **coldpreview:** Brukes for store bilder i artikler og editorer - høy kvalitet, krever autentisering
- Frontend cacher coldpreview som Object URLs for å redusere server-forespørsler

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

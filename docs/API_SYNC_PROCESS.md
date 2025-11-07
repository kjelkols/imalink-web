# API Specification Management

## 🎯 Mål

Sikre at frontend alltid er synkronisert med backend API-spesifikasjonen.

## 📋 Prosess

### Før Implementering av Nye Features

1. **Sjekk API-endringer:**
   ```bash
   ./scripts/sync-api-spec.sh
   ```

2. **Review endringer:**
   - Les `docs/openapi.json`
   - Sammenlign med `docs/COMPLETE_API_SPECIFICATION.md`
   - Identifiser nye/endrede endepunkter

3. **Oppdater dokumentasjon:**
   - Oppdater `COMPLETE_API_SPECIFICATION.md` manuelt
   - Beskriv nye data modeller
   - Legg til eksempler

4. **Oppdater types:**
   ```bash
   # Auto-generate hvis mulig
   npx openapi-typescript docs/openapi.json -o lib/api-types.generated.ts
   
   # Eller manuelt oppdater
   # lib/types.ts
   ```

5. **Implementer:**
   - Følg oppdatert spesifikasjon
   - Bruk genererte types hvis tilgjengelig

### Automatisk TypeScript Type Generering

**Installer verktøy:**
```bash
npm install -D openapi-typescript
```

**Legg til scripts i package.json:**
```json
{
  "scripts": {
    "api:sync": "bash scripts/sync-api-spec.sh",
    "api:types": "openapi-typescript docs/openapi.json -o lib/api-types.generated.ts",
    "predev": "npm run api:sync && npm run api:types",
    "prebuild": "npm run api:sync && npm run api:types"
  }
}
```

**Bruk i kode:**
```typescript
// lib/types.ts
import type { components } from './api-types.generated';

// Bruk backend-definerte types
export type Photo = components['schemas']['PhotoResponse'];
export type Collection = components['schemas']['PhotoCollectionResponse'];
export type SavedSearch = components['schemas']['SavedPhotoSearchResponse'];

// Eller extend hvis du trenger frontend-spesifikke felter
export interface PhotoWithUI extends Photo {
  isSelected?: boolean;
  isLoading?: boolean;
}
```

## 🔄 Workflow

### Scenario 1: Backend Legger Til Nytt Endepunkt

**Backend utvikler:**
1. Implementerer `POST /api/v1/collections/:id/share`
2. Oppdaterer OpenAPI schema
3. Deployer til staging

**Frontend utvikler:**
1. Kjører `npm run api:sync`
2. Ser ny endpoint i `docs/openapi.json`
3. Oppdaterer `COMPLETE_API_SPECIFICATION.md`:
   ```markdown
   ### Share Collection
   POST /api/v1/collections/{collection_id}/share
   ...
   ```
4. Kjører `npm run api:types` (genererer types)
5. Implementerer i `lib/api-client.ts`:
   ```typescript
   shareCollection(id: number, emails: string[]) {
     return this.post(`/collections/${id}/share`, { emails });
   }
   ```

### Scenario 2: Backend Endrer Data Model

**Backend utvikler:**
1. Legger til `cover_image_url` på Collection
2. Oppdaterer schema
3. Deployer

**Frontend utvikler:**
1. `npm run api:sync` → oppdager endring
2. Kjører `npm run api:types` → nye types genereres
3. TypeScript compiler feiler → må håndtere nytt felt
4. Oppdaterer komponenter:
   ```typescript
   {collection.cover_image_url && (
     <img src={collection.cover_image_url} />
   )}
   ```

## 🛡️ CI/CD Integration

### GitHub Actions (forslag)

```yaml
# .github/workflows/api-sync-check.yml
name: API Sync Check

on:
  pull_request:
    branches: [main]

jobs:
  check-api-sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Sync API spec
        run: ./scripts/sync-api-spec.sh
      
      - name: Check for changes
        run: |
          git diff --exit-code docs/openapi.json || \
          (echo "⚠️ API spec has changed! Review and update." && exit 1)
      
      - name: Generate types
        run: npm run api:types
      
      - name: Type check
        run: npm run type-check
```

## 📊 Versjonering

**Backend API Version Convention:**
- **Major**: Breaking changes (v1 → v2)
- **Minor**: New features (v2.1 → v2.2)
- **Patch**: Bug fixes (v2.1.0 → v2.1.1)

**Frontend Response:**
- **Major**: Må oppdatere base URL og alle calls
- **Minor**: Kan bruke nye features gradvis
- **Patch**: Ingen endringer nødvendig

## 🔍 Manual Review Checklist

Før hver release, sjekk:

- [ ] `npm run api:sync` kjørt
- [ ] `docs/COMPLETE_API_SPECIFICATION.md` oppdatert
- [ ] Nye endpoints dokumentert med eksempler
- [ ] TypeScript types generert
- [ ] `npm run type-check` passerer
- [ ] Alle tests passerer
- [ ] Breaking changes dokumentert i CHANGELOG

## 🎓 Best Practices

1. **Aldri hardkode response structures** - bruk genererte types
2. **Alltid kjør sync før ny feature** - unngå overraskelser
3. **Test mot staging først** - valider spec-match
4. **Versioner API-client** - gjør rollback mulig
5. **Dokumenter avvik** - hvis du MÅ avvike fra spec

## 🚨 Når Spesifikasjonen Er Ute av Sync

**Symptomer:**
- TypeScript errors om manglende felter
- Runtime errors: "undefined is not an object"
- HTTP 400/422 errors fra backend

**Løsning:**
```bash
# 1. Sync spec
npm run api:sync

# 2. Sammenlign endringer
git diff docs/openapi.json

# 3. Oppdater types
npm run api:types

# 4. Fix TypeScript errors
npm run type-check

# 5. Test
npm run dev
```

## 📞 Kommunikasjon

**Backend endrer API?**
→ Gi beskjed i Slack/Discord før deploy  
→ Oppdater OpenAPI spec først  
→ La frontend få tid til å tilpasse  

**Frontend trenger ny feature?**
→ Diskuter API design først  
→ Backend implementerer + dokumenterer  
→ Frontend implementerer etter spec er klar  

---

**Sist oppdatert:** 5. november 2025  
**Ansvarlig:** Utviklingsteam

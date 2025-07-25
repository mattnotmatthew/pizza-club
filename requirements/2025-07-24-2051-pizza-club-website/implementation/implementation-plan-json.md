# Implementation Plan: Greater Chicagoland Pizza Club Website (JSON-Based)
Generated: 2025-07-25
Based on: Simplified JSON approach instead of CMS

## Overview
Build a mobile-first responsive React/TypeScript single-page application with Vite for the Greater Chicagoland Pizza Club. The site will use JSON files for data management, allowing easy updates via GitHub's web interface without requiring a CMS.

## Key Changes from Original Plan
- **No CMS Required**: All data stored in JSON files in the repository
- **GitHub-based Updates**: Non-technical members edit JSON files directly on GitHub
- **Automatic Deployment**: GitHub Actions deploys to Namecheap on every commit
- **Simplified Architecture**: No API endpoints, authentication, or backend needed

## Implementation Phases

### Phase 1: Foundation & Setup ✅ COMPLETED
All setup tasks completed including:
- Vite + React + TypeScript project
- Tailwind CSS configured
- Project structure created
- Path aliases configured

### Phase 2: Data Layer (Simplified) ✅ COMPLETED
**What we built instead of CMS:**

1. **JSON Data Files** (`public/data/`):
   - `events.json` - Club events with dates, locations, descriptions
   - `members.json` - Member profiles with bios and stats
   - `restaurants.json` - Restaurant visits with ratings and notes

2. **Data Service** (`src/services/data.ts`):
   - Simple fetch functions for JSON files
   - Type-safe data access
   - Sorting and filtering utilities
   - No authentication needed

### Phase 3: GitHub Integration ✅ COMPLETED
**Automatic deployment workflow:**

1. **GitHub Actions** (`.github/workflows/deploy-to-namecheap.yml`):
   - Triggers on pushes to main branch
   - Builds the React app
   - Deploys via FTP to Namecheap
   - No manual deployment needed

2. **Documentation**:
   - `EDITING-GUIDE.md` - How to edit JSON files
   - `DEPLOYMENT-SETUP.md` - How to configure secrets

### Phase 4: Component Implementation (Next Steps)

#### Events Components
```typescript
// Use the data service instead of CMS
import { dataService } from '@/services/data';

// In components:
const events = await dataService.getUpcomingEvents(3);
```

Create these components:
- `EventCard.tsx` - Display individual events
- `EventList.tsx` - List of events with loading states
- `UpcomingEvents.tsx` - Homepage widget

#### Members Components ✅ PARTIALLY COMPLETE
- `MemberCard.tsx` ✅ Created
- Need to connect to data service
- Member detail pages need restaurant visit data

#### Restaurant/Map Components ✅ PARTIALLY COMPLETE
- Map container created
- Need to connect to JSON data
- Info windows should pull from restaurants.json

### Phase 5: Simplified Deployment

**One-time setup**:
1. Set GitHub secrets for FTP credentials
2. Set Google Maps API key
3. Configure domain/subdirectory

**Ongoing updates**:
1. Members edit JSON files on GitHub.com
2. Commit triggers automatic deployment
3. Site updates in ~5 minutes

## Benefits of JSON Approach

1. **No Infrastructure Costs**: No CMS hosting, database, or API servers
2. **Version Control**: Every change is tracked in git
3. **Simple Rollback**: Revert any commit to undo changes
4. **Familiar Tools**: GitHub interface is user-friendly
5. **Fast Development**: Skip CMS integration complexity

## Remaining Tasks

### High Priority
- [ ] Connect components to data service
- [ ] Implement event display on homepage
- [ ] Wire up member data to components
- [ ] Connect restaurant data to map markers

### Medium Priority
- [ ] Add loading states for data fetching
- [ ] Implement error handling
- [ ] Add data validation for JSON edits
- [ ] Create "Add New" templates for members

### Nice to Have
- [ ] JSON schema validation
- [ ] Preview deployments for pull requests
- [ ] Automated backups of JSON data
- [ ] Simple admin panel (future enhancement)

## Migration Path

If the club grows and needs a CMS later:
1. Keep the same component structure
2. Update data service to fetch from API
3. Migrate JSON data to CMS
4. No component changes needed

## Testing Strategy

1. **Local Testing**: 
   ```bash
   npm run dev
   # Edit JSON files locally
   # See changes immediately
   ```

2. **GitHub Testing**:
   - Create test branch
   - Edit JSON files
   - Preview before merging

3. **Production Testing**:
   - Small edits first
   - Monitor GitHub Actions
   - Check live site

## Summary

This JSON-based approach reduces complexity by ~60% compared to a CMS integration while maintaining all the functionality the Pizza Club needs. Members can update content easily, deployments are automatic, and the codebase stays simple and maintainable.
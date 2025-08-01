# Development Setup

## Prerequisites

- **Node.js**: v18+ recommended
- **npm**: v8+ (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended
- **PHP**: v8.2+ (for local API development)
- **MySQL/MariaDB**: For database backend

## Initial Setup

### 1. Clone the Repository
```bash
git clone [repository-url]
cd pizza-club-site
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env` file from example:
```bash
cp .env.example .env
```

Update with your values:
```env
# API Configuration (Required)
VITE_API_URL=https://greaterchicagolandpizza.club/pizza_api
VITE_UPLOAD_API_TOKEN=your-api-token

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
VITE_GOOGLE_MAPS_ID=your-map-id

# Upload API
VITE_UPLOAD_API_URL=https://greaterchicagolandpizza.club/pizza_upload/upload.php

# Admin Access
VITE_ADMIN_PASSWORD=your-admin-password
```

### 4. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173/pizza`

## Available Scripts

### Development
```bash
npm run dev        # Start Vite dev server with HMR
```

### Build
```bash
npm run build      # TypeScript check + Vite production build
```

### Linting
```bash
npm run lint       # Run ESLint
```

### Preview Production Build
```bash
npm run preview    # Preview production build locally
```

## Project Structure

```
pizza-club-site/
├── public/              # Static assets
│   ├── data/           # Legacy JSON files (not used)
│   ├── images/         # Static images
│   └── logo.png        # Club logo
├── server/              # Backend code
│   ├── api/            # PHP API
│   ├── database/       # Database scripts
│   └── upload/         # Photo upload handler
├── src/
│   ├── components/     # React components
│   ├── pages/          # Route pages
│   ├── hooks/          # Custom hooks
│   ├── services/       # Data services
│   ├── types/          # TypeScript types
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── docs/               # Project documentation
└── package.json        # Dependencies & scripts
```

## Development Workflow

### 1. Creating New Components

Place components in appropriate directories:
```typescript
// src/components/[category]/ComponentName.tsx
import React from 'react';

interface ComponentNameProps {
  // Props
}

const ComponentName: React.FC<ComponentNameProps> = (props) => {
  return <div>Component</div>;
};

export default ComponentName;
```

### 2. Adding New Pages

1. Create page component in `src/pages/`
2. Add lazy import in `App.tsx`:
```typescript
const NewPage = lazy(() => import('@/pages/NewPage'));
```
3. Add route:
```typescript
<Route path="new-page" element={<NewPage />} />
```

### 3. Working with Data

All data is managed through the API. The frontend uses:
- `src/services/api.ts` - API communication layer
- `src/services/dataWithApi.ts` - Data service using API

**Note**: JSON files in `public/data/` are legacy and not used in production.

### 4. TypeScript Types

Define interfaces in `src/types/index.ts`:
```typescript
export interface NewType {
  id: string;
  // Other properties
}
```

## Code Style Guide

### TypeScript/React
- Use functional components with TypeScript
- Define prop interfaces for all components
- Use explicit return types for functions
- Prefer `const` over `let`

### Naming Conventions
- **Components**: PascalCase (`MemberCard.tsx`)
- **Files**: Match component name
- **Hooks**: Start with 'use' (`useSort.ts`)
- **Types**: PascalCase for interfaces/types

### Import Order
1. React/external libraries
2. Components
3. Hooks/utilities
4. Types
5. Styles

Example:
```typescript
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/common/Card';
import { useSort } from '@/hooks/useSort';
import type { Member } from '@/types';
```

## Environment Configuration

### Path Aliases
The `@/` alias maps to `src/`:
```typescript
import Component from '@/components/Component';
// Instead of: import Component from '../../../components/Component';
```

### Base URL
Configured in `vite.config.ts`:
```typescript
base: '/pizza'  // App served from /pizza path
```

### API Development

#### Local API Setup
1. Install PHP 8.2+ with MySQL extension
2. Set up local MySQL database
3. Import schema:
   ```bash
   mysql -u root -p pizza_club < server/database/schema/complete-schema.sql
   ```
4. Update `server/api/config/Database.php` with local credentials
5. Run local PHP server:
   ```bash
   cd server/api
   php -S localhost:8000
   ```
6. Update `.env` for local API:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

#### API Testing
Test API endpoints:
```bash
# Health check
curl http://localhost:8000/health

# Get restaurants
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/restaurants
```

## Debugging

### Browser DevTools
- React Developer Tools extension recommended
- Use Network tab to monitor data fetching
- Console for error messages

### VS Code Debugging
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173/pizza",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

## Common Issues & Solutions

### 1. Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### 2. TypeScript Errors
```bash
# Check TypeScript compilation
npx tsc --noEmit
```

### 3. Missing Dependencies
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### 4. Build Failures
- Check for TypeScript errors first
- Ensure all imports are correct
- Verify environment variables are set
- Check API connectivity

### 5. API Connection Issues
- Verify `VITE_API_URL` is set correctly
- Check CORS configuration if using local API
- Ensure API token is valid
- Test API health endpoint directly

### 6. CORS Errors
For local development with production API:
- API includes CORS headers for common local ports
- If issues persist, use local API setup

## Performance Tips

### 1. Use React DevTools Profiler
- Identify slow renders
- Check unnecessary re-renders

### 2. Lazy Load Components
Already implemented for routes, extend to:
- Heavy components
- Modal contents
- Tab panels

### 3. Optimize Images
- Use appropriate formats (WebP, AVIF)
- Implement responsive images
- Add loading="lazy" attribute

## Testing (Future Enhancement)

Currently no tests, recommended setup:
```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/user-event

# Add test script to package.json
"test": "vitest"
```

## Deployment

### Build for Production
```bash
npm run build
```

Creates optimized build in `dist/` directory.

### Deployment Checklist
- [ ] Generate new API token for production
- [ ] Update production environment variables
- [ ] Run linting: `npm run lint`
- [ ] Build successfully: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Deploy API to server
- [ ] Run database migrations
- [ ] **Delete migration scripts after use**
- [ ] Update CORS for production domains only
- [ ] Verify API health endpoint

### Static Hosting
The build output can be deployed to any static hosting:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront

## Contributing Guidelines

1. **Branch Naming**
   - `feature/description`
   - `fix/issue-description`
   - `docs/what-documented`

2. **Commit Messages**
   - Use present tense
   - Be descriptive
   - Reference issues if applicable

3. **Pull Requests**
   - Update documentation if needed
   - Ensure linting passes
   - Test thoroughly

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router](https://reactrouter.com)
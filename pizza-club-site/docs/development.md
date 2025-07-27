# Development Setup

## Prerequisites

- **Node.js**: v18+ recommended
- **npm**: v8+ (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended

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

### 3. Start Development Server
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
│   ├── data/           # JSON data files
│   ├── images/         # Static images
│   └── logo.png        # Club logo
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

Add/modify JSON files in `public/data/`:
- `members.json` - Club member data
- `restaurants.json` - Restaurant information
- `events.json` - Club events

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
- Verify JSON data files are valid

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
- [ ] Run linting: `npm run lint`
- [ ] Build successfully: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Update data files if needed
- [ ] Verify base path configuration

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
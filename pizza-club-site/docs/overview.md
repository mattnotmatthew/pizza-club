# Project Overview

## Architecture

The Pizza Club Site follows a modern React application architecture with clear separation of concerns:

```
src/
├── components/       # Reusable UI components
│   ├── common/      # Shared components (Layout, Header, Footer, etc.)
│   ├── events/      # Event-specific components
│   ├── map/         # Map-related components
│   ├── members/     # Member-specific components
│   └── restaurants/ # Restaurant-specific components
├── pages/           # Route-level page components
├── hooks/           # Custom React hooks
├── services/        # Data fetching and API services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── styles/          # Global styles
```

## Tech Stack

### Core Dependencies
- **React 19.1.0** - UI library
- **React Router DOM 7.7.1** - Client-side routing
- **TypeScript 5.8.3** - Type safety
- **Vite 7.0.4** - Build tool and dev server

### UI & Styling
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **Custom CSS Variables** - For theme colors (e.g., `--color-pizza-red`)

### Mapping
- **@vis.gl/react-google-maps 1.5.4** - Google Maps integration

### HTTP Client
- **Axios 1.11.0** - Promise-based HTTP client

### Development Tools
- **ESLint** - Code linting with React and TypeScript support
- **Prettier** - Code formatting
- **PostCSS & Autoprefixer** - CSS processing

## Key Features

1. **Member Management** - View club members, their profiles, and visited restaurants
2. **Restaurant Directory** - Browse and rate pizza restaurants
3. **Restaurant Comparison** - Compare up to 4 restaurants side-by-side
4. **Interactive Map** - Visual representation of restaurant locations
5. **Event Tracking** - Manage and view club events
6. **Rating System** - Pizza slice-based rating visualization

## Routing Structure

The app uses React Router with lazy loading for performance:

- `/` - Home page
- `/members` - Members list
- `/members/:id` - Individual member details
- `/restaurants` - Restaurant directory
- `/restaurants/compare` - Restaurant comparison tool
- `/events` - Events listing
- `/test` - Development test page

## Data Management

The application uses:
- Static JSON files in `public/data/` for data storage
- Service layer (`services/data.ts`) for data fetching
- React's built-in state management
- No external state management library (Redux, MobX, etc.)

## Build Configuration

- **Path Aliases**: `@/` maps to `src/` directory
- **TypeScript**: Strict mode enabled with separate configs for app and node
- **Base Path**: `/pizza` for deployment
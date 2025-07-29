# Pizza Club Site Documentation

Welcome to the Pizza Club Site documentation. This documentation provides a comprehensive overview of the web application's architecture, patterns, and implementation details.

## 📁 Documentation Structure

### Core Documentation
- **[Overview](./overview.md)** - High-level architecture and tech stack
- **[Components Guide](./components.md)** - Component patterns and usage
- **[Hooks & Utilities](./hooks-utilities.md)** - Custom hooks and utility functions
- **[Data Flow](./data-flow.md)** - API patterns and data management
- **[Routing](./routing.md)** - Page structure and navigation
- **[Development Setup](./development.md)** - Getting started and local development

### Features
- **[Restaurant Comparison](./restaurant-comparison.md)** - Side-by-side restaurant comparison feature
- **[Dynamic Rating Categories](./dynamic-rating-categories.md)** - Flexible rating system that adapts to data
- **[Infographics Generator](./features/infographics/overview.md)** - Admin tool for creating visit infographics
  - [Authentication Setup](./features/infographics/authentication.md)
  - [Data Model](./features/infographics/data-model.md)
  - [Component Reference](./features/infographics/components.md)
  - [Implementation Guide](./features/infographics/implementation-guide.md)

### Design & Implementation
- **[Styling Guide](./styling.md)** - CSS patterns and Tailwind conventions
- **[Homepage Redesign](./homepage-redesign.md)** - Homepage implementation details and patterns
- **[Design Patterns](./patterns.md)** - Reusable patterns and best practices

### Operations
- **[Maintenance Guide](./maintenance.md)** - Maintenance tasks and troubleshooting

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## 🏗️ Project Overview

The Pizza Club Site is a React-based web application built with:
- **React 19.1** with TypeScript
- **Vite** for fast development and building
- **React Router DOM** for client-side routing
- **Tailwind CSS** for styling
- **Google Maps API** for restaurant locations

The app serves as a platform for a pizza enthusiast club to track members, restaurants, ratings, and events.
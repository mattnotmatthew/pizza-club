# Type Guards & Environment Utilities

## Overview

This document covers TypeScript type guards and environment utilities for runtime validation and configuration.

## Type Guards

Useful for runtime type checking:

```typescript
// utils/guards.ts
export const isMember = (obj: any): obj is Member => {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
};

export const isRestaurant = (obj: any): obj is Restaurant => {
  return obj && obj.coordinates && typeof obj.averageRating === 'number';
};
```

### Usage Examples

```typescript
// Validate API responses
const response = await fetch('/api/members');
const data = await response.json();

if (Array.isArray(data) && data.every(isMember)) {
  // Safe to use as Member[]
  setMembers(data);
}

// Runtime validation in components
const restaurant = getRestaurantFromProps(props);
if (isRestaurant(restaurant)) {
  // TypeScript knows this is a Restaurant
  displayRestaurant(restaurant);
}
```

## Environment Utilities

The app uses Vite's environment variables for configuration:

### Current Usage
- `import.meta.env.BASE_URL` - Used for data fetching paths
- `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` - Google Maps integration
- `import.meta.env.VITE_API_URL` - Backend API endpoint
- `import.meta.env.VITE_UPLOAD_API_TOKEN` - Authentication token

### Recommended Extensions

```typescript
// utils/env.ts
export const getApiUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error('VITE_API_URL environment variable is required');
  }
  return apiUrl;
};

export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

export const getFeatureFlag = (flag: string): boolean => {
  return import.meta.env[`VITE_FEATURE_${flag}`] === 'true';
};
```

### Feature Flags Usage

```typescript
// Enable/disable features based on environment
if (getFeatureFlag('ENABLE_COMPARISON')) {
  // Show comparison feature
}

if (getFeatureFlag('DEBUG_MODE')) {
  // Show debug information
}
```

## Related Files

- [Custom Hooks](../hooks/custom-hooks.md) - Application-specific React hooks
- [General Utilities](./general-utilities.md) - Helper functions and utilities
- [Image Utilities](./image-utilities.md) - Image processing and storage utilities
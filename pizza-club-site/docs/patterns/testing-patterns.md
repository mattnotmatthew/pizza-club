# Testing Patterns

## Overview

This document covers testing patterns and best practices for the Pizza Club application.

## Component Testing Structure

### Basic Component Testing
```typescript
describe('Component', () => {
  it('renders with required props', () => {
    render(<Component requiredProp="value" />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
  
  it('handles user interaction', async () => {
    const handleClick = jest.fn();
    render(<Component onClick={handleClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Testing Custom Hooks
```typescript
describe('useCustomHook', () => {
  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useCustomHook());
    
    expect(result.current.value).toBe(initialValue);
    expect(result.current.loading).toBe(false);
  });
  
  it('updates state when action is called', () => {
    const { result } = renderHook(() => useCustomHook());
    
    act(() => {
      result.current.updateValue('new value');
    });
    
    expect(result.current.value).toBe('new value');
  });
});
```

## Integration Testing

### API Integration Tests
```typescript
describe('API Integration', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('fetches and displays data correctly', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: mockData }));
    
    render(<DataComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('Expected data')).toBeInTheDocument();
    });
    
    expect(fetchMock).toHaveBeenCalledWith('/api/data');
  });
  
  it('handles API errors gracefully', async () => {
    fetchMock.mockRejectOnce(new Error('API Error'));
    
    render(<DataComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading data')).toBeInTheDocument();
    });
  });
});
```

## Accessibility Testing

### Screen Reader Testing
```typescript
describe('Accessibility', () => {
  it('provides proper ARIA labels', () => {
    render(<Button onClick={jest.fn()}>Close</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Close dialog');
  });
  
  it('supports keyboard navigation', async () => {
    const handleKeyDown = jest.fn();
    render(<Component onKeyDown={handleKeyDown} />);
    
    const element = screen.getByTestId('interactive-element');
    await userEvent.type(element, '{enter}');
    
    expect(handleKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'Enter' })
    );
  });
});
```

## Mock Patterns

### Service Mocking
```typescript
// Mock the entire service module
jest.mock('@/services/dataService', () => ({
  getMembers: jest.fn(),
  getRestaurants: jest.fn(),
  saveData: jest.fn()
}));

const mockDataService = dataService as jest.Mocked<typeof dataService>;

describe('Component with API calls', () => {
  beforeEach(() => {
    mockDataService.getMembers.mockResolvedValue(mockMembers);
  });
  
  it('renders data from API', async () => {
    render(<MembersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    expect(mockDataService.getMembers).toHaveBeenCalledTimes(1);
  });
});
```

### Environment Variable Mocking
```typescript
describe('Environment dependent features', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });
  
  afterEach(() => {
    process.env = originalEnv;
  });
  
  it('behaves differently in development', () => {
    process.env.NODE_ENV = 'development';
    
    render(<DevFeature />);
    
    expect(screen.getByTestId('debug-panel')).toBeInTheDocument();
  });
});
```

## End-to-End Testing Patterns

### Page Object Model
```typescript
class RestaurantsPage {
  async navigateToComparison() {
    await page.click('[data-testid="compare-button"]');
    await page.waitForSelector('[data-testid="comparison-view"]');
  }
  
  async selectRestaurant(name: string) {
    await page.click(`[data-testid="restaurant-${name}"] input[type="checkbox"]`);
  }
  
  async getSelectedCount() {
    return await page.$$eval(
      '[data-testid^="restaurant-"] input:checked',
      elements => elements.length
    );
  }
}

describe('Restaurant Comparison', () => {
  const restaurantsPage = new RestaurantsPage();
  
  it('allows selecting up to 4 restaurants', async () => {
    await restaurantsPage.navigateToComparison();
    
    await restaurantsPage.selectRestaurant('pizza-place-1');
    await restaurantsPage.selectRestaurant('pizza-place-2');
    
    const count = await restaurantsPage.getSelectedCount();
    expect(count).toBe(2);
  });
});
```

## Performance Testing

### Render Performance
```typescript
describe('Performance', () => {
  it('renders large lists efficiently', () => {
    const startTime = performance.now();
    
    render(<LargeList items={Array(1000).fill(mockItem)} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(100); // 100ms threshold
  });
});
```

## Related Files

- [Component Patterns](./component-patterns.md) - React component design patterns
- [Accessibility Patterns](./accessibility-patterns.md) - WCAG compliance and accessibility patterns
- [Development Guide](../development.md) - Development setup and workflow
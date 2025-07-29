# Infographics Authentication

## Overview

The infographics feature uses a simple password-based authentication system to restrict access to admin functionality. This is appropriate for a small team where only one or two people need admin access.

## Setup

### 1. Environment Variable

Add to your `.env` file:
```env
VITE_ADMIN_PASSWORD=your_secure_password_here
```

**Important**: 
- Never commit the `.env` file to version control
- Use a strong, unique password
- The `VITE_` prefix makes it available to the client code

### 2. Development Access

During development, you can access admin areas using:
- Password prompt: Navigate to `/admin/infographics` and enter password
- URL parameter: `/admin/infographics?password=your_password`
- The password is removed from URL after successful auth

## How It Works

### AdminRoute Component

Located at `/src/components/admin/AdminRoute.tsx`

```typescript
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  // 1. Check session storage for existing auth
  // 2. Verify against VITE_ADMIN_PASSWORD
  // 3. Show prompt if needed
  // 4. Redirect to home if auth fails
  return isAuthenticated ? children : <Navigate to="/" />;
};
```

### Key Features

1. **Session Persistence**: Auth stored in sessionStorage
   - Survives page refreshes
   - Cleared when browser closes
   - Separate from localStorage (used for drafts)

2. **Security Measures**:
   - Password removed from URL after auth
   - No password = no access (fails safe)
   - Session-based, not permanent

3. **User Experience**:
   - Loading state during auth check
   - Clear error messages
   - Quick logout from admin header

## Usage in Routes

```typescript
// In App.tsx
<Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
  <Route path="infographics" element={<InfographicsList />} />
  <Route path="infographics/new" element={<InfographicsEditor />} />
</Route>
```

## Security Considerations

### Current Implementation
- ✅ Password never exposed in code
- ✅ Environment variable configuration
- ✅ Session-based authentication
- ✅ Automatic redirect for unauthorized

### Limitations
- ⚠️ Password visible in browser tools (client-side)
- ⚠️ No user management or roles
- ⚠️ Single shared password

### Future Improvements
For production use, consider:
1. Server-side authentication
2. JWT tokens
3. User accounts with roles
4. OAuth integration
5. Rate limiting

## Troubleshooting

### "Admin password not configured"
- Ensure `.env` file exists
- Check for typo in `VITE_ADMIN_PASSWORD`
- Restart dev server after adding env var

### Can't access after correct password
- Check browser console for errors
- Clear session storage and try again
- Verify no special characters breaking the comparison

### Password prompt keeps appearing
- Session storage might be disabled
- Try different browser
- Check for browser extensions blocking storage
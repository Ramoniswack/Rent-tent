# NomadNotes Frontend (Next.js)

Modern Next.js frontend for the NomadNotes application with unified Header and Footer components.

## Setup Complete ✅

The following has been set up:

### Components
- ✅ `components/Header.tsx` - Unified navigation header with authentication
- ✅ `components/Footer.tsx` - Unified footer with branding

### Hooks
- ✅ `hooks/useAuth.tsx` - Authentication context and hook

### Pages Created
- ✅ `/` - Home page (redirects to /features)
- ✅ `/features` - Features showcase page

### Configuration
- ✅ Tailwind CSS configured
- ✅ TypeScript configured
- ✅ lucide-react installed for icons
- ✅ Inter font configured
- ✅ AuthProvider wrapped in root layout

## Getting Started

```bash
# Install dependencies (already done)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # Home page (redirects to features)
│   ├── globals.css         # Global styles
│   └── features/
│       └── page.tsx        # Features page
├── components/
│   ├── Header.tsx          # Navigation header
│   └── Footer.tsx          # Footer component
├── hooks/
│   └── useAuth.tsx         # Authentication hook
├── types.ts                # TypeScript types
└── package.json
```

## Pages to Migrate

The following pages from `nomad/pages` still need to be migrated to Next.js:

### Priority Pages
1. **GearRentalNew.tsx** → `app/gear/page.tsx`
   - Gear marketplace with filters
   - Pagination
   - Mock data with 6 items

2. **GearDetailNew.tsx** → `app/gear/[id]/page.tsx`
   - Dynamic route for gear details
   - Image gallery
   - Booking card

3. **AboutNew.tsx** → `app/about/page.tsx`
   - About page with company info

4. **ContactNew.tsx** → `app/contact/page.tsx`
   - Contact form and information

### Additional Pages (Optional)
5. **AccountNew.tsx** → `app/account/page.tsx`
6. **MessagesNew.tsx** → `app/messages/page.tsx`
7. **LoginNew.tsx** → `app/login/page.tsx`

## Migration Steps for Each Page

1. Create the appropriate folder structure in `app/`
2. Create `page.tsx` file
3. Add `'use client';` directive at the top
4. Replace `useNavigate` with `useRouter` from `next/navigation`
5. Replace `useLocation` with `usePathname` from `next/navigation`
6. Replace `navigate()` calls with `router.push()`
7. Import Header and Footer components
8. Test the page

## Design System

### Colors
- Primary: `#059467` (Emerald Green)
- Dark Background: `#0f231d`
- Light Background: `#f5f8f7`
- Text Dark: `#0f172a`
- Text Light: `#ffffff`

### Typography
- Font Family: Inter (configured in layout.tsx)
- Headings: Bold, tracking-tight
- Body: Regular, antialiased

### Components
- Buttons: `rounded-full`, emerald green primary
- Cards: `rounded-xl`, subtle shadows
- Inputs: `rounded-full`, border focus states
- Navigation: Active state with emerald background

## Key Differences from React Router

### Navigation
```tsx
// React Router (nomad)
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/path');

// Next.js (frontend)
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/path');
```

### Current Path
```tsx
// React Router (nomad)
import { useLocation } from 'react-router-dom';
const location = useLocation();
const path = location.pathname;

// Next.js (frontend)
import { usePathname } from 'next/navigation';
const pathname = usePathname();
```

### Client Components
All interactive components need `'use client';` directive at the top.

## Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## API Integration

The backend API is still running at `http://localhost:5000`. Update the API calls to use the environment variable:

```tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
```

## Authentication

Authentication is handled via the `useAuth` hook:

```tsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, status, login, logout } = useAuth();
  
  // user: User object or null
  // status: 'loading' | 'authenticated' | 'unauthenticated'
  // login(token, userData): Function to log in
  // logout(): Function to log out
}
```

## Next Steps

1. Migrate remaining pages from nomad to frontend
2. Set up API service layer
3. Add loading states
4. Add error boundaries
5. Implement dark mode toggle
6. Add page transitions
7. Set up deployment

## Development Notes

- The app uses Next.js 15 with App Router
- Tailwind CSS is configured with custom colors
- lucide-react provides all icons
- TypeScript is enabled for type safety
- ESLint is configured for code quality

## Troubleshooting

### Port Already in Use
If port 3000 is already in use (by nomad app), run on a different port:
```bash
npm run dev -- -p 3001
```

### Build Errors
Make sure all client components have `'use client';` directive.

### Type Errors
Check that all imports are correct and types are defined in `types.ts`.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

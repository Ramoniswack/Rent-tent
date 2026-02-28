# NomadNotes Frontend (Next.js)

Modern Next.js frontend for the NomadNotes application - a comprehensive travel platform with gear rental, trip planning, and social matching features.

## Latest Features ✨

### Newsletter Subscription
- Footer newsletter subscription form with email validation
- Success/error message handling
- Auto-clearing messages after 5 seconds
- Responsive design for all devices

### Admin Settings
- Dynamic footer menu management (Product & Company menus)
- Site settings configuration (branding, social links, etc.)
- Real-time updates without page refresh

### Email Notifications
- Welcome emails on registration
- Order confirmation emails for gear rentals
- Match notification emails
- Newsletter welcome emails with beautiful HTML templates

## Setup Complete ✅

### Core Components
- ✅ `components/Header.tsx` - Unified navigation header with authentication
- ✅ `components/Footer.tsx` - Dynamic footer with newsletter subscription
- ✅ `components/NotificationCenter.tsx` - Real-time notifications
- ✅ `components/MatchSuccess.tsx` - Match celebration modal

### Hooks
- ✅ `hooks/useAuth.tsx` - Authentication context and hook
- ✅ `hooks/useNotifications.ts` - Real-time notification management
- ✅ `hooks/useOfflineSync.ts` - Offline data synchronization

### Key Features
- ✅ Trip Planning & Management
- ✅ Gear Rental Marketplace
- ✅ Social Matching System
- ✅ Real-time Messaging
- ✅ Offline Mode Support
- ✅ PWA (Progressive Web App)
- ✅ Admin Dashboard
- ✅ Dynamic Content Management
- ✅ Newsletter Subscription

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_firebase_vapid_key
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   ├── admin/                  # Admin dashboard
│   │   ├── settings/           # Site settings management
│   │   └── pages/              # Dynamic page editor
│   ├── gear/                   # Gear rental marketplace
│   ├── trips/                  # Trip planning
│   ├── match/                  # Social matching
│   ├── messages/               # Real-time messaging
│   ├── notifications/          # Notification center
│   ├── account/                # User account settings
│   └── ...
├── components/
│   ├── Header.tsx              # Navigation header
│   ├── Footer.tsx              # Dynamic footer with newsletter
│   ├── NotificationCenter.tsx  # Real-time notifications
│   ├── MatchSuccess.tsx        # Match celebration
│   └── ...
├── hooks/
│   ├── useAuth.tsx             # Authentication
│   ├── useNotifications.ts     # Notifications
│   └── useOfflineSync.ts       # Offline sync
├── lib/
│   ├── db.ts                   # IndexedDB for offline
│   └── cloudinary.ts           # Image uploads
├── services/
│   └── api.ts                  # API client
└── types.ts                    # TypeScript types
```

## Key Features

### Trip Planning
- Create and manage trips with itineraries
- Collaborative trip planning with multiple users
- Expense tracking and budget management
- Packing list management
- Weather forecasts
- Interactive maps

### Gear Rental Marketplace
- Browse and rent travel gear
- List your own gear for rent
- Booking management system
- Seller analytics dashboard
- Review and rating system
- Secure payment processing

### Social Matching
- Swipe-based matching system
- Advanced filtering (age, gender, interests, location)
- Real-time match notifications
- Connection management

### Messaging & Calls
- Real-time text messaging
- Image sharing
- Message reactions and replies
- Read receipts
- Typing indicators

### Admin Features
- Dynamic content management
- Site settings configuration
- Footer menu management
- Newsletter subscriber management
- User management
- Analytics dashboard

### Progressive Web App
- Offline mode support
- Background sync
- Push notifications
- Installable on mobile devices
- Service worker caching

## Newsletter Subscription

The footer includes a newsletter subscription form that:
- Validates email addresses
- Shows success/error messages
- Sends welcome emails automatically
- Stores subscribers in the database
- Supports unsubscribe functionality

### Admin Management
Admins can manage newsletter subscribers at `/admin/settings`:
- View all subscribers
- See subscription statistics
- Export subscriber list
- Manage subscription status

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

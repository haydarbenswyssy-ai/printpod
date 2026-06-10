# PrintPod — Print-On-Demand Marketplace

A modern full-stack t-shirt print-on-demand marketplace built with **Next.js 16**, **Tailwind CSS v4**, and **Supabase**.

## Features

- Custom t-shirt editor (Fabric.js) — white/black tees, front/back, image upload, text
- Marketplace with search, categories, trending
- Per-seller stores at `/store/[username]`
- 3-step cart + checkout with cash-on-delivery (modular for future payment integration)
- Admin dashboard (product approval, order tracking, user management)
- JWT auth + bcrypt
- Secure file uploads, design download prevention
- Streetwear-inspired dark UI

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend**: Next.js API routes (Node.js)
- **Database**: Supabase (PostgreSQL + Storage)
- **Auth**: JWT + bcrypt
- **Editor**: Fabric.js
- **Animation**: Framer Motion
- **State**: Zustand (with persist)

## Setup

### 1. Install dependencies

```bash
cd printpod-app
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL editor, run the schema from `src/lib/database.sql`
3. In the Storage section, create 4 buckets:
   - `designs` (private)
   - `previews` (public)
   - `avatars` (public)
   - `banners` (public)

### 3. Configure environment

Update `.env.local` with your real values:

```
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=long-random-string
NEXT_PUBLIC_BASE_PRICE=15.00
```

### 4. Create an admin user

After signing up via `/signup`, update your user's role in Supabase:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, trending, creators |
| `/marketplace` | Browse all approved products |
| `/product/[id]` | Product detail with size selector |
| `/store/[username]` | Public seller store |
| `/create` | T-shirt editor (auth required) |
| `/cart` | Cart + checkout flow |
| `/orders` | Customer order history |
| `/dashboard` | Seller dashboard |
| `/admin` | Admin panel (role: admin) |
| `/login`, `/signup` | Auth |

## Architecture

```
src/
├── app/
│   ├── api/              # Backend endpoints
│   │   ├── auth/         # signup, login, me
│   │   ├── products/     # CRUD
│   │   ├── orders/       # cart → order
│   │   ├── stores/       # public store endpoint
│   │   ├── upload/       # secure image upload
│   │   └── admin/        # admin endpoints
│   └── (pages)/          # Frontend routes
├── components/           # Shared UI
└── lib/
    ├── auth.ts           # JWT + bcrypt helpers
    ├── api.ts            # Client-side API wrapper
    ├── supabase.ts       # Supabase client
    ├── store.ts          # Zustand stores
    ├── types.ts          # Shared types
    ├── constants.ts      # App constants
    └── database.sql      # DB schema
```

## Security

- Bcrypt password hashing (12 rounds)
- JWT-based stateless auth (7-day expiry)
- Admin-only routes guarded by middleware
- Design files served via Supabase storage with download prevention CSS
- Right-click + drag-and-drop disabled on design imagery
- File type & size validation on upload
- Selling price enforcement above base cost

## License

MIT

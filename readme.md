# Design Resources for Developers

A curated collection of design resources for developers. Built with Next.js, this application helps you discover and organize the best design tools, UI frameworks, icons, fonts, and more for your web and mobile projects.

![Project Banner](./headerimage.png)

## ✨ Features

- **Share Buttons** - Share resources to social media (Twitter, LinkedIn, Facebook, Reddit, Email) with copy link functionality
- **Autocomplete Suggestions** - Show search suggestions as users type with keyboard navigation
- **View Toggle** - Switch between Grid view and List view for browsing resources
- **Quick Preview Modal** - Preview resource details in a modal without leaving the site
- **Favorites/Bookmarks** - Save your favorite resources to local storage for quick access
- **Global Search** - Search across all categories from anywhere via the header search bar
- **Curated Categories** - Browse resources organized by type (UI Graphics, CSS Frameworks, Icons, Typography, etc.)
- **Click Tracking** - Track resource popularity with click counts
- **Featured Resources** - Highlight top resources
- **Responsive Design** - Fully responsive UI that works on all devices
- **Dark Mode Support** - Automatic theme based on system preferences
- **Server-Side Rendering** - Fast initial loads with Next.js App Router

## 🔄 CI/CD Automation

This project uses GitHub Actions for automated database seeding:

- **Trigger**: Automatically runs on push to the `dev` branch
- **Condition**: Only executes when [`resources.md`](resources.md) is modified
- **Action**: Runs the seed script to update the database with new resources from resources.md

The workflow file is located at [`.github/workflows/seed-resources.yml`](.github/workflows/seed-resources.yml).

### Adding New Resources

1. Add new resources to the appropriate category in [`resources.md`](resources.md)
2. Push changes to the `dev` branch
3. The CI/CD workflow will automatically seed the database

## �️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Database**: [MongoDB](https://www.mongodb.com) with [Prisma](https://www.prisma.io)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **UI Components**: [Radix UI](https://www.radix-ui.com)
- **Icons**: [Lucide React](https://lucide.dev)
- **Forms**: [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18 or later)
- **npm** or **yarn** or **pnpm**
- **MongoDB** (local or Atlas)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd design-resources-for-developers
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add your MongoDB connection string:

```env
DATABASE_URL="mongodb://localhost:27017/link-organizer"
# Or for MongoDB Atlas:
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/link-organizer"
```

### 4. Database Setup

Generate the Prisma client:

```bash
npx prisma generate
```

### 5. Seed the Database

Populate the database with initial design resources:

```bash
npm run seed
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔍 Global Search with Autocomplete

The application features an intelligent search bar in the header that provides autocomplete suggestions as you type:

### How Autocomplete Works

- **Suggestions**: As you type (minimum 2 characters), the search shows matching resources
- **Quick Access**: Click any suggestion to go directly to that category
- **Keyboard Navigation**: Use arrow keys (↑/↓) to navigate suggestions, Enter to select, Escape to close
- **Tab Completion**: Press Tab to autocomplete with the highlighted suggestion
- **Mobile Support**: Tap outside the dropdown to close, suggestions work on touch devices

### Search Features

- Type your query in the search bar (desktop or mobile)
- Press Enter or click the Search button for full results
- View results organized by category on the search results page
- Clear your search with the X button to return home
- Loading indicator shows while fetching suggestions

The search looks through resource titles and descriptions, providing instant access to relevant design resources.

## ❤️ Favorites

You can save your favorite design resources for quick access later. Here's how to use this feature:

- **Add to Favorites**: Click the heart icon on any resource card to save it
- **View Favorites**: Click the heart icon in the header navigation to see all your saved resources
- **Remove from Favorites**: Click the heart icon again on a favorited resource to remove it
- **Clear All**: Use the "Clear all" button on the favorites page to remove all saved resources

Your favorites are stored locally in your browser, so they'll persist across sessions. Note that favorites are stored by resource ID, so if a resource is removed from the database, it may no longer appear in your favorites.

## 👁️ Quick Preview Modal

The Quick Preview Modal provides a better user experience than the previous hover tooltip approach. Instead of an intrusive tooltip that appears on hover (which could detract from the user experience), you can now:

- **Preview**: Click the eye icon on any resource card to open a modal with full details
- **View Details**: See the complete title, URL, description, and icon information
- **Open**: Click "Open Resource" button to visit the external site
- **Mobile-Friendly**: Works great on touch devices with responsive design

The modal can be closed by:
- Clicking outside the modal
- Pressing the Escape key
- Clicking the X button

This feature provides a clean, accessible way to preview resources without navigating away from the site.

## 🔲 View Toggle

The View Toggle feature allows you to switch between Grid view and List view for browsing resources:

- **Grid View** (default): Display resources in a 3-column grid layout, ideal for desktop browsing
- **List View**: Display resources in a single-column vertical list, great for quick scanning

### How to Use

- Click the Grid or List button in the top-right corner of any page
- The view preference persists in the URL (e.g., `?view=list`)
- Share the URL with others to share your preferred view

The View Toggle is available on:
- Home page
- Category pages (e.g., `/ui-graphics`)
- Search results page
- Favorites page

On mobile devices, only icons are shown to save space.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── actions.ts         # Server actions for data operations
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   ├── search/            # Global search results page
│   │   └── page.tsx
│   ├── [slug]/            # Dynamic category pages
│   │   └── page.tsx
│   └── favorites/         # Favorites page
│       └── page.tsx
├── components/            # React components
│   ├── header.tsx        # Site header with global search
│   ├── category-nav.tsx  # Category navigation
│   ├── link-card.tsx     # Link display card
│   ├── favorites-button.tsx # Favorites navigation button
│   ├── search-input.tsx  # Search component
│   ├── skeletons.tsx     # Loading skeletons
│   └── ui/               # UI components (Button, Card, etc.)
├── lib/                   # Utility functions and data layer
│   ├── data.ts           # Database operations
│   ├── db.ts             # Prisma client
│   ├── schemas.ts        # Zod validation schemas
│   ├── types.ts          # TypeScript types
│   ├── utils.ts          # Helper functions
│   └── hooks/            # Custom React hooks
│       └── use-favorites.ts # Favorites local storage hook
├── prisma/                # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── public/                # Static assets
└── package.json           # Project dependencies
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed the database |
| `npx prisma studio` | Open Prisma database GUI |

## 🧩 Adding New Resources

To add new design resources to the database, you can either:

### Option 1: Use Prisma Studio

```bash
npx prisma studio
```

This opens a GUI where you can add categories and links manually.

### Option 2: Create a Seed Script

Modify `prisma/seed.ts` to add your resources, then run:

```bash
npm run seed
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Add your `DATABASE_URL` environment variable
4. Deploy

### Self-Hosted

Build for production:

```bash
npm run build
npm run start
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](./contributing.md) before submitting a pull request.

### Guidelines

- Add one resource per pull request for easier review
- Include resource name and category in the PR title
- Verify the resource is free to use
- Check if the resource already exists before adding

## 🙏 Acknowledgments

- Thanks to all contributors who help maintain this resource collection
- Built with the amazing Next.js and React ecosystem

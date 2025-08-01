# Pizza Club Site

The official website for the Greater Chicagoland Pizza Club - a community of pizza enthusiasts exploring and rating Chicago's finest pizzerias.

## Features

- **Restaurant Directory** - Browse and search pizza restaurants with ratings, reviews, and visit history
- **Interactive Map** - Visual exploration of pizza spots across Chicagoland
- **Member Profiles** - Track member ratings, preferences, and pizza journey
- **Event Calendar** - Upcoming pizza nights and club gatherings
- **Infographics** - Beautiful visual summaries of restaurant visits
- **Comparison Tool** - Side-by-side restaurant rating comparisons
- **Admin Panel** - Manage restaurants, members, and create infographics

## Tech Stack

- **Frontend**: React 18 with TypeScript, Vite, TailwindCSS
- **Backend**: PHP 8.2+ RESTful API
- **Database**: MySQL/MariaDB
- **Hosting**: Shared hosting (Namecheap)
- **Maps**: Google Maps API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PHP 8.2+
- MySQL/MariaDB

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/mattnotmatthew/pizza-club.git
cd pizza-club/pizza-club-site
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_MAPS_ID=your_map_id

# API Configuration
VITE_API_URL=https://yourdomain.com/pizza_api
VITE_UPLOAD_API_URL=https://yourdomain.com/pizza_upload/upload.php
VITE_UPLOAD_API_TOKEN=your_secure_token

# Admin Access
VITE_ADMIN_PASSWORD=your_admin_password
```

### Database Setup

1. Create MySQL database
2. Run the schema creation script:
```bash
mysql -u username -p database_name < server/database/schema/complete-schema.sql
```

3. Configure database connection in `server/api/config/Database.php`

### Development

Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:5173/pizza/`

### Build & Deployment

1. Build for production:
```bash
npm run build
```

2. Upload files to server:
   - Upload `dist/` contents to `public_html/pizza/`
   - Upload `server/api/` to `public_html/pizza_api/`
   - Upload `server/upload/` to `public_html/pizza_upload/`

3. Set proper permissions:
```bash
chmod 755 public_html/pizza_api
chmod 644 public_html/pizza_api/.htaccess
```

## API Documentation

See [docs/API.md](docs/API.md) for complete API documentation.

## Project Structure

```
pizza-club-site/
├── src/                    # React application source
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── services/          # API and data services
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript type definitions
├── server/                # Backend code
│   ├── api/              # PHP API endpoints
│   ├── database/         # Database scripts and migrations
│   └── upload/           # Photo upload handler
├── public/               # Static assets
│   └── data/            # JSON data files (legacy)
└── docs/                # Documentation
```

## Key Features Implementation

### Database-First Architecture
- All data is stored in MySQL database
- RESTful API provides data access
- No JSON file dependencies in production

### Rating System
- Comprehensive rating categories (overall, crust, sauce, cheese, toppings)
- Support for multiple pizzas per visit
- Automatic average rating calculations

### Infographics
- Visual restaurant visit summaries
- Photo positioning and layout tools
- Quote integration from visits
- Export capabilities

### Performance
- API response times < 200ms
- Optimized database queries
- Client-side caching strategies

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

Private project - all rights reserved

## Contact

For questions or access requests, contact the Pizza Club administrators.
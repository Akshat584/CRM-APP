# CRM Pro - Full-Stack Customer Relationship Management

A production-ready, full-stack CRM web application built with React, Node.js/Express, and PostgreSQL. Features real authentication, persistent data, drag-and-drop pipeline management, and comprehensive analytics.

## Features

- 🔐 **JWT Authentication** with access/refresh token strategy
- 👥 **Contact Management** with search, filtering, and detail panels
- 📈 **Sales Pipeline** with drag-and-drop Kanban boards
- 📝 **Activity Logging** with type filtering and organization
- ✅ **Task Management** with Kanban-style organization
- 📊 **Analytics Dashboard** with real-time metrics and charts
- 🎨 **Dark Theme** with professional UI design
- 🔒 **Security** with input validation, rate limiting, and parameterized queries

## Tech Stack

**Frontend:**
- React 18 with React Router v6
- Context API + useReducer for state management
- Axios for HTTP requests
- CSS with custom properties for styling

**Backend:**
- Node.js 20+ with Express 5
- PostgreSQL 15+ with node-postgres
- JWT authentication
- Express middleware (helmet, cors, rate limiting)

## Quick Start

### Prerequisites
- Node.js 20+
- Docker and Docker Compose

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd crm-app
```

2. **Start PostgreSQL and the server using Docker**
```bash
docker-compose up -d postgres
```

3. **Wait for PostgreSQL to be ready (10-15 seconds), then start the backend**
```bash
cd server
npm install
npm run migrate
npm run dev
```

The server will run on http://localhost:5000

4. **Install and start the frontend**
```bash
cd ../client
npm install
npm run dev
```

The frontend will run on http://localhost:5173

5. **Access the application**
Open http://localhost:5173 in your browser and login with:
- Email: `admin@demo.com`
- Password: `demo1234`

## API Endpoints

### Authentication (No JWT required)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login with email/password |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout and clear refresh token |
| GET | `/api/v1/auth/me` | Get current user profile |

### Contacts (JWT required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/contacts` | List contacts with search/filter/sort |
| GET | `/api/v1/contacts/:id` | Get contact details with related data |
| POST | `/api/v1/contacts` | Create new contact |
| PUT | `/api/v1/contacts/:id` | Update contact |
| DELETE | `/api/v1/contacts/:id` | Soft delete contact |

Query parameters for GET /contacts:
- `search` - Search by name, company, email
- `status` - Filter by status (Lead/Prospect/Customer/Churned)
- `sort` - Sort field (name/value/created_at)
- `order` - Sort order (asc/desc)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Deals (JWT required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/deals` | List deals with filtering |
| GET | `/api/v1/deals/:id` | Get deal details |
| POST | `/api/v1/deals` | Create new deal |
| PUT | `/api/v1/deals/:id` | Update deal |
| DELETE | `/api/v1/deals/:id` | Delete deal |

Query parameters for GET /deals:
- `stage` - Filter by stage
- `contact_id` - Filter by contact
- `sort` - Sort field
- `order` - Sort order
- `page` - Page number
- `limit` - Items per page

### Activities (JWT required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/activities` | List activities |
| POST | `/api/v1/activities` | Log new activity |
| DELETE | `/api/v1/activities/:id` | Delete activity |

Query parameters for GET /activities:
- `contact_id` - Filter by contact
- `deal_id` - Filter by deal
- `type` - Filter by type
- `page` - Page number
- `limit` - Items per page

### Tasks (JWT required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/tasks` | List tasks |
| POST | `/api/v1/tasks` | Create new task |
| PUT | `/api/v1/tasks/:id` | Update task |
| DELETE | `/api/v1/tasks/:id` | Delete task |

Query parameters for GET /tasks:
- `status` - Filter by status
- `priority` - Filter by priority
- `assignee_id` - Filter by assignee
- `due_before` - Filter by due date

### Analytics (JWT required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/analytics/dashboard` | Dashboard metrics |
| GET | `/api/v1/analytics/pipeline` | Pipeline funnel data |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for access tokens | Yes |
| `REFRESH_TOKEN_SECRET` | Secret key for refresh tokens | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `CLIENT_URL` | Frontend URL for CORS | Yes |
| `VITE_API_URL` | Backend API URL for frontend | Yes |

## Project Structure

```
/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # Axios API client
│   │   ├── components/    # Shared UI components
│   │   ├── context/       # React Context providers
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Helper functions
│   │   └── App.jsx        # Router setup
│   └── package.json
│
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── db/           # Database connection & migrations
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── index.js      # Server entry point
│   └── package.json
│
├── docker-compose.yml     # Docker services
├── .env.example          # Environment variables template
└── README.md
```

## Database Schema

### Tables Created:
- **users** - Application users
- **contacts** - Customer contacts
- **deals** - Sales opportunities
- **activities** - Activity log entries
- **tasks** - Task management
- **tags** - Tags for organization

All tables include:
- UUID primary keys
- Created/updated timestamps
- Foreign key relationships with CASCADE
- Indexes on commonly queried columns

## Development

### Running Tests
```bash
# Backend
cd server && npm test

# Frontend
cd client && npm test
```

### Database Migrations
```bash
cd server
npm run migrate    # Run migrations
npm run migrate:undo  # Revert last migration
```

### Building for Production
```bash
# Backend
cd server
npm run build

# Frontend
cd client
npm run build
```

## Security

- All passwords hashed with bcrypt (12 rounds)
- JWT access tokens (15 min) + refresh tokens (7 days)
- Input validation with express-validator
- Parameterized SQL queries (no SQL injection)
- Helmet for security headers
- CORS restricted to CLIENT_URL
- Rate limiting on auth endpoints
- Scoped queries by user_id

## License

MIT# CRM-APP

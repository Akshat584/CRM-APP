# CRM Pro - Setup Instructions

## Quick Start with SQLite (Recommended for Demo)

For easy local development and demonstration, we've prepared an SQLite version that requires no setup:

1. **Install Dependencies**
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

2. **Start the Application**
```bash
# Terminal 1 - Start Server
cd server
npm run dev

# Terminal 2 - Start Client
cd client
npm run dev
```

3. **Access the Application**
Open http://localhost:5173 in your browser

**Demo Login:**
- Email: admin@demo.com
- Password: demo1234

## Full PostgreSQL Setup (Production)

For production deployment with PostgreSQL:

### Prerequisites
- PostgreSQL 15+ installed and running
- Docker (optional, for containerized setup)

### Manual Setup

1. **Start PostgreSQL**
```bash
# On Windows
net start postgresql-x64-15

# On Linux/macOS
sudo service postgresql start
```

2. **Create Database**
```bash
createdb crm_db
```

3. **Update Environment**
Edit `server/.env`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/crm_db
```

4. **Run Migrations**
```bash
cd server
npm run migrate
```

5. **Start Servers**
```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

### Docker Setup

1. **Start Services**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Server on port 5000
- Client on port 5173 (manual start required)

2. **Run Migrations**
```bash
docker-compose exec server npm run migrate
```

3. **Access Application**
Open http://localhost:5173

## Troubleshooting

### Database Connection Failed
- Ensure PostgreSQL is running: `pg_isready`
- Check credentials in `.env` file
- Verify pg_hba.conf allows password authentication
- Try connecting manually: `psql -U postgres -d crm_db`

### Port Already in Use
- Stop other instances: `lsof -ti:5000 | xargs kill`
- Or change PORT in `.env`

### Migration Errors
- Ensure database exists: `psql -l | grep crm_db`
- Check user permissions
- Review migration logs in `server/src/db/migrations/`

## Project Structure
```
/
├── client/           # React frontend
│   ├── src/
│   │   ├── api/     # API client
│   │   ├── components/  # UI components
│   │   ├── pages/   # Page components
│   │   ├── hooks/   # Custom hooks
│   │   └── context/ # React context
├── server/          # Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── db/           # Database & migrations
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   └── services/     # Business logic
│   └── migrations/    # SQL migration files
└── docker-compose.yml
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Contacts
- `GET /api/v1/contacts` - List contacts
- `GET /api/v1/contacts/:id` - Get contact details
- `POST /api/v1/contacts` - Create contact
- `PUT /api/v1/contacts/:id` - Update contact
- `DELETE /api/v1/contacts/:id` - Delete contact

### Deals
- `GET /api/v1/deals` - List deals
- `GET /api/v1/deals/:id` - Get deal details
- `POST /api/v1/deals` - Create deal
- `PUT /api/v1/deals/:id` - Update deal
- `DELETE /api/v1/deals/:id` - Delete deal

### Activities
- `GET /api/v1/activities` - List activities
- `POST /api/v1/activities` - Create activity
- `DELETE /api/v1/activities/:id` - Delete activity

### Tasks
- `GET /api/v1/tasks` - List tasks
- `POST /api/v1/tasks` - Create task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard metrics
- `GET /api/v1/analytics/pipeline` - Pipeline analytics

## Features

✅ **Authentication**
- JWT-based auth with access/refresh tokens
- Secure password hashing with bcrypt
- Protected routes

✅ **Contact Management**
- Full CRUD operations
- Search and filter
- Contact detail panels
- Soft delete

✅ **Sales Pipeline**
- Kanban-style drag-and-drop
- Real-time stage updates
- Deal tracking

✅ **Activity Log**
- Log activities by type
- Filter by type
- Chronological feed

✅ **Task Management**
- Kanban board (To Do / In Progress / Done)
- Priority levels
- Due date tracking
- Inline editing

✅ **Analytics Dashboard**
- KPI cards
- Pipeline funnel
- Charts (bar, donut)
- Activity breakdown

✅ **Security**
- Input validation
- SQL injection protection
- Rate limiting
- CORS protection
- Helmet security headers

## Tech Stack

**Frontend:**
- React 18
- React Router v6
- Context API + useReducer
- Axios for HTTP
- Custom CSS (no UI libraries)

**Backend:**
- Node.js 20+
- Express 5
- PostgreSQL 15+
- JWT authentication
- bcrypt for password hashing

## License

MIT
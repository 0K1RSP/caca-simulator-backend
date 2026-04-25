# Caca Simulator - Backend Setup

## Prerequisites
- Node.js (v16+)
- MongoDB (running locally or use MongoDB Atlas)

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Edit `.env` file with your configuration:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/caca-simulator
JWT_SECRET=your-super-secret-key-min-32-characters-long
ADMIN_USER=ansaru
ADMIN_PASS=AnsaruDev
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

3. **Start MongoDB:**
- If using local MongoDB: `mongod` or use your MongoDB service
- If using MongoDB Atlas: Update `MONGODB_URI` with your Atlas connection string

4. **Start the server:**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new account
  - Body: `{ username, password }`
  - Returns: `{ token, username }`

- `POST /api/auth/login` - Login
  - Body: `{ username, password }`
  - Returns: `{ token, username, gameState }`

### Game
- `POST /api/updateScore` - Sync game state (requires auth)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ gameState, toilets, upgrades, ... }`

- `GET /api/leaderboard?type=pd&limit=10` - Get leaderboard
  - Query params: `type` (pd or ap), `limit` (default 10)

- `GET /api/gameState` - Get current user's game state (requires auth)

### Admin (requires admin auth)
- `GET /api/admin/users` - List all users
- `POST /api/admin/ban` - Ban/unban a user
  - Body: `{ username, banned: boolean }`
- `POST /api/admin/giveItem` - Give items to a user
  - Body: `{ username, action, amount, itemId }`
  - Actions: givePoop, setPoop, multPoop, givePD, setPD, multPD, giveGems, setGems, multGems, giveAP, setAP, multAP, givePet, clearPets
- `POST /api/admin/changePassword` - Change user password
  - Body: `{ username, newPassword }`

### Events (real-time global events)
- `GET /api/event` - Get currently active events
  - Returns: `{ activeEvents: { eventId: { active: true, since: timestamp } } }`
- `POST /api/event` - Toggle an event (admin only)
  - Body: `{ eventId, active: boolean }`
- `POST /api/event/clear` - Clear all events (admin only)

## Security Features
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for authentication (7 day expiry)
- Rate limiting on auth endpoints (5 requests per 15 minutes)
- Anti-cheat validation on score updates
- Admin-only routes protected by middleware

## Frontend Configuration

In `game.js`, update the API base URL if needed:
```javascript
const API_BASE = 'http://localhost:3000/api';
```

For production, change to your production URL.

## Testing the System

1. Start the backend server
2. Open `index.html` in a browser
3. Create an account or login
4. The game will automatically sync to the backend every 10 seconds
5. To access admin panel, login with admin credentials set in `.env`

## Migration from localStorage

The frontend maintains backward compatibility with localStorage. Existing localStorage accounts will work, but new accounts will use the backend API. To migrate existing accounts, you would need to run a one-time migration script (not included in this implementation).

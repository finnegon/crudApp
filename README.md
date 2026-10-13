# CRUD App

A small full-stack practice project: an **Express + MongoDB REST API** for users and posts, with a **React frontend** for exercising the endpoints by hand.

It was built as a way to learn JavaScript backend fundamentals — routing, controllers, Mongoose models, middleware, and password hashing — plus a lightweight UI to test them without reaching for Postman.

## Tech stack

| Layer | Tools |
|---|---|
| Runtime | Node.js (ES modules) |
| Backend | Express 5, Mongoose 9, MongoDB Atlas, dotenv, bcrypt |
| Dev tooling | nodemon |
| Frontend | React 19, Vite, plain CSS (no UI library) |

## Project structure

```
crudApp/
├── package.json            # root scripts + backend dependencies
├── .env.example            # template for required env vars
├── backend/
│   └── src/
│       ├── index.js        # entry point: connects DB, starts server
│       ├── app.js          # express app + route mounting
│       ├── config/
│       │   ├── database.js # mongoose connection
│       │   └── constants.js
│       ├── controllers/    # request handlers
│       ├── models/         # mongoose schemas (User, Post)
│       └── routes/         # route definitions
└── frontend/
    ├── vite.config.js      # dev server + /api proxy to :4000
    └── src/
        ├── App.jsx         # layout and shared state
        ├── api.js          # fetch wrapper that never throws
        ├── useTheme.js     # dark / light mode
        ├── index.css       # all styling (theme tokens)
        └── components/
            ├── AuthPanel.jsx    # register / login / logout
            ├── PostsPanel.jsx   # create, list, edit, delete posts
            └── RequestLog.jsx   # inspect every request's raw response
```

## Getting started

### 1. Install backend dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the template and fill in your own values:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the API listens on | `4000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>` |

### 3. Run the backend

```bash
npm run dev     # nodemon, restarts on file changes
# or
npm start       # plain node
```

The API will be available at `http://localhost:4000`.

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api/*` to the backend, so no CORS setup is required.

## API reference

Base path: `/api/v1`

### Users — `/api/v1/users`

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/register` | `{ username, email, password }` | Create a user; password is hashed with bcrypt before saving |
| `POST` | `/login` | `{ email, password }` | Verify credentials against the stored hash |
| `POST` | `/logout` | `{ email }` | Confirms the user exists (placeholder — see limitations) |

### Posts — `/api/v1/posts`

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/create` | `{ name, description, age }` | Create a post |
| `GET` | `/getPosts` | — | List all posts |
| `PATCH` | `/update/:id` | any subset of fields | Update a post by ID |
| `DELETE` | `/delete/:id` | — | Delete a post by ID |

### Validation rules

**User**
- `username` — required, unique, 4–30 characters, lowercased and trimmed
- `email` — required, unique, lowercased and trimmed
- `password` — required, 8–50 characters, hashed on save (never stored in plain text)

**Post**
- `name` — required
- `description` — required
- `age` — required, between 1 and 200

### Example

```bash
# Register
curl -X POST http://localhost:4000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ada","email":"ada@example.com","password":"secret123"}'

# Create a post
curl -X POST http://localhost:4000/api/v1/posts/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Hello","description":"First post","age":30}'

# List posts
curl http://localhost:4000/api/v1/posts/getPosts
```

## Frontend features

- **Account panel** — register, log in, and log out; shows the active user
- **Posts panel** — create posts, fetch them, and edit or delete them inline
- **Request log** — every call records its method, path, status code, duration, and raw JSON response, which makes API errors easy to inspect
- **Dark / light theme** — respects your OS preference on first visit and remembers your choice

> Note: the "signed in" state lives only in the page. The backend does not issue sessions or tokens yet.

## Known limitations

- **No authentication.** `login` verifies credentials but issues no token or session, and no route is protected — every endpoint is publicly callable. `logout` only checks that the user exists; it does not invalidate anything.
- **Verb-based route names.** Endpoints such as `/getPosts` and `/update/:id` are functional but not RESTful; an idiomatic design would use `GET /posts` and `PATCH /posts/:id`.
- **Database name is implicit.** `MONGODB_URI` currently has no database path, so Mongoose falls back to the default `test` database. The `DB_NAME` constant in `backend/src/config/constants.js` is defined but not wired up.
- **Validation errors return 500.** Mongoose schema validation failures (for example, an out-of-range `age`) surface as `500` rather than `400`.

## License

ISC

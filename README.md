# Follow-up Recommendation System

Minimal client/server foundation for the SME follow-up recommendation project.

## Requirements

- Node.js and npm
- MongoDB running locally, or a MongoDB connection URI

## Configure and run the API

```sh
cd server
cp .env.example .env
npm install
npm run dev
```

The API listens on `http://localhost:3000`. `GET /api/health` reports API and MongoDB connection status. The server starts even if MongoDB is unavailable, and logs the connection error so the API can still be inspected.

## Run the frontend

In another terminal:

```sh
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The frontend and backend run as separate applications. The client API base URL example is in `client/.env.example`.

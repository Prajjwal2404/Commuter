# Commuter App

A real-time location and commute tracking application built with React and Express.js.

## Project Overview

Commuter is a web application that allows users to:
- Create an account and log in securely
- View and interact with Google Maps
- Search for locations using Google Places Autocomplete
- Track their current location in real-time
- Calculate routes between destinations

## Tech Stack

### Frontend
- React 19
- Google Maps API (Places, Maps)
- CSS for styling
- JWT for authentication

### Backend
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or connection string)
- Google Maps API key with Places API enabled

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/Commuter.git
   cd Commuter/commuter-backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the `commuter-backend` directory with:
   ```
   JWT_TOKEN=your_secret_key_here
   ```

4. Start MongoDB locally
   ```bash
   mongod --dbpath /path/to/your/data/directory
   ```

5. Start the backend server
   ```bash
   node server.js
   ```

The backend server will run on http://localhost:5000.

### Frontend Setup

1. Navigate to the frontend directory
   ```bash
   cd ../commuter
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the `commuter` directory with:
   ```
   VITE_API_KEY=your_google_maps_api_key
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

The frontend will be available at http://localhost:5173 (or another port chosen by Vite).

## Google Maps API Setup

This project requires a Google Maps API key with the following APIs enabled:
- Maps JavaScript API
- Places API

To set up your Google Maps API key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to APIs & Services > Library
4. Enable the Maps JavaScript API and Places API
5. Create an API key under APIs & Services > Credentials
6. Restrict the API key as needed for security
7. Add the API key to your frontend `.env` file as `VITE_API_KEY`

## Project Structure

```
Commuter/
├── commuter/                 # Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── Map.jsx
│   │   ├── Login.jsx
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
└── commuter-backend/         # Backend
    ├── middleware/
    ├── models/
    ├── routes/
    ├── server.js
    └── package.json
```

## Features

- User authentication (register/login)
- Interactive map interface
- Places search with autocomplete
- Current location tracking
- User profile and statistics

## License

[MIT License](LICENSE)
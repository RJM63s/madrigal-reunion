# Madrigal Family Reunion App

A full-stack web application for managing family reunion registrations with an interactive family tree visualization.

## Features

- **Registration Form**: Collect detailed family member information
  - Name, email, phone
  - Relationship type and family connections
  - Generation and family branch
  - Photo upload
  - Number of attendees
  - Dietary restrictions

- **Interactive Family Tree**: D3.js-powered visualization
  - Shows family connections and relationships
  - Displays member photos on nodes
  - Interactive zoom and pan
  - Drag nodes to rearrange

- **QR Code**: Easy registration access via QR code on home page

- **Admin Dashboard**: View all submissions
  - Statistics overview
  - Filter by generation
  - Export to CSV
  - Detailed member information table

- **Data Storage**: All data saved to `family.json` file
- **Photo Storage**: Uploaded photos stored in `/uploads` folder

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS 4
- **Backend**: Express.js
- **Visualization**: D3.js
- **File Upload**: Multer
- **QR Code**: qrcode library

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. **Install Server Dependencies**
   ```bash
   cd server
   npm install --cache /tmp/.npm
   ```

2. **Install Client Dependencies**
   ```bash
   cd ../client
   npm install --cache /tmp/.npm
   ```

### Running the Application

1. **Start the Backend Server** (in one terminal)
   ```bash
   cd server
   npm start
   ```
   Server will run on http://localhost:3001

2. **Start the Frontend** (in another terminal)
   ```bash
   cd client
   npm run dev
   ```
   Client will run on http://localhost:5173

3. **Access the Application**
   - Open your browser to http://localhost:5173
   - Scan the QR code to access registration on mobile devices

## Project Structure

```
madrigal-reunion/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Home page with QR code
│   │   │   ├── Register.jsx       # Registration form
│   │   │   ├── FamilyTree.jsx     # D3.js family tree visualization
│   │   │   └── Admin.jsx          # Admin dashboard
│   │   ├── App.jsx         # Main app component with routing
│   │   ├── index.css       # Tailwind styles
│   │   └── main.jsx        # App entry point
│   └── package.json
│
├── server/                 # Express backend
│   ├── server.js           # Express server with API endpoints
│   ├── family.json         # Family data storage
│   ├── uploads/            # Photo storage directory
│   └── package.json
│
└── README.md
```

## API Endpoints

- `POST /api/register` - Register a new family member (with photo upload)
- `GET /api/family` - Get all family members
- `GET /api/stats` - Get registration statistics

## Notes

- Photos are limited to 5MB
- Accepted image formats: JPEG, JPG, PNG, GIF
- All family data is stored in `server/family.json`
- Uploaded photos are stored in `server/uploads/`

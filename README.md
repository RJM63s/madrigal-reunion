# Madrigal Family Reunion App

A full-stack Progressive Web App (PWA) for managing family reunion registrations with an interactive family tree visualization. Features festive design with Dancing Script fonts, floating butterflies, and a beautiful radial family tree layout.

## ✨ Features

### 📱 Progressive Web App (PWA)
- **Installable**: Add to home screen on mobile and desktop
- **Offline Support**: Works without internet connection
- **Full Screen Mode**: Runs like a native app
- **Push Notifications**: Ready for future notifications
- **App Shortcuts**: Quick access to Register and Family Tree

### 📝 Registration Form
- Name, email, phone
- Relationship type and family connections
- Generation and family branch
- Photo upload
- Number of attendees

### 🌳 Interactive Family Tree
- **Radial/circular layout** by generation
- **Larger nodes** with prominent photos
- **Hover effects** that highlight connection paths
- **Smooth animations** and transitions
- Drag nodes to rearrange
- Interactive zoom and pan
- Generation badges and decorative elements

### 🎨 Festive Design
- **Google Fonts**: Dancing Script for headings, Poppins for body
- **Floating butterflies** with gentle animations
- **Rainbow gradient borders** on cards
- **Celebration title animations**
- Warm color palette with amber, orange, and pink

### 📊 Admin Dashboard
- Statistics overview
- Filter by generation
- Export to CSV
- Detailed member information table

### 💾 Data & Storage
- All data saved to `family.json` file
- Uploaded photos stored in `/uploads` folder
- QR code for easy mobile registration

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

## 📱 PWA Setup

The app is now a Progressive Web App! To complete the setup:

### Generate App Icons

1. **Option 1**: Open `client/generate-icons.html` in your browser
   - Right-click each generated icon and save to `client/public/`
   - Required sizes: 72, 96, 128, 144, 152, 192, 384, 512
   - Save apple-touch-icon as `apple-touch-icon.png`

2. **Option 2**: Use an online tool
   - Visit https://www.pwabuilder.com/imageGenerator
   - Upload a 512x512 logo
   - Download all icon sizes

### Test the PWA

**Desktop (Chrome/Edge)**:
- Look for the install icon in the address bar
- Click to install as desktop app

**Mobile**:
- Visit the site on your phone
- Look for "Add to Home Screen" prompt
- Install from the prompt or browser menu

**Offline Mode**:
- Open DevTools → Application → Service Workers
- Check "Offline" mode
- App should still load!

For detailed PWA setup instructions, see `client/PWA_SETUP.md`

### Deployment for PWA

PWA features require HTTPS in production:
- Deploy to Vercel, Netlify, or similar
- Service worker will automatically register
- Users can install from any browser

## Notes

- Photos are limited to 5MB
- Accepted image formats: JPEG, JPG, PNG, GIF
- All family data is stored in `server/family.json`
- Uploaded photos are stored in `server/uploads/`

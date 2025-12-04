require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Google Sheets configuration
const GOOGLE_SHEETS_ENABLED = process.env.GOOGLE_SHEETS_ENABLED === 'true';
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Middleware - CORS configuration
const corsOptions = {
  origin: NODE_ENV === 'production'
    ? [CLIENT_URL] // Only allow specific origin in production
    : '*', // Allow all origins in development
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/gallery', express.static('gallery'));

// Input validation helpers
function sanitizeString(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  // Remove any HTML tags and script content
  const cleaned = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
  return cleaned.substring(0, maxLength);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir('uploads', { recursive: true });
    await fs.mkdir('gallery', { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Gallery storage
const galleryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'gallery/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = function (req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

const galleryUpload = multer({
  storage: galleryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for gallery
  fileFilter: fileFilter
});

// Password protection middleware for admin routes
function requireAdminPassword(req, res, next) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.warn('Warning: ADMIN_PASSWORD not set in environment variables. Admin routes are unprotected!');
    return next();
  }

  const providedPassword = req.headers['x-admin-password'];

  if (providedPassword === adminPassword) {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid admin password'
    });
  }
}

// Initialize data files
async function initializeDataFile() {
  try {
    const data = await fs.readFile('family.json', 'utf8');
    if (!data.trim()) {
      await fs.writeFile('family.json', JSON.stringify([], null, 2));
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile('family.json', JSON.stringify([], null, 2));
    }
  }
}

async function initializeGalleryFile() {
  try {
    const data = await fs.readFile('gallery.json', 'utf8');
    if (!data.trim()) {
      await fs.writeFile('gallery.json', JSON.stringify([], null, 2));
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile('gallery.json', JSON.stringify([], null, 2));
    }
  }
}

// Read/Write helpers
async function readFamilyData() {
  try {
    const data = await fs.readFile('family.json', 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    return [];
  }
}

async function writeFamilyData(data) {
  await fs.writeFile('family.json', JSON.stringify(data, null, 2));
}

async function readGalleryData() {
  try {
    const data = await fs.readFile('gallery.json', 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    return [];
  }
}

async function writeGalleryData(data) {
  await fs.writeFile('gallery.json', JSON.stringify(data, null, 2));
}

// ==========================================
// GOOGLE SHEETS INTEGRATION
// ==========================================

let sheetsClient = null;

// Initialize Google Sheets API client
function getGoogleSheetsClient() {
  if (!GOOGLE_SHEETS_ENABLED) {
    return null;
  }

  if (sheetsClient) {
    return sheetsClient;
  }

  try {
    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
      console.error('Google Sheets: Missing required environment variables');
      return null;
    }

    const auth = new google.auth.JWT(
      GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      GOOGLE_PRIVATE_KEY,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    sheetsClient = google.sheets({ version: 'v4', auth });
    console.log('Google Sheets API client initialized successfully');
    return sheetsClient;
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error.message);
    return null;
  }
}

// Append registration data to Google Sheet
async function appendToGoogleSheet(memberData) {
  if (!GOOGLE_SHEETS_ENABLED) {
    console.log('Google Sheets integration is disabled');
    return;
  }

  const sheets = getGoogleSheetsClient();
  if (!sheets) {
    console.error('Google Sheets client not available');
    return;
  }

  try {
    const values = [[
      memberData.name,
      memberData.email,
      memberData.phone,
      memberData.relationshipType,
      memberData.connectedThrough,
      memberData.generation,
      memberData.familyBranch,
      memberData.attendees,
      memberData.createdAt
    ]];

    const request = {
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Sheet1!A:I', // Adjust sheet name if needed
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: values
      }
    };

    const response = await sheets.spreadsheets.values.append(request);
    console.log(`Google Sheets: Successfully appended registration for ${memberData.name}`);
    console.log(`Google Sheets: Updated ${response.data.updates.updatedCells} cells`);
  } catch (error) {
    console.error('Error appending to Google Sheet:', error.message);
    // Log additional details for debugging
    if (error.response) {
      console.error('Google Sheets API error details:', error.response.data);
    }
    // Don't throw - we don't want Google Sheets errors to break the registration
  }
}

// ==========================================
// FAMILY REGISTRATION ROUTES
// ==========================================

app.post('/api/register', upload.single('photo'), async (req, res) => {
  try {
    const familyData = await readFamilyData();

    // Validate and sanitize inputs
    const email = sanitizeString(req.body.email);
    if (email && !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const newMember = {
      id: Date.now().toString(),
      name: sanitizeString(req.body.name, 100),
      email: email,
      phone: sanitizeString(req.body.phone, 20),
      relationshipType: sanitizeString(req.body.relationshipType, 50),
      connectedThrough: sanitizeString(req.body.connectedThrough, 100),
      generation: parseInt(req.body.generation) || 0,
      familyBranch: sanitizeString(req.body.familyBranch, 100),
      photo: req.file ? `/uploads/${req.file.filename}` : null,
      attendees: parseInt(req.body.attendees) || 1,
      createdAt: new Date().toISOString()
    };

    familyData.push(newMember);
    await writeFamilyData(familyData);

    // Append to Google Sheets (async, non-blocking)
    appendToGoogleSheet(newMember).catch(err => {
      console.error('Failed to append to Google Sheets:', err.message);
    });

    res.json({
      success: true,
      message: 'Registration successful!',
      member: newMember
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/family', async (req, res) => {
  try {
    const familyData = await readFamilyData();
    res.json(familyData);
  } catch (error) {
    console.error('Error reading family data:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to load family data. Please try again later.',
      error: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const familyData = await readFamilyData();
    const stats = {
      totalMembers: familyData.length,
      totalAttendees: familyData.reduce((sum, member) => sum + (member.attendees || 0), 0),
      byGeneration: familyData.reduce((acc, member) => {
        acc[member.generation] = (acc[member.generation] || 0) + 1;
        return acc;
      }, {}),
      byBranch: familyData.reduce((acc, member) => {
        const branch = member.familyBranch || 'Unknown';
        acc[branch] = (acc[branch] || 0) + 1;
        return acc;
      }, {})
    };

    res.json(stats);
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to load statistics. Please try again later.',
      error: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==========================================
// ADMIN ROUTES (Password Protected)
// ==========================================

// Verify admin password endpoint
app.post('/api/admin/verify', (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.json({ success: true, message: 'No password configured' });
  }

  const providedPassword = req.body.password;

  if (providedPassword === adminPassword) {
    res.json({ success: true, message: 'Password verified' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// Protected admin routes
app.get('/api/admin/registrations', requireAdminPassword, async (req, res) => {
  try {
    const familyData = await readFamilyData();
    res.json(familyData);
  } catch (error) {
    console.error('Error reading family data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve family data',
      error: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/admin/stats', requireAdminPassword, async (req, res) => {
  try {
    const familyData = await readFamilyData();
    const stats = {
      totalMembers: familyData.length,
      totalAttendees: familyData.reduce((sum, member) => sum + (member.attendees || 0), 0),
      byGeneration: familyData.reduce((acc, member) => {
        acc[member.generation] = (acc[member.generation] || 0) + 1;
        return acc;
      }, {}),
      byBranch: familyData.reduce((acc, member) => {
        const branch = member.familyBranch || 'Unknown';
        acc[branch] = (acc[branch] || 0) + 1;
        return acc;
      }, {})
    };

    res.json(stats);
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate statistics',
      error: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete registration endpoint
app.delete('/api/admin/registrations/:id', requireAdminPassword, async (req, res) => {
  try {
    const { id } = req.params;
    const familyData = await readFamilyData();
    const memberIndex = familyData.findIndex(m => m.id === id);

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    const member = familyData[memberIndex];
    const memberName = member.name;

    // Remove from local JSON
    familyData.splice(memberIndex, 1);
    await writeFamilyData(familyData);

    // Also remove from Google Sheets if enabled
    if (GOOGLE_SHEETS_ENABLED) {
      try {
        const sheets = getGoogleSheetsClient();
        if (sheets) {
          // Get all rows to find the one to delete
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: 'Sheet1!A:I'
          });

          const rows = response.data.values || [];
          // Find the row index (add 1 for 1-based index, add 1 for header row)
          let rowToDelete = -1;
          for (let i = 1; i < rows.length; i++) {
            // Check if email matches (column B is email, index 1)
            if (rows[i][1] === member.email && rows[i][0] === member.name) {
              rowToDelete = i + 1; // +1 for 1-based index
              break;
            }
          }

          if (rowToDelete > 0) {
            // Get sheet ID
            const sheetMetadata = await sheets.spreadsheets.get({
              spreadsheetId: GOOGLE_SHEET_ID
            });
            const sheetId = sheetMetadata.data.sheets[0].properties.sheetId;

            // Delete the row
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId: GOOGLE_SHEET_ID,
              resource: {
                requests: [{
                  deleteDimension: {
                    range: {
                      sheetId: sheetId,
                      dimension: 'ROWS',
                      startIndex: rowToDelete - 1,
                      endIndex: rowToDelete
                    }
                  }
                }]
              }
            });
            console.log(`Google Sheets: Deleted row for ${memberName}`);
          }
        }
      } catch (sheetsError) {
        console.error('Error deleting from Google Sheets:', sheetsError.message);
        // Don't fail the request if Google Sheets deletion fails
      }
    }

    console.log(`Deleted registration: ${memberName} (ID: ${id})`);

    res.json({
      success: true,
      message: `Successfully deleted registration for ${memberName}`
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete registration',
      error: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==========================================
// PHOTO GALLERY ROUTES
// ==========================================

// Get all gallery photos
app.get('/api/gallery', async (req, res) => {
  try {
    const galleryData = await readGalleryData();
    // Sort by most recent first
    galleryData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(galleryData);
  } catch (error) {
    console.error('Error reading gallery data:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to load gallery. Please try again later.',
      error: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Upload photos to gallery
app.post('/api/gallery/upload', galleryUpload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photos selected. Please choose photos to upload.'
      });
    }

    const galleryData = await readGalleryData();
    const newPhotos = [];

    // Sanitize caption and uploadedBy to prevent XSS
    const caption = sanitizeString(req.body.caption || '', 200);
    const uploadedBy = sanitizeString(req.body.uploadedBy || 'Anonymous', 100);

    for (const file of req.files) {
      const photo = {
        id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
        url: `/gallery/${file.filename}`,
        caption: caption,
        uploadedBy: uploadedBy,
        createdAt: new Date().toISOString()
      };
      newPhotos.push(photo);
      galleryData.push(photo);
    }

    await writeGalleryData(galleryData);

    res.json({
      success: true,
      message: `${newPhotos.length} photo(s) uploaded successfully!`,
      uploaded: newPhotos.length,
      photos: newPhotos
    });
  } catch (error) {
    console.error('Gallery upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed. Please try again.',
      error: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete a photo from gallery
app.delete('/api/gallery/:id', async (req, res) => {
  try {
    const galleryData = await readGalleryData();
    const photoIndex = galleryData.findIndex(p => p.id === req.params.id);

    if (photoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    const photo = galleryData[photoIndex];

    // Delete file from disk - FIX path traversal vulnerability
    try {
      // Extract filename from URL and validate it
      const filename = path.basename(photo.url);
      // Ensure the file is in the gallery directory (prevent path traversal)
      const galleryDir = path.resolve(__dirname, 'gallery');
      const filePath = path.resolve(galleryDir, filename);

      // Verify the resolved path is still within the gallery directory
      if (!filePath.startsWith(galleryDir)) {
        throw new Error('Invalid file path');
      }

      await fs.unlink(filePath);
    } catch (err) {
      console.log('File already deleted or not found:', err.message);
    }

    galleryData.splice(photoIndex, 1);
    await writeGalleryData(galleryData);

    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to delete photo. Please try again.',
      error: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==========================================
// START SERVER
// ==========================================

Promise.all([
  ensureDirectories(),
  initializeDataFile(),
  initializeGalleryFile()
]).then(() => {
  // Serve static files from React build
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle client-side routing - this must be LAST, after all API routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

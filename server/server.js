const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3001;

// Google Sheets Integration (optional)
let sheets = null;
let sheetsEnabled = false;

async function initGoogleSheets() {
  if (process.env.GOOGLE_SHEETS_ENABLED !== 'true') {
    console.log('Google Sheets integration is disabled');
    return;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheets = google.sheets({ version: 'v4', auth });
    sheetsEnabled = true;
    console.log('Google Sheets integration enabled');
  } catch (error) {
    console.error('Failed to initialize Google Sheets:', error.message);
  }
}

async function syncToGoogleSheets(member) {
  if (!sheetsEnabled || !sheets) return;

  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const values = [[
      member.id,
      member.name,
      member.email,
      member.phone,
      member.city || '',
      member.relationshipType,
      member.connectedThrough,
      member.generation,
      member.familyBranch,
      member.attendees,
      member.createdAt
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Registrations!A:K',
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    console.log('Registration synced to Google Sheets');
  } catch (error) {
    console.error('Failed to sync to Google Sheets:', error.message);
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/gallery', express.static('gallery'));

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
// FAMILY REGISTRATION ROUTES
// ==========================================

app.post('/api/register', upload.single('photo'), async (req, res) => {
  try {
    const familyData = await readFamilyData();

    let photoPath = null;
    if (req.file) {
      // Optimize image with sharp
      const optimizedFilename = `optimized-${req.file.filename}`;
      const optimizedPath = path.join('uploads', optimizedFilename);

      try {
        await sharp(req.file.path)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toFile(optimizedPath);

        // Remove original file
        await fs.unlink(req.file.path);
        photoPath = `/uploads/${optimizedFilename}`;
      } catch (sharpError) {
        console.log('Sharp optimization failed, using original:', sharpError.message);
        photoPath = `/uploads/${req.file.filename}`;
      }
    }

    const newMember = {
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      city: req.body.city || '',
      relationshipType: req.body.relationshipType,
      connectedThrough: req.body.connectedThrough,
      generation: parseInt(req.body.generation),
      familyBranch: req.body.familyBranch,
      photo: photoPath,
      attendees: parseInt(req.body.attendees),
      createdAt: new Date().toISOString()
    };

    familyData.push(newMember);
    await writeFamilyData(familyData);

    // Sync to Google Sheets (if enabled)
    await syncToGoogleSheets(newMember);

    res.json({
      success: true,
      message: 'Registration successful!',
      member: newMember
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
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
      message: 'Failed to retrieve family data',
      error: error.message
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
      message: 'Failed to calculate statistics',
      error: error.message
    });
  }
});

// Get single member
app.get('/api/family/:id', async (req, res) => {
  try {
    const familyData = await readFamilyData();
    const member = familyData.find(m => m.id === req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json(member);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve member',
      error: error.message
    });
  }
});

// Update member
app.put('/api/family/:id', upload.single('photo'), async (req, res) => {
  try {
    const familyData = await readFamilyData();
    const memberIndex = familyData.findIndex(m => m.id === req.params.id);

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const existingMember = familyData[memberIndex];
    let photoPath = existingMember.photo;

    if (req.file) {
      // Delete old photo if exists
      if (existingMember.photo) {
        try {
          await fs.unlink(path.join(__dirname, existingMember.photo));
        } catch (err) {
          console.log('Old photo not found or already deleted');
        }
      }

      // Optimize new image
      const optimizedFilename = `optimized-${req.file.filename}`;
      const optimizedPath = path.join('uploads', optimizedFilename);

      try {
        await sharp(req.file.path)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toFile(optimizedPath);

        await fs.unlink(req.file.path);
        photoPath = `/uploads/${optimizedFilename}`;
      } catch (sharpError) {
        console.log('Sharp optimization failed, using original:', sharpError.message);
        photoPath = `/uploads/${req.file.filename}`;
      }
    }

    const updatedMember = {
      ...existingMember,
      name: req.body.name || existingMember.name,
      email: req.body.email || existingMember.email,
      phone: req.body.phone || existingMember.phone,
      city: req.body.city !== undefined ? req.body.city : existingMember.city,
      relationshipType: req.body.relationshipType || existingMember.relationshipType,
      connectedThrough: req.body.connectedThrough || existingMember.connectedThrough,
      generation: req.body.generation ? parseInt(req.body.generation) : existingMember.generation,
      familyBranch: req.body.familyBranch || existingMember.familyBranch,
      photo: photoPath,
      attendees: req.body.attendees ? parseInt(req.body.attendees) : existingMember.attendees,
      updatedAt: new Date().toISOString()
    };

    familyData[memberIndex] = updatedMember;
    await writeFamilyData(familyData);

    res.json({
      success: true,
      message: 'Member updated successfully!',
      member: updatedMember
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Update failed',
      error: error.message
    });
  }
});

// Delete member
app.delete('/api/family/:id', async (req, res) => {
  try {
    const familyData = await readFamilyData();
    const memberIndex = familyData.findIndex(m => m.id === req.params.id);

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const member = familyData[memberIndex];

    // Delete photo if exists
    if (member.photo) {
      try {
        await fs.unlink(path.join(__dirname, member.photo));
      } catch (err) {
        console.log('Photo not found or already deleted');
      }
    }

    familyData.splice(memberIndex, 1);
    await writeFamilyData(familyData);

    res.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed',
      error: error.message
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
      message: 'Failed to retrieve gallery',
      error: error.message
    });
  }
});

// Upload photos to gallery
app.post('/api/gallery/upload', galleryUpload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const galleryData = await readGalleryData();
    const newPhotos = [];

    // Parse captions array from JSON string
    let captions = [];
    if (req.body.captions) {
      try {
        captions = JSON.parse(req.body.captions);
      } catch (e) {
        captions = [];
      }
    }

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      // Optimize image with sharp
      const optimizedFilename = `optimized-${file.filename}`;
      const optimizedPath = path.join('gallery', optimizedFilename);
      let finalUrl = `/gallery/${file.filename}`;

      try {
        await sharp(file.path)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toFile(optimizedPath);

        // Remove original file
        await fs.unlink(file.path);
        finalUrl = `/gallery/${optimizedFilename}`;
      } catch (sharpError) {
        console.log('Sharp optimization failed, using original:', sharpError.message);
      }

      const photo = {
        id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
        url: finalUrl,
        caption: (captions[i] || '').substring(0, 25), // Enforce 25 char limit
        uploadedBy: req.body.uploadedBy || 'Anonymous',
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
      message: 'Failed to upload photos',
      error: error.message
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

    // Delete file from disk
    try {
      await fs.unlink(path.join(__dirname, photo.url));
    } catch (err) {
      console.log('File already deleted or not found');
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
      message: 'Failed to delete photo',
      error: error.message
    });
  }
});

// ==========================================
// START SERVER
// ==========================================

Promise.all([
  ensureDirectories(),
  initializeDataFile(),
  initializeGalleryFile(),
  initGoogleSheets()
]).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

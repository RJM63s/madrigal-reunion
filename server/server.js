const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3001;

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

    const newMember = {
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      relationshipType: req.body.relationshipType,
      connectedThrough: req.body.connectedThrough,
      generation: parseInt(req.body.generation),
      familyBranch: req.body.familyBranch,
      photo: req.file ? `/uploads/${req.file.filename}` : null,
      attendees: parseInt(req.body.attendees),
      createdAt: new Date().toISOString()
    };

    familyData.push(newMember);
    await writeFamilyData(familyData);

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

    for (const file of req.files) {
      const photo = {
        id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
        url: `/gallery/${file.filename}`,
        caption: req.body.caption || '',
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
  initializeGalleryFile()
]).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

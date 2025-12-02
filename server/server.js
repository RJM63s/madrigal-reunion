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

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Initialize family.json if it doesn't exist or is empty
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

// Read family data
async function readFamilyData() {
  try {
    const data = await fs.readFile('family.json', 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    return [];
  }
}

// Write family data
async function writeFamilyData(data) {
  await fs.writeFile('family.json', JSON.stringify(data, null, 2));
}

// Routes
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

// Start server
initializeDataFile().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

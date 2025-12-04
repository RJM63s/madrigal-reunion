# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets as the data storage backend for the Madrigal Family Reunion app.

## Overview

The app now uses Google Sheets instead of a local JSON file to store family registration data. This provides:
- ✅ Real-time data synchronization
- ✅ Easy data access and management through Google Sheets interface
- ✅ Automatic backups via Google Drive
- ✅ Collaborative data viewing and editing
- ✅ No local file management required

## Prerequisites

- A Google account
- Access to Google Cloud Console
- Basic understanding of environment variables

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: `Madrigal Reunion` (or your preferred name)
5. Click "Create"

### 2. Enable Google Sheets API

1. In your Google Cloud project, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

### 3. Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the details:
   - Service account name: `madrigal-reunion-service`
   - Service account ID: (auto-generated)
   - Description: `Service account for Madrigal Family Reunion app`
4. Click "Create and Continue"
5. Skip the optional steps by clicking "Done"

### 4. Generate Service Account Key

1. In the "Credentials" page, find your service account under "Service Accounts"
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create new key"
5. Choose "JSON" format
6. Click "Create"
7. A JSON file will download - **KEEP THIS FILE SECURE!**

### 5. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it: `Madrigal Family Reunion - Registrations`
4. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```
   The SHEET_ID is the long string between `/d/` and `/edit`

### 6. Share Sheet with Service Account

1. In your Google Sheet, click the "Share" button
2. Paste the service account email (from the JSON file: `client_email`)
3. Give it "Editor" permissions
4. Uncheck "Notify people"
5. Click "Share"

### 7. Configure Environment Variables

#### For Local Development (server/.env)

1. Navigate to the `server` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Open the `.env` file and fill in the values:

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=your_sheet_id_from_step_5
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Copy the entire private_key value from the JSON file
# Keep the quotes and \n characters exactly as they appear
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Admin Password (choose a secure password)
ADMIN_PASSWORD=your_secure_admin_password

# Server Configuration
PORT=3001

# Production URL (for QR code generation)
PRODUCTION_URL=https://madrigal-family-reunion.onrender.com
```

4. **Finding the values in your JSON file:**
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Look for `client_email` field
   - `GOOGLE_PRIVATE_KEY`: Look for `private_key` field (copy the entire value including quotes)

#### For Production (Render.com / Vercel / etc.)

Add these as environment variables in your hosting platform's dashboard:

```
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour key\n-----END PRIVATE KEY-----\n
ADMIN_PASSWORD=your_secure_password
PORT=3001
PRODUCTION_URL=https://your-app-url.com
```

**Important for Production:**
- The `GOOGLE_PRIVATE_KEY` must include the `\n` characters (not actual newlines)
- Some platforms may require you to wrap the key in quotes
- Test the connection after deployment

### 8. Configure Client Environment Variables (Optional)

#### For Local Development (client/.env)

1. Navigate to the `client` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Set the production URL (optional - defaults to current origin):
```env
VITE_PRODUCTION_URL=https://madrigal-family-reunion.onrender.com
```

This will make the QR code point to your production URL even in local development.

## Google Sheet Structure

The app will automatically create the following columns in your sheet:

| Column | Description |
|--------|-------------|
| Timestamp | Date and time of registration |
| ID | Unique identifier |
| First Name | First name of family member |
| Last Name | Last name of family member |
| Email | Email address |
| Phone | Phone number |
| Relationship Type | Type of family relationship |
| Connected To | Who they're connected through |
| Generation | Generation number (1-5) |
| Branch Description | Family branch description |
| Number of Attendees | Number of people attending |
| Photo URL | Path to uploaded photo |
| Notes | Additional notes |

## Testing the Integration

### 1. Start the Server

```bash
cd server
npm start
```

You should see:
```
✅ Google Sheets initialized successfully
📊 Sheet: Sheet1
✅ Server running on http://localhost:3001
📊 Connected to Google Sheet: Madrigal Family Reunion - Registrations
```

### 2. Test Registration

1. Start the client app:
   ```bash
   cd client
   npm run dev
   ```

2. Navigate to the registration page
3. Fill out and submit the form
4. Check your Google Sheet - you should see a new row with the data!

### 3. Test Admin Access

1. Navigate to `/admin` in your browser
2. Enter the password you set in `ADMIN_PASSWORD`
3. You should see the admin dashboard with stats and family data

## Troubleshooting

### Error: "GOOGLE_SHEET_ID not found in environment variables"

**Solution:** Make sure your `.env` file exists in the `server` directory and contains `GOOGLE_SHEET_ID`

### Error: "Failed to initialize Google Sheets"

**Possible causes:**
1. Sheet ID is incorrect
2. Service account doesn't have access to the sheet
3. Google Sheets API is not enabled

**Solution:**
1. Verify the Sheet ID in your `.env` file
2. Check that you shared the sheet with the service account email
3. Confirm Google Sheets API is enabled in Google Cloud Console

### Error: "Invalid admin password"

**Solution:** Check that `ADMIN_PASSWORD` in server `.env` matches what you're entering

### Private Key Format Issues

If you're getting authentication errors, ensure:
1. The private key includes `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
2. Newlines are represented as `\n` (not actual line breaks)
3. The entire key is wrapped in quotes

**Example:**
```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...(rest of key)...\n-----END PRIVATE KEY-----\n"
```

### Photos Not Showing

**Note:** Photos are still stored locally in the `server/uploads/` directory. Only the photo URL is stored in Google Sheets.

For production, you'll need to:
1. Use a cloud storage service (AWS S3, Cloudinary, etc.) for photos
2. Update the upload logic to store photos in cloud storage
3. Save the cloud storage URL in Google Sheets

## Security Best Practices

1. **Never commit your `.env` file** - It's already in `.gitignore`
2. **Keep your service account JSON file secure** - Don't share it publicly
3. **Use a strong admin password** - Consider using a password manager
4. **Regularly rotate credentials** - Update service account keys periodically
5. **Limit service account permissions** - Only give Editor access to the specific sheet

## Data Migration (if you have existing data)

If you have data in the old `family.json` file:

1. Open your `family.json` file
2. Open your Google Sheet
3. Manually copy the data or use a script to import it

**Migration Script (optional):**
Create a file `server/migrate.js`:

```javascript
require('dotenv').config();
const fs = require('fs').promises;
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

async function migrate() {
  // Read old data
  const data = JSON.parse(await fs.readFile('family.json', 'utf8'));

  // Initialize Google Sheets
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];

  // Add each member
  for (const member of data) {
    const [firstName, ...lastNameParts] = member.name.split(' ');
    const lastName = lastNameParts.join(' ');

    await sheet.addRow({
      'Timestamp': member.createdAt || new Date().toISOString(),
      'ID': member.id,
      'First Name': firstName,
      'Last Name': lastName,
      'Email': member.email,
      'Phone': member.phone,
      'Relationship Type': member.relationshipType,
      'Connected To': member.connectedThrough,
      'Generation': member.generation.toString(),
      'Branch Description': member.familyBranch,
      'Number of Attendees': (member.attendees || 0).toString(),
      'Photo URL': member.photo || '',
      'Notes': ''
    });

    console.log(`Migrated: ${member.name}`);
  }

  console.log('Migration complete!');
}

migrate().catch(console.error);
```

Run with:
```bash
node migrate.js
```

## Support

If you encounter issues:

1. Check the server console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure the Google Sheet is shared with the service account
4. Confirm Google Sheets API is enabled

## Next Steps

Once everything is working:

1. ✅ Test registration flow end-to-end
2. ✅ Verify data appears in Google Sheet
3. ✅ Test admin dashboard access
4. ✅ Set up production deployment with environment variables
5. ✅ Configure cloud storage for photos (optional)
6. ✅ Set up automated backups (Google Sheets does this automatically!)

---

**Created for Madrigal Family Reunion App**
For questions or issues, refer to this documentation or check the `.env.example` files.

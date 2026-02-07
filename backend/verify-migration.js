const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'motion_studio.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

// Check the projects table schema
db.all("PRAGMA table_info(projects)", (err, rows) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  
  console.log('\n=== Projects Table Schema ===\n');
  rows.forEach(row => {
    console.log(`${row.name.padEnd(25)} ${row.type.padEnd(10)} ${row.notnull ? 'NOT NULL' : 'NULL'.padEnd(8)} ${row.dflt_value ? `DEFAULT ${row.dflt_value}` : ''}`);
  });
  
  // Check for new fields
  const newFields = ['thumbnailPath', 'caseStudyPath', 'mediaType', 'videoPath', 'videoThumbnailPath', 'videoDuration', 'galleryImages'];
  const existingFields = rows.map(r => r.name);
  
  console.log('\n=== Migration Status ===\n');
  newFields.forEach(field => {
    const exists = existingFields.includes(field);
    console.log(`${field.padEnd(25)} ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
  });
  
  db.close();
});

const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function runMigration(direction = 'up') {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  try {
    if (direction === 'up') {
      for (const file of files) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await pool.query(sql);
        console.log(`✓ Completed: ${file}`);
      }
      console.log('\nAll migrations completed successfully!');
    } else if (direction === 'undo') {
      for (let i = files.length - 1; i >= 0; i--) {
        console.log(`Undo migration not implemented (file: ${files[i]})`);
      }
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

const direction = process.argv[2] === 'undo' ? 'undo' : 'up';
runMigration(direction);
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🗄️  VenueKart Database Setup');
console.log('=============================\n');

// Check if .env file exists
const envPath = join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('📝 Please copy .env.example to .env and configure your database settings:\n');
  console.log('   cp .env.example .env\n');
  console.log('📋 Required environment variables:');
  console.log('   - DATABASE_URL or DB_* variables');
  console.log('   - JWT_SECRET');
  console.log('   - SESSION_SECRET');
  console.log('   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (for OAuth)');
  console.log('   - CLOUDINARY_* variables (for image uploads)\n');
  process.exit(1);
}

console.log('✅ Environment file found');

// Check if PostgreSQL is installed
console.log('🔍 Checking PostgreSQL installation...');

const checkPostgres = () => {
  return new Promise((resolve) => {
    const psql = spawn('psql', ['--version'], { shell: true });
    
    psql.on('close', (code) => {
      if (code === 0) {
        console.log('✅ PostgreSQL is installed');
        resolve(true);
      } else {
        console.log('❌ PostgreSQL not found');
        console.log('\n📦 Please install PostgreSQL:');
        console.log('   - Windows: Download from https://www.postgresql.org/download/windows/');
        console.log('   - macOS: brew install postgresql');
        console.log('   - Ubuntu: sudo apt-get install postgresql postgresql-contrib');
        console.log('   - Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres\n');
        resolve(false);
      }
    });
    
    psql.on('error', () => {
      resolve(false);
    });
  });
};

const createDatabase = () => {
  return new Promise((resolve) => {
    console.log('🏗️  Creating database (if it doesn\'t exist)...');
    
    // Load environment variables
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    
    const dbName = envVars.DB_NAME || 'venuekart';
    const dbUser = envVars.DB_USER || 'postgres';
    const dbPassword = envVars.DB_PASSWORD || 'password';
    const dbHost = envVars.DB_HOST || 'localhost';
    const dbPort = envVars.DB_PORT || '5432';
    
    console.log(`📍 Database: ${dbName}`);
    console.log(`👤 User: ${dbUser}`);
    console.log(`🌐 Host: ${dbHost}:${dbPort}\n`);
    
    // Create database if it doesn't exist
    const createDbCommand = `PGPASSWORD=${dbPassword} createdb -h ${dbHost} -p ${dbPort} -U ${dbUser} ${dbName}`;
    
    const createDb = spawn(createDbCommand, { shell: true });
    
    createDb.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    createDb.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('already exists')) {
        console.log('ℹ️  Database already exists');
      } else if (!error.includes('password authentication failed')) {
        console.log('⚠️ ', error);
      }
    });
    
    createDb.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Database ready');
      } else {
        console.log('ℹ️  Database may already exist or check your credentials');
      }
      resolve(true);
    });
    
    createDb.on('error', () => {
      console.log('⚠️  Could not create database automatically');
      console.log('📝 Please create the database manually:');
      console.log(`   CREATE DATABASE ${dbName};`);
      resolve(true);
    });
  });
};

const testConnection = async () => {
  console.log('🔗 Testing database connection...');
  
  try {
    // Import and test database connection
    const { default: pool } = await import('../server/config/database.js');
    const client = await pool.connect();
    
    console.log('✅ Database connection successful');
    client.release();
    
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your .env database configuration');
    console.log('   2. Ensure PostgreSQL is running');
    console.log('   3. Verify database credentials');
    console.log('   4. Check if the database exists\n');
    return false;
  }
};

const initializeTables = async () => {
  console.log('📋 Initializing database tables...');
  
  try {
    const { initializeDatabase } = await import('../server/config/database.js');
    await initializeDatabase();
    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.log('❌ Failed to initialize tables:', error.message);
    return false;
  }
};

const main = async () => {
  try {
    // Check PostgreSQL installation
    const postgresInstalled = await checkPostgres();
    if (!postgresInstalled) {
      process.exit(1);
    }
    
    // Create database
    await createDatabase();
    
    // Test connection
    const connectionSuccess = await testConnection();
    if (!connectionSuccess) {
      process.exit(1);
    }
    
    // Initialize tables
    const tablesInitialized = await initializeTables();
    if (!tablesInitialized) {
      process.exit(1);
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Configure Google OAuth (optional):');
    console.log('      - Go to Google Cloud Console');
    console.log('      - Create OAuth 2.0 credentials');
    console.log('      - Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env');
    console.log('   2. Configure Cloudinary (optional):');
    console.log('      - Sign up at cloudinary.com');
    console.log('      - Add CLOUDINARY_* variables to .env');
    console.log('   3. Start the development server:');
    console.log('      npm run dev\n');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
};

main();

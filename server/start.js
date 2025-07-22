import { createServer, initializeServer, setupGracefulShutdown } from './index.js';

async function start() {
  try {
    // Initialize server with database and setup
    await initializeServer();
    
    // Create Express app
    const app = createServer();
    
    // Setup graceful shutdown
    setupGracefulShutdown();
    
    // Start server
    const PORT = process.env.PORT || 3001;
    const server = app.listen(PORT, () => {
      console.log(`🚀 VenueKart server running on port ${PORT}`);
      console.log(`📱 API Documentation: http://localhost:${PORT}/api/health`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('\n🔧 Development Mode:');
        console.log(`   - API Base URL: http://localhost:${PORT}/api`);
        console.log(`   - Health Check: http://localhost:${PORT}/api/health`);
        console.log(`   - Google OAuth: http://localhost:${PORT}/api/auth/google`);
        console.log('\n📚 Available Endpoints:');
        console.log('   Authentication:');
        console.log('     POST /api/auth/register');
        console.log('     POST /api/auth/login');
        console.log('     GET  /api/auth/google');
        console.log('     POST /api/auth/refresh');
        console.log('     GET  /api/auth/me');
        console.log('   Venues:');
        console.log('     GET  /api/venues');
        console.log('     POST /api/venues');
        console.log('     GET  /api/venues/:id');
        console.log('     PUT  /api/venues/:id');
        console.log('   Bookings:');
        console.log('     POST /api/bookings');
        console.log('     GET  /api/bookings/my-bookings');
        console.log('     GET  /api/bookings/:id');
      }
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
start();

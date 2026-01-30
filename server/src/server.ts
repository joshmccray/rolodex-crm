import 'dotenv/config';
import app from './app.js';
import { startAllJobs } from './jobs/index.js';

const PORT = process.env.PORT || 3001;

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please copy .env.example to .env and fill in the values.');
  process.exit(1);
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Start background jobs in production
  if (process.env.NODE_ENV === 'production') {
    startAllJobs();
  } else {
    console.log('Skipping background jobs in development mode');
    console.log('To start jobs manually, import and call startAllJobs()');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

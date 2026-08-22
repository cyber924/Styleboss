/**
 * @fileoverview This is the entry point for the Firebase Cloud Function
 * that will serve the Next.js application.
 */
import { https } from 'firebase-functions/v2';
import next from 'next';
import { config } from 'dotenv';
config();

const isDev = process.env.NODE_ENV !== 'production';

// Initialize the Next.js server.
// The `conf` object points to the build directory (.next).
const server = next({
  dev: isDev,
  conf: { distDir: '.next' },
});

const nextjsHandle = server.getRequestHandler();

// Export the cloud function `nextApp` that will handle all incoming requests.
export const nextApp = https.onRequest(
  {
    // You can customize function options here
    region: 'us-central1', // Example: set the region
    memory: '1GiB',
  },
  (req, res) => {
    // Ensure the Next.js server is prepared before handling requests.
    return server.prepare().then(() => nextjsHandle(req, res));
  }
);

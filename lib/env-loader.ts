// Environment loader utility to ensure DATABASE_URL is available
// Simplified version that relies on Next.js built-in environment loading

// Get DATABASE_URL from environment with fallback handling
export const DATABASE_URL = process.env.DATABASE_URL;

// Debug function to check environment loading (server-side only)
export function debugEnvironment() {
  if (typeof window !== 'undefined') {
    console.log('🔍 Environment debug not available on client-side');
    return;
  }
  
  console.log('🔍 Environment Debug Info:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- Working Directory:', process.cwd());
  console.log('- DATABASE_URL available:', !!process.env.DATABASE_URL);
  console.log('- All env vars with DATABASE:', Object.keys(process.env).filter(key => key.includes('DATABASE')));
}

// Validate that DATABASE_URL is available (server-side only)
if (typeof window === 'undefined' && !DATABASE_URL) {
  console.error('❌ Failed to load DATABASE_URL from environment variables');
  console.error('📂 Current working directory:', process.cwd());
  console.error('💡 Make sure .env.local exists in the project root');
  console.error('🔄 Try restarting the development server');
  debugEnvironment();
}

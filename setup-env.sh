#!/bin/bash

# Environment Setup Script for Student Feedback Application
# This script helps verify and set up the required environment variables

echo "🔍 Student Feedback App - Environment Setup"
echo "==========================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "💡 Creating .env.local template..."
    
    cat > .env.local << 'EOF'
# Neon Database Configuration
DATABASE_URL=postgresql://YOUR_NEON_DATABASE_CONNECTION_STRING

# Optional: For production deployments
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Admin login override
NEXT_PUBLIC_ADMIN_EMAIL=admin@olagshs.edu.gh
NEXT_PUBLIC_ADMIN_PASSWORD=change-this-password
EOF
    
    echo "✅ Created .env.local template"
else
    echo "✅ .env.local file exists"
fi

# Check DATABASE_URL
if grep -q "DATABASE_URL=" .env.local; then
    echo "✅ DATABASE_URL is configured"
else
    echo "❌ DATABASE_URL not found in .env.local"
    echo "💡 Please add: DATABASE_URL=postgresql://..."
fi

echo ""
echo "🚀 Setup complete!"
echo "📝 Next steps:"
echo "   1. Run: npm install"
echo "   2. Run: npm run dev"
echo "   3. Open: http://localhost:3000"
echo ""
echo "🔧 If you encounter 'DATABASE_URL must be set' error:"
echo "   - Restart the development server: npm run dev"
echo "   - Verify .env.local is in the project root"
echo "   - Check DATABASE_URL is not commented out"

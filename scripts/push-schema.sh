#!/bin/bash
# Script to confirm schema push
cd /Users/cyphahimself/Desktop/feedback/student-feedback
echo "✅ Pushing database schema to Neon..."
echo -e "\n" | npx drizzle-kit push

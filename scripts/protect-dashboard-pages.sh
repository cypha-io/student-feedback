#!/bin/bash

# Script to add ProtectedRoute wrapper to all dashboard pages

DASHBOARD_PAGES=(
    "app/dashboard/teachers/page.tsx"
    "app/dashboard/questions/page.tsx"
    "app/dashboard/settings/page.tsx"
    "app/dashboard/teacher-evaluation-reports/page.tsx"
    "app/dashboard/reports/page.tsx"
)

for page in "${DASHBOARD_PAGES[@]}"; do
    echo "Processing $page..."
    
    # Check if file exists
    if [ ! -f "$page" ]; then
        echo "File $page does not exist, skipping..."
        continue
    fi
    
    # Add ProtectedRoute import if not already present
    if ! grep -q "import ProtectedRoute" "$page"; then
        # Find the line with DashboardLayout import and add ProtectedRoute import after it
        if grep -q "import.*DashboardLayout" "$page"; then
            sed -i '' '/import.*DashboardLayout/a\
import ProtectedRoute from'\''@/components/ProtectedRoute'\'';' "$page"
        else
            # If no DashboardLayout import, add it at the top of imports
            sed -i '' '1a\
import ProtectedRoute from '\''@/components/ProtectedRoute'\'';' "$page"
        fi
    fi
    
    echo "Added ProtectedRoute import to $page"
done

echo "Done! Remember to manually wrap the return statements with <ProtectedRoute> tags."

# SMEI - Student-Teacher Evaluation & Management Intelligence

A comprehensive web application for collecting and analyzing student feedback on teacher performance. Built with Next.js, TypeScript, and Appwrite as the backend.

**Software Developer:** Chamba Nanang - Cypha Inc.  
**Deployed for:** Our Lady of Grace Senior High School (OLAGSHS)

## Features

### Student Interface
- **Section-based Evaluation Form**: Students evaluate teachers across 8 standardized sections (A-H)
- **Real-time Scoring**: Instant calculation of section scores and overall performance
- **Performance Grading**: Automatic grade assignment (Excellent, Good, Average, Poor)
- **Anonymous Submissions**: Optional student identification for privacy

### Admin Dashboard
- **Evaluation Overview**: Comprehensive dashboard with key metrics and recent activity
- **Teacher Management**: Manage teacher profiles and evaluation data
- **Question Management**: Create, edit, and organize evaluation questions by section
- **Performance Reports**: Detailed analytics with section-by-section breakdowns
- **Student Responses**: View and filter all submitted feedback
- **System Settings**: Configure application-wide settings

### Analytics & Reporting
- **Section Averages**: Performance tracking across all evaluation categories
- **Teacher Rankings**: Compare teacher performance across the system
- **Trend Analysis**: Track evaluation trends over time
- **Export Capabilities**: Download reports and data for external analysis

## Technical Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Appwrite (Database, Authentication)
- **Deployment**: Optimized for Vercel

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Appwrite account and project configured
- Environment variables set up (see APPWRITE_SETUP.md)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd student-feedback
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Appwrite credentials (see APPWRITE_SETUP.md for details)

4. Populate initial data:
```bash
# Load standard evaluation questions
node scripts/populate-feedback-questions.js
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) to view the application

## Usage

### For Students
1. Navigate to `/student-feedback`
2. Enter teacher name and optional student identification
3. Complete the evaluation across all sections (A-H)
4. Submit feedback and view real-time scoring

### For Administrators
1. Access the admin dashboard at `/dashboard`
2. Use the navigation to access different management areas:
   - **Evaluation Overview**: Main dashboard with metrics
   - **Teacher Management**: Manage teacher profiles
   - **Evaluation Questions**: Customize evaluation criteria
   - **Performance Reports**: View detailed analytics
   - **Student Responses**: Review all submissions
   - **System Settings**: Configure the application

## Database Schema

### Questions Collection
- Section-based organization (A-H)
- Standard evaluation criteria
- Customizable question text and ordering

### Feedback Collection
- Teacher evaluation responses
- Section scores and overall performance
- Submission timestamps and student information

## Development

### File Structure
```
app/
├── dashboard/           # Admin interface
├── student-feedback/    # Student evaluation form
└── lib/                # Shared utilities
components/             # Reusable UI components
types/                  # TypeScript definitions
scripts/                # Database utilities
```

### Key Components
- `DashboardLayout`: Admin navigation and layout
- `ClientProvider`: Appwrite client configuration
- Database utilities in `/lib/appwrite.ts`

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=your_appwrite_endpoint
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_QUESTIONS_COLLECTION_ID=questions_collection_id
NEXT_PUBLIC_APPWRITE_FEEDBACK_COLLECTION_ID=feedback_collection_id
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please refer to the documentation or create an issue in the repository.

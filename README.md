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
- **Backend**: Neon Database (PostgreSQL) with Drizzle ORM
- **Deployment**: Optimized for Vercel

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Neon database account and project configured
- Environment variables set up

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
   - Add your Neon database URL:
   ```
   DATABASE_URL=your_neon_database_connection_string
   ```

4. Generate and run database migrations:
```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push
```

5. Populate initial data:
```bash
# Load sample data including classes with years
npm run db:populate
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) to view the application

## Database Management

### Drizzle Commands
- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:push` - Push schema changes directly to database
- `npm run db:migrate` - Run pending migrations
- `npm run db:studio` - Open Drizzle Studio for database browsing
- `npm run db:populate` - Populate database with sample data

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

### Core Tables

#### Classes Table
- **Enhanced with Year Field**: Classes now include both grade and academic year for better differentiation
- Example: "Form 1A - 2024-2025" vs "Form 1A - 2025-2026"
- Supports capacity tracking

#### Subjects Table  
- **Simplified Structure**: Removed subject codes for cleaner management
- Focus on subject name and department association
- Streamlined subject selection interface

#### Teachers Table
- Teacher profiles with department assignments
- Subject associations and class responsibilities
- Contact information management

#### Students Table
- Student profiles with class and section assignments
- Support for evaluation submissions

#### Feedback & Responses
- Comprehensive evaluation tracking
- Section-based scoring (A-H categories)
- Performance metrics and grading

### Key Improvements

- **Class Differentiation**: Academic year field added to distinguish classes across different years
- **Simplified Subjects**: Removed unnecessary subject code complexity  
- **PostgreSQL Benefits**: Better performance, ACID compliance, and advanced querying
- **Type Safety**: Full TypeScript support with Drizzle ORM

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
- `ClientProvider`: Database client configuration
- Database utilities in `/lib/db/` and schema definitions
- Drizzle ORM integration for type-safe database operations

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables
```env
DATABASE_URL=your_neon_database_connection_string
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please refer to the documentation or create an issue in the repository.

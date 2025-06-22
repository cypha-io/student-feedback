# Appwrite Setup Guide

## 1. Install Appwrite SDK

```bash
npm install appwrite
```

## 2. Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id_here
NEXT_PUBLIC_APPWRITE_TEACHERS_COLLECTION_ID=teachers
NEXT_PUBLIC_APPWRITE_STUDENTS_COLLECTION_ID=students
NEXT_PUBLIC_APPWRITE_SUBJECTS_COLLECTION_ID=subjects
NEXT_PUBLIC_APPWRITE_CLASSES_COLLECTION_ID=classes
NEXT_PUBLIC_APPWRITE_DEPARTMENTS_COLLECTION_ID=departments
NEXT_PUBLIC_APPWRITE_QUESTIONS_COLLECTION_ID=questions
NEXT_PUBLIC_APPWRITE_FEEDBACKS_COLLECTION_ID=feedbacks
NEXT_PUBLIC_APPWRITE_RESPONSES_COLLECTION_ID=responses
```

## 3. Appwrite Console Setup

### Create Project
1. Go to [Appwrite Console](https://cloud.appwrite.io/console)
2. Create a new project
3. Copy the Project ID

### Create Database
1. Go to Databases in your project
2. Create a new database
3. Copy the Database ID

### Create Collections

#### Teachers Collection
- **Collection ID**: `teachers`
- **Attributes**:
  - `name` (String, Required, Size: 255)
  - `employeeId` (String, Required, Size: 50, Unique)
  - `department` (String, Required, Size: 100)
  - `class` (String, Required, Size: 50)
  - `subjects` (String Array, Required)
  - `email` (Email, Required, Size: 255)
  - `phone` (String, Size: 20)

#### Students Collection
- **Collection ID**: `students`
- **Attributes**:
  - `name` (String, Required, Size: 255)
  - `studentId` (String, Required, Size: 50, Unique)
  - `class` (String, Required, Size: 50)
  - `section` (String, Required, Size: 10)
  - `email` (Email, Required, Size: 255)
  - `phone` (String, Size: 20)

#### Subjects Collection
- **Collection ID**: `subjects`
- **Attributes**:
  - `name` (String, Required, Size: 255)
  - `code` (String, Required, Size: 20, Unique)
  - `department` (String, Required, Size: 100)
  - `credits` (Integer, Required, Min: 1, Max: 10)

#### Classes Collection
- **Collection ID**: `classes`
- **Attributes**:
  - `name` (String, Required, Size: 255)
  - `grade` (String, Required, Size: 20)
  - `section` (String, Required, Size: 10)
  - `capacity` (Integer, Required, Min: 1, Max: 100)

#### Departments Collection
- **Collection ID**: `departments`
- **Attributes**:
  - `name` (String, Required, Size: 255)
  - `code` (String, Required, Size: 20, Unique)
  - `head` (String, Required, Size: 255)
  - `description` (String, Size: 1000)

#### Questions Collection
- **Collection ID**: `questions`
- **Attributes**:
  - `question` (String, Required, Size: 1000)
  - `type` (Enum, Required, Elements: ['rating', 'text', 'multiple_choice'])
  - `options` (String Array)
  - `required` (Boolean, Required, Default: true)
  - `category` (String, Required, Size: 100)
  - `order` (Integer, Min: 1, Max: 100)

#### Feedbacks Collection
- **Collection ID**: `feedbacks`
- **Attributes**:
  - `studentId` (String, Required, Size: 255)
  - `teacherId` (String, Required, Size: 255)
  - `subjectId` (String, Required, Size: 255)
  - `classId` (String, Required, Size: 255)
  - `status` (Enum, Required, Elements: ['pending', 'completed', 'draft'], Default: 'pending')
  - `submittedAt` (DateTime)

#### Responses Collection
- **Collection ID**: `responses`
- **Attributes**:
  - `feedbackId` (String, Required, Size: 255)
  - `questionId` (String, Required, Size: 255)
  - `answer` (String, Required, Size: 2000)
  - `type` (Enum, Required, Elements: ['rating', 'text', 'multiple_choice'])

## 4. Database Permissions

For each collection, set the following permissions:

### Create Permissions
- Add role: `users` with `create` permission

### Read Permissions
- Add role: `users` with `read` permission

### Update Permissions
- Add role: `users` with `update` permission

### Delete Permissions
- Add role: `users` with `delete` permission

## 5. Testing the Integration

1. Start your development server: `npm run dev`
2. Navigate to the settings page to test CRUD operations
3. Check the Appwrite console to verify data is being stored

## 6. Authentication (Optional)

If you want to add user authentication:

1. Enable Email/Password authentication in Appwrite Console
2. Create auth service in your app
3. Implement login/register functionality

## Features Integrated with Appwrite

✅ **Teachers Management**: Full CRUD operations
✅ **Subjects Management**: Add, edit, delete subjects
✅ **Classes Management**: Manage class information
✅ **Departments Management**: Department configuration
✅ **Data Persistence**: All data stored in Appwrite
✅ **Error Handling**: Graceful fallbacks to mock data
✅ **TypeScript Support**: Fully typed interfaces
✅ **Real-time Updates**: Automatic UI updates after operations

## 🚨 TROUBLESHOOTING - CURRENT ISSUE

**Your application is configured but data isn't saving to the database. Here's how to fix it:**

### Step 1: Check Browser Console
1. Go to `http://localhost:3001/dashboard/teachers`
2. Press F12 to open Developer Console
3. Look for configuration logs:
```
🔧 Appwrite Configuration:
- Endpoint: https://cloud.appwrite.io/v1
- Project ID: 68567c270022407815f0
- Database ID: 68567c3a002af4b231c1
```

### Step 2: Test Adding a Teacher
1. Click "Add New Teacher"
2. Fill the form and submit
3. Watch console for these logs:
   - `🚀 Attempting to save teacher to Appwrite...`
   - `📝 Creating document in collection: teachers`
   - Either `✅ Successfully created` or `❌ Error saving`

### Step 3: Likely Issues & Solutions

**Issue 1: Collections Don't Exist**
```
❌ Error: Collection with the requested ID could not be found
```
**Solution:** Create these collections in Appwrite Console:
- `teachers` (with attributes: name, employeeId, department, class, subjects, email, phone)
- `subjects`, `classes`, `departments`, etc.

**Issue 2: Wrong Project/Database ID**
```
❌ Error: Project with the requested ID could not be found
```
**Solution:** Verify in Appwrite Console that:
- Project ID is: `68567c270022407815f0`
- Database ID is: `68567c3a002af4b231c1`

**Issue 3: Permissions**
```
❌ Error: User (role: guests) missing scope
```
**Solution:** Set permissions in each collection to "Any" for Create/Read/Update/Delete

### Step 4: Quick Fix
1. **Go to [Appwrite Console](https://cloud.appwrite.io/)**
2. **Open project: `68567c270022407815f0`**
3. **Open database: `68567c3a002af4b231c1`**
4. **Create collection: `teachers`**
5. **Add attributes and set permissions to "Any"**
6. **Try adding a teacher again**

**The console logs will tell you exactly what's wrong!**

---

## Next Steps

1. Set up Appwrite project and collections
2. Update environment variables
3. Test all functionality
4. Add authentication if needed
5. Deploy to production with proper Appwrite settings
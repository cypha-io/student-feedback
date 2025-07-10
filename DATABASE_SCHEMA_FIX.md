# Database Schema Fix Instructions

## Problem
The Appwrite database collection for `questions` is missing required attributes, causing the error:
```
AppwriteException: Invalid document structure: Unknown attribute: "questionNumber"
```

## Solution: Update Appwrite Database Schema

### Step 1: Access Appwrite Console
1. Go to [Appwrite Console](https://cloud.appwrite.io/console)
2. Navigate to your project: `68567c270022407815f0`
3. Go to **Databases** → Select database `68567c3a002af4b231c1`
4. Find the **questions** collection

### Step 2: Add Missing Attributes to Questions Collection

The questions collection needs these additional attributes:

#### Add These Attributes:

1. **section**
   - Type: String
   - Size: 10
   - Required: No
   - Default: ""
   - Description: Section identifier (A, B, C, D, E, F, G, H)

2. **sectionTitle**
   - Type: String  
   - Size: 255
   - Required: No
   - Default: ""
   - Description: Human-readable section title

3. **questionNumber**
   - Type: Integer
   - Min: 1
   - Max: 50
   - Required: No
   - Default: 1
   - Description: Global question number

4. **maxScore**
   - Type: Integer
   - Min: 1
   - Max: 10
   - Required: No
   - Default: 5
   - Description: Maximum score for rating questions

### Step 3: Update Feedbacks Collection

The feedbacks collection needs these additional attributes for the new teacher evaluation system:

1. **responses**
   - Type: String (JSON)
   - Size: 5000
   - Required: No
   - Description: JSON object containing all question responses

2. **overallScore**
   - Type: Float
   - Required: No
   - Default: 0.0
   - Description: Overall evaluation score

3. **sectionScores**
   - Type: String (JSON)
   - Size: 2000
   - Required: No
   - Description: JSON object containing section-wise scores

4. **performanceGrade**
   - Type: String
   - Size: 50
   - Required: No
   - Description: Performance grade (Excellent, Good, Average, Poor)

5. **teacherName**
   - Type: String
   - Size: 255
   - Required: Yes
   - Description: Name of the teacher being evaluated

6. **studentName**
   - Type: String
   - Size: 255
   - Required: No
   - Description: Name of the student (optional for anonymous feedback)

### Step 4: Update Responses Collection

Add these attributes to the responses collection:

1. **section**
   - Type: String
   - Size: 10
   - Required: No
   - Description: Section identifier

2. **question**
   - Type: String
   - Size: 1000
   - Required: No
   - Description: The question text

3. **rating**
   - Type: Integer
   - Min: 1
   - Max: 5
   - Required: No
   - Description: Numeric rating value

### Step 5: Permissions

Ensure all collections have proper permissions:
- **Create**: Any authenticated user
- **Read**: Any authenticated user  
- **Update**: Any authenticated user
- **Delete**: Any authenticated user

### Step 6: Test the Fix

After updating the schema:

1. Go to: `http://localhost:3000/test-db`
2. Click "Test Connection"
3. Click "Populate Test Questions"
4. Go to: `http://localhost:3000/dashboard/questions`
5. Click "Load Standard Questions"

## Alternative: Simplified Version

If you prefer to keep the current schema simple, we can modify the application to work with the existing schema. The questions would be stored as:

```
question: "[A] Encourages Student-Teacher Relationship: Teacher creates positive rapport..."
type: "rating"
category: "teaching_effectiveness"
order: 1
required: true
```

The section information would be parsed from the question text prefix `[A]`.

## Current Working Solution

The application has been updated to work with the existing schema by:
1. Embedding section info in the question text
2. Parsing section data when needed
3. Using only the existing attributes

Try the "Load Standard Questions" button in the Questions page - it should now work with the current schema.

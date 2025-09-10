const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = 'postgresql://neondb_owner:npg_fz3xrnXlJgc6@ep-flat-fog-adsk3osy-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixTeacherData() {
  try {
    console.log('🔧 Fixing teacher department and class data...');
    const sql = neon(DATABASE_URL);
    
    // First, let's see what we have
    const teachers = await sql`SELECT id, name, department, class FROM teachers`;
    console.log('📊 Current teacher data:');
    teachers.forEach(teacher => {
      console.log(`  ${teacher.name}: dept="${teacher.department}", class="${teacher.class}"`);
    });
    
    // Check if departments table exists and has data
    const departments = await sql`SELECT id, name FROM departments`;
    console.log('\n📁 Available departments:');
    departments.forEach(dept => {
      console.log(`  ${dept.id} -> ${dept.name}`);
    });
    
    // Check if classes table exists and has data
    const classes = await sql`SELECT id, name FROM classes`;
    console.log('\n🏫 Available classes:');
    classes.forEach(cls => {
      console.log(`  ${cls.id} -> ${cls.name}`);
    });
    
    // Update teachers with UUID references to use readable names
    for (const teacher of teachers) {
      let needsUpdate = false;
      let newDepartment = teacher.department;
      let newClass = teacher.class;
      
      // Check if department is a UUID (contains hyphens and is 36 chars)
      if (teacher.department && teacher.department.includes('-') && teacher.department.length === 36) {
        const dept = departments.find(d => d.id === teacher.department);
        if (dept) {
          newDepartment = dept.name;
          needsUpdate = true;
          console.log(`\n🔄 ${teacher.name}: Converting department UUID to "${dept.name}"`);
        }
      }
      
      // Check if class is a UUID
      if (teacher.class && teacher.class.includes('-') && teacher.class.length === 36) {
        const cls = classes.find(c => c.id === teacher.class);
        if (cls) {
          newClass = cls.name;
          needsUpdate = true;
          console.log(`🔄 ${teacher.name}: Converting class UUID to "${cls.name}"`);
        }
      }
      
      // Update if needed
      if (needsUpdate) {
        await sql`
          UPDATE teachers 
          SET department = ${newDepartment}, class = ${newClass}
          WHERE id = ${teacher.id}
        `;
        console.log(`✅ Updated ${teacher.name}`);
      }
    }
    
    // Show final result
    const updatedTeachers = await sql`SELECT id, name, department, class FROM teachers`;
    console.log('\n🎉 Final teacher data:');
    updatedTeachers.forEach(teacher => {
      console.log(`  ${teacher.name}: dept="${teacher.department}", class="${teacher.class}"`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

fixTeacherData();

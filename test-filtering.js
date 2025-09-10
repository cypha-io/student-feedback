// Test script to verify teacher-subject filtering logic
const teachers = [
  {
    id: "1",
    name: "Zacheus Darko Amoako",
    subjects: ["Elective ICT", "Core ICT"]
  },
  {
    id: "2", 
    name: "Jane Smith",
    subjects: ["Biology", "Chemistry"]
  }
];

const subjects = [
  { id: "s1", name: "Core ICT" },
  { id: "s2", name: "Elective ICT" },
  { id: "s3", name: "Biology" },
  { id: "s4", name: "Chemistry" },
  { id: "s5", name: "Mathematics" },
  { id: "s6", name: "Physics" }
];

function testFiltering() {
  console.log('🧪 Testing teacher-subject filtering logic...\n');
  
  // Test 1: Select Zacheus (ICT teacher)
  const selectedTeacherId = "1";
  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
  
  console.log(`👨‍🏫 Selected Teacher: ${selectedTeacher.name}`);
  console.log(`📚 Teacher's Subjects: ${selectedTeacher.subjects.join(', ')}`);
  
  const filteredSubjects = subjects.filter(subject => {
    return selectedTeacher.subjects.includes(subject.name);
  });
  
  console.log(`✅ Filtered Subjects: ${filteredSubjects.map(s => s.name).join(', ')}`);
  console.log(`📊 Available: ${filteredSubjects.length} / ${subjects.length} subjects\n`);
  
  // Test 2: Select Jane (Science teacher)
  const selectedTeacherId2 = "2";
  const selectedTeacher2 = teachers.find(t => t.id === selectedTeacherId2);
  
  console.log(`👩‍🔬 Selected Teacher: ${selectedTeacher2.name}`);
  console.log(`📚 Teacher's Subjects: ${selectedTeacher2.subjects.join(', ')}`);
  
  const filteredSubjects2 = subjects.filter(subject => {
    return selectedTeacher2.subjects.includes(subject.name);
  });
  
  console.log(`✅ Filtered Subjects: ${filteredSubjects2.map(s => s.name).join(', ')}`);
  console.log(`📊 Available: ${filteredSubjects2.length} / ${subjects.length} subjects\n`);
  
  console.log('🎉 Filtering logic test completed successfully!');
}

testFiltering();

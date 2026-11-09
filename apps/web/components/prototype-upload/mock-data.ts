// PROTOTYPE — mock courses and test cases for upload prototyping

export interface Course {
  id: string
  name: string
  code: string
  department: string
}

export const mockCourses: Course[] = [
  { id: "c1", name: "Data Structures & Algorithms", code: "CS201", department: "Computer Science" },
  { id: "c2", name: "Operating Systems", code: "CS301", department: "Computer Science" },
  { id: "c3", name: "Linear Algebra", code: "MATH202", department: "Mathematics" },
  { id: "c4", name: "Calculus III", code: "MATH201", department: "Mathematics" },
  { id: "c5", name: "Digital Electronics", code: "EE205", department: "Electrical Engineering" },
  { id: "c6", name: "Organic Chemistry", code: "CHEM301", department: "Chemistry" },
  { id: "c7", name: "Microeconomics", code: "ECON101", department: "Economics" },
]

export const resourceTypeOptions = [
  { value: "exam", label: "Past Exam", icon: "FileQuestion", desc: "Midterms, finals, quizzes, sample solutions" },
  { value: "notes", label: "Lecture Notes", icon: "FileText", desc: "Handwritten or typed notes, study guides" },
  { value: "slides", label: "Slides / Deck", icon: "Presentation", desc: "Prof lecture presentations, slide handouts" },
  { value: "assignment", label: "Assignment", icon: "FileCode", desc: "Problem sets, homework guidelines, rubrics" },
  { value: "lab", label: "Lab Material", icon: "FlaskConical", desc: "Lab sheets, manuals, experiments, datasets" },
  { value: "other", label: "Other", icon: "Files", desc: "Syllabi, cheat sheets, references" },
] as const

export const semesterOptions = [
  { value: "1", label: "Semester 1 (Fall)" },
  { value: "2", label: "Semester 2 (Spring)" },
  { value: "summer", label: "Summer Session" },
] as const

export const yearOptions = [2026, 2025, 2024, 2023, 2022, 2021, 2020]

// Presets for quick testing
export const testFilePresets = [
  {
    name: "CS201_Final_Exam_2024.pdf",
    size: 4.8 * 1024 * 1024,
    type: "application/pdf",
    label: "Valid 4.8 MB PDF (Exam)",
    description: "Standard PDF past exam",
  },
  {
    name: "Lecture_04_Tree_Traversals.docx",
    size: 2.1 * 1024 * 1024,
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    label: "Valid 2.1 MB Word DOCX",
    description: "Word notes with tables",
  },
  {
    name: "Digital_Logic_Review_Slides.pptx",
    size: 18.5 * 1024 * 1024,
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    label: "Valid 18.5 MB PPTX (Degraded preview)",
    description: "Slide deck (download-only preview in MVP)",
  },
  {
    name: "Sorting_Complexity_CheatSheet.png",
    size: 850 * 1024,
    type: "image/png",
    label: "Valid 850 KB PNG (Image preview)",
    description: "Chart image previewable in browser",
  },
  {
    name: "Giant_BioChem_Atlas.pdf",
    size: 68.4 * 1024 * 1024,
    type: "application/pdf",
    label: "Exceeds Size: 68.4 MB (> 50 MB limit)",
    description: "Triggers file size error",
  },
  {
    name: "Lab_Scripts_Archive.zip",
    size: 12.0 * 1024 * 1024,
    type: "application/zip",
    label: "Invalid Type: .zip archive",
    description: "Triggers unsupported format error",
  },
]

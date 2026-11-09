// PROTOTYPE — throwaway mock data for page structure prototyping

export const mockCourses = [
  { id: "1", name: "Data Structures & Algorithms", code: "CS201", department: "Computer Science" },
  { id: "2", name: "Linear Algebra", code: "MATH202", department: "Mathematics" },
  { id: "3", name: "Organic Chemistry", code: "CHEM301", department: "Chemistry" },
  { id: "4", name: "Digital Electronics", code: "EE205", department: "Electrical Engineering" },
  { id: "5", name: "Microeconomics", code: "ECON101", department: "Economics" },
  { id: "6", name: "Operating Systems", code: "CS301", department: "Computer Science" },
]

export const mockResources = [
  {
    id: "1",
    title: "Data Structures Final Exam 2024",
    course: mockCourses[0]!,
    type: "Past Exam",
    fileType: "PDF",
    uploadedBy: "Abebe Kebede",
    uploadedAt: "2 days ago",
    downloads: 142,
    pages: 8,
  },
  {
    id: "2",
    title: "Binary Trees & Graph Traversal Notes",
    course: mockCourses[0]!,
    type: "Notes",
    fileType: "PDF",
    uploadedBy: "Sara Ahmed",
    uploadedAt: "1 week ago",
    downloads: 89,
    pages: 24,
  },
  {
    id: "3",
    title: "Linear Algebra Midterm Solutions",
    course: mockCourses[1]!,
    type: "Past Exam",
    fileType: "PDF",
    uploadedBy: "Dawit Tesfaye",
    uploadedAt: "3 days ago",
    downloads: 67,
    pages: 12,
  },
  {
    id: "4",
    title: "Organic Chemistry Lab Manual",
    course: mockCourses[2]!,
    type: "Slides",
    fileType: "PDF",
    uploadedBy: "Hana Girma",
    uploadedAt: "5 days ago",
    downloads: 34,
    pages: 45,
  },
  {
    id: "5",
    title: "Sorting Algorithms Comparison Chart",
    course: mockCourses[0]!,
    type: "Notes",
    fileType: "Image",
    uploadedBy: "Yonas Bekele",
    uploadedAt: "1 day ago",
    downloads: 56,
    pages: 1,
  },
  {
    id: "6",
    title: "Digital Logic Design Lecture Slides Week 1-8",
    course: mockCourses[3]!,
    type: "Slides",
    fileType: "PDF",
    uploadedBy: "Meron Tadesse",
    uploadedAt: "2 weeks ago",
    downloads: 203,
    pages: 180,
  },
]

export const mockQuestions = [
  {
    id: "1",
    title: "How does Dijkstra's algorithm handle negative weights?",
    course: mockCourses[0]!,
    askedBy: "Kidus Worku",
    askedAt: "3 hours ago",
    answerCount: 4,
    voteCount: 12,
    hasAccepted: true,
  },
  {
    id: "2",
    title: "Can someone explain eigenvalue decomposition step by step?",
    course: mockCourses[1]!,
    askedBy: "Bethlehem Haile",
    askedAt: "1 day ago",
    answerCount: 2,
    voteCount: 8,
    hasAccepted: false,
  },
  {
    id: "3",
    title: "What's the difference between SN1 and SN2 reactions?",
    course: mockCourses[2]!,
    askedBy: "Abel Assefa",
    askedAt: "5 hours ago",
    answerCount: 3,
    voteCount: 15,
    hasAccepted: true,
  },
  {
    id: "4",
    title: "How to implement a priority queue using a heap?",
    course: mockCourses[0]!,
    askedBy: "Liya Solomon",
    askedAt: "2 days ago",
    answerCount: 5,
    voteCount: 21,
    hasAccepted: true,
  },
  {
    id: "5",
    title: "Karnaugh map simplification for 5 variables?",
    course: mockCourses[3]!,
    askedBy: "Naod Mekonnen",
    askedAt: "6 hours ago",
    answerCount: 1,
    voteCount: 3,
    hasAccepted: false,
  },
]

export const mockAnswers = [
  {
    id: "1",
    body: "Dijkstra's algorithm doesn't handle negative weights correctly because it assumes that once a node is visited, its shortest path is finalized. With negative weights, a later path through a negative edge could be shorter. Use Bellman-Ford instead for graphs with negative weights.",
    author: "Sara Ahmed",
    postedAt: "2 hours ago",
    voteCount: 8,
    isAccepted: true,
  },
  {
    id: "2",
    body: "To add to the above answer — if you only have negative weights but no negative cycles, Bellman-Ford works in O(VE). If you might have negative cycles, you need to detect them first (Bellman-Ford can do this too with an extra iteration).",
    author: "Dawit Tesfaye",
    postedAt: "1 hour ago",
    voteCount: 4,
    isAccepted: false,
  },
  {
    id: "3",
    body: "Also worth noting: Johnson's algorithm uses Bellman-Ford as a preprocessing step and then runs Dijkstra from every vertex. This is useful for all-pairs shortest paths with negative weights.",
    author: "Yonas Bekele",
    postedAt: "45 minutes ago",
    voteCount: 3,
    isAccepted: false,
  },
]

export type Resource = (typeof mockResources)[number]
export type Question = (typeof mockQuestions)[number]
export type Course = (typeof mockCourses)[number]
export type Answer = (typeof mockAnswers)[number]

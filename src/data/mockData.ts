// Mock student data for the MUN platform
export interface Student {
  id: number;
  name: string;
  country: string;
  committee: string;
  status: "Active" | "Idle" | "Pending";
  currentScore: number | null;
  speechSubmitted: boolean;
  resolutionSubmitted: boolean;
  quizScore: number | null;
}

export const mockStudents: Student[] = [
  {
    id: 1,
    name: "Alexandra Chen",
    country: "France",
    committee: "UNSC",
    status: "Active",
    currentScore: 9.2,
    speechSubmitted: true,
    resolutionSubmitted: true,
    quizScore: 85,
  },
  {
    id: 2,
    name: "Marcus Williams",
    country: "United States",
    committee: "DISEC",
    status: "Active",
    currentScore: 8.7,
    speechSubmitted: true,
    resolutionSubmitted: false,
    quizScore: 90,
  },
  {
    id: 3,
    name: "Sofia Rodriguez",
    country: "Brazil",
    committee: "WHO",
    status: "Pending",
    currentScore: null,
    speechSubmitted: false,
    resolutionSubmitted: false,
    quizScore: null,
  },
  {
    id: 4,
    name: "James Kim",
    country: "Republic of Korea",
    committee: "UNSC",
    status: "Active",
    currentScore: 8.9,
    speechSubmitted: true,
    resolutionSubmitted: true,
    quizScore: 95,
  },
  {
    id: 5,
    name: "Emma Thompson",
    country: "United Kingdom",
    committee: "DISEC",
    status: "Active",
    currentScore: 9.1,
    speechSubmitted: true,
    resolutionSubmitted: true,
    quizScore: 80,
  },
  {
    id: 6,
    name: "Ahmed Hassan",
    country: "Egypt",
    committee: "WHO",
    status: "Idle",
    currentScore: 7.5,
    speechSubmitted: true,
    resolutionSubmitted: false,
    quizScore: 70,
  },
  {
    id: 7,
    name: "Maria Santos",
    country: "Philippines",
    committee: "UNSC",
    status: "Active",
    currentScore: 8.3,
    speechSubmitted: true,
    resolutionSubmitted: true,
    quizScore: 88,
  },
  {
    id: 8,
    name: "Liam O'Connor",
    country: "Ireland",
    committee: "DISEC",
    status: "Idle",
    currentScore: 7.8,
    speechSubmitted: false,
    resolutionSubmitted: false,
    quizScore: 75,
  },
];

export interface Submission {
  id: number;
  studentId: number;
  name: string;
  country: string;
  type: "Opening Speech" | "Resolution Draft" | "Position Paper";
  submittedAt: string;
  graded: boolean;
  score?: number;
  feedback?: string;
  content: string;
}

export const mockSubmissions: Submission[] = [
  {
    id: 1,
    studentId: 1,
    name: "Alexandra Chen",
    country: "France",
    type: "Opening Speech",
    submittedAt: "2 hours ago",
    graded: false,
    content: `The French Republic firmly believes that the current crisis in the Sahel region demands immediate and coordinated international action. As a permanent member of the United Nations Security Council and a nation with deep historical ties to the region, France is uniquely positioned to contribute to a comprehensive solution.

The delegation of France proposes a three-pillar approach:

First, the international community must address the immediate humanitarian concerns. The displacement of over 2.5 million people across the region requires urgent attention. France commits to increasing its humanitarian aid by 40% and calls upon fellow member states to match this commitment.

Second, the security situation cannot be ignored. The proliferation of armed groups threatens not only regional stability but also international peace. France supports the expansion of MINUSMA's mandate and offers additional training support for regional forces.

Third, and most critically, the root causes of instability must be addressed. Economic development, educational opportunities, and good governance are essential for lasting peace. France proposes the establishment of a UN Development Fund specifically targeted at the Sahel region.

The French delegation stands ready to work with all parties to achieve these objectives and restore peace and prosperity to this vital region.`,
  },
  {
    id: 2,
    studentId: 2,
    name: "Marcus Williams",
    country: "United States",
    type: "Resolution Draft",
    submittedAt: "5 hours ago",
    graded: true,
    score: 8.5,
    feedback: "Excellent structure and use of diplomatic language. Consider adding more specific timelines for proposed actions.",
    content: `The United States of America approaches this matter with the gravity it deserves. As the largest contributor to UN peacekeeping operations, the delegation understands the complexities of maintaining international peace and security.

The United States delegation calls upon all member states to strengthen their commitment to the UN Charter and its principles. This delegation proposes enhanced cooperation mechanisms between regional organizations and the United Nations.`,
  },
  {
    id: 3,
    studentId: 3,
    name: "Sofia Rodriguez",
    country: "Brazil",
    type: "Position Paper",
    submittedAt: "1 day ago",
    graded: false,
    content: `Brazil, as the largest nation in South America and a key player in the Global South, brings a unique perspective to this discussion.

The Brazilian delegation emphasizes the importance of sustainable development and environmental protection in all peacekeeping efforts. Brazil proposes that climate resilience be integrated into post-conflict reconstruction programs.`,
  },
  {
    id: 4,
    studentId: 4,
    name: "James Kim",
    country: "Republic of Korea",
    type: "Opening Speech",
    submittedAt: "1 day ago",
    graded: true,
    score: 9.0,
    feedback: "Outstanding diplomatic tone and well-researched content. Perfect third-person usage throughout.",
    content: `The Republic of Korea proposes the following amendments to the working paper currently before this committee.

The Korean delegation has consistently advocated for peaceful resolution of conflicts through dialogue and multilateral cooperation. This nation's own experience with division and the ongoing pursuit of peace on the Korean Peninsula informs the approach to international security matters.`,
  },
];

// Current delegate info (for delegate portal)
export const currentDelegate = {
  name: "You",
  country: "Germany",
  committee: "UNSC",
  progress: {
    speechComplete: false,
    resolutionComplete: false,
    quizComplete: false,
  },
};

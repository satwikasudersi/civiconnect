export interface Issue {
  id: string;
  title: string;
  category: string;
  customCategory?: string;
  location: string;
  date: string;
  status: 'reported' | 'progress' | 'resolved';
  description: string;
  images: string[];
  suggestions: number;
  enquiries: number;
}

const STORAGE_KEY = 'civic-issues';

export const saveIssue = (issueData: Omit<Issue, 'id' | 'date' | 'status' | 'suggestions' | 'enquiries'>): Issue => {
  const issues = getIssues();
  const newIssue: Issue = {
    ...issueData,
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    status: 'reported',
    suggestions: 0,
    enquiries: 0
  };
  
  issues.push(newIssue);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  
  return newIssue;
};

export const getIssues = (): Issue[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : getMockIssues();
  } catch {
    return getMockIssues();
  }
};

const getMockIssues = (): Issue[] => [
  {
    id: '1',
    title: 'Large pothole on Main Street',
    category: 'potholes',
    location: 'Main Street & 5th Ave',
    date: '2024-01-15',
    status: 'progress',
    description: 'Deep pothole causing damage to vehicles. Multiple cars have reported tire damage.',
    images: [],
    suggestions: 5,
    enquiries: 2
  },
  {
    id: '2',
    title: 'Broken streetlight in park',
    category: 'streetlights',
    location: 'Central Park East Entrance',
    date: '2024-01-14',
    status: 'resolved',
    description: 'Streetlight has been out for over a week, making the area unsafe for evening joggers.',
    images: [],
    suggestions: 2,
    enquiries: 1
  },
  {
    id: '3',
    title: 'Overflowing trash bins',
    category: 'trash',
    location: '2nd Street Bus Stop',
    date: '2024-01-16',
    status: 'reported',
    description: 'Multiple trash bins overflowing for days, creating unsanitary conditions.',
    images: [],
    suggestions: 8,
    enquiries: 3
  }
];
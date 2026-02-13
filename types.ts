
export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  location: string;
  blog?: string;
  twitter_username?: string;
}

export interface GitHubRepo {
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  html_url: string;
  fork: boolean;
}

export interface CategoryImpact {
  category: 'documentation' | 'activity' | 'organization' | 'engagement' | 'depth' | 'impact';
  gain: number;
}

export interface EvaluationResult {
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  overallScore: number;
  metrics: {
    documentation: number;
    activity: number;
    organization: number;
    engagement: number;
    depth: number;
    impact: number;
  };
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: {
    category: string;
    title: string;
    action: string;
    priority: 'High' | 'Medium' | 'Low';
    overallGain: number;
    categoryImpacts: CategoryImpact[];
  }[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  FETCHING_GITHUB = 'FETCHING_GITHUB',
  ANALYZING_AI = 'ANALYZING_AI',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

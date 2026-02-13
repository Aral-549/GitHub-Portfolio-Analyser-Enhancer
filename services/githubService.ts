
import { GitHubUser, GitHubRepo } from '../types';

/**
 * Fetches data from GitHub API. 
 * Supports GITHUB_TOKEN for higher rate limits if provided in environment.
 */
export const fetchGitHubData = async (username: string): Promise<{ user: GitHubUser; repos: GitHubRepo[] }> => {
  const token = process.env.GITHUB_TOKEN || '';
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const userResponse = await fetch(`https://api.github.com/users/${username}`, { headers });
  
  if (!userResponse.ok) {
    if (userResponse.status === 404) {
      throw new Error('This GitHub profile does not exist. Check the spelling.');
    }
    if (userResponse.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please wait a few minutes or add a GitHub Token to environment variables.');
    }
    throw new Error('GitHub is currently unreachable. Please try again later.');
  }
  
  const user: GitHubUser = await userResponse.json();

  const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers });
  if (!reposResponse.ok) {
    throw new Error('Failed to fetch user repositories from GitHub.');
  }
  
  const repos: GitHubRepo[] = await reposResponse.json();

  return { user, repos };
};

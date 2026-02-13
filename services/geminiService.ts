
import { GoogleGenAI, Type } from "@google/genai";
import { GitHubUser, GitHubRepo, EvaluationResult } from "../types";

export const analyzePortfolio = async (user: GitHubUser, repos: GitHubRepo[]): Promise<EvaluationResult> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey === '') {
    throw new Error("Missing Gemini API Key. Please add an environment variable named 'API_KEY' in your Vercel project settings.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const repoData = repos
    .filter(r => !r.fork)
    .slice(0, 15)
    .map(r => ({
      name: r.name,
      description: r.description,
      stars: r.stargazers_count,
      language: r.language,
      updated: r.updated_at
    }));

  const prompt = `
    Act as a FAANG Senior Technical Recruiter. Analyze this GitHub profile for "${user.login}".
    
    Data:
    Bio: ${user.bio || 'None'}
    Followers: ${user.followers}
    Repos: ${JSON.stringify(repoData)}
    
    Scoring Weights (Strict):
    - Documentation: 25% (README presence, quality, setup guides)
    - Activity: 20% (Recency, consistency of commits)
    - Organization: 15% (Topic tags, licenses, clean repo naming)
    - Engagement: 15% (Stars, forks, social proof)
    - Depth: 15% (Tech stack variety, project complexity)
    - Impact: 10% (Utility of tools, popularity, unique value)

    Task:
    1. Calculate current scores (0-100) for all 6 metrics.
    2. Identify 3 critical recommendations.
    3. For EACH recommendation, calculate exactly how many points it adds to its primary categories and the resulting gain in the overall 0-100 score.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          grade: { type: Type.STRING, enum: ['S', 'A', 'B', 'C', 'D', 'F'] },
          overallScore: { type: Type.NUMBER },
          metrics: {
            type: Type.OBJECT,
            properties: {
              documentation: { type: Type.NUMBER },
              activity: { type: Type.NUMBER },
              organization: { type: Type.NUMBER },
              engagement: { type: Type.NUMBER },
              depth: { type: Type.NUMBER },
              impact: { type: Type.NUMBER }
            },
            required: ["documentation", "activity", "organization", "engagement", "depth", "impact"]
          },
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                title: { type: Type.STRING },
                action: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                overallGain: { type: Type.NUMBER },
                categoryImpacts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      gain: { type: Type.NUMBER }
                    },
                    required: ["category", "gain"]
                  }
                }
              },
              required: ["category", "title", "action", "priority", "overallGain", "categoryImpacts"]
            }
          }
        },
        required: ["grade", "overallScore", "metrics", "summary", "strengths", "weaknesses", "recommendations"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("The AI returned an empty response.");
    return JSON.parse(text.trim());
  } catch (err) {
    console.error("AI Parse Error:", err);
    throw new Error("Portfolio audit failed. The AI response was not in the expected format.");
  }
};

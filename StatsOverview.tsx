
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { GitHubRepo } from '../types';

interface Props {
  repos: GitHubRepo[];
}

const COLORS = ['#238636', '#3fb950', '#58a6ff', '#f0883e', '#d29922', '#db6d28'];

export const StatsOverview: React.FC<Props> = ({ repos }) => {
  const langMap: Record<string, number> = {};
  repos.forEach(repo => {
    if (repo.language) {
      langMap[repo.language] = (langMap[repo.language] || 0) + 1;
    }
  });

  const langData = Object.entries(langMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const starData = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)
    .map(r => ({ name: r.name, stars: r.stargazers_count }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
        <h3 className="text-lg font-semibold mb-4 text-[#8b949e]">Language Distribution</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={langData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {langData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '8px' }}
                itemStyle={{ color: '#c9d1d9' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-2 justify-center">
            {langData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-xs text-[#8b949e]">{d.name} ({d.value})</span>
                </div>
            ))}
        </div>
      </div>

      <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
        <h3 className="text-lg font-semibold mb-4 text-[#8b949e]">Top Projects by Stars</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={starData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#8b949e', fontSize: 12 }} />
              <Tooltip 
                 cursor={{ fill: 'transparent' }}
                 contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '8px' }}
              />
              <Bar dataKey="stars" fill="#238636" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

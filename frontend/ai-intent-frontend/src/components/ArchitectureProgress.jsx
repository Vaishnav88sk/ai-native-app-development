import { useEffect, useState } from 'react';

const stages = [
  { name: "Frontend", icon: "🖥️" },
  { name: "Backend API", icon: "🔗" },
  { name: "Auth Service", icon: "🔐" },
  { name: "Core Service", icon: "⚙️" },
  { name: "Processing Service", icon: "🔄" },
  { name: "Database", icon: "🗄️" }
];

export default function ArchitectureProgress({ prompt }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 10;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl text-center">
      <h2 className="text-4xl font-bold mb-8 flex items-center justify-center gap-3">
        AI Architecture Generator
      </h2>

      <div className="space-y-8 mb-12">
        {stages.map((stage, i) => (
          <div key={i} className={`flex items-center gap-6 ${progress >= (i+1)*16 ? 'opacity-100' : 'opacity-40'}`}>
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl border border-white/20">
              {stage.icon}
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-xl">{stage.name}</p>
              <p className="text-white/60">Generating...</p>
            </div>
            {progress >= (i+1)*16 && (
              <div className="text-green-400 text-2xl">✓</div>
            )}
          </div>
        ))}
      </div>

      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-violet-400 to-purple-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-4 text-white/60">Building your app architecture...</p>
    </div>
  );
}
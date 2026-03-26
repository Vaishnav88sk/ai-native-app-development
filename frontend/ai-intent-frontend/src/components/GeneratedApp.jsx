import { useState } from 'react';
import { ArrowLeft, Code2, Copy } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function GeneratedApp({ result, onNewApp }) {
  const [showCode, setShowCode] = useState(false);
  const [codeData, setCodeData] = useState(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const token = localStorage.getItem('token');

  // Generate Actual Code
  const handleGenerateCode = async () => {
    setLoadingCode(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/generate-code`,
        { prompt: result.prompt },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      setCodeData(res.data);
      setShowCode(true);
    } catch (err) {
      alert("Failed to generate code: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingCode(false);
    }
  };

  // Copy code to clipboard
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onNewApp}
          className="flex items-center gap-2 text-white/70 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" /> New App
        </button>
        <h1 className="text-4xl font-bold">Generated App</h1>
      </div>

      {/* Main Result Card */}
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border border-white/20">
        <div className="mb-8">
          <p className="text-sm text-white/60 mb-1">Based on your prompt:</p>
          <p className="italic text-violet-200">"{result.prompt}"</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Architecture */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Architecture</h3>
            <div className="space-y-3">
              {result.architecture.map((item, i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-5">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-white/70 mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Database Schema */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Database Schema</h3>
            <div className="bg-white/5 rounded-2xl p-6">
              <p className="font-medium mb-3">Type: {result.database_schema.type}</p>
              {result.database_schema.tables?.map((table, i) => (
                <div key={i} className="mb-6 last:mb-0">
                  <p className="font-semibold text-violet-300 mb-2">{table.name}</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {table.columns.map((col, j) => (
                      <li key={j} className="flex justify-between">
                        <span>{col.name}</span>
                        <span className="text-white/50 font-mono">{col.type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* APIs & UI Flows */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">APIs</h3>
            <div className="space-y-3 text-sm">
              {result.apis.map((api, i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-4">
                  <span className="font-mono text-violet-300">{api.method}</span>{' '}
                  <span className="font-medium">{api.endpoint}</span>
                  <p className="text-white/70 mt-1">{api.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">UI Flows</h3>
            <div className="flex flex-wrap gap-3">
              {result.ui_flows.map((flow, i) => (
                <div key={i} className="bg-white/10 px-6 py-3 rounded-2xl text-sm">
                  {flow}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-12 bg-gradient-to-br from-violet-600/30 to-purple-600/30 rounded-3xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold mb-2">{result.generated_app_summary.title}</h3>
          <div className="flex flex-wrap gap-3 mt-4">
            {result.generated_app_summary.components.map((comp, i) => (
              <div key={i} className="bg-white/20 px-5 py-2 rounded-xl text-sm">
                {comp}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-white/50">
          {result.audit_trail}
        </div>
      </div>

      {/* Generate Code Button */}
      <div className="flex justify-center mt-10">
        <button
          onClick={handleGenerateCode}
          disabled={loadingCode}
          className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 px-10 py-4 rounded-2xl font-semibold text-lg transition disabled:opacity-70"
        >
          <Code2 className="w-6 h-6" />
          {loadingCode ? "Generating Code..." : "Generate Actual Code"}
        </button>
      </div>

      {/* Code Display Section */}
      {showCode && codeData && (
        <div className="mt-12 bg-zinc-950 rounded-3xl p-8 border border-white/10">
          <h3 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Code2 className="w-8 h-8" /> Generated Code
          </h3>

          {/* Frontend Code */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-semibold text-violet-400">Frontend (React + Tailwind)</h4>
              <button 
                onClick={() => copyToClipboard(codeData.frontend_code, 'frontend')}
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
              >
                <Copy className="w-4 h-4" />
                {copied === 'frontend' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-black p-6 rounded-2xl overflow-auto text-sm text-emerald-300 max-h-96">
              {codeData.frontend_code || "// No code generated"}
            </pre>
          </div>

          {/* Backend Code */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-semibold text-blue-400">Backend (FastAPI)</h4>
              <button 
                onClick={() => copyToClipboard(codeData.backend_code, 'backend')}
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
              >
                <Copy className="w-4 h-4" />
                {copied === 'backend' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-black p-6 rounded-2xl overflow-auto text-sm text-sky-300 max-h-96">
              {codeData.backend_code || "// No code generated"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
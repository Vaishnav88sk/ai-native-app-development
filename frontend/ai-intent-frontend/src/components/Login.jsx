import { useState } from 'react';
import axios from 'axios';
import { User, Mail, Lock } from 'lucide-react';


export default function Login({ onSuccess, API_BASE }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // === LOGIN ===
        const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
        
        const userRes = await axios.get(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${res.data.access_token}` }
        });

        onSuccess(res.data.access_token, userRes.data);
      } 
      else {
        // === REGISTER ===
        await axios.post(`${API_BASE}/api/auth/register`, { 
          full_name: fullName, 
          email, 
          password 
        });

        // Auto Login after successful registration
        const loginRes = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
        
        const userRes = await axios.get(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${loginRes.data.access_token}` }
        });

        onSuccess(loginRes.data.access_token, userRes.data);
      }
    } catch (err) {
      const message = err.response?.data?.detail || err.message || "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20">
      <h1 className="text-4xl font-bold text-center mb-2">AI Intent Platform</h1>
      <p className="text-center text-white/70 mb-8">
        {isLogin ? "Sign in to start building your app" : "Create your account"}
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLogin && (
          <div>
            <label className="text-sm text-white/70">Full Name</label>
            <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-4 mt-1">
              <User className="w-5 h-5 text-white/50" />
              <input 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                placeholder="Neha Kulkarni" 
                className="flex-1 bg-transparent outline-none text-white" 
                required 
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-sm text-white/70">Email Address</label>
          <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-4 mt-1">
            <Mail className="w-5 h-5 text-white/50" />
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="kulneha93@gmail.com " 
              className="flex-1 bg-transparent outline-none text-white" 
              required 
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-white/70">Password</label>
          <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-4 mt-1">
            <Lock className="w-5 h-5 text-white/50" />
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              className="flex-1 bg-transparent outline-none text-white" 
              required 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl font-semibold text-lg hover:scale-105 transition disabled:opacity-70"
        >
          {loading 
            ? "Processing..." 
            : isLogin 
              ? "Sign In & Continue" 
              : "Create Account & Login"
          }
        </button>
      </form>

      <p className="text-center text-white/60 mt-6 text-sm">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => { 
            setIsLogin(!isLogin); 
            setError(''); 
          }}
          className="text-violet-300 underline hover:text-violet-200"
        >
          {isLogin ? 'Register' : 'Sign In'}
        </button>
      </p>
    </div>
  );
}
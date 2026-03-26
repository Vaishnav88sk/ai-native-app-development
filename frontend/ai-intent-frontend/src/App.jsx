import { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Builder from './components/Builder';
import ArchitectureProgress from './components/ArchitectureProgress';
import ValidationScreen from './components/ValidationScreen';
import GeneratedApp from './components/GeneratedApp';

const API_BASE = import.meta.env.VITE_API_BASE;

function App() {
  const [step, setStep] = useState('login');
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      checkTokenValidity(savedToken);
    }
  }, []);

  const checkTokenValidity = async (savedToken) => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` }
      });

      setToken(savedToken);
      setUser(res.data);
      setStep('builder');
    } catch (err) {
      localStorage.removeItem('token');
      setStep('login');
    }
  };

  const handleLoginSuccess = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    setStep('builder');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setResult(null);
    setStep('login');
  };

  const handleGenerate = async (userPrompt) => {
    if (!token) {
      alert("Session expired. Please login again.");
      handleLogout();
      return;
    }

    setPrompt(userPrompt);
    setLoading(true);
    setStep('progress');

    try {
      const res = await axios.post(
        `${API_BASE}/api/generate-app`,
        { prompt: userPrompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(res.data);
      setTimeout(() => setStep('validation'), 2500);
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        handleLogout();
      } else {
        alert("Error: " + (err.response?.data?.detail || err.message));
        setStep('builder');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-6">
      {step === 'login' && <Login onSuccess={handleLoginSuccess} API_BASE={API_BASE} />}

      {step === 'builder' && (
        <Builder 
          onGenerate={handleGenerate} 
          user={user} 
          onLogout={handleLogout} 
        />
      )}

      {step === 'progress' && <ArchitectureProgress prompt={prompt} />}
      {step === 'validation' && result && (
        <ValidationScreen onContinue={() => setStep('result')} />
      )}
      {step === 'result' && result && (
        <GeneratedApp 
          result={result} 
          onNewApp={() => setStep('builder')} 
        />
      )}
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('rahul.mehta@pharmatech.in');
  const [password, setPassword] = useState('Admin@1234');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth (mock)
    await new Promise((r) => setTimeout(r, 800));
    if (email === 'rahul.mehta@pharmatech.in' && password === 'Admin@1234') {
      login(
        { id: 'u1', email, name: 'Rahul Mehta', role: 'QA_MANAGER', isActive: true },
        'mock-jwt-token'
      );
      toast.success('Welcome back, Rahul!');
      navigate('/');
    } else {
      toast.error('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}
          >
            QI
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            Quantum <span style={{ color: '#6c63ff' }}>Invenza</span>
          </h1>
          <p className="text-white/40 text-xs mt-1 uppercase tracking-wider">
            PharmaTech Manufacturing Pvt. Ltd.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
          <h2 className="text-white font-semibold text-base mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/50 focus:border-[#6c63ff]"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/50 focus:border-[#6c63ff]"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-white text-sm transition-all disabled:opacity-60"
              style={{ background: 'var(--accent-purple)' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p className="text-white/25 text-[11px] mt-4 text-center">
            Demo: rahul.mehta@pharmatech.in / Admin@1234
          </p>
        </div>
      </div>
    </div>
  );
}

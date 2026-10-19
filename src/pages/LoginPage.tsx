import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { FloodSenseLogo } from '../components/FloodSenseLogo';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      // Validate credentials (admin / admin)
      if (username.trim() === 'admin' && password === 'admin') {
        onLoginSuccess();
      } else {
        setError('Invalid credentials! Please use username: admin and password: admin');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 sm:p-6">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col md:flex-row min-h-[530px]">
        
        {/* Left Hero Section (Navy with Floodsense Logo & Tagline) */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#0c192c] via-[#10243d] to-[#163356] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

          {/* Top Logo / Brand Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-medium mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              Gujarat Urban Flood Intelligence
            </div>

            {/* Custom Logo icon box matching user's uploaded shield/drop design */}
            <div className="w-20 h-20 rounded-2xl bg-white/10 p-2 shadow-xl border border-white/20 mb-6 flex items-center justify-center backdrop-blur-xs">
              <FloodSenseLogo size={58} />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
              Floodsense
            </h1>
            <p className="text-sky-300 text-sm font-semibold tracking-wide leading-relaxed max-w-xs">
              Understand Rainfall. Identify Risk. Stay Prepared.
            </p>
          </div>

          {/* Bottom Footer Details */}
          <div className="relative z-10 pt-8 mt-auto border-t border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Navsari Hydro-Intelligence</span>
              <span>NMC Control Room</span>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Login</h2>
              <p className="text-sm text-slate-500 mt-1">
                Access the Floodsense dashboard
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username (admin)"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (admin)"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-sm shadow-md shadow-sky-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Helper Box */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 mb-2">
                Default login: <span className="font-semibold text-slate-700">admin / admin</span>
              </p>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-xs text-sky-600 hover:text-sky-800 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Click to autofill credentials
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

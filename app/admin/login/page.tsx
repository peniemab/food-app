// 



"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validUser = process.env.NEXT_PUBLIC_ADMIN_USER;
    const validPass = process.env.NEXT_PUBLIC_ADMIN_PASS;

    if (username === validUser && password === validPass) {
      localStorage.setItem('isAdminAuthenticated', 'true');
      router.push('/admin');
    } else {
      setError('Identifiants invalides.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black uppercase italic text-gray-900">
            Accès Propriétaire
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            Identifiez-vous pour gérer la cuisine.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase text-gray-400 mb-2">Utilisateur</label>
            <div className="relative">
              <User className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 outline-none text-gray-900"
                placeholder="Nom d'utilisateur"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-gray-400 mb-2">Mot de passe</label>
            <div className="relative">
              <Lock className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 outline-none text-gray-900"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
          >
            Se connecter
          </button>
        </form>

        <button 
          onClick={() => router.push('/')}
          className="w-full mt-6 text-gray-400 text-xs font-bold flex items-center justify-center gap-2"
        >
          <ArrowLeft size={14} /> Retour au site
        </button>
      </div>
    </div>
  );
}
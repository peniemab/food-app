"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Identifiants de test (à changer plus tard)
    if (username === 'admin' && password === 'jacquie2026') {
      // On simule une session (on pourra améliorer ça avec des cookies/JWT plus tard)
      localStorage.setItem('isAdminAuthenticated', 'true');
      router.push('/admin');
    } else {
      setError('Identifiants invalides. Réessayez.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-6">
      <div className="mb-8">
        <Logo showText={true} className="scale-125" />
      </div>

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">
            Accès Propriétaire
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            Veuillez vous identifier pour gérer votre cuisine.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
              Utilisateur
            </label>
            <div className="relative">
              <UserIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-gray-900"
                placeholder="Ex: Jacquie"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
              Mot de passe
            </label>
            <div className="relative">
              <LockClosedIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-gray-900"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg transition-all active:scale-95"
          >
            Se connecter
          </button>
        </form>

        <button 
          onClick={() => router.push('/')}
          className="w-full mt-6 text-gray-400 text-xs font-bold hover:text-gray-600 transition-colors"
        >
          Retour au site client
        </button>
      </div>
    </div>
  );
}
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowLeft } from 'lucide-react';
import { supabase } from '@/app/lib/supabase'; // Importation du client Supabase

export default function AdminLogin() {
  const [email, setEmail] = useState(''); // Supabase utilise l'email par défaut
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // APPEL À SUPABASE AUTH
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      setError('Identifiants invalides ou accès refusé.');
      setLoading(false);
    } else {
      // Si ça marche, Supabase gère la session tout seul
      router.push('/admin');
      router.refresh(); // Pour forcer la mise à jour des cookies de session
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
            <label className="block text-xs font-black uppercase text-gray-400 mb-2">Email Admin</label>
            <div className="relative">
              <User className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 outline-none text-gray-900"
                placeholder="votre@email.com"
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
            disabled={loading}
            className={`w-full bg-gray-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-transform ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
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
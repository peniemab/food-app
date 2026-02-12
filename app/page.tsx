"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase'; // Vérifie bien ce chemin (souvent @/lib/supabase)
import ProductCard from '../components/ProductCard';
import Logo from '@/components/Logo';
import { Facebook, Instagram, Twitter, ShoppingCart, X, Plus, Minus, CheckCircle, RotateCcw, MapPin, Phone, User } from 'lucide-react';
import { SunIcon, MoonIcon, BellIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [menu, setMenu] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [activeOrder, setActiveOrder] = useState<any>(null);

  // --- LOGIQUE SUPABASE ---
  useEffect(() => {
    const fetchMenu = async () => {
      const { data } = await supabase.from('menu').select('*');
      if (data) setMenu(data);
    };
    fetchMenu();

    const lastOrderId = localStorage.getItem('last_order_id');
    if (lastOrderId) {
      const subscribeToOrder = async () => {
        const { data: order } = await supabase.from('orders').select('*').eq('id', lastOrderId).single();
        if (order && order.status !== 'Prête / Livrée') {
          setActiveOrder(order);
        }

        supabase.channel('order-status')
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${lastOrderId}` }, 
          (payload: any) => {
            if (payload.new.status === 'Prête / Livrée') {
              setActiveOrder(null);
              localStorage.removeItem('last_order_id');
            } else {
              setActiveOrder(payload.new);
            }
          }).subscribe();
      };
      subscribeToOrder();
    }
  }, []);

  const confirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('orders').insert([{
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      customer_address: customerInfo.address,
      items: cart,
      total: totalPrice,
      status: 'En attente'
    }]).select().single();

    if (!error && data) {
      localStorage.setItem('last_order_id', data.id.toString());
      setActiveOrder(data);
      setCart([]);
      setIsCheckingOut(false);
      setIsCartOpen(false);
    }
  };

  const cancelOrder = async () => {
    if (!activeOrder) return;
    if (confirm("Annuler la commande ?")) {
      await supabase.from('orders').delete().eq('id', activeOrder.id);
      localStorage.removeItem('last_order_id');
      setActiveOrder(null);
    }
  };

  // --- LOGIQUE PANIER ---
  const addToCart = (plat: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === plat.id);
      if (existing) return prev.map(item => item.id === plat.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...plat, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id);
      if (item?.quantity === 1) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const totalPrice = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <main className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      
      {/* 1. HEADER */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-100'} p-4`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-6">
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-gray-200/50 transition-colors">
              {isDark ? <SunIcon className="h-6 w-6 text-yellow-400" /> : <MoonIcon className="h-6 w-6 text-gray-600" />}
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 group">
              <ShoppingCart className={`h-7 w-7 ${isDark ? 'text-white' : 'text-gray-800'}`} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. BANNIÈRE DE SUIVI (Si commande en cours) */}
      {activeOrder && (
        <div className="bg-emerald-500 text-white px-6 py-3 flex items-center justify-between shadow-lg z-40">
          <div className="flex items-center gap-3">
            <BellIcon className="h-5 w-5 animate-bounce" />
            <span className="text-sm font-bold uppercase tracking-tighter">
              COMMANDE #{activeOrder.id} : <span className="bg-white text-emerald-600 px-2 py-0.5 rounded ml-2">{activeOrder.status}</span>
            </span>
          </div>
          {activeOrder.status === 'En attente' && (
            <button onClick={cancelOrder} className="bg-red-600 px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1 hover:bg-red-700 transition-colors">
              <RotateCcw size={12} /> Annuler
            </button>
          )}
        </div>
      )}

      {/* 3. CONTENU PRINCIPAL (MENU) */}
      <div className="flex-grow max-w-7xl mx-auto p-8 w-full">
        <h2 className="text-4xl font-black text-center mb-12 uppercase italic tracking-widest">
          Le Menu de Jacquie
        </h2>
        
        {menu.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-gray-400 italic">Jacquie prépare les fourneaux...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {menu.map((plat) => (
              <ProductCard 
                key={plat.id} 
                {...plat} 
                onAdd={() => addToCart(plat)} 
                isDark={isDark} 
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. FOOTER */}
      {/* 4. FOOTER */}
<footer className={`${isDark ? 'bg-black' : 'bg-gray-100'} py-12 px-8 mt-auto`}>
  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
    <div>
      <Logo />
      <p className="mt-4 text-sm text-gray-500 font-medium leading-relaxed">
        Les meilleurs burgers de la ville, livrés avec passion par Jacquie. Produits frais et locaux.
      </p>
    </div>
    
    <div className="flex flex-col gap-4">
      <h4 className="font-black uppercase italic text-sm mb-2">Suivez Jacquie</h4>
      <div className="flex gap-4">
        <Instagram className="cursor-pointer hover:text-emerald-500 transition-colors" />
        <Facebook className="cursor-pointer hover:text-emerald-500 transition-colors" />
        <Twitter className="cursor-pointer hover:text-emerald-500 transition-colors" />
      </div>
    </div>

    <div className="text-sm text-gray-500">
      {/* LE BOUTON SECRET CI-DESSOUS */}
      <p>
  <span 
    onClick={() => router.push('/admin/login')} 
    className="cursor-pointer hover:text-emerald-500 transition-all duration-300"
  >
    ©
  </span> 
  2026 Jacquie Food. Tous droits réservés.
</p>
      <p className="mt-2 font-bold text-emerald-500 italic">Fait avec amour.</p>
    </div>
  </div>
</footer>

      {/* 5. SIDEBAR PANIER & CHECKOUT */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className={`relative w-full max-w-md ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} h-full shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300`}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase italic">Votre Panier</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center">
                <ShoppingCart size={64} className="text-gray-200 mb-4" />
                <p className="text-gray-400 italic">Votre panier est vide...</p>
              </div>
            ) : (
              <>
                <div className="flex-grow overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between mb-6 p-3 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-gray-100 flex-shrink-0" />
                        <div>
                          <h3 className="font-bold text-sm">{item.name}</h3>
                          <p className="text-emerald-600 font-black">{item.price} €</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                        <button onClick={() => removeFromCart(item.id)} className="p-1 hover:text-red-500"><Minus size={16} /></button>
                        <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => addToCart(item)} className="p-1 hover:text-emerald-500"><Plus size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  {!isCheckingOut ? (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-500 font-bold uppercase text-xs">Total à payer</span>
                        <span className="text-3xl font-black text-emerald-500">{totalPrice.toFixed(2)} €</span>
                      </div>
                      <button 
                        onClick={() => setIsCheckingOut(true)}
                        className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-600 transition-all transform hover:scale-[1.02]"
                      >
                        Passer à la caisse
                      </button>
                    </>
                  ) : (
                    <form onSubmit={confirmOrder} className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input required placeholder="Votre nom" className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-none text-sm" 
                               onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input required placeholder="Téléphone" className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-none text-sm"
                               onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input required placeholder="Adresse de livraison" className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-none text-sm"
                               onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                      </div>
                      <button type="submit" className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase flex items-center justify-center gap-2">
                        <CheckCircle size={20} /> Confirmer la commande
                      </button>
                      <button onClick={() => setIsCheckingOut(false)} className="w-full text-gray-400 text-xs font-bold uppercase py-2">Retour</button>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';// Import de ta config
import ProductCard from '../components/ProductCard';
import Logo from '@/components/Logo';
import { Facebook, Instagram, Twitter, ShoppingCart, X, Plus, Minus, CheckCircle, RotateCcw, MapPin, Phone, User } from 'lucide-react';
import { SunIcon, MoonIcon, BellIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [menu, setMenu] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Charger le menu dynamiquement depuis Supabase
    const fetchMenu = async () => {
      const { data } = await supabase.from('menu').select('*');
      if (data) setMenu(data);
    };
    fetchMenu();

    // 2. Suivre ma commande en temps réel
    const lastOrderId = localStorage.getItem('last_order_id');
    if (lastOrderId) {
      const subscribeToOrder = async () => {
        // Fetch initial de la commande
        const { data: order } = await supabase.from('orders').select('*').eq('id', lastOrderId).single();
        if (order && order.status !== 'Prête / Livrée') {
          setActiveOrder(order);
        }

        // Ecoute des changements (ex: Jacquie change le statut)
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
    // Envoi à Supabase
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

  // Logique de panier identique...
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
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    // Structure HTML identique à la tienne
    <main className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
       {/* Bannière de suivi */}
       {activeOrder && (
         <div className="bg-emerald-500 text-white px-6 py-3 flex items-center justify-between shadow-lg z-40">
           <div className="flex items-center gap-3">
             <BellIcon className="h-5 w-5 animate-bounce" />
             <span className="text-sm font-bold">COMMANDE #{activeOrder.id} : {activeOrder.status}</span>
           </div>
           {activeOrder.status === 'En attente' && (
             <button onClick={cancelOrder} className="bg-red-600 px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1">
               <RotateCcw size={12} /> Annuler
             </button>
           )}
         </div>
       )}

       {/* Reste du code visuel identique... (Header, Menu, Panier) */}
       <div className="flex-grow max-w-7xl mx-auto p-8 w-full">
         <h2 className="text-3xl font-black text-center mb-12 uppercase italic">Notre Menu</h2>
         {menu.length === 0 ? (
           <p className="text-center text-gray-400 italic">Le menu est en cours de préparation...</p>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
             {menu.map((plat) => (
               <ProductCard key={plat.id} {...plat} onAdd={() => addToCart(plat)} isDark={isDark} />
             ))}
           </div>
         )}
       </div>
    </main>
  );
}
"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';
import { TrashIcon, PlusIcon, ArrowLeftIcon, ClipboardDocumentListIcon, Squares2X2Icon, XMarkIcon, PhoneIcon, MapPinIcon, UserIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const prevOrdersCount = useRef<number | null>(null);

  const [newPlat, setNewPlat] = useState({ name: '', description: '', price: '', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500' });

  const playNotificationSound = () => {
    new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
  };

  useEffect(() => {
    const fetchData = async () => {
      // 1. Charger le Menu
      const { data: menuData } = await supabase.from('menu').select('*').order('id', { ascending: false });
      if (menuData) setMenuItems(menuData);

      // 2. Charger les Commandes avec FILTRE 30H
      const limitDate = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        // On affiche si (Récent) OU (Pas encore livré)
        .or(`created_at.gt.${limitDate},status.neq.Prête / Livrée`)
        .order('created_at', { ascending: false });

      if (ordersData) {
        if (prevOrdersCount.current !== null && ordersData.length > prevOrdersCount.current) {
          playNotificationSound();
        }
        setOrders(ordersData);
        prevOrdersCount.current = ordersData.length;
      }
    };

    fetchData();

    // ECOUTE REALTIME POUR LES NOUVELLES COMMANDES
    const channel = supabase.channel('realtime-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload: any) => {
        setOrders(prev => [payload.new, ...prev]);
        playNotificationSound();
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleAddPlat = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('menu').insert([{
      ...newPlat,
      price: parseFloat(newPlat.price)
    }]).select().single();

    if (data) {
      setMenuItems([data, ...menuItems]);
      setIsModalOpen(false);
      setNewPlat({ name: '', description: '', price: '', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500' });
    }
  };

  const updateOrderStatus = async (id: number, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleDeletePlat = async (id: number) => {
    if(confirm("Supprimer ce plat ?")) {
      await supabase.from('menu').delete().eq('id', id);
      setMenuItems(menuItems.filter(m => m.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
       {/* Structure identique, utilise order.customer_name et order.created_at */}
       {/* ... Header ... */}
       <main className="max-w-7xl mx-auto p-6">
          {/* Onglets */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
               {orders.map(order => (
                 <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-black text-xl text-red-600">ORD-{order.id}</span>
                        <div className="bg-gray-50 p-4 rounded-2xl mt-4 border border-gray-100 space-y-2">
                          <div className="flex items-center gap-2 text-sm font-bold"><UserIcon className="h-4 w-4"/> {order.customer_name}</div>
                          <div className="flex items-center gap-2 text-sm text-gray-600"><PhoneIcon className="h-4 w-4"/> {order.customer_phone}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 italic"><MapPinIcon className="h-4 w-4"/> {order.customer_address}</div>
                        </div>
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] text-gray-400 px-2 py-1 bg-gray-100 rounded-full">
                           {new Date(order.created_at).toLocaleString()}
                         </span>
                         <div className="mt-4 font-black text-2xl">{order.total.toFixed(2)} €</div>
                      </div>
                    </div>
                    {/* Items */}
                    <div className="flex flex-wrap gap-2">
                       {order.items.map((item: any, i: number) => (
                         <span key={i} className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold">
                           {item.quantity}x <span className="text-red-500">{item.name}</span>
                         </span>
                       ))}
                    </div>
                    {/* Status Select */}
                    <select 
                      value={order.status} 
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="w-full bg-gray-900 text-white rounded-xl p-3 text-xs font-bold"
                    >
                      <option value="En attente">🔴 En attente</option>
                      <option value="En préparation">🟠 En préparation</option>
                      <option value="Prête / Livrée">🟢 Prête / Livrée</option>
                    </select>
                 </div>
               ))}
            </div>
          )}

          {/* Tab Menu avec mapping de menuItems et handleDeletePlat */}
          {activeTab === 'menu' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                    <img src={item.image} className="h-48 w-full object-cover" />
                    <div className="p-6">
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-red-500 font-black">{item.price.toFixed(2)} €</p>
                      <button onClick={() => handleDeletePlat(item.id)} className="w-full mt-4 flex items-center justify-center gap-2 text-red-500 text-xs font-bold py-2 border-2 border-red-50 rounded-xl hover:bg-red-50">
                        <TrashIcon className="h-4 w-4"/> Supprimer
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          )}
       </main>
    </div>
  );
}
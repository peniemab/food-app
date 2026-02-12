"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';
import { TrashIcon, PlusIcon, ClipboardDocumentListIcon, Squares2X2Icon, XMarkIcon, PhoneIcon, MapPinIcon, UserIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const prevOrdersCount = useRef<number | null>(null);

  const [newPlat, setNewPlat] = useState({ name: '', description: '', price: '', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500' });

  useEffect(() => {
    // Vérification de sécurité
    const auth = localStorage.getItem('isAdminAuthenticated');
    if (!auth) { router.push('/login'); return; }

    const fetchData = async () => {
      const { data: menuData } = await supabase.from('menu').select('*').order('id', { ascending: false });
      if (menuData) setMenuItems(menuData);

      const limitDate = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .or(`created_at.gt.${limitDate},status.neq.Prête / Livrée`)
        .order('created_at', { ascending: false });

      if (ordersData) {
        setOrders(ordersData);
        prevOrdersCount.current = ordersData.length;
      }
    };

    fetchData();

    const channel = supabase.channel('realtime-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload: any) => {
        setOrders(prev => [payload.new, ...prev]);
        new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

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

  const handleAddPlat = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('menu').insert([{
      name: newPlat.name,
      description: newPlat.description,
      price: parseFloat(newPlat.price),
      image: newPlat.image
    }]).select();
    
    if (data) {
      setMenuItems([data[0], ...menuItems]);
      setNewPlat({ name: '', description: '', price: '', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500' });
      setIsModalOpen(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* HEADER AVEC ONGLETS */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="font-black italic text-xl uppercase tracking-tighter">Jacquie <span className="text-red-600">Admin</span></h1>
          
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'}`}
            >
              <ClipboardDocumentListIcon className="h-5 w-5"/> Commandes
            </button>
            <button 
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'menu' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'}`}
            >
              <Squares2X2Icon className="h-5 w-5"/> Menu
            </button>
          </div>

          <button onClick={logout} className="text-gray-400 hover:text-red-600 transition-colors">
            <ArrowLeftOnRectangleIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'orders' ? (
          <div className="grid grid-cols-1 gap-6">
            {orders.length === 0 && <p className="text-center py-20 text-gray-400 italic">Aucune commande récente...</p>}
            {orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-grow">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xl text-red-600">#{order.id.toString().slice(-4)}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">{new Date(order.created_at).toLocaleTimeString()}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="text-sm">
                      <p className="font-bold flex items-center gap-2"><UserIcon className="h-4 w-4 text-gray-400"/> {order.customer_name}</p>
                      <p className="text-gray-500 flex items-center gap-2"><PhoneIcon className="h-4 w-4 text-gray-400"/> {order.customer_phone}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item: any, i: number) => (
                        <span key={i} className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-xs font-bold">
                          {item.quantity}x {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end gap-4">
                  <div className="font-black text-xl">{order.total.toFixed(2)} €</div>
                  <select 
                    value={order.status} 
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="bg-gray-900 text-white rounded-xl p-3 text-xs font-bold outline-none"
                  >
                    <option value="En attente">🔴 En attente</option>
                    <option value="En préparation">🟠 En préparation</option>
                    <option value="Prête / Livrée">🟢 Prête / Livrée</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bouton Ajouter */}
            <button onClick={() => setIsModalOpen(true)} className="border-4 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-8 hover:border-red-200 hover:bg-red-50 transition-all group">
              <PlusIcon className="h-12 w-12 text-gray-300 group-hover:text-red-400" />
              <span className="mt-4 font-bold text-gray-400 group-hover:text-red-500">Ajouter un plat</span>
            </button>

            {menuItems.map(item => (
              <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group">
                <div className="relative h-48">
                  <img src={item.image} className="h-full w-full object-cover" />
                  <button onClick={() => handleDeletePlat(item.id)} className="absolute top-4 right-4 bg-white/90 p-2 rounded-xl text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                    <TrashIcon className="h-5 w-5"/>
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-red-500 font-black mt-1">{item.price.toFixed(2)} €</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    {/* --- LE FORMULAIRE MODAL (AJOUTÉ ICI) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <form onSubmit={handleAddPlat} className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black uppercase italic">Nouveau Plat</h2>
              <button type="button" onClick={() => setIsModalOpen(false)}><XMarkIcon className="h-6 w-6" /></button>
            </div>
            <input required placeholder="Nom du plat" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-500" value={newPlat.name} onChange={e => setNewPlat({...newPlat, name: e.target.value})} />
            <textarea required placeholder="Description" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-500" value={newPlat.description} onChange={e => setNewPlat({...newPlat, description: e.target.value})} />
            <input required type="number" step="0.01" placeholder="Prix (€)" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-500" value={newPlat.price} onChange={e => setNewPlat({...newPlat, price: e.target.value})} />
            <input placeholder="URL de l'image" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-500" value={newPlat.image} onChange={e => setNewPlat({...newPlat, image: e.target.value})} />
            <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200">Ajouter au Menu</button>
          </form>
        </div>
      )}
    </div>
  );
}

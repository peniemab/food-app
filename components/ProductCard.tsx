// src/components/ProductCard.tsx
export default function ProductCard({ name, description, price, image, onAdd, isDark }: any) {
  return (
    <div className={`rounded-2xl shadow-sm border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'} overflow-hidden hover:shadow-md transition-all`}>
      <div className="relative h-48 w-full">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{name}</h3>
        <p className={`text-sm mt-1 line-clamp-2 h-10 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold text-orange-500">{price.toFixed(2)} €</span>
          <button 
            onClick={onAdd}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 active:scale-95 transition-all"
          >
            + Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
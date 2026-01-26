import { Star, Clock } from 'lucide-react';

interface ServiceProps {
    title: string;
    provider: string;
    rating: number;
    reviews: number;
    price: string;
    image: string;
    category: string;
}

export default function ServiceCard({ title, provider, rating, reviews, price, category }: ServiceProps) {
    return (
        <div className="glass-card rounded-xl overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-electric/10">
            <div className="h-32 bg-slate-700 relative">
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-xs text-white font-medium">
                    {category}
                </div>
                {/* Placeholder for service image */}
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-500">
                    Image
                </div>
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-md line-clamp-2 leading-snug group-hover:text-electric transition-colors">
                        {title}
                    </h3>
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-full bg-slate-600" />
                    <span className="text-xs text-gray-300">{provider}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4 border-b border-slate-700/50 pb-3">
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={14} fill="currentColor" />
                        <span className="font-bold text-white">{rating}</span>
                        <span className="text-gray-500">({reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>2 days delivery</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Starting at</span>
                    <span className="text-lg font-bold text-white">₹{price}</span>
                </div>
            </div>
        </div>
    );
}

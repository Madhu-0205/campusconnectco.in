import { Star, Clock } from 'lucide-react';
import Image from 'next/image';

interface ServiceProps {
 title: string;
 provider: string;
 rating: number;
 reviews: number;
 price: string;
 image: string;
 category: string;
}

export default function ServiceCard({ title, provider, rating, reviews, price, category, image }: ServiceProps) {
 return (
 <div className="glass-card rounded-xl overflow-hidden group cursor-pointer hover:shadow-lg hover:shadow-electric/10">
 <div className="h-32 bg-slate-700 relative overflow-hidden">
 <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-white font-medium z-10">
 {category}
 </div>
 <Image 
 src={image} 
 alt={title} 
 fill
 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
 className="object-cover transition-transform duration-500 group-hover:scale-110" 
 />
 </div>
 <div className="p-4">
 <div className="flex justify-between items-start mb-2">
 <h3 className="font-bold text-md line-clamp-2 leading-snug group-hover:text-electric transition-colors">
 {title}
 </h3>
 </div>

 <div className="flex items-center gap-2 mb-3">
 <div className="h-6 w-6 rounded-full bg-slate-600" />
 <span className="text-gray-300">{provider}</span>
 </div>

 <div className="flex items-center gap-4 text-gray-400 mb-4 border-slate-700/50 pb-3">
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
 <span className="text-gray-400">Starting at</span>
 <span className="font-bold text-white">₹{price}</span>
 </div>
 </div>
 </div>
 );
}

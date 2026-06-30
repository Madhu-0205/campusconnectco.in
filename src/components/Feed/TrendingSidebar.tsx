// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TrendingUp, Hash } from 'lucide-react';

const trends = [
    { topic: "AI Hackathon 2024", posts: "2.4k posts" },
    { topic: "React Server Components", posts: "1.8k posts" },
    { topic: "Fintech Internships", posts: "950 posts" },
    { topic: "Campus Startup Incubation", posts: "500 posts" },
];

export default function TrendingSidebar() {
    return (
        <div className="glass-card rounded-xl p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-4 text-white font-heading font-semibold">
                <TrendingUp size={20} className="text-electric" />
                <h3>Trending on Campus</h3>
            </div>
            <div className="space-y-4">
                {trends.map((trend, i) => (
                    <div key={i} className="group cursor-pointer">
                        <div className="flex justify-between items-start">
                            <span className="font-medium text-gray-200 group-hover:text-electric transition-colors">
                                #{trend.topic.replace(/\s+/g, '')}
                            </span>
                        </div>
                        <span className="text-gray-500">{trend.posts}</span>
                    </div>
                ))}
            </div>
            <button className="w-full mt-6 text-electric hover:text-blue-400 hover:underline">
                Show more
            </button>
        </div>
    );
}

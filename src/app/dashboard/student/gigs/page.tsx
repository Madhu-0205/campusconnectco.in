import { Button } from "@/components/ui/Button"
import { GigList } from "@/components/gigs/GigList"
import { Filter, Search } from "lucide-react"

export const dynamic = 'force-dynamic';


export default async function BrowseGigsPage({ searchParams }: { searchParams: Promise<{ q?: string, lat?: string, lng?: string }> }) {
    const params = await searchParams;

    return (
        <div className="space-y-8">
            <div className="relative h-64 rounded-3xl overflow-hidden shadow-lg border border-slate-200">
                <div className="absolute inset-0 bg-linear-to-r from-slate-900/60 to-transparent z-10" />
                <img
                    src="/C:/Users/sriram/.gemini/antigravity/brain/9d02d48f-0699-4a38-ad42-0a688fdc0d1e/student_success_infographic_1769348227993.png"
                    alt="Student Success Journey"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-20 h-full flex flex-col justify-center px-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 backdrop-blur-md mb-4 text-xs font-bold text-white uppercase tracking-widest shadow-lg self-start">
                        Opportunity Hub
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-md">Find Your <span className="text-electric italic">Next Opportunity</span></h2>
                    <p className="text-slate-100 max-w-lg font-medium text-lg leading-relaxed drop-shadow-sm">Discover gigs tailored to your skills and location. Start earning and building your professional portfolio today.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar */}
                <aside className="w-full md:w-64 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Filter size={20} className="text-primary" />
                        <h3 className="font-bold">Filters</h3>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-900">Category</h4>
                        <div className="space-y-2">
                            {['Development', 'Design', 'Marketing', 'Writing'].map(cat => (
                                <label key={cat} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                    <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                                    {cat}
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Search Bar - Simplistic implementation */}
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <form>
                                <input
                                    name="q"
                                    type="text"
                                    placeholder="Search for gigs..."
                                    defaultValue={params?.q}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </form>
                        </div>
                        <Button>Search</Button>
                    </div>

                    {/* Results */}
                    <GigList searchParams={params} />
                </div>
            </div>
        </div>
    )
}

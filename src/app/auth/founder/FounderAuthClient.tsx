"use client";

import { motion } from"framer-motion";
import { Eye, EyeOff, Loader2, ShieldCheck, Lock } from"lucide-react";
import Link from"next/link";
import { useRouter } from"next/navigation";
import { useState, useEffect } from"react";

import { createClient } from"@/lib/supabase/client";

export default function FounderSignInPage() {
 const router = useRouter();
 const supabase = createClient();

 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState("");

 // If already logged in as founder, go straight to panel
 useEffect(() => {
 const check = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (user) router.replace("/dashboard");
 };
 check();
 }, [supabase, router]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsLoading(true);
 setError("");

 try {
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
 if (signInError) throw new Error(signInError.message);

 // Verify role from DB before allowing access
 const res = await fetch("/api/founder/verify-role");
 if (!res.ok) {
 await supabase.auth.signOut();
 throw new Error("Access denied — this login is reserved for the Founder only.");
 }

 router.replace("/dashboard/founder");
 router.refresh();
 } catch (err: unknown) {
 setError(err instanceof Error ? err.message :"Sign in failed.");
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
 {/* Background glows */}
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-warning/10 text-warning rounded-full blur-3xl" />
 <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-(--primary)/5 rounded-full blur-3xl" />

 <motion.div
 initial={{ opacity: 0, y: 24 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="w-full max-w-md relative z-10"
 >
 {/* Card */}
 <div className="bg-background border border-border rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
 {/* Top accent */}
 <div className="h-1 w-full bg-linear-to-r from-amber-500 via-orange-400 to-amber-600" />

 <div className="p-4 md:p-8">
 {/* Header */}
 <div className="text-center mb-8">
 <div className="mx-auto w-14 h-14 bg-warning/10 text-warning border border-amber-500/20 rounded-2xl flex items-center justify-center mb-4">
 <ShieldCheck size={26} className="text-amber-400" />
 </div>
 <h1 className="font-black text-foreground">Founder Control Panel</h1>
 <p className="text-sm mt-1">Restricted access · Authorized personnel only</p>
 </div>

 {/* Security badge */}
 <div className="flex items-center gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl mb-6">
 <Lock size={14} className="text-amber-400 shrink-0" />
 <p className="text-amber-300/80 font-medium">
 This portal is monitored. All login attempts are logged.
 </p>
 </div>

 {error && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height:"auto" }}
 className="bg-red-500/10 border border-red-500/30 text-sm p-3 rounded-xl mb-5"
 >
 {error}
 </motion.div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block font-black text-muted-foreground uppercase tracking-wider mb-1.5">
 Founder Email
 </label>
 <input
 type="email"
 placeholder="founder@campusconnectco.in"
 className="w-full bg-card border-border text-foreground p-3 rounded-xl focus:ring-0 focus:border-amber-500 outline-none transition-all font-medium placeholder:text-muted-foreground"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 />
 </div>

 <div>
 <label className="block font-black text-muted-foreground uppercase tracking-wider mb-1.5">
 Password
 </label>
 <div className="relative">
 <input
 type={showPassword ?"text" :"password"}
 placeholder="••••••••"
 className="w-full bg-card border-border text-foreground p-3 rounded-xl focus:ring-0 focus:border-amber-500 outline-none transition-all pr-11 font-medium placeholder:text-muted-foreground"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-3.5 text-muted-foreground hover:text-muted-foreground transition-colors"
 >
 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
 </button>
 </div>
 </div>

 <button
 type="submit"
 disabled={isLoading}
 className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-amber-500/20 mt-2"
 >
 {isLoading ? (
 <><Loader2 className="animate-spin" size={18} /> Verifying...</>
 ) : (
 <><ShieldCheck size={18} /> Access Control Panel</>
 )}
 </button>
 </form>

 <div className="mt-6 text-center">
 <Link href="/auth/sign-in" className="text-muted-foreground hover:text-muted-foreground transition-colors">
 ← Back to Student Sign In
 </Link>
 </div>
 </div>
 </div>

 {/* Footer note */}
 <p className="text-muted-foreground mt-4">
 campusconnectco.in · Founder Portal · v2.0
 </p>
 </motion.div>
 </div>
 );
}

"use client";
import { useSearchParams, useRouter } from"next/navigation";
import { useEffect, useState, Suspense } from"react";
import { toast } from"sonner";

import { createClient } from"@/lib/supabase/client";

interface GigDetails {
 id: string;
 title: string;
 budget: number;
}

interface ApplicationDetails {
 id: string;
 applicant: {
 name: string;
 };
}

function CheckoutContent({ nonce }: { nonce?: string }) {
 const searchParams = useSearchParams();
 const router = useRouter();
 const gigId = searchParams.get("gigId");
 const pkg = searchParams.get("package") ||"Basic";

 const [gig, setGig] = useState<GigDetails | null>(null);
 const [app, setApp] = useState<ApplicationDetails | null>(null);
 const [loading, setLoading] = useState(true);
 const [paying, setPaying] = useState(false);

 useEffect(() => {
 if (!gigId) {
 toast.error("Missing gig parameter");
 router.push("/client-hub");
 return;
 }

 async function fetchData() {
 try {
 const supabase = createClient();
 const { data: { session } } = await supabase.auth.getSession();
 if (!session) {
 router.push("/auth/sign-in");
 return;
 }

 // Fetch gig details
 const gigRes = await fetch(`/api/gigs?id=${gigId}`);
 if (!gigRes.ok) throw new Error("Failed to fetch gig details");
 const gigData = await gigRes.json();
 setGig(gigData);

 // Fetch application accepted for this gig
 const appRes = await fetch(`/api/client-hub/applicants?gigId=${gigId}`);
 if (appRes.ok) {
 const appData = await appRes.json();
 const acceptedApp = appData.applicants?.find((a: any) => a.status ==="ACCEPTED" || a.status ==="PENDING");
 if (acceptedApp) {
 setApp({
 id: acceptedApp.id,
 applicant: { name: acceptedApp.applicant?.name ||"Student" }
 });
 }
 }
 } catch (err) {
 console.error(err);
 toast.error("Error loading checkout details");
 } finally {
 setLoading(false);
 }
 }

 fetchData();
 }, [gigId, router]);

 // Load Razorpay script
 const loadRazorpayScript = () => {
 return new Promise((resolve) => {
 const script = document.createElement("script");
 script.src ="https://checkout.razorpay.com/v1/checkout.js";
 if (nonce) {
 script.setAttribute("nonce", nonce);
 }
 script.onload = () => resolve(true);
 script.onerror = () => resolve(false);
 document.body.appendChild(script);
 });
 };

 const handlePayment = async () => {
 if (!gig || !app) {
 toast.error("Unable to initialize checkout. Missing worker or gig.");
 return;
 }

 setPaying(true);
 try {
 const orderRes = await fetch("/api/checkout/create-order", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ gigId: gig.id, applicationId: app.id }),
 });

 if (!orderRes.ok) {
 const errData = await orderRes.json();
 throw new Error(errData.error ||"Failed to create order");
 }

 const orderData = await orderRes.json();

 if (orderData.mock) {
 // Mock Mode (Local testing bypass)
 toast.success("Sandbox Mode: Simulating successful payment...");
 
 const webhookRes = await fetch("/api/checkout/webhook", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({
 event:"order.paid",
 orderId: orderData.orderId,
 payload: {
 payment: {
 entity: {
 id: `pay_mock_${Math.random().toString(36).substring(2, 9)}`,
 amount: orderData.amount,
 currency:"INR",
 status:"captured",
 }
 }
 }
 }),
 });

 if (webhookRes.ok) {
 toast.success("Escrow secured successfully! Gig status: IN_PROGRESS");
 router.push("/client-hub");
 } else {
 throw new Error("Local webhook simulation failed");
 }
 return;
 }

 // Real integration checkout
 const isLoaded = await loadRazorpayScript();
 if (!isLoaded) {
 toast.error("Razorpay SDK failed to load. Are you online?");
 setPaying(false);
 return;
 }

 const options = {
 key: orderData.keyId,
 amount: orderData.amount,
 currency: orderData.currency,
 name:"CampusConnect",
 description: `Escrow for ${gig.title}`,
 order_id: orderData.orderId,
 handler: async function (response: any) {
 toast.success("Payment verified! Completing escrow locking...");
 
 // Trigger manual update / webhook wait
 const webhookRes = await fetch("/api/checkout/webhook", {
 method:"POST",
 headers: {
"Content-Type":"application/json",
 },
 body: JSON.stringify({
 event:"payment.captured",
 orderId: orderData.orderId,
 payload: {
 payment: {
 entity: {
 id: response.razorpay_payment_id,
 order_id: response.razorpay_order_id,
 signature: response.razorpay_signature,
 }
 }
 }
 }),
 });

 if (webhookRes.ok) {
 toast.success("Escrow funds locked. Gig is active!");
 router.push("/client-hub");
 } else {
 toast.error("Failed to verify transaction state.");
 }
 },
 prefill: {
 name:"Client Owner",
 },
 theme: {
 color:"#4f46e5",
 },
 };

 const paymentObject = new (window as any).Razorpay(options);
 paymentObject.open();

 } catch (err: any) {
 console.error(err);
 toast.error(err.message ||"Payment initiation failed");
 } finally {
 setPaying(false);
 }
 };

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
 <div className="text-center">
 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
 <p className="text-slate-400">Loading order configuration...</p>
 </div>
 </div>
 );
 }

 if (!gig) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
 <div className="max-w-md w-full text-center bg-surface-2 border border-slate-800 rounded-2xl p-8">
 <h2 className="text-xl font-bold text-red-500 mb-2">Checkout Error</h2>
 <p className="text-slate-400 mb-6">Gig details could not be found or verified.</p>
 <button onClick={() => router.push("/client-hub")} className="px-6 py-2 bg-surface-3 hover:bg-slate-700 text-white rounded-full">
 Return to Hub
 </button>
 </div>
 </div>
 );
 }

 const platformFee = gig.budget * 0.10;
 const total = gig.budget + platformFee;

 return (
 <div className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
 <div className="max-w-3xl mx-auto">
 <h1 className="text-3xl font-extrabold tracking-tight mb-8 bg-linear-to-r from-white via-slate-200 to-primary-light bg-clip-text text-transparent">
 Secure Gig Escrow
 </h1>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {/* Order Summary */}
 <div className="md:col-span-2 space-y-6">
 <div className="bg-surface-2/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
 <h2 className="text-lg font-bold text-slate-300 mb-4">Gig Information</h2>
 <div className="space-y-2">
 <p className="text-2xl font-bold text-white">{gig.title}</p>
 <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
 Package: {pkg}
 </div>
 </div>
 </div>

 {/* Worker Info */}
 <div className="bg-surface-2/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
 <h2 className="text-lg font-bold text-slate-300 mb-4">Assigned Worker</h2>
 {app ? (
 <div className="flex items-center space-x-3">
 <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white text-sm">
 {app.applicant.name.charAt(0)}
 </div>
 <div>
 <p className="font-semibold text-white">{app.applicant.name}</p>
 <p className="text-xs text-slate-400">Escrow will release automatically upon client approval</p>
 </div>
 </div>
 ) : (
 <p className="text-red-400 text-sm">⚠ No worker is currently assigned or accepted for this gig.</p>
 )}
 </div>
 </div>

 {/* Payment Card */}
 <div className="bg-surface-2 border border-slate-800 rounded-2xl p-6 h-fit space-y-6">
 <h2 className="text-lg font-bold text-white">Payment Billing</h2>
 
 <div className="space-y-3 text-sm border-b border-slate-800 pb-4">
 <div className="flex justify-between text-slate-400">
 <span>Base Budget</span>
 <span className="text-white">₹{gig.budget.toLocaleString()}</span>
 </div>
 <div className="flex justify-between text-slate-400">
 <span>Platform Fee (10%)</span>
 <span className="text-white">₹{platformFee.toLocaleString()}</span>
 </div>
 </div>

 <div className="flex justify-between items-center text-lg font-extrabold text-white">
 <span>Total Amount</span>
 <span className="text-primary">₹{total.toLocaleString()}</span>
 </div>

 <button
 onClick={handlePayment}
 disabled={paying || !app}
 className="w-full py-3 px-4 bg-primary hover:bg-primary disabled:bg-surface-3 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
 >
 {paying ?"Processing secure payment..." :"Deposit to Escrow"}
 </button>

 <p className="text-center text-xxs text-slate-500">
 Payments are protected by Razorpay Route Escrow. Funds are released safely after work is validated and approved.
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}

export default function CheckoutClient({ nonce }: { nonce?: string }) {
 return (
 <Suspense fallback={
 <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
 <p className="text-slate-400">Loading Checkout...</p>
 </div>
 }>
 <CheckoutContent nonce={nonce} />
 </Suspense>
 );
}

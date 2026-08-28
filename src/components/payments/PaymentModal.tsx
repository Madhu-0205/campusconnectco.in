"use client";

import { X, ShieldCheck } from"lucide-react";
import Script from"next/script";
import { useState } from"react";

import { Button } from"@/components/ui/Button";

interface PaymentModalProps {
 isOpen: boolean;
 onClose: () => void;
 gigId: string;
 workerId: string;
 gigTitle: string;
 budget: number;
 onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, gigId, workerId, gigTitle, budget, onSuccess }: PaymentModalProps) {
 const [loading, setLoading] = useState(false);

 const platformFee = budget * 0.10;
 const totalAmount = budget + platformFee;

 const handlePayment = async () => {
 setLoading(true);
 try {
 // 1. Create Order via API
 const res = await fetch("/api/payments/escrow/create-order", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ gigId, workerId })
 });
 const data = await res.json();

 if (!res.ok) throw new Error(data.error ||"Failed to create order");

 // 2. Open Razorpay Checkout
 const options = {
 key: data.key,
 amount: Math.round(totalAmount * 100), // Expected in paise
 currency:"INR",
 name:"CampusConnect",
 description: `Escrow Lock: ${gigTitle}`,
 image:"/logo-v2.jpg",
 order_id: data.orderId,
 handler: async function (response: any) {
 try {
 // 3. Verify Payment
 const verifyRes = await fetch("/api/payments/escrow/verify", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({
 razorpay_order_id: response.razorpay_order_id,
 razorpay_payment_id: response.razorpay_payment_id,
 razorpay_signature: response.razorpay_signature,
 gigId
 })
 });

 if (verifyRes.ok) {
 onSuccess();
 onClose();
 } else {
 alert("Payment verification failed. Please contact support.");
 }
 } catch (error) {
 console.error("Verification error", error);
 alert("An error occurred during verification.");
 }
 },
 theme: { color:"#1FA971" },
 };

 const rzp = new (window as any).Razorpay(options);
 rzp.on("payment.failed", function (response: any) {
 console.error("Payment failed", response.error);
 alert(`Payment failed: ${response.error.description}`);
 });
 rzp.open();
 } catch (error: any) {
 console.error("Payment error", error);
 alert(`Payment initialization failed: ${error.message}`);
 } finally {
 setLoading(false);
 }
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
 <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
 
 <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/10 animate-in slide-in-from-bottom-4 relative">
 {/* Header */}
 <div className="p-6 pb-0 flex items-center justify-between">
 <h2 className="text-xl font-black flex items-center gap-2">
 <ShieldCheck className="text-primary h-6 w-6" />
 Secure Escrow Lock
 </h2>
 <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
 <X size={18} />
 </button>
 </div>

 {/* Body */}
 <div className="p-6 space-y-6">
 <p className="text-sm text-muted-foreground leading-relaxed">
 To formally assign this gig and guarantee payment to the student upon successful completion, please lock the total budget into CampusConnect Escrow.
 </p>

 <div className="bg-background rounded-2xl p-5 space-y-3 border border-white/5">
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">Gig Budget</span>
 <span className="font-bold">₹{budget.toLocaleString()}</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">Platform Fee (10%)</span>
 <span className="font-bold text-orange-400">+ ₹{platformFee.toLocaleString()}</span>
 </div>
 <div className="pt-3 border-t border-white/5 flex justify-between items-center">
 <span className="font-black text-slate-300">Total to Lock</span>
 <span className="text-xl font-black text-primary">₹{totalAmount.toLocaleString()}</span>
 </div>
 </div>
 </div>

 {/* Footer */}
 <div className="p-6 pt-0">
 <Button 
 onClick={handlePayment} 
 disabled={loading}
 className="w-full rounded-2xl h-14 text-base font-black uppercase tracking-widest shadow-xl"
 style={{
 background:"linear-gradient(135deg, var(--color-primary), #FF4500)",
 }}
 >
 {loading ?"Processing..." :"Proceed to Payment"}
 </Button>
 <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
 <ShieldCheck size={12} /> Powered securely by Razorpay
 </p>
 </div>
 </div>
 </div>
 );
}

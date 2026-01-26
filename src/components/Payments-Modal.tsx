import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    CheckCircle,
    Loader2,
    CreditCard,
    Smartphone,
    ShieldCheck,
    Building2,
    ChevronRight,
    Search,
    Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

interface PaymentModalProps {
    onClose: () => void;
    method: "upi" | "card" | "netbanking" | "razorpay" | null;
    amount?: string;
    gigId?: string; // Passed gigId for locking
}

export default function PaymentModal({
    onClose,
    method,
    amount = "540.00",
    gigId
}: PaymentModalProps) {
    const { addToast } = useToast();

    const [paymentAmount, setPaymentAmount] = useState(amount);
    const [step, setStep] = useState<"input" | "processing" | "success">("input");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setPaymentAmount(amount);
    }, [amount]);

    useEffect(() => {
        // Load Razorpay Script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    /* Secure Payment Trigger */
    const handlePay = async () => {
        if (processing) return;
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            addToast("Please enter a valid amount", "error");
            return;
        }

        setProcessing(true);
        setStep("processing");

        try {
            // 1. Create Order
            const orderRes = await fetch("/api/payments/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: parseFloat(paymentAmount) })
            });
            const order = await orderRes.json();

            if (!order.id) throw new Error("Order creation failed");

            // 2. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag",
                amount: order.amount,
                currency: "INR",
                name: "CampusConnect",
                description: gigId ? `Escrow Funding for Gig` : `Wallet Deposit`,
                order_id: order.id,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await fetch("/api/payments/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                gigId,
                                amount // in standard currency
                            })
                        });

                        if (verifyRes.ok) {
                            setStep("success");
                            addToast(gigId ? "Payment Verified & Funds Locked!" : "Deposit Successful!", "success");
                        } else {
                            addToast("Payment Verification Failed", "error");
                            setStep("input");
                        }
                    } catch (error) {
                        addToast("Verification Error", "error");
                    }
                },
                prefill: {
                    name: "CampusConnect User",
                    email: "student@campusconnect.co.in",
                    contact: "9999999999"
                },
                theme: {
                    color: "#0f172a"
                }
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error(error);
            addToast("Payment initiation failed.", "error");
            setStep("input");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
            <div className="absolute inset-0" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="relative w-full max-w-md bg-white border border-secondary rounded-3xl shadow-2xl overflow-hidden fast-render max-h-[95vh] flex flex-col"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-6 md:right-6 text-muted-foreground hover:text-foreground transition-colors z-20"
                >
                    <X size={20} />
                </button>

                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                    <AnimatePresence mode="wait">
                        {step === "input" && (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 text-primary rotate-3">
                                        <Smartphone size={40} />
                                    </div>
                                    <h2 className="text-2xl font-black text-foreground">Secure Checkout</h2>
                                    <p className="text-sm text-slate-500 mt-2 font-medium">Pay via UPI, Card, Netbanking, or QR</p>
                                    <div className="flex items-center justify-center gap-1 text-primary text-[10px] font-bold uppercase tracking-widest mt-1">
                                        <ShieldCheck size={12} /> Razorpay Secured Gateway
                                    </div>
                                </div>

                                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                                        <Zap className="text-emerald-400" size={40} />
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                            {gigId ? "Total Project Budget" : "Amount to Deposit"}
                                        </p>

                                        {gigId ? (
                                            <p className="text-5xl font-black text-white tracking-tighter mb-4">₹{amount}</p>
                                        ) : (
                                            <div className="relative mb-4">
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-500">₹</span>
                                                <input
                                                    type="number"
                                                    value={paymentAmount}
                                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                                    className="w-full bg-transparent text-5xl font-black text-white tracking-tighter outline-none border-b border-slate-700 focus:border-emerald-500 py-2 pl-8 transition-colors"
                                                    placeholder="0"
                                                />
                                            </div>
                                        )}

                                        <div className="h-px w-full bg-white/10 mb-4" />

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Platform Commission (7-10%)</span>
                                                <span className="text-rose-400 font-black">Incl. in budget</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Funds Locked</span>
                                                <span className="text-emerald-400 font-black">100% Secure Usage</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    disabled={processing}
                                    onClick={handlePay}
                                    className="w-full bg-primary hover:bg-teal-600 disabled:opacity-30 text-white font-black py-5 rounded-2xl transition-all active:scale-95 shadow-2xl shadow-primary/30 flex items-center justify-center gap-2"
                                >
                                    {processing ? <Loader2 className="animate-spin" /> : <>Complete Payment <ChevronRight size={20} /></>}
                                </button>

                                <p className="text-xs text-center text-slate-400 px-4">
                                    Clicking above will open the secure Razorpay payment page. You can choose any UPI app or bank method there.
                                </p>
                            </motion.div>
                        )}

                        {step === "processing" && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-16 space-y-6"
                            >
                                <div className="relative mx-auto h-24 w-24">
                                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-foreground">Waiting for Payment</h3>
                                    <p className="text-muted-foreground font-medium mt-2">Please complete the transaction in the popup window...</p>
                                </div>
                            </motion.div>
                        )}

                        {step === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-12 space-y-6"
                            >
                                <div className="h-24 w-24 bg-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto text-white shadow-2xl shadow-green-500/30">
                                    <CheckCircle size={48} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-foreground">Payment Successful!</h3>
                                    <p className="text-muted-foreground font-medium mt-1">Funds are now securely locked in Escrow.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-black transition-all"
                                >
                                    Return to Dashboard
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="py-4 text-center border-t border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Secured by Razorpay • CampusConnect
                </div>
            </motion.div>
        </motion.div>
    );
}


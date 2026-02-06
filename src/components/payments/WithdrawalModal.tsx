"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    CheckCircle,
    Loader2,
    Building2,
    Smartphone,
    CreditCard,
    ArrowRight,
    Lock
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ToastProvider";

interface WithdrawalModalProps {
    onClose: () => void;
    availableBalance: number;
}

export default function WithdrawalModal({ onClose, availableBalance }: WithdrawalModalProps) {
    const { addToast } = useToast();
    const [step, setStep] = useState<"input" | "processing" | "success">("input");
    const [type, setType] = useState<"bank" | "upi">("bank");
    const [amount, setAmount] = useState("");
    const [processing, setProcessing] = useState(false);

    // Bank details
    const [accNumber, setAccNumber] = useState("");
    const [ifsc, setIfsc] = useState("");
    const [bankName, setBankName] = useState("");
    const [upiId, setUpiId] = useState("");

    const isValid = type === "bank"
        ? (accNumber.length > 8 && ifsc.length === 11 && bankName.length > 2 && Number(amount) > 0)
        : (upiId.includes("@") && Number(amount) > 0);

    const handleWithdraw = async () => {
        if (!isValid || processing) return;
        if (Number(amount) > availableBalance) {
            addToast("Insufficient balance", "error");
            return;
        }

        setProcessing(true);
        setStep("processing");

        try {
            const res = await fetch("/api/withdraw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: Number(amount),
                    type,
                    accNumber: type === "bank" ? accNumber : undefined,
                    ifscCode: type === "bank" ? ifsc : undefined,
                    bankName: type === "bank" ? bankName : undefined,
                    upiId: type === "upi" ? upiId : undefined
                })
            });

            if (!res.ok) throw new Error("Withdrawal failed");

            await new Promise(r => setTimeout(r, 2000));
            setStep("success");
            addToast("Withdrawal request submitted", "success");
        } catch (error) {
            addToast("Something went wrong", "error");
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
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl"
        >
            <div className="absolute inset-0" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200"
            >
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Withdraw Funds</h2>
                        <p className="text-slate-500 font-bold text-sm">Securely transfer your earnings.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto max-h-[70vh]">
                    <AnimatePresence mode="wait">
                        {step === "input" && (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                {/* Balance Info */}
                                <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20">
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Available to Withdraw</p>
                                    <h3 className="text-4xl font-black">₹{availableBalance.toLocaleString()}</h3>
                                </div>

                                {/* Amount Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 uppercase tracking-widest px-1">Amount to Transfer</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">₹</div>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-slate-100 focus:border-slate-900 focus:bg-white rounded-2xl py-5 pl-12 pr-6 text-xl font-black transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Method Switcher */}
                                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                                    <button
                                        onClick={() => setType("bank")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black transition-all ${type === "bank" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        <Building2 size={18} />
                                        Bank Account
                                    </button>
                                    <button
                                        onClick={() => setType("upi")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black transition-all ${type === "upi" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        <Smartphone size={18} />
                                        UPI ID
                                    </button>
                                </div>

                                {/* Dynamic Forms */}
                                <div className="space-y-4">
                                    {type === "bank" ? (
                                        <>
                                            <input
                                                placeholder="Account Number"
                                                value={accNumber}
                                                onChange={e => setAccNumber(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold outline-none focus:border-slate-900 transition-all"
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    placeholder="IFSC Code"
                                                    value={ifsc}
                                                    onChange={e => setIfsc(e.target.value.toUpperCase())}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold outline-none focus:border-slate-900 transition-all"
                                                />
                                                <input
                                                    placeholder="Bank Name"
                                                    value={bankName}
                                                    onChange={e => setBankName(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold outline-none focus:border-slate-900 transition-all"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <input
                                            placeholder="vpa@upi"
                                            value={upiId}
                                            onChange={e => setUpiId(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold outline-none focus:border-slate-900 transition-all"
                                        />
                                    )}
                                </div>

                                <button
                                    onClick={handleWithdraw}
                                    disabled={!isValid || processing}
                                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-[1.5rem] font-black text-lg transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3"
                                >
                                    Confirm Withdrawal
                                    <ArrowRight size={20} />
                                </button>

                                <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                    <Lock size={12} />
                                    End-to-End Encrypted Transfer
                                </div>
                            </motion.div>
                        )}

                        {step === "processing" && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-20 flex flex-col items-center text-center space-y-6"
                            >
                                <div className="relative">
                                    <div className="h-24 w-24 border-4 border-slate-100 rounded-full" />
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 h-24 w-24 border-4 border-t-slate-950 rounded-full"
                                    />
                                    <Loader2 className="absolute inset-0 m-auto h-10 w-10 text-slate-950 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Verifying Request</h3>
                                    <p className="text-slate-500 font-bold">Securing your transaction path...</p>
                                </div>
                            </motion.div>
                        )}

                        {step === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 flex flex-col items-center text-center space-y-6"
                            >
                                <div className="h-24 w-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40">
                                    <CheckCircle size={48} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Request Received!</h3>
                                    <p className="text-slate-500 font-bold">₹{amount} will be credited within 24-48 hours.</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 w-full">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-500 font-bold">Reference ID:</span>
                                        <span className="text-slate-900 font-black">#WD-{Math.floor(Math.random() * 1000000)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-bold">Status:</span>
                                        <span className="text-emerald-600 font-black uppercase tracking-widest">Processing</span>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black transition-all"
                                >
                                    Back to Dashboard
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}

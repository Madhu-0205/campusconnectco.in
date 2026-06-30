"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Star, MapPin, Clock, MessageSquare, Heart, CheckCircle2,
    Share2, User, ChevronRight, ShieldCheck, Zap
} from "lucide-react";
import { Button } from "@/components/ui/Button";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

export interface GigPackage {
    id: string;
    name: "Basic" | "Standard" | "Premium";
    price: number;
    deliveryDays: number;
    description: string;
    features: string[];
}

export interface FloatingGigCardProps {
    isOpen: boolean;
    onClose: () => void;
    gig: {
        id: string;
        title: string;
        description: string;
        fullDescription?: string;
        category: string;
        startingPrice: number;
        deliveryTime: string;
        location?: string;
        rating?: number;
        reviewsCount?: number;
        images?: string[];
        seller: {
            id: string;
            name: string;
            image?: string;
            role?: string;
            isVerified?: boolean;
        };
        packages?: GigPackage[];
    };
}

export function FloatingGigCard({ isOpen, onClose, gig }: FloatingGigCardProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<"Basic" | "Standard" | "Premium">("Basic");

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    // Derived mock data if not provided
    const packages: GigPackage[] = gig.packages || [
        {
            id: "pkg_basic",
            name: "Basic",
            price: gig.startingPrice,
            deliveryDays: parseInt(gig.deliveryTime) || 2,
            description: "Essential delivery for quick tasks.",
            features: ["1 concept", "1 revision", "Source files"]
        },
        {
            id: "pkg_standard",
            name: "Standard",
            price: Math.round(gig.startingPrice * 2),
            deliveryDays: (parseInt(gig.deliveryTime) || 2) + 2,
            description: "perfect for professional projects.",
            features: ["2 concepts", "3 revisions", "Source files", "Commercial Use"]
        },
        {
            id: "pkg_premium",
            name: "Premium",
            price: Math.round(gig.startingPrice * 3.5),
            deliveryDays: (parseInt(gig.deliveryTime) || 2) + 4,
            description: "Complete premium package with priority support.",
            features: ["3 concepts", "Unlimited revisions", "Source files", "Commercial Use", "Priority Support"]
        }
    ];

    const currentPackage = packages.find(p => p.name === selectedPackage) || packages[0];

    const handleSaveToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSaved(!isSaved);
        toast.success(isSaved ? "Removed from favorites" : "Saved to favorites");
    };

    const handleContact = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/messages?userId=${gig.seller.id}`);
        onClose();
    };

    const handleOrder = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Route to checkout or escrow creation
        router.push(`/checkout?gigId=${gig.id}&package=${selectedPackage}`);
        onClose();
    };

    const toggleExpand = () => setIsExpanded(!isExpanded);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-hidden">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                />

                {/* Modal Content */}
                <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className={`relative w-full max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 rounded-4xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col ${isExpanded ? "max-w-4xl" : "max-w-sm sm:max-w-md lg:max-w-lg" }`}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 p-2 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-md rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all shadow-sm"
                    >
                        <X size={20} />
                    </button>

                    <div className="overflow-y-auto flex flex-1 scrollbar-hide">
                        <div className={`flex flex-col ${isExpanded ? "md:flex-row" : ""}`}>

                            {/* LEFT SIDE / MAIN CARD */}
                            <motion.div
                                layout
                                className={`p-6 sm:p-8 flex flex-col gap-6 ${isExpanded ? "md:w-3/5 md:border-r border-slate-200 dark:border-slate-800" : "w-full"}`}
                                onClick={!isExpanded ? toggleExpand : undefined}
                                style={{ cursor: !isExpanded ? "pointer" : "default" }}
                            >
                                {/* Header Info */}
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-electric/10 text-xs font-black rounded-full uppercase tracking-wider">
                                            {gig.category}
                                        </span>
                                        {gig.location && (
                                            <span className="flex items-center gap-1 font-bold text-slate-500 dark:text-slate-400">
                                                <MapPin size={12} /> {gig.location}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleSaveToggle}
                                        className={`p-2 rounded-full transition-all ${isSaved ? "bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400" : "bg-slate-50 text-slate-400 hover:text-rose-500 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/10"}`}
                                    >
                                        <Heart size={20} className={isSaved ? "fill-current" : ""} />
                                    </button>
                                </div>

                                <motion.h2 layout="position" className="sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                                    {gig.title}
                                </motion.h2>

                                {/* Seller Profile Summary */}
                                <motion.div layout="position" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 relative rounded-full bg-electric/20 flex items-center justify-center overflow-hidden shrink-0 border-white dark:border-slate-700 shadow-sm">
                                            {gig.seller.image ? (
                                                <Image src={gig.seller.image} alt={gig.seller.name} fill className="object-cover" />
                                            ) : (
                                                <User size={20} className="text-electric" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-black text-slate-900 dark:text-white">{gig.seller.name}</span>
                                                {gig.seller.isVerified !== false && <ShieldCheck size={14} className="text-emerald-500" />}
                                            </div>
                                            <div className="flex items-center gap-2 font-bold text-slate-500">
                                                <span>{gig.seller.role || "Student"}</span>
                                                <span className="flex items-center gap-0.5 text-amber-500">
                                                    <Star size={12} className="fill-current" /> {gig.rating || 4.9}
                                                </span>
                                                <span>({gig.reviewsCount || 12} reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/profile/${gig.seller.id}`); onClose(); }} className="hidden sm:flex rounded-full text-xs font-bold border-slate-200 dark:border-slate-700">
                                            View Profile
                                        </Button>
                                    )}
                                </motion.div>

                                <motion.p layout="position" className={`text-slate-600 dark:text-slate-300 font-medium leading-relaxed ${!isExpanded ? "line-clamp-3" : ""}`}>
                                    {isExpanded ? (gig.fullDescription || gig.description) : gig.description}
                                </motion.p>

                                {!isExpanded && (
                                    <div className="flex items-center gap-2 font-bold text-electric mt-2 group">
                                        View full details <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}

                                {/* Expanded Left Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 flex flex-col gap-6"
                                        >
                                            {/* Optional Image Gallery or Previews */}
                                            {gig.images && gig.images.length > 0 && (
                                                <div className="grid grid-cols-2 gap-3 pb-4">
                                                    {gig.images.map((img, i) => (
                                                        <div key={i} className="rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800 relative">
                                                            <Image src={img} alt="Gig preview" fill className="object-cover hover:scale-105 transition-transform duration-500" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* RIGHT SIDE / ACTIONS CONTEXT */}
                            {(!isExpanded || isExpanded) && (
                                <motion.div
                                    layout
                                    className={`p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-6 justify-between ${isExpanded ? "md:w-2/5" : "w-full border-slate-100 dark:border-slate-800"}`}
                                >
                                    {/* Packages Toggle */}
                                    <div className="flex flex-col gap-6">
                                        {isExpanded && (
                                            <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1.5 rounded-full relative">
                                                {["Basic", "Standard", "Premium"].map((pkg) => (
                                                    <button
                                                        key={pkg}
                                                        onClick={(e) => { e.stopPropagation(); setSelectedPackage(pkg as never); }}
                                                        className={`flex-1 py-2 text-xs font-black rounded-full z-10 transition-colors ${selectedPackage === pkg ? "text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}`}
                                                    >
                                                        {pkg}
                                                    </button>
                                                ))}
                                                <motion.div
                                                    layoutId="package-indicator"
                                                    className="absolute top-1.5 bottom-1.5 w-[calc(33.333%-4px)] bg-white dark:bg-slate-700 rounded-full shadow-sm"
                                                    initial={false}
                                                    animate={{
                                                        x: selectedPackage === "Basic" ? 0 : selectedPackage === "Standard" ? "100%" : "200%"
                                                    }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                />
                                            </div>
                                        )}

                                        {/* Price & Delivery Time Display */}
                                        <div>
                                            <motion.div layout="position" className="flex items-end justify-between mb-2">
                                                <p className="font-bold text-slate-500 uppercase tracking-widest">{currentPackage.name} Package</p>
                                                <div className="flex items-start">
                                                    <span className="font-bold text-slate-400 mt-1 mr-1">₹</span>
                                                    <span className="font-black text-slate-900 dark:text-white tracking-tighter">
                                                        {currentPackage.price.toLocaleString()}
                                                    </span>
                                                </div>
                                            </motion.div>
                                            <p className="text-slate-600 dark:text-slate-300">{currentPackage.description}</p>
                                        </div>

                                        <div className="flex items-center gap-4 py-4 border-slate-200 dark:border-slate-700/50 font-bold text-slate-700 dark:text-slate-300">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={16} className="text-electric" /> {currentPackage.deliveryDays} Days Delivery
                                            </div>
                                        </div>

                                        {/* Features List (only when expanded) */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                                    {currentPackage.features.map((feature, i) => (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                                            <span className="text-slate-600 dark:text-slate-400 font-medium">{feature}</span>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Action Buttons */}
                                    <motion.div layout="position" className="flex flex-col gap-3 mt-6">
                                        <Button
                                            onClick={handleOrder}
                                            className="w-full h-14 rounded-2xl bg-electric hover:bg-blue-600 font-black text-lg shadow-xl shadow-electric/20 active:scale-95 transition-all"
                                        >
                                            <Zap size={18} className="mr-2" /> Book Now (₹{currentPackage.price.toLocaleString()})
                                        </Button>

                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={handleContact}
                                                className="flex-1 h-12 rounded-2xl border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
                                            >
                                                <MessageSquare size={16} className="mr-2" /> Contact
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={(e) => { e.stopPropagation(); /* Copy share link */ toast.success("Link copied!"); }}
                                                className="w-12 h-12 p-0 rounded-2xl border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
                                            >
                                                <Share2 size={16} />
                                            </Button>
                                        </div>
                                    </motion.div>

                                    {!isExpanded && (
                                        <p className="text-slate-400 font-black tracking-widest uppercase mt-4">
                                            Tap card to expand details
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

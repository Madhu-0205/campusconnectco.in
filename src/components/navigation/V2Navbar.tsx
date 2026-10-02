"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Search, Sparkles, ArrowRight, UserCircle, Settings,
  LogOut, LayoutDashboard, Briefcase, Users, MessageSquare, Plus,
  Shield, Building2, ChevronDown
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";

import { SignOutButton } from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/client";

export interface V2NavbarUser {
  id: string;
  role: string;
  name: string | null;
  avatar: string | null;
}

interface V2NavbarProps {
  initialUser?: V2NavbarUser | null;
}

export function V2Navbar({ initialUser = null }: V2NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<V2NavbarUser | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openSearch = () => {
    document.dispatchEvent(new CustomEvent("open-command-center"));
  };

  const syncUser = useCallback(async () => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (error || !authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const meta = authUser.user_metadata || {};
      const fallbackRole = (meta.role as string) || "STUDENT";
      const fallbackName = meta.full_name || meta.name || authUser.email?.split("@")[0] || null;
      const fallbackAvatar = meta.avatar_url || meta.picture || null;

      let resolvedRole = fallbackRole;
      let resolvedName = fallbackName;
      let resolvedAvatar = fallbackAvatar;

      try {
        const { data: profile } = await supabase
          .from("User")
          .select("role, full_name, name, avatar_url, image")
          .eq("id", authUser.id)
          .maybeSingle();

        if (profile) {
          if (profile.role) resolvedRole = profile.role;
          if (profile.full_name || profile.name) resolvedName = profile.full_name || profile.name;
          if (profile.avatar_url || profile.image) resolvedAvatar = profile.avatar_url || profile.image;
        }
      } catch {
        // use fallback values
      }

      setUser({
        id: authUser.id,
        role: resolvedRole,
        name: resolvedName,
        avatar: resolvedAvatar,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    setMounted(true);
    syncUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
        syncUser();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      }
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [syncUser, supabase, router]);

  // Dynamic Navigation Links based on role
  const navLinks = React.useMemo(() => {
    if (!user) {
      return [
        { label: "Discover", href: "/opportunities" },
        { label: "Internships", href: "/opportunities?type=internship" },
        { label: "Campus Gigs", href: "/opportunities?type=gig" },
        { label: "For Founders", href: "/auth/founder" },
      ];
    }

    const common = [
      { label: "Opportunities", href: "/opportunities" },
      { label: "Network", href: "/network" },
      { label: "Messages", href: "/messages" },
    ];

    if (user.role === "STUDENT") {
      return [
        { label: "Dashboard", href: "/dashboard/student" },
        ...common,
      ];
    }

    if (user.role === "CLIENT" || user.role === "STARTUP") {
      return [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Talent Search", href: "/employer/talent-search" },
        ...common,
      ];
    }

    if (user.role === "FOUNDER") {
      return [
        { label: "Founder Hub", href: "/dashboard/founder" },
        ...common,
      ];
    }

    return common;
  }, [user]);

  const dashboardHref = user?.role === "FOUNDER" 
    ? "/dashboard/founder" 
    : (user?.role === "CLIENT" || user?.role === "STARTUP") 
    ? "/dashboard" 
    : "/dashboard/student";

  const profileHref = user?.role === "STUDENT" 
    ? "/dashboard/student/profile" 
    : user?.role === "FOUNDER" 
    ? "/dashboard/founder/settings" 
    : "/dashboard";

  return (
    <>
      {/* Top Banner - Truthful, Calm Discovery Prompt */}
      <div className="w-full bg-[#1e382d] text-white flex items-center justify-between px-4 py-2 text-xs md:text-sm font-medium z-50 relative border-b border-[#2b4d3e]">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-[#1FA971]/20 text-[#6fe2b2] px-2 py-0.5 rounded text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" /> Live
            </span>
            <span className="hidden sm:inline text-slate-200">
              Verified campus gigs, startup internships, and hackathons in one place.
            </span>
            <span className="sm:hidden text-slate-200 truncate">
              Verified student gigs & internships.
            </span>
          </div>

          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1 text-[#6fe2b2] hover:text-white font-semibold transition-colors text-xs shrink-0 ml-4 group"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`w-full sticky top-0 z-40 transition-all duration-200 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80"
            : "bg-white border-b border-slate-200/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 focus:outline-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#2B4B3C] text-white flex items-center justify-center font-bold text-lg shadow-xs">
              C
            </div>
            <span className="font-bold text-xl tracking-tight text-[#232B27]">
              Campus<span className="text-[#1FA971]">ConnectCo</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-semibold">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href.startsWith("/opportunities?") &&
                  pathname === "/opportunities");
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`transition-colors py-1 relative ${
                    isActive
                      ? "text-[#1FA971] font-bold"
                      : "text-slate-600 hover:text-[#1FA971]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Command Bar Trigger */}
            <button
              onClick={openSearch}
              type="button"
              className="flex items-center gap-2 h-9 px-3 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 text-xs font-medium transition-all border border-slate-200/60 cursor-pointer"
              aria-label="Open search command center"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search opportunities…</span>
              <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-500 border border-slate-200 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-1" />

            {/* Stable Auth Loading State vs Authenticated vs Anonymous */}
            {!mounted && loading ? (
              <div className="w-24 h-9 rounded-xl bg-slate-100 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={dashboardHref}
                  className="h-9 px-4 rounded-xl bg-[#1FA971] hover:bg-[#199160] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs hover:shadow-sm"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                {/* Profile dropdown */}
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(prev => !prev)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1FA971]/30 cursor-pointer"
                    aria-label="Open user menu"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#2B4B3C] text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                      {user.avatar ? (
                        <Image src={user.avatar} alt="Avatar" width={28} height={28} className="w-full h-full object-cover" unoptimized />
                      ) : (
                        user.name?.charAt(0)?.toUpperCase() ?? "U"
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                      {user.name ?? "Member"}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </button>

                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl py-1.5 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name ?? "Member"}</p>
                      <p className="text-[11px] text-slate-500 capitalize">{user.role.toLowerCase()}</p>
                    </div>

                    <Link
                      href={profileHref}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#1FA971] transition-colors"
                    >
                      <UserCircle className="w-4 h-4 text-slate-400" />
                      <span>Account Profile</span>
                    </Link>

                    <Link
                      href={user.role === "STUDENT" ? "/dashboard/student/settings" : "/dashboard"}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#1FA971] transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Settings</span>
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <SignOutButton />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/sign-in"
                  className="text-sm font-bold text-slate-700 hover:text-[#1FA971] transition-colors px-2"
                >
                  Log in
                </Link>

                <Link
                  href="/join"
                  className="h-9 px-4 rounded-xl bg-[#1FA971] hover:bg-[#199160] text-white text-xs font-bold flex items-center justify-center transition-all shadow-xs hover:shadow-sm"
                >
                  Join Network
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Navigation Trigger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={openSearch}
              type="button"
              className="p-2 rounded-lg text-slate-600 hover:text-[#1FA971] hover:bg-slate-100 transition-colors"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 rounded-lg text-slate-700 hover:text-[#1FA971] hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-white flex flex-col p-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-8 h-8 rounded-lg bg-[#2B4B3C] text-white flex items-center justify-center font-bold text-lg">
                  C
                </div>
                <span className="font-bold text-xl tracking-tight text-[#232B27]">
                  Campus<span className="text-[#1FA971]">ConnectCo</span>
                </span>
              </Link>
              <button
                type="button"
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col flex-1 justify-center gap-5 text-lg font-bold text-slate-800 py-6">
              {user && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 mb-2">
                  <p className="text-sm font-bold text-slate-800">{user.name ?? "Member"}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role.toLowerCase()}</p>
                </div>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#1FA971] transition-colors py-1"
                >
                  {link.label}
                </Link>
              ))}

              <div className="h-px w-full bg-slate-100 my-1" />

              {user ? (
                <div className="flex flex-col gap-3">
                  <Link
                    href={dashboardHref}
                    className="w-full py-3 rounded-xl bg-[#1FA971] hover:bg-[#199160] text-white text-sm font-bold text-center transition-colors shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Open Dashboard
                  </Link>
                  <div className="pt-1">
                    <SignOutButton />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/auth/sign-in"
                    className="text-slate-600 text-base font-semibold hover:text-[#1FA971] transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/join"
                    className="w-full py-3.5 rounded-xl bg-[#1FA971] hover:bg-[#199160] text-white text-base font-bold text-center transition-colors shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Join Network
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


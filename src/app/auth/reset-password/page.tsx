"use client";

import { Eye, EyeOff, Loader2, CheckCircle, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
    const router = useRouter();
    const supabase = createClient();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);

    useEffect(() => {
        // Check if user has a valid recovery session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsValidSession(true);
            } else {
                setError("Invalid or expired reset link. Please request a new one.");
            }
        };

        checkSession();
    }, [supabase]);

    const validatePassword = (pwd: string): string | null => {
        if (pwd.length < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!/[A-Z]/.test(pwd)) {
            return "Password must contain at least one uppercase letter";
        }
        if (!/[a-z]/.test(pwd)) {
            return "Password must contain at least one lowercase letter";
        }
        if (!/[0-9]/.test(pwd)) {
            return "Password must contain at least one number";
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Validate password
        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            setIsLoading(false);
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                setError(updateError.message);
                setIsLoading(false);
                return;
            }

            setSuccess(true);

            // Redirect to sign in after 2 seconds
            setTimeout(() => {
                router.push("/auth/sign-in");
            }, 2000);
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
                <div className="w-full max-w-md bg-(--surface) rounded-2xl shadow-2xl p-4 md:p-8 border border-(--border)">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                        </div>

                        <h1 className="font-bold text-white mb-2">
                            Password Reset Successful!
                        </h1>

                        <p className="text-slate-600 dark:text-muted-foreground mb-6">
                            Your password has been updated successfully. Redirecting to sign in...
                        </p>

                        <div className="flex justify-center">
                            <Loader2 className="animate-spin text-(--primary)" size={24} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isValidSession && error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
                <div className="w-full max-w-md bg-(--surface) rounded-2xl shadow-2xl p-4 md:p-8 border border-(--border)">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <Lock size={32} className="text-red-600 dark:text-red-400" />
                        </div>

                        <h1 className="font-bold text-white mb-2">
                            Invalid Reset Link
                        </h1>

                        <p className="text-slate-600 dark:text-muted-foreground mb-6">
                            {error}
                        </p>

                        <Link
                            href="/auth/forgot-password"
                            className="inline-block bg-(--primary) hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02]"
                        >
                            Request New Reset Link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
            <div className="w-full max-w-md bg-(--surface) rounded-2xl shadow-2xl p-4 md:p-8 border border-(--border)">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-(--primary)/10 dark:bg-(--primary)/20 rounded-full flex items-center justify-center mb-4">
                        <Lock size={32} className="text-(--primary)" />
                    </div>

                    <h1 className="font-bold text-white mb-2">
                        Reset Your Password
                    </h1>

                    <p className="text-slate-600 dark:text-muted-foreground">
                        Enter your new password below
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="dark:text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="block font-semibold text-slate-700 dark:text-muted-foreground mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                className="w-full border border-slate-300 dark:border-slate-600 bg-(--surface-2) text-white p-3 rounded-xl focus:ring-2 focus:ring-(--primary)/50 focus:border-(--primary) outline-none transition-all pr-12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-600 dark:hover:text-muted-foreground"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block font-semibold text-slate-700 dark:text-muted-foreground mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                className="w-full border border-slate-300 dark:border-slate-600 bg-(--surface-2) text-white p-3 rounded-xl focus:ring-2 focus:ring-(--primary)/50 focus:border-(--primary) outline-none transition-all pr-12"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-600 dark:hover:text-muted-foreground"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="bg-(--surface-2)/50 p-3 rounded-lg">
                        <p className="text-slate-600 dark:text-muted-foreground font-semibold mb-2">
                            Password Requirements:
                        </p>
                        <ul className="text-muted-foreground dark:text-muted-foreground space-y-1">
                            <li className="flex items-center gap-2">
                                <span className={password.length >= 8 ? "text-green-500" : ""}>•</span>
                                At least 8 characters
                            </li>
                            <li className="flex items-center gap-2">
                                <span className={/[A-Z]/.test(password) ? "text-green-500" : ""}>•</span>
                                One uppercase letter
                            </li>
                            <li className="flex items-center gap-2">
                                <span className={/[a-z]/.test(password) ? "text-green-500" : ""}>•</span>
                                One lowercase letter
                            </li>
                            <li className="flex items-center gap-2">
                                <span className={/[0-9]/.test(password) ? "text-green-500" : ""}>•</span>
                                One number
                            </li>
                        </ul>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-(--primary) hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Resetting Password...
                            </>
                        ) : (
                            <>
                                <Lock size={20} />
                                Reset Password
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        href="/auth/sign-in"
                        className="text-slate-600 dark:text-muted-foreground hover:text-(--primary) dark:hover:text-(--primary) font-semibold transition-colors"
                    >
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}

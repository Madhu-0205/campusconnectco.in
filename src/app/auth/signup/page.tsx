"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Eye, EyeOff, Loader2, ShieldPlus, CheckCircle2, XCircle } from "lucide-react";

export default function SignUpPage() {
    const router = useRouter();
    const { status } = useSession();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "STUDENT",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [capsLock, setCapsLock] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [passwordScore, setPasswordScore] = useState(0);

    /* Auto redirect if logged in */
    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/dashboard");
        }
    }, [status, router]);

    /* Password strength logic */
    useEffect(() => {
        let score = 0;
        if (formData.password.length >= 8) score++;
        if (/[A-Z]/.test(formData.password)) score++;
        if (/[0-9]/.test(formData.password)) score++;
        if (/[^A-Za-z0-9]/.test(formData.password)) score++;
        setPasswordScore(score);
    }, [formData.password]);

    const getStrengthLabel = () => {
        if (passwordScore <= 1) return "Weak";
        if (passwordScore === 2) return "Fair";
        if (passwordScore === 3) return "Good";
        return "Strong";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.toLowerCase().trim(),
                    password: formData.password,
                    role: formData.role,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Registration failed");

            const login = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
                callbackUrl: "/dashboard"
            });

            if (login?.error) {
                router.push("/auth/signin");
            } else {
                router.replace("/dashboard");
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl: "/dashboard" });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-electric via-[#FFE4C4] to-[#FFA673] p-4">
            <div className="w-full max-w-md">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/40">

                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-2 text-electric">
                            <ShieldPlus size={34} />
                        </div>
                        <h1 className="text-3xl font-bold text-[#2C3E50] mb-1">
                            Create Account
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Secure registration for CampusConnect
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                autoComplete="name"
                                className="w-full px-4 py-3 border border-[#E8D5C4] rounded-lg focus:outline-none focus:ring-2 focus:ring-electric bg-[#FFFAF0]"
                                placeholder="John Doe"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                autoComplete="email"
                                className="w-full px-4 py-3 border border-[#E8D5C4] rounded-lg focus:outline-none focus:ring-2 focus:ring-electric bg-[#FFFAF0]"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Type
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: "STUDENT" })}
                                    className={`py-3 rounded-lg border-2 transition-all font-medium ${formData.role === "STUDENT"
                                        ? "border-electric bg-electric/10 text-electric"
                                        : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                                        }`}
                                >
                                    Student
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: "CLIENT" })}
                                    className={`py-3 rounded-lg border-2 transition-all font-medium ${formData.role === "CLIENT"
                                        ? "border-electric bg-electric/10 text-electric"
                                        : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                                        }`}
                                >
                                    Client
                                </button>
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    className="w-full px-4 py-3 border border-[#E8D5C4] rounded-lg focus:outline-none focus:ring-2 focus:ring-electric bg-[#FFFAF0] pr-12"
                                    placeholder="••••••••"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {capsLock && (
                                <p className="text-xs text-amber-600 mt-1">
                                    ⚠ Caps Lock is ON
                                </p>
                            )}

                            <div className="mt-2 text-xs flex items-center justify-between">
                                <span className="text-gray-500">Strength:</span>
                                <span className={`font-semibold ${passwordScore >= 3 ? "text-green-600" : passwordScore === 2 ? "text-yellow-600" : "text-red-600"}`}>
                                    {getStrengthLabel()}
                                </span>
                            </div>

                            <div className="mt-1 h-1 w-full bg-gray-200 rounded">
                                <div
                                    className={`h-full rounded transition-all ${passwordScore === 0 ? "w-[5%] bg-red-500" :
                                        passwordScore === 1 ? "w-[30%] bg-red-500" :
                                            passwordScore === 2 ? "w-[60%] bg-yellow-500" :
                                                "w-full bg-green-500"}`}
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>

                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    className="w-full px-4 py-3 border border-[#E8D5C4] rounded-lg focus:outline-none focus:ring-2 focus:ring-electric bg-[#FFFAF0] pr-12"
                                    placeholder="••••••••"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <div className="mt-1 text-xs flex items-center gap-1">
                                {formData.confirmPassword.length > 0 &&
                                    (formData.password === formData.confirmPassword ?
                                        <><CheckCircle2 size={14} className="text-green-600" /> <span className="text-green-600">Passwords match</span></> :
                                        <><XCircle size={14} className="text-red-600" /> <span className="text-red-600">Passwords do not match</span></>)
                                }
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 bg-[#FF5722] hover:bg-[#E64A19] text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-60"
                        >
                            {isLoading && <Loader2 className="animate-spin" size={20} />}
                            {isLoading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleSignIn}
                            type="button"
                            className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-gray-700 font-medium">
                                Sign up with Google
                            </span>
                        </button>
                    </div>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <a href="/auth/signin" className="text-electric hover:underline font-semibold">
                            Sign in
                        </a>
                    </p>

                </div>
            </div>
        </div>
    );
}

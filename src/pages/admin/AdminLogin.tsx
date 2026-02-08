import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, User, ShoppingBag } from "lucide-react";

const AdminLogin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAdmin();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (login(username, password)) {
            navigate("/admin/dashboard");
        } else {
            setError("Invalid credentials. Try admin/admin123");
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #c5a059 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            </div>

            {/* Animated Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-[#1a1d23]/80 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 p-8">
                    {/* Logo & Header */}
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-primary/20 mb-6 group"
                        >
                            <ShoppingBag className="w-10 h-10 text-primary transition-transform group-hover:scale-110" />
                        </motion.div>
                        <h1 className="font-display text-4xl font-bold text-white mb-2 tracking-tight">RUMI <span className="text-primary">Admin</span></h1>
                        <p className="font-body text-sm text-gray-400">Secure access to boutique management</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Username</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 transition-colors group-focus-within:text-primary" />
                                <Input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-12 bg-black/40 border-white/10 text-white h-12 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-gray-600"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 transition-colors group-focus-within:text-primary" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-12 bg-black/40 border-white/10 text-white h-12 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-gray-600"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm font-medium flex items-center gap-2"
                            >
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            variant="luxury"
                            size="lg"
                            className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
                        >
                            Log In to System
                        </Button>
                    </form>

                    {/* Footer Info */}
                    <div className="mt-10 pt-6 border-t border-white/5">
                        <div className="text-center">
                            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Demo Access Only</p>
                            <div className="mt-2 text-xs text-gray-400">
                                admin / admin123
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;

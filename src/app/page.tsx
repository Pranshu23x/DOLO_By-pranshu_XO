"use client";

import { motion } from "framer-motion";
import { ArrowRight, History, Sparkles, Shield, Zap } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/app-context";

export default function Home() {
    const { setFile } = useAppContext();
    const router = useRouter();

    const handleFileUpload = (files: File[]) => {
        if (files.length > 0) {
            const uploadedFile = files[0];
            setFile(uploadedFile);
            router.push("/analyze");
        }
    };

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col relative">
            {/* Ambient orbs — very soft */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-[-15%] left-[-8%] w-[45%] h-[45%] bg-violet-300/20 blur-[140px] rounded-full" />
                <div className="absolute bottom-[-15%] right-[-8%] w-[45%] h-[45%] bg-indigo-300/15 blur-[140px] rounded-full" />
                <div className="absolute top-[40%] right-[15%] w-[25%] h-[25%] bg-blue-200/10 blur-[100px] rounded-full" />
            </div>

            {/* Top navigation */}
            <motion.nav
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="relative z-20 flex items-center justify-between px-8 md:px-16 lg:px-24 py-5"
            >
                <div className="flex items-center gap-3">
                    <img 
                        src="https://i.postimg.cc/KjYZLCk5/image.png" 
                        alt="DOLO Logo" 
                        className="w-8 h-8 object-contain"
                    />
                    <span className="font-heading font-bold text-slate-900 text-lg tracking-tight">DOLO</span>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => router.push("/safety")}
                        className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/40 transition-all"
                    >
                        <Shield className="w-3.5 h-3.5" />
                        Privacy
                    </button>
                    <button 
                        onClick={() => router.push("/history")}
                        className="group flex items-center gap-2 px-4 py-2 glass rounded-full text-xs font-bold text-slate-800 hover:text-violet-700 transition-all active:scale-[0.97] shadow-sm"
                    >
                        <History className="w-3.5 h-3.5 group-hover:rotate-[-12deg] transition-transform" />
                        <span className="tracking-wide">HISTORY</span>
                    </button>
                </div>
            </motion.nav>

            {/* Main content */}
            <div className="flex-1 flex flex-row items-start justify-between px-8 md:px-16 lg:px-24 pt-4 md:pt-8 z-10 max-w-[1440px] mx-auto w-full gap-24">
                {/* Left — Hero */}
                <div className="flex-1 flex flex-col items-start max-w-xl">
                    <motion.div 
                        initial={{ y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.6 }}
                        className="text-left mb-8"
                    >
                      
                        <h1 className="text-4xl md:text-[3.5rem] font-heading font-bold text-slate-900 tracking-tight mb-5 leading-[1.1]">
                            Understand your health<br />
                            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">in seconds.</span>
                        </h1>
                        <p className="text-slate-600 font-medium text-base md:text-[1.05rem] max-w-md mb-0 leading-relaxed">
                            Upload your medical reports, scans, or blood tests. Our AI provides instant insights and clear explanations.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="w-full max-w-[480px] premium-card aspect-[16/10] overflow-hidden flex flex-col p-4 mb-8 glow-input"
                    >
                        <FileUpload onChange={handleFileUpload} />
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-1"
                    >
                        {[
                            { label: "Blood Works", icon: "🩸" },
                            { label: "Radiology", icon: "📡" },
                            { label: "Lab Reports", icon: "🔬" },
                            { label: "Prescriptions", icon: "💊" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                <span className="text-xs">{item.icon}</span>
                                {item.label}
                            </div>
                        ))}
                    </motion.div>

                    {/* Trust badges */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.65, duration: 0.5 }}
                        className="flex items-center gap-4 mt-10"
                    >
                        {[
                            { label: "HIPAA Ready", icon: <Shield className="w-3.5 h-3.5" /> },
                            { label: "Encrypted", icon: <Zap className="w-3.5 h-3.5" /> },
                            { label: "Private", icon: <Sparkles className="w-3.5 h-3.5" /> },
                        ].map((badge) => (
                            <div key={badge.label} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                <span className="text-slate-400">{badge.icon}</span>
                                {badge.label}
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Right — Brand visual */}
                <motion.div 
                    initial={{ opacity: 0, x: 40, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                    className="hidden lg:flex flex-1 justify-center items-start pt-24"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-indigo-400/20 blur-[60px] rounded-full scale-110" />
                        <img 
                            src="https://i.postimg.cc/KjYZLCk5/image.png" 
                            alt="DOLO Branding" 
                            className="relative w-full max-w-[380px] h-auto object-contain drop-shadow-2xl opacity-90"
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

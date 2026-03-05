"use client";

import { useRef, useEffect, useState } from "react";
import { ExpandableAIChat } from "@/components/ui/expandable-ai-chat";
import { 
    FileImage, Sparkles, LayoutDashboard, ArrowLeft, 
    History, Settings, ShieldCheck, Activity, Menu
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/app-context";
import { cn } from "@/lib/utils";
import { 
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup, 
    SidebarGroupContent, SidebarGroupLabel, SidebarHeader, 
    SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, 
    SidebarProvider, SidebarTrigger 
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/analyze", active: true },
    { label: "History", icon: History, href: "/history" },
    { label: "Safety", icon: ShieldCheck, href: "/safety" },
    { label: "Settings", icon: Settings, href: "#" },
];

export default function AnalyzePage() {
    const { file, setFile } = useAppContext();
    const router = useRouter();

    useEffect(() => {
        if (!file) {
            router.push("/");
        }
    }, [file, router]);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    const reset = () => {
        setFile(null);
        router.push("/");
    };

    if (!file) return null;

    return (
        <SidebarProvider>
            <div className="h-screen w-screen flex overflow-hidden">
                <Sidebar collapsible="icon" className="border-r border-white/20 glass">
                    <SidebarHeader className="h-14 flex items-center px-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <img 
                                src="https://i.postimg.cc/KjYZLCk5/image.png" 
                                alt="DOLO Logo" 
                                className="w-8 h-8 object-contain"
                            />
                            <span className="font-heading font-bold text-slate-900 tracking-tight">DOLO</span>
                        </div>
                    </SidebarHeader>
                    <SidebarContent className="p-2">
                        <SidebarGroup>
                            <SidebarGroupLabel className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Navigation</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {NAV_ITEMS.map((item) => (
                                        <SidebarMenuItem key={item.label}>
                                            <SidebarMenuButton 
                                                isActive={item.active}
                                                onClick={() => item.href !== "#" && router.push(item.href)}
                                                className={cn(
                                                    "nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                                    item.active
                                                        ? "active bg-white/50 text-violet-700 font-semibold shadow-sm border border-violet-100/50"
                                                        : "text-slate-500 hover:bg-white/30 hover:text-slate-800"
                                                )}
                                            >
                                                <item.icon className="w-4 h-4" />
                                                <span className="text-[13px]">{item.label}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarFooter className="p-4 border-t border-white/10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 flex items-center justify-center text-white text-xs font-bold shadow-md">P</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 truncate">Pranshu</p>
                                <p className="text-[10px] text-slate-400 truncate font-medium">Pro Plan</p>
                            </div>
                        </div>
                    </SidebarFooter>
                </Sidebar>

                <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
                    <motion.div
                        key="dashboard-page"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="h-full flex flex-col"
                    >
                        {/* Header */}
                        <header className="h-14 border-b border-white/15 glass flex items-center justify-between px-5 z-20">
                            <div className="flex items-center gap-3">
                                <SidebarTrigger className="hover:bg-white/10 rounded-lg transition-colors p-2 md:hidden" />
                                <button 
                                    onClick={reset}
                                    className="p-1.5 hover:bg-white/15 rounded-lg transition-all text-slate-500 flex items-center gap-2 group active:scale-[0.97]"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                    <span className="text-xs font-semibold">New Analysis</span>
                                </button>
                                <div className="h-4 w-px bg-slate-200/50 mx-1" />
                                <p className="text-sm font-heading font-bold text-slate-800 tracking-tight">AI Dashboard</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex flex-col items-end text-right">
                                    <p className="text-[10px] font-bold text-slate-800 truncate max-w-[150px]">{file?.name}</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-glow" />
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">AI Active</p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </header>

                        <div className="flex-1 flex overflow-hidden">
                            {/* Center: AI Chat */}
                            <div className="flex-1 h-full flex flex-col min-w-0 z-10">
                                <ExpandableAIChat initialFile={file} />
                            </div>

                            {/* Right Panel: Source Document */}
                            <div className="w-[420px] h-full border-l border-white/10 glass overflow-y-auto custom-scrollbar p-5 lg:p-6 shadow-[-10px_0_40px_rgba(0,0,0,0.02)]">
                                <div className="space-y-5">
                                    {/* Document card */}
                                    <div className="premium-card p-5 flex flex-col justify-center">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center text-violet-600 border border-violet-100/40">
                                                <FileImage className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-heading font-bold text-slate-800 tracking-tight uppercase">Source Document</p>
                                                <p className="text-[10px] text-slate-400 font-medium">Verified & Processed</p>
                                            </div>
                                        </div>
                                        
                                        {previewUrl && (
                                            <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50/50">
                                                <img 
                                                    src={previewUrl} 
                                                    alt="Report Preview" 
                                                    className="w-full h-auto max-h-[500px] object-contain"
                                                />
                                            </div>
                                        )}

                                        <div className="p-4 bg-violet-50/50 rounded-xl border border-violet-100/40 text-slate-600 text-[11px] leading-relaxed relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-indigo-500 rounded-full" />
                                            <p className="pl-3 italic">
                                                Our AI engine is dissecting your {file?.name?.split('.').pop()?.toUpperCase() || 'document'} to extract clinical markers and baseline health metrics.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick stats */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: "Processing", value: "Active", color: "emerald" },
                                            { label: "Confidence", value: "High", color: "violet" },
                                        ].map((stat) => (
                                            <div key={stat.label} className="premium-card p-4 flex flex-col gap-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", stat.color === "emerald" ? "bg-emerald-500 pulse-glow" : "bg-violet-500")} />
                                                    <p className="text-sm font-bold text-slate-800">{stat.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}

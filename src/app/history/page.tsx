"use client";

import { motion } from "framer-motion";
import { 
    History, LayoutDashboard, Settings, ShieldCheck, 
    Search, Calendar, MessageSquare, ArrowRight,
    Filter, Trash2, Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/app-context";
import { cn } from "@/lib/utils";
import { 
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup, 
    SidebarGroupContent, SidebarGroupLabel, SidebarHeader, 
    SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, 
    SidebarProvider, SidebarTrigger 
} from "@/components/ui/sidebar";
import Link from "next/link";

const NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/analyze" },
    { label: "History", icon: History, href: "/history", active: true },
    { label: "Safety", icon: ShieldCheck, href: "/safety" },
    { label: "Settings", icon: Settings, href: "#" },
];

const MOCK_HISTORY = [
    {
        id: "1",
        title: "Comprehensive Blood Panel",
        date: "Oct 24, 2025",
        preview: "Analyzed lipid profile and glucose levels. Recommendations provided for dietary adjustments.",
        type: "Blood Work",
        status: "Completed"
    },
    {
        id: "2",
        title: "Cardiovascular Risk Assessment",
        date: "Oct 20, 2025",
        preview: "Evaluated heart rate trends and historical blood pressure data across multiple readings.",
        type: "Cardiology",
        status: "Completed"
    },
    {
        id: "3",
        title: "Dermatological Scan",
        date: "Oct 15, 2025",
        preview: "AI vision scan of skin markings. No immediate concerns detected in analyzed regions.",
        type: "Imaging",
        status: "Archived"
    },
    {
        id: "4",
        title: "Metabolic Synthesis Report",
        date: "Oct 02, 2025",
        preview: "Synthetic overview of metabolic markers over the last 6 months with trend analysis.",
        type: "General Health",
        status: "Completed"
    }
];

export default function HistoryPage() {
    const { setFile } = useAppContext();
    const router = useRouter();

    const reset = () => {
        setFile(null);
        router.push("/");
    };

    return (
        <SidebarProvider>
            <div className="h-screen w-screen flex overflow-hidden">
                <Sidebar collapsible="icon" className="border-r border-white/20 glass">
                    <SidebarHeader className="h-14 flex items-center px-4 border-b border-white/10">
                        <Link href="/" className="flex items-center gap-3">
                            <img 
                                src="https://i.postimg.cc/KjYZLCk5/image.png" 
                                alt="DOLO Logo" 
                                className="w-8 h-8 object-contain"
                            />
                            <span className="font-heading font-bold text-slate-900 tracking-tight">DOLO</span>
                        </Link>
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
                    <header className="h-14 border-b border-white/15 glass flex items-center justify-between px-6 z-20">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="hover:bg-white/10 rounded-lg transition-colors p-2 md:hidden" />
                            <h1 className="text-sm font-heading font-bold text-slate-800 tracking-tight">Session History</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative hidden md:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search sessions..." 
                                    className="pl-9 pr-4 py-2 bg-white/30 border border-white/30 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/15 focus:border-violet-200/50 w-64 backdrop-blur-sm transition-all placeholder:text-slate-400"
                                />
                            </div>
                            <button className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-[0.95] text-slate-500 hover:text-slate-700">
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto space-y-6"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">Your Medical Sessions</h2>
                                    <p className="text-sm font-medium text-slate-500 mt-1">View and manage your previous AI health analyses</p>
                                </div>
                                <button 
                                    onClick={reset}
                                    className="shimmer-btn flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/25 hover:scale-[1.02] transition-all active:scale-[0.98]"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Analysis
                                </button>
                            </div>

                            <div className="grid gap-4">
                                {MOCK_HISTORY.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08, duration: 0.4 }}
                                        className="premium-card p-5 group cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="px-2.5 py-1 rounded-lg bg-violet-500/8 text-violet-600 text-[10px] font-bold uppercase tracking-wider border border-violet-100/40">
                                                        {item.type}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                                                        <Calendar className="w-3 h-3" />
                                                        {item.date}
                                                    </span>
                                                </div>
                                                <h3 className="text-[15px] font-heading font-bold text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm text-slate-500 line-clamp-1 leading-relaxed">
                                                    {item.preview}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="hidden sm:flex flex-col items-end mr-3">
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold",
                                                        item.status === "Completed" 
                                                            ? "bg-emerald-500/8 text-emerald-600" 
                                                            : "bg-slate-500/8 text-slate-500"
                                                    )}>
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", item.status === "Completed" ? "bg-emerald-500" : "bg-slate-400")} />
                                                        {item.status}
                                                    </div>
                                                </div>
                                                <button className="p-2 hover:bg-violet-50 rounded-xl transition-all text-slate-400 hover:text-violet-600 active:scale-[0.95]">
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-red-50 rounded-xl transition-all text-slate-400 hover:text-red-500 active:scale-[0.95]">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all ml-1" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}

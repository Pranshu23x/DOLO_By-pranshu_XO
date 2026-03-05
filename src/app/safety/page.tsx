"use client";

import { motion } from "framer-motion";
import { 
    ShieldCheck, LayoutDashboard, History, Settings, 
    Lock, EyeOff, Server, ShieldAlert, CheckCircle2,
    ArrowLeft, FileLock2, Globe2
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
    { label: "History", icon: History, href: "/history" },
    { label: "Safety", icon: ShieldCheck, href: "/safety", active: true },
    { label: "Settings", icon: Settings, href: "#" },
];

const PRIVACY_CARDS = [
    {
        icon: EyeOff,
        iconBg: "from-emerald-500/10 to-emerald-400/5",
        iconColor: "text-emerald-600",
        borderColor: "border-emerald-100/50",
        title: "No Third-Party Sharing",
        description: "We explicitly guarantee that your uploaded reports, personal information, and AI conversation history are <strong>never sold, shared, or disclosed</strong> to any third-party advertisers, pharmaceutical companies, or insurance providers."
    },
    {
        icon: Lock,
        iconBg: "from-blue-500/10 to-blue-400/5",
        iconColor: "text-blue-600",
        borderColor: "border-blue-100/50",
        title: "End-to-End Protection",
        description: "Everything you upload is encrypted both in transit and at rest using industry-standard AES-256 encryption. Your physical document files are processed in secure volatile memory and are periodically purged."
    },
    {
        icon: Server,
        iconBg: "from-amber-500/10 to-amber-400/5",
        iconColor: "text-amber-600",
        borderColor: "border-amber-100/50",
        title: "Data Sovereignty",
        description: "You maintain full ownership of your data. At any time, you can choose to delete your entire session history from our servers, which will permanently remove all associated metadata and AI analysis logs."
    }
];

export default function SafetyPage() {
    const { setFile } = useAppContext();
    const router = useRouter();

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
                            <h1 className="text-sm font-heading font-bold text-slate-800 tracking-tight">Privacy & Security</h1>
                        </div>
                        <button 
                            onClick={() => router.back()}
                            className="p-2 hover:bg-white/15 rounded-xl transition-all group active:scale-[0.95]"
                        >
                            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    </header>

                    <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
                        <div className="max-w-3xl mx-auto">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-center mb-16"
                            >
                                <div className="w-20 h-20 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-violet-100/50 shadow-lg shadow-violet-500/5">
                                    <ShieldCheck className="w-10 h-10 text-violet-600" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4 tracking-tight">
                                    We value your privacy.
                                </h2>
                                <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">
                                    Your health data is sensitive, and we treat it with the highest level of security.
                                </p>
                            </motion.div>

                            <div className="grid gap-5">
                                {PRIVACY_CARDS.map((card, idx) => (
                                    <motion.div 
                                        key={card.title}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + idx * 0.1, duration: 0.4 }}
                                        className="premium-card p-7 flex gap-5 items-start"
                                    >
                                        <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 border", card.iconBg, card.borderColor)}>
                                            <card.icon className={cn("w-6 h-6", card.iconColor)} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-heading font-bold text-slate-900 mb-2">{card.title}</h3>
                                            <p className="text-slate-500 leading-relaxed text-[15px]" dangerouslySetInnerHTML={{ __html: card.description }} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-14 premium-card p-8 text-center"
                            >
                                <div className="flex justify-center gap-10 mb-8">
                                    {[
                                        { icon: FileLock2, label: "HIPAA Ready" },
                                        { icon: Globe2, label: "GDPR Compliant" },
                                        { icon: ShieldAlert, label: "Local Privacy" },
                                    ].map((badge) => (
                                        <div key={badge.label} className="flex flex-col items-center gap-2.5">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                <badge.icon className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{badge.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/8 rounded-full border border-emerald-100/50 mb-5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs font-bold text-emerald-700">Verified Secure Infrastructure</span>
                                </div>
                                <p className="text-xs text-slate-400 italic leading-relaxed max-w-lg mx-auto">
                                    Disclaimer: DOLO is an AI health assistant and not a medical professional. Our analysis is for informational purposes only. Always consult with a qualified healthcare provider for medical advice.
                                </p>
                            </motion.div>
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}

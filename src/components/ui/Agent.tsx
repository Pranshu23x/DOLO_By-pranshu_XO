"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Globe,
    Search,
    MapPin,
    Star,
    CheckCircle2,
    Clock,
    ChevronRight,
    Stethoscope,
    Brain,
    Eye,
    Heart,
    Activity,
    ExternalLink,
    ArrowRight,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Types
------------------------------------------------------------------ */

interface AgentStep {
    id: string;
    type: "thinking" | "searching" | "reading" | "done";
    label: string;
    detail?: string;
    url?: string;
    done?: boolean;
}

interface Doctor {
    name: string;
    specialty: string;
    hospital: string;
    location: string;
    rating: number;
    reviews: number;
    experience: string;
    available: string;
    match: number;
    icon: React.ReactNode;
    badge?: string;
}

interface AgentProps {
    onClose: () => void;
    reportSummary?: string;
}

/* ------------------------------------------------------------------
   Agent Steps (simulated)
------------------------------------------------------------------ */

const AGENT_STEPS: AgentStep[] = [
    { id: "1", type: "thinking",  label: "Reading your medical report…",            detail: "Identifying key findings, abnormal markers, and urgency." },
    { id: "2", type: "searching", label: "Searching Google Maps for specialists",   detail: "google.com/maps", url: "google.com/maps" },
    { id: "3", type: "reading",   label: "Scanning Practo for top-rated doctors",   detail: "practo.com/find-doctors", url: "practo.com" },
    { id: "4", type: "reading",   label: "Cross-referencing hospital ratings",       detail: "healthgrades.com", url: "healthgrades.com" },
    { id: "5", type: "reading",   label: "Checking appointment availability",        detail: "Filtering by proximity & open slots" },
    { id: "6", type: "done",      label: "Matching doctors to your report profile",  detail: "Ranking by specialisation fit + proximity + review score." },
];

/* ------------------------------------------------------------------
   Mock Doctor Results
------------------------------------------------------------------ */

const MOCK_DOCTORS: Doctor[] = [
    {
        name: "Dr. Priya Sharma",
        specialty: "Ophthalmologist",
        hospital: "AIIMS Delhi — Ophthalmology Dept.",
        location: "New Delhi, IN · 2.1 km",
        rating: 4.9,
        reviews: 1821,
        experience: "18 yrs exp.",
        available: "Today, 4:30 PM",
        match: 97,
        badge: "Best Match",
        icon: <Eye className="w-5 h-5" />,
    },
    {
        name: "Dr. Ankit Mehrotra",
        specialty: "Neuro-ophthalmologist",
        hospital: "Fortis Escorts, Okhla",
        location: "New Delhi, IN · 5.4 km",
        rating: 4.7,
        reviews: 943,
        experience: "14 yrs exp.",
        available: "Tomorrow, 10:00 AM",
        match: 91,
        icon: <Brain className="w-5 h-5" />,
    },
    {
        name: "Dr. Kavita Nair",
        specialty: "Internal Medicine",
        hospital: "Max Hospital, Saket",
        location: "New Delhi, IN · 7.0 km",
        rating: 4.8,
        reviews: 2130,
        experience: "22 yrs exp.",
        available: "Today, 6:00 PM",
        match: 85,
        icon: <Heart className="w-5 h-5" />,
    },
];

/* ------------------------------------------------------------------
   Step Icon
------------------------------------------------------------------ */
function StepIcon({ type, done }: { type: AgentStep["type"]; done?: boolean }) {
    if (done) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (type === "thinking") return <Brain className="w-4 h-4 text-violet-400 animate-pulse" />;
    if (type === "searching") return <Search className="w-4 h-4 text-blue-400 animate-pulse" />;
    if (type === "reading")   return <Globe  className="w-4 h-4 text-indigo-400 animate-pulse" />;
    return <Activity className="w-4 h-4 text-violet-400" />;
}

/* ------------------------------------------------------------------
   Typing Cursor
------------------------------------------------------------------ */
function TypingCursor() {
    return (
        <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.65, ease: "easeInOut" }}
            className="inline-block w-[2px] h-3.5 bg-violet-500 ml-0.5 align-middle rounded-sm"
        />
    );
}

/* ------------------------------------------------------------------
   Main Agent Component
------------------------------------------------------------------ */
export default function Agent({ onClose }: AgentProps) {
    const [currentStep, setCurrentStep] = useState(-1);
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [urlBar, setUrlBar] = useState("agent://initialising...");
    const [browsingText, setBrowsingText] = useState("");
    const browsingTexts = useRef([
        "Analyzing elevated spherical refractive error…",
        "Querying specialist availability near you…",
        "Filtering by patient review score > 4.5…",
        "Computing specialty match score…",
    ]);
    const textIndex = useRef(0);

    /* Run steps sequentially */
    useEffect(() => {
        let step = 0;
        const runNext = () => {
            if (step >= AGENT_STEPS.length) {
                setTimeout(() => setShowResults(true), 400);
                return;
            }
            setCurrentStep(step);
            const s = AGENT_STEPS[step];
            if (s.url)    setUrlBar(`https://www.${s.url}`);
            else if (s.type === "thinking") setUrlBar("agent://dolo-report-analysis");
            else          setUrlBar(`agent://matching-doctors`);

            setTimeout(() => {
                setCompletedSteps(prev => [...prev, s.id]);
                step++;
                setTimeout(runNext, 350);
            }, step === 0 ? 1000 : 900);
        };
        const init = setTimeout(runNext, 500);
        return () => clearTimeout(init);
    }, []);

    /* Rotate browsing sub-text */
    useEffect(() => {
        const interval = setInterval(() => {
            textIndex.current = (textIndex.current + 1) % browsingTexts.current.length;
            setBrowsingText(browsingTexts.current[textIndex.current]);
        }, 1800);
        setBrowsingText(browsingTexts.current[0]);
        return () => clearInterval(interval);
    }, []);

    const agentDone = completedSteps.length === AGENT_STEPS.length;

    return (
        <AnimatePresence>
            <motion.div
                key="agent-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-stretch justify-end"
                style={{ backdropFilter: "blur(6px)", background: "rgba(30,20,60,0.40)" }}
            >
                {/* Dismiss backdrop */}
                <div className="absolute inset-0" onClick={onClose} />

                {/* Panel */}
                <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    className="relative z-10 w-full max-w-md flex flex-col h-full shadow-2xl overflow-hidden"
                    style={{
                        background: "rgba(255,255,255,0.14)",
                        backdropFilter: "blur(28px) saturate(180%)",
                        borderLeft: "1px solid rgba(255,255,255,0.18)",
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg">
                                    <Stethoscope className="w-4 h-4 text-white" />
                                </div>
                                {!agentDone && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 leading-tight tracking-tight">Doctor Finder</p>
                                <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-widest">Agent · Active</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-slate-500 hover:text-slate-900"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Fake Browser Bar */}
                    <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2.5">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
                        </div>
                        <div className="flex-1 flex items-center gap-2 bg-black/10 rounded-lg px-3 py-1 border border-white/10">
                            <Globe className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={urlBar}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-[11px] font-mono text-slate-600 truncate"
                                >
                                    {urlBar}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {/* Steps */}
                        <div className="p-5 space-y-2.5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Agent Trace</p>
                            {AGENT_STEPS.map((step, idx) => {
                                const isDone = completedSteps.includes(step.id);
                                const isActive = currentStep === idx && !isDone;
                                return (
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={currentStep >= idx ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className={cn(
                                            "flex items-start gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-300",
                                            isDone
                                                ? "bg-emerald-500/8 border-emerald-400/20"
                                                : isActive
                                                ? "bg-violet-500/10 border-violet-400/30 shadow-sm"
                                                : "bg-white/5 border-white/10"
                                        )}
                                    >
                                        <div className="mt-0.5 flex-shrink-0">
                                            <StepIcon type={step.type} done={isDone} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("text-xs font-semibold", isDone ? "text-slate-600" : "text-slate-800")}>
                                                {step.label}
                                                {isActive && <TypingCursor />}
                                            </p>
                                            {step.detail && (
                                                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{step.detail}</p>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Live status bar while running */}
                        <AnimatePresence>
                            {!agentDone && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="mx-5 mb-4 px-3.5 py-2.5 bg-violet-500/8 border border-violet-400/20 rounded-xl flex items-center gap-2.5"
                                >
                                    <Loader2 className="w-3.5 h-3.5 text-violet-500 animate-spin flex-shrink-0" />
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={browsingText}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.3 }}
                                            className="text-[11px] font-medium text-violet-700 leading-snug"
                                        >
                                            {browsingText}
                                        </motion.p>
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Doctor Results */}
                        <AnimatePresence>
                            {showResults && (
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className="px-5 pb-6 space-y-3"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Top Matches</p>
                                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> {MOCK_DOCTORS.length} doctors found
                                        </span>
                                    </div>

                                    {MOCK_DOCTORS.map((doc, idx) => (
                                        <motion.div
                                            key={doc.name}
                                            initial={{ opacity: 0, y: 14, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ delay: idx * 0.12, type: "spring", damping: 20, stiffness: 260 }}
                                            className="group relative rounded-2xl border border-white/20 p-4 hover:border-violet-400/40 transition-all duration-300 cursor-pointer overflow-hidden"
                                            style={{
                                                background: "rgba(255,255,255,0.35)",
                                                backdropFilter: "blur(12px)",
                                            }}
                                        >
                                            {/* Shimmer on hover */}
                                            <div className="absolute inset-0 w-[150%] -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] pointer-events-none" />

                                            {doc.badge && (
                                                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow">
                                                    {doc.badge}
                                                </span>
                                            )}

                                            <div className="flex items-start gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 text-white",
                                                    idx === 0 ? "bg-gradient-to-br from-violet-600 to-indigo-600"
                                                    : idx === 1 ? "bg-gradient-to-br from-blue-600 to-cyan-500"
                                                    : "bg-gradient-to-br from-rose-500 to-pink-500"
                                                )}>
                                                    {doc.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-slate-900 leading-tight">{doc.name}</p>
                                                    </div>
                                                    <p className="text-[11px] font-semibold text-violet-700 mt-0.5">{doc.specialty}</p>
                                                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{doc.hospital}</p>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                                                <span className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                                                    <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                                                    {doc.rating}
                                                    <span className="text-slate-400">({doc.reviews.toLocaleString()})</span>
                                                </span>
                                                <span className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                                                    <MapPin className="w-3 h-3 text-slate-400" />
                                                    {doc.location}
                                                </span>
                                                <span className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    {doc.experience}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between">
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-[10px] font-bold text-emerald-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    {doc.available}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wide">
                                                        {doc.match}% match
                                                    </span>
                                                    <div
                                                        className="h-1.5 w-16 rounded-full bg-black/5 overflow-hidden"
                                                    >
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${doc.match}%` }}
                                                            transition={{ delay: idx * 0.12 + 0.3, duration: 0.7, ease: "easeOut" }}
                                                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[11px] font-bold tracking-wide shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all">
                                                Book Appointment <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </motion.div>
                                    ))}

                                    {/* Disclaimer */}
                                    <p className="text-[9px] text-slate-400 leading-relaxed mt-2 text-center px-2">
                                        Doctor recommendations are AI-generated based on your report and publicly available data. Always verify credentials independently.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

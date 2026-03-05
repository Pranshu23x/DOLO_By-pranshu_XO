"use client";

import {
    useState,
    useRef,
    useCallback,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    Paperclip,
    RotateCcw,
    User,
    X,
    AlertTriangle,
    Activity,
    FlaskConical,
    Leaf,
    Zap,
    Globe,
    Search,
    Brain,
    CheckCircle2,
    MapPin,
    Star,
    Clock,
    Stethoscope,
    Loader2,
    Eye,
    Heart,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TextShimmer } from "@/components/ui/text-shimmer";

const BASE_URL = "https://dolo-hsil-1.onrender.com";

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */

export interface ChatHandle {
    analyzeReport: (file: File, message: string) => void;
}

interface Finding {
    parameter: string;
    value: string;
    normal_range: string;
    severity: "low" | "medium" | "high";
}

interface StructuredReport {
    summary?: string;
    abnormal_findings?: string | string[] | Finding[];
    recommended_tests?: string | string[];
    lifestyle_suggestions?: string | string[];
    urgency?: string;
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string | StructuredReport;
    fileName?: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                               */
/* ------------------------------------------------------------------ */

function isStructuredReport(data: unknown): data is StructuredReport {
    if (typeof data !== "object" || data === null) return false;
    const d = data as Record<string, unknown>;
    return "summary" in d || "abnormal_findings" in d || "urgency" in d;
}

function toList(val: string | string[] | Array<{ parameter: string; value: string; normal_range: string; severity: string }> | undefined): string[] {
    if (!val) return [];
    if (Array.isArray(val)) {
        // If array of objects, format each entry
        if (val.length > 0 && typeof val[0] === "object" && val[0] !== null) {
            return (val as Array<any>).map((item) => {
                const { parameter, value, normal_range, severity } = item;
                return `${parameter}: ${value} (normal: ${normal_range}, severity: ${severity})`;
            });
        }
        // array of strings
        return (val as string[]).filter(Boolean);
    }
    // plain string
    return (val as string)
        .split(/[\n;]/)
        .map((s) => s.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean);
}

function extractContent(data: unknown): string | StructuredReport {
    if (data === null || data === undefined) return "";
    
    let content = data;

    // If it's a string, try to extract JSON from it
    if (typeof content === "string") {
        let text = content.trim();
        
        // Quick check for common error strings
        if (text.includes("429") || text.includes("RESOURCE_EXHAUSTED") || text.includes("Quota exceeded")) {
            return "### ⚠️ Quota Exceeded\nYou've reached the AI limit. This usually resets shortly. Please try again in 1-2 minutes.";
        }

        // 1. Remove markdown code block wrappers
        text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

        // 2. Try to find the first JSON object if it's not the whole string
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                if (isStructuredReport(parsed)) return parsed;
                // If it's an object but not a report, maybe we want the string instead?
                // For now, if it's valid JSON and we're looking for a report, let's use it.
                return parsed;
            } catch {
                // Not valid JSON, fall back to string
            }
        }
        return content;
    }

    if (typeof content === "object" && content !== null) {
        // Direct match
        if (isStructuredReport(content)) return content as StructuredReport;

        // Common wrapper fields
        const d = content as Record<string, unknown>;

        // Detect error responses (429 Quota/Rate Limit)
        if (d.detail && typeof d.detail === 'string' && d.detail.includes("429")) {
            return "### ⚠️ Quota Exceeded\nYou've reached the AI usage limit. Please wait a few minutes before trying again.";
        }
        if (d.status === "RESOURCE_EXHAUSTED") {
            return "### ⚠️ Quota Exceeded\nAPI Rate limit reached. Try again shortly.";
        }

        const top = d.response ?? d.message ?? d.reply ?? d.text ?? d.content;
        
        if (top !== undefined) {
            return extractContent(top);
        }

        // Search nested
        for (const v of Object.values(d)) {
            if (isStructuredReport(v)) return v as StructuredReport;
        }
        
        return JSON.stringify(content, null, 2);
    }
    
    return String(content);
}

function Logo({ className }: { className?: string }) {
    return <img src="https://i.postimg.cc/KjYZLCk5/image.png" alt="logo" className={cn("object-contain", className)} />;
}

/* ------------------------------------------------------------------
   Agent Bubble — inline in the chat thread
------------------------------------------------------------------- */

const AGENT_STEPS = [
    { id: "1", icon: <Brain className="w-3.5 h-3.5" />,  label: "Reading your medical report…",          sub: "Identifying key findings & abnormal markers" },
    { id: "2", icon: <Search className="w-3.5 h-3.5" />, label: "Searching for nearby specialists",         sub: "google.com/maps · practo.com" },
    { id: "3", icon: <Globe className="w-3.5 h-3.5" />,  label: "Cross-referencing hospital ratings",      sub: "healthgrades.com · docprime.com" },
    { id: "4", icon: <Globe className="w-3.5 h-3.5" />,  label: "Checking appointment availability",       sub: "Filtering open slots & proximity" },
    { id: "5", icon: <Stethoscope className="w-3.5 h-3.5" />, label: "Matching doctors to your profile", sub: "Ranking by specialty fit + reviews + distance" },
];

const MOCK_DOCTORS = [
    { name: "Dr. Priya Sharma",    specialty: "Ophthalmologist",        hospital: "AIIMS Delhi",        location: "2.1 km", rating: 4.9, reviews: 1821, exp: "18 yrs", available: "Today 4:30 PM",  match: 97, badge: "Best Match", icon: <Eye   className="w-4 h-4" /> },
    { name: "Dr. Ankit Mehrotra",  specialty: "Neuro-ophthalmologist",  hospital: "Fortis Escorts",    location: "5.4 km", rating: 4.7, reviews: 943,  exp: "14 yrs", available: "Tomorrow 10 AM", match: 91, badge: "",           icon: <Brain  className="w-4 h-4" /> },
    { name: "Dr. Kavita Nair",     specialty: "Internal Medicine",      hospital: "Max Hospital Saket",location: "7.0 km", rating: 4.8, reviews: 2130, exp: "22 yrs", available: "Today 6:00 PM",  match: 85, badge: "",           icon: <Heart  className="w-4 h-4" /> },
];

const SHIMMER_TEXTS = [
    "Initialising agent…",
    "Querying specialist databases…",
    "Analyzing refractive error severity…",
    "Computing match scores…",
];

function AgentBubble() {
    const [step, setStep] = useState(-1);
    const [done, setDone] = useState<string[]>([]);
    const [showDoctors, setShowDoctors] = useState(false);
    const [shimmerIdx, setShimmerIdx] = useState(0);
    const cancelledRef = useRef(false);

    useEffect(() => {
        cancelledRef.current = false;
        let s = 0;
        const timers: ReturnType<typeof setTimeout>[] = [];
        const schedule = (fn: () => void, ms: number) => {
            const t = setTimeout(() => { if (!cancelledRef.current) fn(); }, ms);
            timers.push(t);
        };

        const runStep = () => {
            if (cancelledRef.current) return;
            if (s >= AGENT_STEPS.length) {
                schedule(() => setShowDoctors(true), 400);
                return;
            }
            setStep(s);
            const currentS = s;
            schedule(() => {
                setDone(p => [...p, AGENT_STEPS[currentS].id]);
                s++;
                schedule(runStep, 380);
            }, currentS === 0 ? 900 : 850);
        };

        schedule(runStep, 300);

        return () => {
            cancelledRef.current = true;
            timers.forEach(t => clearTimeout(t));
        };
    }, []);

    useEffect(() => {
        const iv = setInterval(() => {
            setShimmerIdx(prev => (prev + 1) % SHIMMER_TEXTS.length);
        }, 1700);
        return () => clearInterval(iv);
    }, []);

    const allDone = done.length === AGENT_STEPS.length;
    const shimmerText = SHIMMER_TEXTS[shimmerIdx];

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex gap-2 justify-start">
            <Logo className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div className="glass rounded-2xl rounded-tl-sm shadow-sm w-full max-w-[90%] px-4 py-3 space-y-3">

                {/* Header shimmer */}
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
                        <Stethoscope className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-violet-700 uppercase tracking-widest">Doctor Finder · Agent</p>
                        {!allDone && (
                            <p className="text-xs font-medium text-slate-500 animate-pulse">{shimmerText}</p>
                        )}
                        {allDone && (
                            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Found {MOCK_DOCTORS.length} matching doctors
                            </p>
                        )}
                    </div>
                    {!allDone && <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin ml-auto flex-shrink-0" />}
                </div>

                {/* Step trace */}
                <div className="space-y-1.5">
                    {AGENT_STEPS.map((s, idx) => {
                        const isDone = done.includes(s.id);
                        const isActive = step === idx && !isDone;
                        if (step < idx) return null;
                        return (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.25 }}
                                className={cn(
                                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors",
                                    isDone ? "bg-emerald-50/80" : isActive ? "bg-violet-50/80" : "bg-white/5"
                                )}
                            >
                                <span className={cn("flex-shrink-0", isDone ? "text-emerald-500" : isActive ? "text-violet-500 animate-pulse" : "text-slate-400")}>
                                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.icon}
                                </span>
                                <div className="min-w-0">
                                    <p className={cn("text-xs font-semibold leading-tight", isDone ? "text-slate-600" : "text-slate-800")}>{s.label}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{s.sub}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Doctor cards */}
                {showDoctors && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="space-y-2 pt-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Top Matches</p>
                        {MOCK_DOCTORS.map((doc, i) => (
                            <motion.div
                                key={doc.name}
                                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: i * 0.1, type: "spring", damping: 22, stiffness: 280 }}
                                className="group relative rounded-xl border border-white/30 bg-white/40 backdrop-blur-sm px-3 py-2.5 hover:border-violet-400/40 hover:bg-white/60 transition-all cursor-pointer overflow-hidden"
                            >
                                {doc.badge && (
                                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                                        {doc.badge}
                                    </span>
                                )}
                                <div className="flex items-center gap-2.5">
                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white shadow flex-shrink-0",
                                        i === 0 ? "bg-gradient-to-br from-violet-600 to-indigo-600" :
                                        i === 1 ? "bg-gradient-to-br from-blue-600 to-cyan-500" :
                                                  "bg-gradient-to-br from-rose-500 to-pink-500"
                                    )}>{doc.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-900 leading-tight">{doc.name}</p>
                                        <p className="text-[11px] font-semibold text-violet-700">{doc.specialty}</p>
                                        <p className="text-[10px] text-slate-500">{doc.hospital}</p>
                                    </div>
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span className="flex items-center gap-1 text-[10px] text-slate-600 font-medium">
                                        <Star className="w-3 h-3 text-amber-500 fill-amber-400" />{doc.rating} ({doc.reviews.toLocaleString()})
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] text-slate-600"><MapPin className="w-3 h-3 text-slate-400" />{doc.location}</span>
                                    <span className="flex items-center gap-1 text-[10px] text-slate-600"><Clock className="w-3 h-3 text-slate-400" />{doc.exp}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-700">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{doc.available}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold text-violet-600">{doc.match}% match</span>
                                        <div className="h-1 w-12 rounded-full bg-black/5 overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${doc.match}%` }} transition={{ delay: i * 0.1 + 0.3, duration: 0.6, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
                                        </div>
                                    </div>
                                </div>
                                <button className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold tracking-wide shadow hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all">
                                    Book Appointment <ArrowRight className="w-3 h-3" />
                                </button>
                            </motion.div>
                        ))}
                        <p className="text-[9px] text-slate-400 text-center leading-relaxed">
                            AI-generated recommendations based on your report. Always verify credentials independently.
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const el = textareaRef.current;
            if (!el) return;
            if (reset) { el.style.height = `${minHeight}px`; return; }
            el.style.height = `${minHeight}px`;
            el.style.height = `${Math.min(el.scrollHeight, maxHeight ?? 9999)}px`;
        },
        [minHeight, maxHeight]
    );
    useEffect(() => {
        if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
    }, [minHeight]);
    return { textareaRef, adjustHeight };
}

/* ------------------------------------------------------------------ */
/* Structured report card                                                */
/* ------------------------------------------------------------------ */

const URGENCY_COLOR: Record<string, string> = {
    low: "bg-emerald-100 text-emerald-700 border-emerald-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    high: "bg-red-100 text-red-700 border-red-200",
};

const SEVERITY_COLORS: Record<string, string> = {
    low: "bg-emerald-100 text-emerald-700 border-emerald-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    high: "bg-red-100 text-red-700 border-red-100",
};

function FindingLabel({ severity }: { severity: string }) {
    const s = severity?.toLowerCase() || "low";
    return (
        <span className={cn("px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase border", SEVERITY_COLORS[s] || SEVERITY_COLORS.low)}>
            {s}
        </span>
    );
}

function ReportCard({ report }: { report: StructuredReport }) {
    const urgency = (report.urgency ?? "low").toLowerCase();
    const urgencyClass = URGENCY_COLOR[urgency] ?? URGENCY_COLOR.low;
    
    const rawAbnormal = report.abnormal_findings;
    const isStructuredFindings = Array.isArray(rawAbnormal) && rawAbnormal.length > 0 && typeof rawAbnormal[0] === 'object';
    
    const abnormal = isStructuredFindings ? [] : toList(report.abnormal_findings);
    const tests = toList(report.recommended_tests);
    const lifestyle = toList(report.lifestyle_suggestions);

    return (
        <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm",
                        urgencyClass
                    )}
                >
                    <Zap className="w-3.5 h-3.5" />
                    Priority: {report.urgency ?? "Normal"}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Medical Insights</span>
            </div>

            {/* Summary */}
            {report.summary && (
                <div className="rounded-xl glass-dark border-none px-4 py-3">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" /> Summary
                    </p>
                    <div className="text-slate-800 leading-relaxed markdown-content">
                        <ReactMarkdown
                            components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                code: ({ children }) => <code className="bg-black/5 rounded px-1 py-0.5 font-mono text-[10px]">{children}</code>,
                            }}
                        >
                            {report.summary}
                        </ReactMarkdown>
                    </div>
                </div>
            )}

            {/* Abnormal findings */}
            {(isStructuredFindings || abnormal.length > 0) && (
                <div className="rounded-2xl glass-dark border-none overflow-hidden shadow-sm">
                    <div className="bg-red-500/10 px-4 py-2 border-b border-white/10 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Critical Observations</span>
                    </div>
                    <div className="p-4">
                        {isStructuredFindings ? (
                            <div className="space-y-3">
                                {(rawAbnormal as Finding[]).map((f, i) => (
                                    <div key={i} className="flex flex-col gap-1 p-3 rounded-xl bg-white/10 border border-white/10 transition-all hover:bg-white/20">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold text-slate-900">{f.parameter}</span>
                                            <FindingLabel severity={f.severity} />
                                        </div>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-sm font-medium text-red-600">{f.value}</span>
                                            <span className="text-[11px] font-bold text-slate-600/90 whitespace-nowrap">vs {f.normal_range} (Normal)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {abnormal.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors group">
                                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 group-hover:scale-110 transition-transform" />
                                        <span className="text-slate-800 font-medium leading-tight">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* Recommended tests */}
            {tests.length > 0 && (
                <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-3">
                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5" /> Recommended Tests
                    </p>
                    <ul className="space-y-1">
                        {tests.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-blue-700">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Lifestyle suggestions */}
            {lifestyle.length > 0 && (
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <Leaf className="w-3.5 h-3.5" /> Lifestyle Suggestions
                    </p>
                    <ul className="space-y-1">
                        {lifestyle.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-green-700">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Message bubble                                                        */
/* ------------------------------------------------------------------ */

function MessageBubble({ msg }: { msg: Message }) {
    const isUser = msg.role === "user";
    const isStructured = isStructuredReport(msg.content);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}
        >
            {!isUser && <Logo className="w-6 h-6 flex-shrink-0 mt-0.5" />}

            <div
                className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    isUser
                        ? "bg-gradient-to-br from-violet-500 to-blue-500 text-white rounded-tr-sm max-w-[78%]"
                        : isStructured
                        ? "glass rounded-tl-sm shadow-sm w-full max-w-[90%]"
                        : "glass text-slate-800 font-medium rounded-tl-sm shadow-sm max-w-[78%]"
                )}
            >
                {msg.fileName && (
                    <p className="text-xs opacity-70 mb-1 flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        {msg.fileName}
                    </p>
                )}
                {isStructured ? (
                    <ReportCard report={msg.content as StructuredReport} />
                ) : (
                    <div className={cn(
                        "markdown-content",
                        isUser ? "text-white" : "text-slate-800 font-medium"
                    )}>
                        <ReactMarkdown
                            components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                                code: ({ children }) => <code className="bg-black/5 rounded px-1 py-0.5 font-mono text-xs">{children}</code>,
                                pre: ({ children }) => <pre className="bg-black/5 rounded p-2 my-2 overflow-x-auto font-mono text-xs">{children}</pre>,
                            }}
                        >
                            {msg.content as string}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            {isUser && (
                <div className="w-7 h-7 rounded-lg bg-white/40 backdrop-blur-md flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm border border-white/20">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                </div>
            )}
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/* Main component                                                        */
/* ------------------------------------------------------------------ */

const AI_MODELS = ["GPT-4-1 Mini", "GPT-4-1", "o3-mini", "Gemini 2.5 Flash", "Claude 3.5 Sonnet"];

export interface ExpandableAIChatProps {
    initialFile?: File | null;
}

export const ExpandableAIChat = forwardRef<ChatHandle, ExpandableAIChatProps>(function ExpandableAIChat({ initialFile }, ref) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    const [value, setValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showFindDoctor, setShowFindDoctor] = useState(false);
    const [showAgentBubble, setShowAgentBubble] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<"connecting" | "online" | "error">("connecting");
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingAnalysis, setPendingAnalysis] = useState<{file: File, message: string} | null>(null);
    const [lastAutoAnalyzed, setLastAutoAnalyzed] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 52, maxHeight: 120 });

    async function createConversation() {
        const res = await fetch(`${BASE_URL}/conversation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "Health Chat" }),
        });
        const data = await res.json();
        const id = data.conversation_id ?? data.id ?? data._id ?? Object.values(data)[0];
        return String(id);
    }

    const initConnection = useCallback(() => {
        setConnectionStatus("connecting");
        createConversation()
            .then((id) => {
                setConversationId(id);
                setConnectionStatus("online");
            })
            .catch((e) => {
                console.error("Failed to create conversation", e);
                setConnectionStatus("error");
            });
    }, []);

    useEffect(() => {
        initConnection();
    }, [initConnection]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        const hasAssistantMessage = messages.some(m => m.role === "assistant");
        if (hasAssistantMessage && !showFindDoctor) {
            const timer = setTimeout(() => setShowFindDoctor(true), 4000);
            return () => clearTimeout(timer);
        }
    }, [messages, showFindDoctor]);



    const clearChat = useCallback(async () => {
        setMessages([]);
        setConversationId(null);
        setPendingFile(null);
        try {
            const id = await createConversation();
            setConversationId(id);
        } catch (e) {
            console.error("Failed to create conversation", e);
        }
    }, []);

    const runAnalysis = useCallback(
        async (file: File, prompt: string) => {
            if (!conversationId) {
                setPendingAnalysis({ file, message: prompt });
                return;
            }

            const userMsg: Message = {
                id: Date.now().toString(),
                role: "user",
                content: prompt || "Analyze this report",
                fileName: file.name,
            };
            setMessages((prev) => [...prev, userMsg]);
            setIsTyping(true);

            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("message", prompt || "Please analyze this medical report.");
                const res = await fetch(`${BASE_URL}/analyze-report/${conversationId}`, {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                const content = extractContent(data);
                setMessages((prev) => [
                    ...prev,
                    { id: (Date.now() + 1).toString(), role: "assistant", content },
                ]);
            } catch {
                setMessages((prev) => [
                    ...prev,
                    { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, couldn't reach the server." },
                ]);
            } finally {
                setIsTyping(false);
            }
        },
        [conversationId]
    );

    // Effect to run analysis once connection is established
    useEffect(() => {
        if (connectionStatus === "online" && conversationId && pendingAnalysis) {
            runAnalysis(pendingAnalysis.file, pendingAnalysis.message);
            setPendingAnalysis(null);
        }
    }, [connectionStatus, conversationId, pendingAnalysis, runAnalysis]);

    // Handle initialFile prop for auto-analysis
    useEffect(() => {
        if (initialFile && initialFile !== lastAutoAnalyzed) {
            if (connectionStatus === "online" && conversationId) {
                runAnalysis(initialFile, "Please provide a comprehensive analysis of this medical report.");
                setLastAutoAnalyzed(initialFile);
            } else {
                setPendingAnalysis({ 
                    file: initialFile, 
                    message: "" 
                });
                setLastAutoAnalyzed(initialFile);
            }
        }
    }, [initialFile, lastAutoAnalyzed, connectionStatus, conversationId, runAnalysis]);

    // Expose analyzeReport to parent
    useImperativeHandle(ref, () => ({
        analyzeReport: (file: File, message: string) => {
            if (connectionStatus !== "online") {
                setPendingAnalysis({ file, message });
            } else {
                runAnalysis(file, message);
            }
        },
    }));

    const sendMessage = useCallback(async () => {
        const text = value.trim();
        if (!text && !pendingFile) return;
        if (!conversationId) return;

        if (pendingFile) {
            const file = pendingFile;
            setPendingFile(null);
            setValue("");
            adjustHeight(true);
            await runAnalysis(file, text);
            return;
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
        };
        setMessages((prev) => [...prev, userMsg]);
        setValue("");
        adjustHeight(true);
        setIsTyping(true);

        try {
            const res = await fetch(`${BASE_URL}/chat/${conversationId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });
            const data = await res.json();
            const content = extractContent(data);
            setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: "assistant", content },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, couldn't reach the server." },
            ]);
        } finally {
            setIsTyping(false);
        }
    }, [value, pendingFile, conversationId, adjustHeight, runAnalysis]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPendingFile(file);
        e.target.value = "";
    };

    const canSend = (value.trim() || pendingFile) && !!conversationId;

    return (
        <div className="h-full flex flex-col bg-transparent">
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
            >
                <div className="flex items-center gap-2.5">
                    <Logo className="w-7 h-7" />
                    <div>
                        <p className="text-xs font-bold text-slate-800 tracking-tight">DOLO</p>
                        <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full inline-block",
                              conversationId ? "bg-emerald-400" : "bg-amber-400"
                            )}
                          />
                          {mounted ? (
                            connectionStatus === "online" ? "Online" : 
                            connectionStatus === "error" ? (
                              <button 
                                onClick={(e) => { e.stopPropagation(); initConnection(); }}
                                className="text-red-500 hover:underline flex items-center gap-1"
                              >
                                Error - Retry?
                              </button>
                            ) : "Connecting…"
                          ) : "..."}
                        </p>
                    </div>
                </div>
                <button
                    onClick={clearChat}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/20 transition-all active:scale-[0.95]"
                    title="New chat"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-4">
                {messages.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full flex flex-col items-center justify-center gap-4 text-center px-6 animate-fade-in-up"
                    >
                        <Logo className="w-14 h-14" />
                        <div>
                            <p className="text-sm font-semibold text-slate-700">Your Health AI Assistant</p>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Upload a medical report on the left, or ask a health question below.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center mt-1">
                            {["How's my heart health?", "Analyze my blood test", "Check stress levels", "Explain my results"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setValue(s)}
                                    className="text-xs px-3.5 py-2 rounded-xl border border-slate-100 hover:bg-white/50 hover:border-violet-100/50 text-slate-600 transition-all hover:text-violet-600 active:scale-[0.97]"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                ))}

                {/* Agent bubble inline in chat */}
                {showAgentBubble && <AgentBubble />}

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2"
                    >
                        <Logo className="w-6 h-6 flex-shrink-0 mt-0.5 rounded-full" />
                        <div className="glass rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                            <TextShimmer duration={1.2} className="text-sm font-medium">
                                Analyzing your health data...
                            </TextShimmer>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
                className="px-4 pb-4 pt-2 flex-shrink-0"
                style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
            >
                <AnimatePresence>
                    {pendingFile && (
                        <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-xl text-xs text-violet-700"
                        >
                            <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate flex-1">{pendingFile.name}</span>
                            <button onClick={() => setPendingFile(null)} className="hover:text-violet-900">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="premium-card glow-input p-1">
                    <Textarea
                        ref={textareaRef}
                        value={value}
                        placeholder="Ask about your health…"
                        className="w-full rounded-xl rounded-b-none px-3 py-2.5 bg-transparent border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-800 font-medium placeholder:text-slate-600/80 min-h-[52px]"
                        onKeyDown={handleKeyDown}
                        onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
                    />
                    <div className="flex items-center justify-between px-2 pb-1">
                        <AnimatePresence mode="wait">
                            {showFindDoctor ? (
                                <motion.button
                                    key="doctor-btn"
                                    onClick={() => { setShowAgentBubble(true); }}
                                    disabled={showAgentBubble}
                                    initial={{ opacity: 0, scale: 0.3, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: 8 }}
                                    transition={{ 
                                        type: "spring", 
                                        bounce: 0.6,
                                        damping: 12,
                                        stiffness: 400
                                    }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={cn(
                                        "group relative flex items-center justify-center gap-2 h-8 px-4 rounded-full border border-white/20 overflow-hidden cursor-pointer transition-all",
                                        showAgentBubble
                                            ? "bg-slate-400 text-white/80 shadow-none cursor-default"
                                            : "text-white shadow-[0_4px_16px_rgba(124,58,237,0.3)] bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600"
                                    )}
                                >
                                    {/* SaaS Shimmer effect on hover */}
                                    <div className="absolute inset-0 w-[150%] -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]" />
                                    
                                    <Activity className="w-3.5 h-3.5 relative z-10 mb-[1px]" />
                                    <span className="relative z-10 uppercase text-[10px] sm:text-xs font-bold tracking-widest text-shadow-sm flex items-center gap-1.5">
                                        Find a Doctor <span className="opacity-80 normal-case font-medium tracking-normal text-[10px] mt-[1px]">(Agent)</span>
                                    </span>
                                </motion.button>
                            ) : (
                                <div key="placeholder" className="h-8 w-[140px]" />
                            )}
                        </AnimatePresence>

                        <div className="flex items-center gap-1.5">
                            <label className="rounded-lg p-1.5 cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-black/5 transition-colors">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <Paperclip className="w-3.5 h-3.5" />
                            </label>
                            <button
                                type="button"
                                disabled={!canSend}
                                onClick={sendMessage}
                                className={cn(
                                    "rounded-xl p-1.5 transition-all duration-200",
                                    canSend
                                        ? "bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-md hover:shadow-lg hover:scale-105"
                                        : "bg-black/10 text-slate-400/80"
                                )}
                            >
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

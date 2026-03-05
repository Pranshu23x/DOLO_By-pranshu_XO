"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AppContextType {
    file: File | null;
    setFile: (file: File | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [file, setFile] = useState<File | null>(null);

    return (
        <AppContext.Provider value={{ file, setFile }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
}

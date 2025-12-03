"use client";

import { SidebarProvider } from "./SidebarContext";

export function Shell({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-background text-foreground font-sans antialiased">
                {children}
            </div>
        </SidebarProvider>
    );
}

"use client";

import { Search, Bell, Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

export function TopBar() {
    const { toggle } = useSidebar();

    return (
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 md:px-8 fixed top-0 right-0 left-0 md:left-64 z-20 transition-all duration-300">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={toggle}
                    className="md:hidden p-2 -ml-2 text-secondary hover:text-foreground hover:bg-surface-hover rounded-md transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input
                        type="text"
                        placeholder="Search product, supplier, order..."
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-secondary hover:text-foreground relative hover:bg-surface-hover rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-surface"></span>
                </button>
                <div className="w-8 h-8 bg-surface-hover rounded-full overflow-hidden border border-border">
                    {/* Placeholder for user avatar */}
                    <img src="https://github.com/shadcn.png" alt="User" />
                </div>
            </div>
        </header>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingCart,
    BarChart3,
    Users,
    Package,
    Store,
    Settings,
    LogOut,
    Calendar,
    CheckSquare,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Store, label: "Inventory", href: "/inventory" },
    { icon: Package, label: "Orders", href: "/orders" },
    { icon: CheckSquare, label: "Approved", href: "/approve" },
    { icon: Calendar, label: "Exhibition", href: "/exhibitions" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isOpen, close } = useSidebar();

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={close}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen w-64 bg-surface border-r border-border transition-transform duration-300 ease-in-out md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">T</span>
                            </div>
                            <span className="text-foreground font-bold text-lg tracking-tight">Transpo</span>
                        </div>
                        <button
                            onClick={close}
                            className="md:hidden p-1 text-secondary hover:text-foreground rounded-md hover:bg-surface-hover transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => close()}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "text-primary bg-primary/10"
                                            : "text-secondary hover:bg-surface-hover hover:text-foreground"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-secondary")} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-border space-y-1">
                        <Link
                            href="/settings"
                            onClick={() => close()}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-secondary hover:bg-surface-hover hover:text-foreground transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                            Settings
                        </Link>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-secondary hover:bg-surface-hover hover:text-danger/80 transition-colors group">
                            <LogOut className="w-5 h-5 group-hover:text-danger" />
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

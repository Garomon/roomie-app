"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    DollarSign,
    CheckSquare,
    Users,
    Menu,
    FileText,
    BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LoginButton from "@/components/LoginButton";
import { useAuth } from "@/components/AuthProvider";
import NotificationsCenter from "@/components/NotificationsCenter";
import { SearchCommand } from "@/components/SearchCommand";
import InstallPWA from "@/components/InstallPWA";
import PushManager from "@/components/PushManager";

export default function Navigation() {
    const { roomie } = useAuth();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const routes = [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/finance", label: "Finanzas", icon: DollarSign },
        { href: "/chores", label: "Tareas", icon: CheckSquare },
        { href: "/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/profiles", label: "Perfiles", icon: Users },
        { href: "/manifesto", label: "Manifiesto", icon: FileText },
    ];

    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            <nav className="w-full max-w-6xl rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl pointer-events-auto">
                <div className="flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/10 group-hover:border-cyan-400/50 transition-colors shadow-lg">
                                <Image
                                    src="/icon-192x192.png"
                                    alt="Logo"
                                    fill
                                    sizes="32px"
                                    className="object-cover"
                                />
                            </div>
                            <span className="hidden font-heading font-bold text-white md:inline-block tracking-tight text-lg group-hover:text-cyan-400 transition-colors">
                                Roomie App
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            {routes.map((route) => {
                                const Icon = route.icon;
                                const isActive = pathname === route.href;
                                return (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        className={cn(
                                            "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 relative overflow-hidden group",
                                            isActive
                                                ? "text-white"
                                                : "text-gray-400 hover:text-white"
                                        )}
                                    >
                                        {/* Active/Hover Background */}
                                        <div className={cn(
                                            "absolute inset-0 bg-white/5 opacity-0 transition-opacity duration-300",
                                            isActive ? "opacity-100" : "group-hover:opacity-100"
                                        )} />

                                        {/* Active Indicator Line */}
                                        {isActive && (
                                            <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                                        )}

                                        <Icon className={cn("h-4 w-4 relative z-10", isActive && "text-cyan-400")} />
                                        <span className="relative z-10">{route.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:block">
                            <SearchCommand />
                        </div>

                        {/* Desktop Buttons - Hidden on Mobile */}
                        <div className="hidden md:flex items-center gap-2">
                            <InstallPWA />
                            <PushManager />
                        </div>

                        <NotificationsCenter />

                        <div className="hidden md:block">
                            <LoginButton />
                        </div>

                        {/* Mobile Menu */}
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild className="md:hidden">
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] border-l-white/10 bg-black/95 backdrop-blur-xl">
                                <div className="flex flex-col gap-4 mt-8">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-400">
                                            {roomie?.name || 'Invitado'}
                                        </span>
                                        <LoginButton />
                                    </div>

                                    <div className="py-2 flex flex-col gap-2">
                                        <InstallPWA />
                                        <PushManager />
                                    </div>

                                    <SearchCommand />

                                    {routes.map((route) => {
                                        const Icon = route.icon;
                                        return (
                                            <Link
                                                key={route.href}
                                                href={route.href}
                                                onClick={() => setIsOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                    pathname === route.href
                                                        ? "bg-white/10 text-white border border-white/5"
                                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                                {route.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </nav>
        </div>
    );
}

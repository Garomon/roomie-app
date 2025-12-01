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
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                fill
                                sizes="32px"
                                className="object-cover"
                            />
                        </div>
                        <span className="hidden font-heading font-bold text-white md:inline-block">
                            Roomie App
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {routes.map((route) => {
                            const Icon = route.icon;
                            return (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10",
                                        pathname === route.href
                                            ? "bg-white/10 text-white"
                                            : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {route.label}
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
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] border-l-white/10 bg-black/95">
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
                                                    ? "bg-white/10 text-white"
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
    );
}

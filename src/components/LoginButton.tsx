"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROOMIES } from "@/lib/bossLogic";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

export default function LoginButton() {
    const { user, roomie, signInWithGoogle, signOut, linkRoomie, unlinkRoomie } = useAuth();

    if (user) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8 border border-white/10">
                            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
                            <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-black/90 border-white/10 text-white" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || "Usuario"}</p>
                            <p className="text-xs leading-none text-gray-400">{user.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />

                    {roomie ? (
                        <DropdownMenuItem onClick={unlinkRoomie} className="text-yellow-400 focus:text-yellow-300 focus:bg-yellow-900/20 cursor-pointer">
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>Desvincular de {roomie.name}</span>
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="cursor-pointer">
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Vincular Perfil</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent className="bg-black/90 border-white/10 text-white">
                                    {ROOMIES.map((r) => (
                                        <DropdownMenuItem
                                            key={r.id}
                                            onClick={() => linkRoomie(r.id)}
                                            className="cursor-pointer hover:bg-white/10"
                                        >
                                            <Avatar className="h-6 w-6 mr-2 border border-white/10">
                                                <AvatarImage src={r.avatar} />
                                                <AvatarFallback>{r.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {r.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    )}

                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={signOut} className="text-red-400 focus:text-red-300 focus:bg-red-900/20 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <Button
            onClick={signInWithGoogle}
            variant="outline"
            size="sm"
            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
        >
            <LogIn className="mr-2 h-4 w-4" />
            Login
        </Button>
    );
}

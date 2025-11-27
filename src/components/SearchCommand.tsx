"use client";

import * as React from "react";
import {
    Calculator,
    CreditCard,
    Smile,
    User,
    Search,
    FileText,
    Home,
    CheckCircle2
} from "lucide-react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function SearchCommand() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 py-2 w-full md:w-64 justify-start text-muted-foreground"
            >
                <Search className="mr-2 h-4 w-4" />
                <span>Buscar...</span>
                <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-hidden p-0 shadow-lg">
                    <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <Command.Input
                                placeholder="Escribe un comando o busca..."
                                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                            <Command.Empty className="py-6 text-center text-sm">No se encontraron resultados.</Command.Empty>

                            <Command.Group heading="Navegación">
                                <Command.Item onSelect={() => runCommand(() => router.push("/"))} className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    <Home className="mr-2 h-4 w-4" />
                                    <span>Dashboard</span>
                                </Command.Item>
                                <Command.Item onSelect={() => runCommand(() => router.push("/finance"))} className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    <span>Finanzas</span>
                                </Command.Item>
                                <Command.Item onSelect={() => runCommand(() => router.push("/chores"))} className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    <span>Tareas</span>
                                </Command.Item>
                                <Command.Item onSelect={() => runCommand(() => router.push("/manifesto"))} className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>Manifiesto</span>
                                </Command.Item>
                                <Command.Item onSelect={() => runCommand(() => router.push("/profiles"))} className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Perfiles</span>
                                </Command.Item>
                            </Command.Group>

                            <Command.Group heading="Acciones">
                                <Command.Item onSelect={() => runCommand(() => router.push("/finance?tab=rent"))} className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    <Calculator className="mr-2 h-4 w-4" />
                                    <span>Pagar Renta</span>
                                </Command.Item>
                                <Command.Item onSelect={() => runCommand(() => router.push("/chores"))} className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    <Smile className="mr-2 h-4 w-4" />
                                    <span>Registrar Tarea</span>
                                </Command.Item>
                            </Command.Group>
                        </Command.List>
                    </Command>
                </DialogContent>
            </Dialog>
        </>
    );
}

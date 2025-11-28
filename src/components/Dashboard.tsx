"use client";

import { useEffect, useState } from "react";
import { getBossOfTheMonth, getDaysUntilRentDue, RentStatus } from "@/lib/bossLogic";
import { Crown, Clock, PiggyBank, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
{/* Quick Actions */ }
<motion.div variants={item} className="md:col-span-1 flex flex-col h-full gap-6">
    <Card className="bg-white/5 border-dashed border-white/10 flex-none">
        <CardHeader>
            <CardTitle className="text-lg text-white">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            <Link href="/finance" className="block">
                <Button className="w-full justify-between group" variant="secondary">
                    Registrar Pago
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
            </Link>
            <Link href="/manifesto" className="block">
                <Button className="w-full justify-between group" variant="ghost">
                    Leer Manifiesto
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
            </Link>
        </CardContent>
    </Card>

    <div className="h-[300px] min-h-0">
        <ActivityFeed />
    </div>
</motion.div>
            </div >
        </motion.div >
    );
}

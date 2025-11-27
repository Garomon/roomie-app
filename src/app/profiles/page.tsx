"use client";

import { motion } from "framer-motion";
import { ROOMIES } from "@/lib/bossLogic";
import RoommateProfile from "@/components/RoommateProfile";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default function ProfilesPage() {
    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <Badge variant="vibra" className="mb-2">
                    <Users className="w-3 h-3 mr-1" />
                    Squad
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold font-heading text-white">
                    Perfiles
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Conoce a tu equipo. Stats, tareas y nivel de confiabilidad.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ROOMIES.map((roomie, index) => (
                    <motion.div
                        key={roomie.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <RoommateProfile roomie={roomie} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

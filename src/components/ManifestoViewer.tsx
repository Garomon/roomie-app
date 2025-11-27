"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Heart, Shield, Zap, Users } from "lucide-react";

            <div className="text-center space-y-4">
                <Badge variant="vibra" className="mb-2">Manifiesto Anzures</Badge>
                <h1 className="text-4xl md:text-5xl font-bold font-heading text-white">
                    Vibra Alta
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Calle Leibnitz 37, Depto 3. El depa más cool de Anzures.
                </p>
            </div>

            <div className="grid gap-6">
                {sections.map((section, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:border-white/20 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-xl">
                                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                        {section.icon}
                                    </div>
                                    {section.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-gray-300 leading-relaxed">
                                    {section.content}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-center pt-8">
                <div className="flex -space-x-4">
                    {['A', 'E', 'J'].map((initial, i) => (
                        <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 border-4 border-black flex items-center justify-center font-bold text-white shadow-lg z-10 hover:z-20 hover:scale-110 transition-transform cursor-default">
                            {initial}
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
}

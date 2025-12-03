"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Exhibition } from "@/lib/db";
import { Plus, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ExhibitionsPage() {
    const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [newExhibition, setNewExhibition] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        fetchExhibitions();
    }, []);

    const fetchExhibitions = async () => {
        try {
            const res = await fetch("/api/exhibitions");
            const data = await res.json();
            setExhibitions(data);
        } catch (error) {
            console.error("Failed to fetch exhibitions", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateExhibition = async () => {
        try {
            const res = await fetch("/api/exhibitions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newExhibition),
            });
            if (res.ok) {
                setIsCreateModalOpen(false);
                fetchExhibitions();
                setNewExhibition({
                    name: "",
                    description: "",
                    startDate: "",
                    endDate: "",
                });
            }
        } catch (error) {
            console.error("Failed to create exhibition", error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-foreground">Exhibitions</h1>
                <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto gap-2">
                    <Plus className="w-4 h-4" />
                    New Exhibition
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center py-12 text-secondary">Loading exhibitions...</div>
                ) : exhibitions.length === 0 ? (
                    <div className="col-span-full text-center py-12 border-2 border-dashed border-border rounded-xl">
                        <p className="text-secondary">No exhibitions found. Create one to get started.</p>
                    </div>
                ) : exhibitions.map((exhibition) => (
                    <Link href={`/exhibitions/${exhibition.exhibitionId}`} key={exhibition.id} className="block group h-full">
                        <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all duration-200 group-hover:-translate-y-1">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{exhibition.name}</CardTitle>
                                        <CardDescription>{exhibition.exhibitionId}</CardDescription>
                                    </div>
                                    <span className="px-2.5 py-1 bg-info/10 text-info rounded-full text-xs font-medium border border-info/20">
                                        Active
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-secondary text-sm mb-6 line-clamp-2 h-10">{exhibition.description || "No description provided."}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="flex items-center gap-2 text-xs text-secondary">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{exhibition.startDate || "N/A"} - {exhibition.endDate || "N/A"}</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Exhibition"
                className="max-w-xl"
            >
                <div className="space-y-4">
                    <Input
                        label="Exhibition Name"
                        placeholder="Enter exhibition name"
                        value={newExhibition.name}
                        onChange={(e) => setNewExhibition({ ...newExhibition, name: e.target.value })}
                    />
                    <Input
                        label="Description"
                        placeholder="Enter description"
                        value={newExhibition.description}
                        onChange={(e) => setNewExhibition({ ...newExhibition, description: e.target.value })}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Start Date"
                            type="date"
                            value={newExhibition.startDate}
                            onChange={(e) => setNewExhibition({ ...newExhibition, startDate: e.target.value })}
                        />
                        <Input
                            label="End Date"
                            type="date"
                            value={newExhibition.endDate}
                            onChange={(e) => setNewExhibition({ ...newExhibition, endDate: e.target.value })}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateExhibition}>Create Exhibition</Button>
                </div>
            </Modal>
        </div>
    );
}

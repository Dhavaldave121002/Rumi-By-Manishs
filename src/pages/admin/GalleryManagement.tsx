import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
    Image as ImageIcon, Video, Instagram, Plus, Trash2, Edit2,
    Search, Filter, X, Upload, ExternalLink, Eye, CheckCircle2,
    AlertTriangle, Grid3x3, List, Download, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useEffect } from "react";

interface GalleryItem {
    id: string;
    url: string;
    title: string;
    category: string;
    type: "image" | "video" | "instagram-post" | "instagram-reel";
    thumbnail?: string;
    instagramUrl?: string;
    uploadedAt: string;
    status: "active" | "draft" | "archived";
}

const GalleryManagement = () => {
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

    // Fetch items
    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const response = await api.gallery.getAll({ limit: 1000 }); // Get all items
            if (response.success && Array.isArray(response.data)) {
                // Map API response to Component state
                const mappedItems: GalleryItem[] = response.data.map((item: any) => ({
                    id: item.id,
                    url: item.url,
                    title: item.title,
                    category: item.category,
                    type: item.type,
                    thumbnail: item.thumbnail,
                    instagramUrl: item.instagram_url,
                    uploadedAt: item.created_at ? item.created_at.split(' ')[0] : new Date().toISOString().split('T')[0],
                    status: item.status
                }));
                setGalleryItems(mappedItems);
            }
        } catch (error) {
            console.error("Failed to fetch gallery items:", error);
            toast.error("Failed to load gallery items");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // Form state for add/edit modal
    const [formData, setFormData] = useState({
        url: "",
        title: "",
        category: "Sarees",
        type: "image" as GalleryItem["type"],
        thumbnail: "",
        instagramUrl: "",
        status: "active" as GalleryItem["status"],
    });

    const categories = ["Sarees", "Lehengas", "Anarkalis", "Suits", "Kurtis"];
    const types = [
        { value: "image", label: "Image", icon: ImageIcon },
        { value: "video", label: "Video", icon: Video },
        { value: "instagram-post", label: "Instagram Post", icon: Instagram },
        { value: "instagram-reel", label: "Instagram Reel", icon: Instagram },
    ];

    // Filter items
    const filteredItems = galleryItems.filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || item.type === filterType;
        const matchesCategory = filterCategory === "all" || item.category === filterCategory;
        const matchesStatus = filterStatus === "all" || item.status === filterStatus;

        return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });

    // Statistics
    const stats = {
        total: galleryItems.length,
        images: galleryItems.filter(i => i.type === "image").length,
        videos: galleryItems.filter(i => i.type === "video").length,
        instagramPosts: galleryItems.filter(i => i.type === "instagram-post").length,
        instagramReels: galleryItems.filter(i => i.type === "instagram-reel").length,
        active: galleryItems.filter(i => i.status === "active").length,
        draft: galleryItems.filter(i => i.status === "draft").length,
    };

    const handleAddItem = async () => {
        try {
            const response = await api.gallery.create({
                ...formData,
                display_order: 0
            });

            if (response.success) {
                toast.success("Gallery item added successfully!");
                setShowAddModal(false);
                resetForm();
                fetchItems();
            } else {
                toast.error(response.error || "Failed to add item");
            }
        } catch (error: any) {
            console.error("Error adding item:", error);
            toast.error(error.message || "Failed to add item");
        }
    };

    const handleEditItem = async () => {
        if (!editingItem) return;

        try {
            const response = await api.gallery.update(Number(editingItem.id), formData);

            if (response.success) {
                toast.success("Gallery item updated successfully!");
                setEditingItem(null);
                resetForm();
                fetchItems();
            } else {
                toast.error(response.error || "Failed to update item");
            }
        } catch (error: any) {
            console.error("Error updating item:", error);
            toast.error(error.message || "Failed to update item");
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        try {
            const response = await api.gallery.delete(Number(id));
            if (response.success) {
                toast.success("Gallery item deleted successfully!");
                fetchItems();
            } else {
                toast.error(response.error || "Failed to delete item");
            }
        } catch (error: any) {
            console.error("Error deleting item:", error);
            toast.error(error.message || "Failed to delete item");
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedItems.size} items?`)) return;

        let successCount = 0;
        for (const id of selectedItems) {
            try {
                const response = await api.gallery.delete(Number(id));
                if (response.success) successCount++;
            } catch (error) {
                console.error(`Failed to delete item ${id}`, error);
            }
        }

        toast.success(`${successCount} items deleted successfully!`);
        setSelectedItems(new Set());
        fetchItems();
    };

    const handleBulkStatusChange = async (status: GalleryItem["status"]) => {
        let successCount = 0;
        for (const id of selectedItems) {
            try {
                const response = await api.gallery.update(Number(id), { status });
                if (response.success) successCount++;
            } catch (error) {
                console.error(`Failed to update item ${id}`, error);
            }
        }

        toast.success(`${successCount} items updated to ${status}!`);
        setSelectedItems(new Set());
        fetchItems();
    };

    const resetForm = () => {
        setFormData({
            url: "",
            title: "",
            category: "Sarees",
            type: "image",
            thumbnail: "",
            instagramUrl: "",
            status: "active",
        });
    };

    const openEditModal = (item: GalleryItem) => {
        setEditingItem(item);
        setFormData({
            url: item.url,
            title: item.title,
            category: item.category,
            type: item.type,
            thumbnail: item.thumbnail || "",
            instagramUrl: item.instagramUrl || "",
            status: item.status,
        });
    };

    const toggleSelectItem = (id: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const selectAll = () => {
        if (selectedItems.size === filteredItems.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredItems.map(item => item.id)));
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8 max-w-[1800px] mx-auto pb-12">
                {/* Header */}
                <div className="bg-[#1a1d23] rounded-3xl border border-white/5 p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight flex items-center gap-3">
                                    <ImageIcon className="w-8 h-8 text-primary" />
                                    Gallery Management
                                </h1>
                                <p className="text-gray-400">Manage photos, videos, and Instagram content</p>
                            </div>
                            <Button
                                onClick={() => setShowAddModal(true)}
                                className="bg-primary text-black hover:bg-primary/90 h-12 px-8 font-bold uppercase tracking-wider shadow-lg shadow-primary/20"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add New Item
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {[
                        { label: "Total Items", value: stats.total, color: "primary", icon: ImageIcon },
                        { label: "Images", value: stats.images, color: "blue-500", icon: ImageIcon },
                        { label: "Videos", value: stats.videos, color: "purple-500", icon: Video },
                        { label: "IG Posts", value: stats.instagramPosts, color: "pink-500", icon: Instagram },
                        { label: "IG Reels", value: stats.instagramReels, color: "orange-500", icon: Instagram },
                        { label: "Active", value: stats.active, color: "green-500", icon: CheckCircle2 },
                        { label: "Draft", value: stats.draft, color: "yellow-500", icon: AlertTriangle },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-[#1a1d23] rounded-2xl border border-white/5 p-6 shadow-xl hover:border-white/10 transition-all"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                                <span className={`text-2xl font-display font-bold text-white`}>{stat.value}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Filters & Search */}
                <div className="bg-[#1a1d23] rounded-2xl border border-white/5 p-6 shadow-xl">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by title or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-all"
                            />
                        </div>

                        {/* Type Filter */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all [&>option]:bg-[#1a1d23] [&>option]:text-white"
                        >
                            <option value="all" className="bg-[#1a1d23] text-white">All Types</option>
                            <option value="image" className="bg-[#1a1d23] text-white">Images</option>
                            <option value="video" className="bg-[#1a1d23] text-white">Videos</option>
                            <option value="instagram-post" className="bg-[#1a1d23] text-white">Instagram Posts</option>
                            <option value="instagram-reel" className="bg-[#1a1d23] text-white">Instagram Reels</option>
                        </select>

                        {/* Category Filter */}
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all [&>option]:bg-[#1a1d23] [&>option]:text-white"
                        >
                            <option value="all" className="bg-[#1a1d23] text-white">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat} className="bg-[#1a1d23] text-white">{cat}</option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all [&>option]:bg-[#1a1d23] [&>option]:text-white"
                        >
                            <option value="all" className="bg-[#1a1d23] text-white">All Status</option>
                            <option value="active" className="bg-[#1a1d23] text-white">Active</option>
                            <option value="draft" className="bg-[#1a1d23] text-white">Draft</option>
                            <option value="archived" className="bg-[#1a1d23] text-white">Archived</option>
                        </select>

                        {/* View Mode Toggle */}
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === "grid" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setViewMode("grid")}
                                className="h-12 px-4"
                            >
                                <Grid3x3 className="w-5 h-5" />
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setViewMode("list")}
                                className="h-12 px-4"
                            >
                                <List className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedItems.size > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between"
                        >
                            <p className="text-sm text-gray-400">
                                <span className="text-primary font-bold">{selectedItems.size}</span> items selected
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBulkStatusChange("active")}
                                    className="border-green-500/20 text-green-500 hover:bg-green-500/10"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Set Active
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBulkStatusChange("draft")}
                                    className="border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10"
                                >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Set Draft
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                    className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Selected
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Gallery Items */}
                <div className="bg-[#1a1d23] rounded-2xl border border-white/5 p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-display font-bold text-white">
                            Gallery Items ({filteredItems.length})
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={selectAll}
                            className="text-primary hover:bg-primary/10"
                        >
                            {selectedItems.size === filteredItems.length ? "Deselect All" : "Select All"}
                        </Button>
                    </div>

                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            <AnimatePresence mode="popLayout">
                                {filteredItems.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: idx * 0.02 }}
                                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${selectedItems.has(item.id)
                                            ? "border-primary shadow-lg shadow-primary/20"
                                            : "border-white/5 hover:border-white/20"
                                            }`}
                                        onClick={() => toggleSelectItem(item.id)}
                                    >
                                        {/* Image/Video Thumbnail */}
                                        <img
                                            src={item.thumbnail || item.url}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        />

                                        {/* Type Badge */}
                                        <div className="absolute top-2 left-2">
                                            {item.type === "video" || item.type === "instagram-reel" ? (
                                                <div className="p-1.5 bg-purple-500/90 rounded-lg">
                                                    <Video className="w-3 h-3 text-white" />
                                                </div>
                                            ) : item.type === "instagram-post" ? (
                                                <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                                                    <Instagram className="w-3 h-3 text-white" />
                                                </div>
                                            ) : (
                                                <div className="p-1.5 bg-blue-500/90 rounded-lg">
                                                    <ImageIcon className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Badge */}
                                        <div className="absolute top-2 right-2">
                                            <span className={`text-[8px] px-2 py-1 rounded-full font-bold uppercase ${item.status === "active" ? "bg-green-500/90 text-white" :
                                                item.status === "draft" ? "bg-yellow-500/90 text-black" :
                                                    "bg-gray-500/90 text-white"
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>

                                        {/* Selection Checkbox */}
                                        <div className="absolute bottom-2 left-2">
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedItems.has(item.id)
                                                ? "bg-primary border-primary"
                                                : "bg-black/50 border-white/30"
                                                }`}>
                                                {selectedItems.has(item.id) && (
                                                    <CheckCircle2 className="w-3 h-3 text-black" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Hover Actions */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                                <p className="text-white text-xs font-bold mb-1 truncate">{item.title}</p>
                                                <p className="text-white/60 text-[10px] mb-3">{item.category}</p>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditModal(item);
                                                        }}
                                                        className="flex-1 h-7 text-[10px] border-white/20 text-white hover:bg-white/10"
                                                    >
                                                        <Edit2 className="w-3 h-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteItem(item.id);
                                                        }}
                                                        className="h-7 px-2 border-red-500/20 text-red-500 hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <AnimatePresence mode="popLayout">
                                {filteredItems.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: idx * 0.02 }}
                                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${selectedItems.has(item.id)
                                            ? "border-primary bg-primary/5"
                                            : "border-white/5 bg-white/5 hover:bg-white/10"
                                            }`}
                                    >
                                        {/* Checkbox */}
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.has(item.id)}
                                            onChange={() => toggleSelectItem(item.id)}
                                            className="w-5 h-5 rounded border-white/20 bg-white/5"
                                        />

                                        {/* Thumbnail */}
                                        <img
                                            src={item.thumbnail || item.url}
                                            alt={item.title}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />

                                        {/* Info */}
                                        <div className="flex-1">
                                            <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                                <span>{item.category}</span>
                                                <span>•</span>
                                                <span className="capitalize">{item.type.replace("-", " ")}</span>
                                                <span>•</span>
                                                <span>{item.uploadedAt}</span>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${item.status === "active" ? "bg-green-500/20 text-green-500" :
                                            item.status === "draft" ? "bg-yellow-500/20 text-yellow-500" :
                                                "bg-gray-500/20 text-gray-500"
                                            }`}>
                                            {item.status}
                                        </span>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {item.instagramUrl && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => window.open(item.instagramUrl, "_blank")}
                                                    className="h-8 px-3 border-white/10 text-white hover:bg-white/5"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openEditModal(item)}
                                                className="h-8 px-3 border-white/10 text-white hover:bg-white/5"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="h-8 px-3 border-red-500/20 text-red-500 hover:bg-red-500/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Empty State */}
                    {filteredItems.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20"
                        >
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ImageIcon className="w-10 h-10 text-gray-500" />
                            </div>
                            <h3 className="text-xl font-display font-bold text-white mb-2">No items found</h3>
                            <p className="text-gray-400 mb-6">Try adjusting your filters or add a new item</p>
                            <Button onClick={() => setShowAddModal(true)} className="bg-primary text-black hover:bg-primary/90">
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Item
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {(showAddModal || editingItem) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setShowAddModal(false);
                                setEditingItem(null);
                                resetForm();
                            }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#1a1d23] border border-white/10 w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-display font-bold text-white">
                                    {editingItem ? "Edit Gallery Item" : "Add New Gallery Item"}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingItem(null);
                                        resetForm();
                                    }}
                                    className="p-2 rounded-full hover:bg-white/5 text-gray-400 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Type Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                                        Content Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {types.map((type) => (
                                            <button
                                                key={type.value}
                                                onClick={() => setFormData({ ...formData, type: type.value as GalleryItem["type"] })}
                                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${formData.type === type.value
                                                    ? "border-primary bg-primary/10"
                                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                                    }`}
                                            >
                                                <type.icon className={`w-5 h-5 ${formData.type === type.value ? "text-primary" : "text-gray-400"}`} />
                                                <span className={`text-sm font-bold ${formData.type === type.value ? "text-white" : "text-gray-400"}`}>
                                                    {type.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter title..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-all"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all [&>option]:bg-[#1a1d23] [&>option]:text-white"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat} className="bg-[#1a1d23] text-white">{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* URL */}
                                {/* URL */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        {formData.type === "video" || formData.type === "instagram-reel" ? "Video URL" : "Image URL"}
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={formData.url}
                                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                            placeholder="https://..."
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-all"
                                        />
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id="file-upload"
                                                className="hidden"
                                                accept={formData.type === "video" || formData.type === "instagram-reel" ? "video/*" : "image/*"}
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    try {
                                                        const promise = api.upload(file);
                                                        toast.promise(promise, {
                                                            loading: 'Uploading...',
                                                            success: 'File uploaded successfully',
                                                            error: 'Failed to upload file',
                                                        });
                                                        const response = await promise;
                                                        if (response.success) {
                                                            setFormData({ ...formData, url: response.url });
                                                        }
                                                    } catch (error) {
                                                        console.error("Upload failed", error);
                                                    }
                                                }}
                                            />
                                            <Button
                                                variant="outline"
                                                className="h-full border-white/10 text-white hover:bg-white/5"
                                                onClick={() => document.getElementById('file-upload')?.click()}
                                                type="button"
                                            >
                                                <Upload className="w-5 h-5 mr-2" />
                                                Upload
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Thumbnail (for videos) */}
                                {(formData.type === "video" || formData.type === "instagram-reel") && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            Thumbnail URL (Optional)
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.thumbnail}
                                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                )}

                                {/* Instagram URL */}
                                {(formData.type === "instagram-post" || formData.type === "instagram-reel") && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            Instagram URL (Optional)
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.instagramUrl}
                                            onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                                            placeholder="https://instagram.com/..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                )}

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as GalleryItem["status"] })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all [&>option]:bg-[#1a1d23] [&>option]:text-white"
                                    >
                                        <option value="active" className="bg-[#1a1d23] text-white">Active</option>
                                        <option value="draft" className="bg-[#1a1d23] text-white">Draft</option>
                                        <option value="archived" className="bg-[#1a1d23] text-white">Archived</option>
                                    </select>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setEditingItem(null);
                                            resetForm();
                                        }}
                                        className="flex-1 h-12 border-white/10 text-white hover:bg-white/5"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={editingItem ? handleEditItem : handleAddItem}
                                        disabled={!formData.title || !formData.url}
                                        className="flex-1 h-12 bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider"
                                    >
                                        {editingItem ? "Update Item" : "Add Item"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default GalleryManagement;

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Category {
    id: number;
    name: string;
}

interface ProductFormData {
    name: string;
    price: string | number;
    priceINR: string | number;
    category_id: string; // Storing as string for select value
    description: string;
    fabric: string;
    sku: string;
    image: string;
    inStock: boolean;
    quantity: string | number;
    rating: number;
    reviews: number;
    sizes: string;
    details: string;
    careInstructions: string;
}

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        price: "",
        priceINR: "",
        category_id: "",
        description: "",
        fabric: "",
        sku: "",
        image: "",
        inStock: true,
        quantity: "",
        rating: 5,
        reviews: 0,
        sizes: "M, L, XL",
        details: "",
        careInstructions: ""
    });

    // Fetch Categories and Product Data (if editing)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Categories
                const catRes = await api.categories.getAll();
                if (catRes.success && Array.isArray(catRes.data)) {
                    setCategories(catRes.data as unknown as Category[]);
                }

                // If Edit mode, fetch product details
                if (isEdit) {
                    const productRes = await api.products.getById(Number(id));
                    if (productRes.success && productRes.data) {
                        const p = productRes.data;
                        setFormData({
                            name: p.name,
                            price: p.price,
                            priceINR: p.price * 60, // Approximate conversion or fetch if available
                            category_id: p.category_id?.toString() || "",
                            description: p.description || "",
                            fabric: p.fabric || "",
                            sku: p.sku || "",
                            image: p.images && p.images.length > 0 ? p.images[0].image_url : "",
                            inStock: p.stock_quantity > 0,
                            quantity: p.stock_quantity,
                            rating: p.rating || 5,
                            reviews: p.reviews_count || 0, // Adjust based on actual API response field
                            sizes: "M, L, XL", // Ideally fetch variants/sizes
                            details: "", // Map if available
                            careInstructions: p.care_instructions || ""
                        });
                        setImagePreview(p.images && p.images.length > 0 ? p.images[0].image_url : "");
                    } else {
                        toast.error("Failed to fetch product details");
                        navigate("/admin/products");
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error);
                toast.error("Failed to load necessary data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isEdit, navigate]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let finalImageUrl = formData.image;

            // 1. Upload Image if new file selected
            if (imageFile) {
                try {
                    const uploadRes = await api.upload(imageFile);
                    if (uploadRes.success) {
                        finalImageUrl = uploadRes.url;
                    } else {
                        throw new Error("Image upload failed");
                    }
                } catch (err) {
                    console.error("Upload error:", err);
                    toast.error("Failed to upload image. Please try again.");
                    setSubmitting(false);
                    return;
                }
            }

            if (!finalImageUrl) {
                toast.error("Please upload a product image");
                setSubmitting(false);
                return;
            }

            // 2. Prepare Payload
            const payload = {
                name: formData.name,
                slug: generateSlug(formData.name),
                description: formData.description,
                category_id: Number(formData.category_id),
                price: Number(formData.price),
                sku: formData.sku,
                stock_quantity: Number(formData.quantity),
                fabric: formData.fabric,
                care_instructions: formData.careInstructions,
                status: formData.inStock ? 'active' : 'draft',
                images: [{ url: finalImageUrl, alt: formData.name }]
            };

            // 3. Submit Product
            let res;
            if (isEdit) {
                res = await api.products.update(Number(id), payload);
            } else {
                res = await api.products.create(payload);
            }

            if (res.success) {
                toast.success(`Product ${isEdit ? "updated" : "created"} successfully!`);
                navigate("/admin/products");
            } else {
                toast.error(res.error || "Failed to save product");
            }

        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("An error occurred while saving the product");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/admin/products")}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">
                            {isEdit ? "Edit Product" : "Add New Product"}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {isEdit ? "Update product information" : "Create a new product listing"}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-background rounded-xl border border-border p-6 space-y-6">
                        {/* Basic Info */}
                        <div>
                            <h2 className="text-lg font-display font-bold text-foreground mb-4">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Product Name *</label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Silk Banarasi Saree"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">SKU *</label>
                                    <Input
                                        required
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        placeholder="e.g., RBM-SAR-001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
                                    <select
                                        required
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-md"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Fabric *</label>
                                    <Input
                                        required
                                        value={formData.fabric}
                                        onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                                        placeholder="e.g., Pure Banarasi Silk"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div>
                            <h2 className="text-lg font-display font-bold text-foreground mb-4">Pricing</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Price (USD) *</label>
                                    <Input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="299.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Price (INR) Approx.</label>
                                    <Input
                                        type="number"
                                        value={formData.priceINR}
                                        onChange={(e) => setFormData({ ...formData, priceINR: e.target.value })}
                                        placeholder="17,940"
                                        readOnly
                                        className="bg-secondary/20"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
                            <Textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detailed product description..."
                                rows={4}
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Product Image *</label>

                            <div className="flex gap-6 items-start">
                                {/* Preview */}
                                <div className="w-32 h-32 bg-secondary/20 rounded-lg border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
                                    )}
                                </div>

                                {/* Upload Controls */}
                                <div className="flex-1 space-y-3">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="image-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById('image-upload')?.click()}
                                            className="gap-2"
                                        >
                                            <Upload className="w-4 h-4" />
                                            {imagePreview ? "Change Image" : "Upload Image"}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Recommended size: 800x800px. Max file size: 5MB.
                                        Supported formats: JPG, PNG, WEBP.
                                    </p>
                                    {formData.image && !imageFile && (
                                        <p className="text-xs text-emerald-600">
                                            ✓ Current image: {formData.image.split('/').pop()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sizes */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Sizes (comma-separated)</label>
                            <Input
                                value={formData.sizes}
                                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                                placeholder="M, L, XL"
                            />
                        </div>

                        {/* Details */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Product Details (one per line) - Future use</label>
                            <Textarea
                                value={formData.details}
                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                placeholder="Handwoven pure silk&#10;Traditional zari work"
                                rows={2}
                            />
                        </div>

                        {/* Care Instructions */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Care Instructions</label>
                            <Textarea
                                value={formData.careInstructions}
                                onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                                placeholder="Dry clean only"
                                rows={2}
                            />
                        </div>

                        {/* Stock & Inventory */}
                        <div>
                            <h2 className="text-lg font-display font-bold text-foreground mb-4">Stock & Inventory</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Stock Quantity *
                                    </label>
                                    <Input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.quantity}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData({
                                                ...formData,
                                                quantity: val,
                                                inStock: Number(val) > 0
                                            });
                                        }}
                                        placeholder="0"
                                    />
                                    {Number(formData.quantity) > 0 && Number(formData.quantity) < 10 && (
                                        <p className="text-xs text-yellow-600 mt-1">⚠️ Low stock alert</p>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="flex items-center gap-2 p-4 bg-secondary/30 rounded-lg">
                                        <input
                                            type="checkbox"
                                            id="inStock"
                                            checked={formData.inStock}
                                            onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="inStock" className="text-sm font-medium text-foreground">
                                            Available for Purchase
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Button type="submit" variant="luxury" className="gap-2" disabled={submitting}>
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {isEdit ? "Update Product" : "Create Product"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/admin/products")}
                            className="gap-2"
                            disabled={submitting}
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default ProductForm;

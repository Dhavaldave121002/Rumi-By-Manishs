import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import FloatingContactButton from "@/components/FloatingContactButton";
import { api } from "@/lib/api";
import {
  X, ZoomIn, ChevronLeft, ChevronRight, Heart, Share2, Play, Pause,
  Image as ImageIcon, Video, Instagram, ExternalLink, Loader2
} from "lucide-react";
import { allProducts } from "@/data/products";
import { useToast } from "@/hooks/use-toast";

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Gallery Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 text-foreground">
          <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg border border-destructive/20">
            <h2 className="text-xl font-bold text-destructive mb-4">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-4">The gallery could not be loaded.</p>
            <pre className="p-4 bg-muted rounded text-xs overflow-auto max-h-40">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface GalleryItem {
  id: string;
  url: string;
  title: string;
  category: string;
  type: "image" | "video" | "instagram-post" | "instagram-reel";
  instagramUrl?: string;
  thumbnail?: string;
}

const GalleryContent = () => {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Create gallery images from products - Static Data
  const productImages: GalleryItem[] = allProducts?.flatMap(product =>
    product.images?.map((img, idx) => ({
      id: `prod-${product.id}-${idx}`,
      url: img,
      title: product.name,
      category: product.category,
      type: "image" as const,
    })) || []
  ) || [];

  const [galleryData, setGalleryData] = useState<GalleryItem[]>(productImages);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch gallery items from API and merge
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        // Safe check for api.gallery
        if (api?.gallery?.getAll) {
          const response = await api.gallery.getAll({ status: 'active', limit: 100 });
          if (response?.success && Array.isArray(response.data)) {
            const apiItems: GalleryItem[] = response.data.map((item: any) => ({
              id: item.id?.toString() || `api-${Math.random()}`,
              url: item.url || "",
              title: item.title || "Untitled",
              category: item.category || "Uncategorized",
              type: item.type || "image",
              thumbnail: item.thumbnail,
              instagramUrl: item.instagram_url
            })).filter(item => item.url); // Ensure URL exists

            // Merge API items with static items
            setGalleryData(prev => {
              // Avoid duplicates
              const prevIds = new Set(prev.map(p => p.id));
              const uniqueApiItems = apiItems.filter(i => !prevIds.has(i.id));
              return [...prev, ...uniqueApiItems];
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch gallery:", error);
        // Silent fail or subtle toast - don't block UI
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const allPhotos = galleryData.filter(item => item.type === 'image' || item.type === 'instagram-post');
  const allVideos = galleryData.filter(item => item.type === 'video' || item.type === 'instagram-reel');

  const categories = ["All", ...Array.from(new Set(allProducts?.map(p => p.category) || []))];

  const filteredPhotos = selectedCategory === "All"
    ? allPhotos
    : allPhotos.filter(img => img.category === selectedCategory);

  const filteredVideos = selectedCategory === "All"
    ? allVideos
    : allVideos.filter(vid => vid.category === selectedCategory);

  const currentItems = activeTab === "photos" ? filteredPhotos : filteredVideos;
  const currentIndex = selectedItem
    ? currentItems.findIndex(item => item.id === selectedItem.id)
    : -1;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setSelectedItem(currentItems[currentIndex - 1]);
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < currentItems.length - 1) {
      setSelectedItem(currentItems[currentIndex + 1]);
      setIsPlaying(false);
    }
  };

  const toggleLike = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleShare = async (item: GalleryItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (navigator.share) {
      await navigator.share({
        title: item.title,
        text: `Check out this beautiful ${item.category} from RUMI by Manisha`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  return (
    <>
      <Header />
      <main className="pt-20 md:pt-24 min-h-screen bg-background">

        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-secondary/50 to-background relative overflow-hidden">
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              backgroundImage: "radial-gradient(circle at center, hsl(var(--primary)) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full font-body text-xs tracking-wider uppercase mb-4"
              >
                Our Collection
              </motion.span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 md:mb-6">
                Gallery
              </h1>
              <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our exquisite collection of handcrafted ethnic wear -
                photos, videos, and exclusive behind-the-scenes content.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Tabs for Photos/Videos */}
        <section className="py-6 md:py-8 border-b border-border bg-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("photos")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-body text-sm transition-all ${activeTab === "photos"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-secondary/50 text-foreground hover:bg-secondary hover:shadow-md"
                  }`}
              >
                <ImageIcon className="w-4 h-4" />
                Photos & Posts ({allPhotos.length})
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("videos")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-body text-sm transition-all ${activeTab === "videos"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-secondary/50 text-foreground hover:bg-secondary hover:shadow-md"
                  }`}
              >
                <Video className="w-4 h-4" />
                Videos & Reels ({allVideos.length})
              </motion.button>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-4 md:py-6 border-b border-border sticky top-16 md:top-20 bg-background/95 backdrop-blur-sm z-30">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {categories.map((category, index) => (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 md:px-5 py-2 font-body text-xs md:text-sm tracking-wider uppercase rounded-full transition-all ${selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary/50 text-foreground hover:bg-secondary hover:shadow-md"
                    }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-8 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {currentItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group relative aspect-square md:aspect-[3/4] overflow-hidden bg-secondary cursor-pointer rounded-lg md:rounded-xl shadow-md hover:shadow-2xl transition-shadow duration-300"
                    onClick={() => setSelectedItem(item)}
                  >
                    {item.type === "video" || item.type === "instagram-reel" ? (
                      <>
                        <img
                          src={item.thumbnail || item.url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center bg-foreground/30"
                          initial={{ opacity: 0.3 }}
                          whileHover={{ opacity: 0.5 }}
                        >
                          <motion.div
                            className="w-14 h-14 md:w-16 md:h-16 bg-background/90 rounded-full flex items-center justify-center"
                            whileHover={{ scale: 1.2 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <Play className="w-6 h-6 md:w-7 md:h-7 text-primary ml-1" />
                          </motion.div>
                        </motion.div>
                      </>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    )}

                    {/* Instagram Badge */}
                    {(item.type === "instagram-post" || item.type === "instagram-reel") && (
                      <motion.div
                        className="absolute top-3 left-3 p-2 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Instagram className="w-4 h-4 text-white" />
                      </motion.div>
                    )}

                    {/* Gradient Overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Hover Actions */}
                    <motion.div
                      className="absolute top-3 right-3 flex gap-2"
                      initial={{ opacity: 0, y: -10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => toggleLike(item.id, e)}
                        className={`p-2.5 rounded-full backdrop-blur-sm transition-all ${likedItems.has(item.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-background/80 text-foreground hover:bg-primary hover:text-primary-foreground"
                          }`}
                      >
                        <Heart className={`w-4 h-4 ${likedItems.has(item.id) ? "fill-current" : ""}`} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleShare(item, e)}
                        className="p-2.5 bg-background/80 rounded-full backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <Share2 className="w-4 h-4" />
                      </motion.button>
                    </motion.div>

                    {/* Info Overlay */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 p-3 md:p-4"
                      initial={{ y: 20, opacity: 0 }}
                      whileHover={{ y: 0, opacity: 1 }}
                    >
                      <p className="font-accent text-[10px] md:text-xs tracking-wider text-primary-foreground/80 uppercase mb-1">
                        {item.category}
                      </p>
                      <h3 className="font-display text-sm md:text-base text-white line-clamp-2">
                        {item.title}
                      </h3>
                      {item.instagramUrl && (
                        <a
                          href={item.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 mt-2 text-xs text-white/80 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View on Instagram
                        </a>
                      )}
                    </motion.div>

                    <motion.div
                      className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          whileHover={{ scale: 1, opacity: 1 }}
                          className="p-3 bg-background/80 rounded-full backdrop-blur-sm"
                        >
                          <ZoomIn className="w-5 h-5 text-foreground" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {currentItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === "photos" ? (
                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                  ) : (
                    <Video className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-display text-xl text-foreground mb-2">No items found</h3>
                <p className="font-body text-muted-foreground">
                  Try selecting a different category.
                </p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Lightbox */}
        <AnimatePresence>
          {
            selectedItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/95 backdrop-blur-md p-4"
                onClick={() => {
                  setSelectedItem(null);
                  setIsPlaying(false);
                }}
              >
                <motion.button
                  className="absolute top-4 right-4 md:top-6 md:right-6 p-3 bg-background/10 hover:bg-background/20 rounded-full text-white transition-all z-10"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setSelectedItem(null);
                    setIsPlaying(false);
                  }}
                >
                  <X className="w-6 h-6" />
                </motion.button>

                {/* Navigation Arrows */}
                {currentIndex > 0 && (
                  <motion.button
                    className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-background/10 hover:bg-background/20 rounded-full text-white transition-all z-10"
                    whileHover={{ scale: 1.1, x: -4 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevious();
                    }}
                  >
                    <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                  </motion.button>
                )}
                {currentIndex < currentItems.length - 1 && (
                  <motion.button
                    className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-background/10 hover:bg-background/20 rounded-full text-white transition-all z-10"
                    whileHover={{ scale: 1.1, x: 4 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                  >
                    <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                  </motion.button>
                )}

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="relative max-w-5xl max-h-[85vh] w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  {selectedItem.type === "video" || selectedItem.type === "instagram-reel" ? (
                    <div className="relative w-full aspect-video bg-foreground rounded-xl overflow-hidden shadow-2xl">
                      <video
                        ref={videoRef}
                        src={selectedItem.url}
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                    </div>
                  ) : (
                    <motion.img
                      src={selectedItem.url}
                      alt={selectedItem.title}
                      className="w-full h-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                      layoutId={`image-${selectedItem.id}`}
                    />
                  )}

                  {/* Item Info */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-foreground/90 to-transparent rounded-b-xl"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-accent text-xs tracking-wider text-white/70 uppercase">
                            {selectedItem.category}
                          </p>
                          {(selectedItem.type === "instagram-post" || selectedItem.type === "instagram-reel") && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded text-[10px] text-white font-medium">
                              Instagram
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-lg md:text-xl text-white">
                          {selectedItem.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => toggleLike(selectedItem.id, e)}
                          className={`p-3 rounded-full transition-all ${likedItems.has(selectedItem.id)
                            ? "bg-primary text-primary-foreground"
                            : "bg-white/10 hover:bg-white/20 text-white"
                            }`}
                        >
                          <Heart className={`w-5 h-5 ${likedItems.has(selectedItem.id) ? "fill-current" : ""}`} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleShare(selectedItem, e)}
                          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                        >
                          <Share2 className="w-5 h-5" />
                        </motion.button>
                        {selectedItem.instagramUrl && (
                          <motion.a
                            href={selectedItem.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full text-white transition-all"
                          >
                            <Instagram className="w-5 h-5" />
                          </motion.a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-background/10 backdrop-blur-sm rounded-full">
                  <span className="font-body text-sm text-white">
                    {currentIndex + 1} / {currentItems.length}
                  </span>
                </div>
              </motion.div>
            )
          }
        </AnimatePresence>
      </main>
      <Footer />
      <BackToTop />
      <FloatingContactButton />
    </>
  );
};

const Gallery = () => {
  return (
    <ErrorBoundary>
      <GalleryContent />
    </ErrorBoundary>
  );
};

export default Gallery;

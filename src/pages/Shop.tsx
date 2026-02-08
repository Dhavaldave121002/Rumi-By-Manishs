import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import FloatingContactButton from "@/components/FloatingContactButton";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter, Grid, List, X, Search, Mic, MicOff, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import { allProducts, Product } from "@/data/products";

const categories = ["All", "Sarees", "Lehengas", "Anarkalis", "Suits"];
const categoryMap: Record<string, number> = {
  "Sarees": 1,
  "Lehengas": 2,
  "Anarkalis": 3,
  "Suits": 4
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [gridView, setGridView] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  // Type definitions for SpeechRecognition if not available globally
  interface SpeechRecognitionEvent {
    results: {
      [index: number]: {
        [index: number]: { transcript: string };
      };
    };
  }

  // Voice recognition setup
  useEffect(() => {
    // @ts-expect-error - SpeechRecognition fallback
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
    }
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const collectionSlug = searchParams.get("collection");
      let res;
      let isCollection = false;

      if (collectionSlug) {
        res = await api.collections.getBySlug(collectionSlug);
        isCollection = true;
      } else {
        const params: any = { limit: 100 };
        if (selectedCategory !== "All") {
          params.category = categoryMap[selectedCategory];
        }
        res = await api.products.getAll(params);
      }

      if (res.success && res.data) {
        // Handle different response structures
        // Collection returns data with collection_products array
        // Products getAll returns data as array directly
        const rawProducts = isCollection && res.data.collection_products
          ? res.data.collection_products
          : (Array.isArray(res.data) ? res.data : []);

        const mappedProducts = rawProducts.map((p: any) => ({
          ...p,
          id: String(p.id),
          image: p.primary_image || (p.images && p.images[0] ? p.images[0].image_url : "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80"),
          priceINR: p.price * 60,
          category: p.category_name || selectedCategory
        }));
        setProducts(mappedProducts);
      } else {
        // Fallback to static data if API is empty
        // Only fallback if NOT a collection search (collections might legitimately be empty)
        if (!collectionSlug) {
          setProducts(allProducts);
        } else {
          setProducts([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      // Fallback only if generic fetch
      if (!searchParams.get("collection")) {
        setProducts(allProducts);
      } else {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchParams]);

  const toggleVoiceSearch = () => {
    // @ts-expect-error - SpeechRecognition fallback
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // Initialize from URL params
  useEffect(() => {
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    // Note: collection is handled by fetchProducts directly accessing searchParams

    if (search) setSearchQuery(search);
    if (category) {
      const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
      if (categories.includes(formattedCategory)) {
        setSelectedCategory(formattedCategory);
      }
    }
  }, [searchParams]);

  // Filter and sort products
  const filterProducts = useCallback(() => {
    // Start with the products fetched from API
    let filtered = [...products];

    // Filter by category
    // Only apply category filter if NOT in collection mode (or if user explicitly selected a category on top of collection)
    // For simplicity, if param 'category' exists, we filter.
    if (selectedCategory !== "All") {
      filtered = filtered.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.fabric && p.fabric.toLowerCase().includes(query))
      );
    }

    // Filter by price
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => Number(b.id) - Number(a.id));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, priceRange, sortBy, searchQuery, products]);

  useEffect(() => {
    const debounce = setTimeout(filterProducts, 150);
    return () => clearTimeout(debounce);
  }, [filterProducts]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category !== "All") {
      setSearchParams({ category: category.toLowerCase() });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setPriceRange([0, 2000]);
    setSearchQuery("");
    setSortBy("featured");
    setSearchParams({});
  };

  const activeFiltersCount = [
    selectedCategory !== "All",
    priceRange[0] > 0 || priceRange[1] < 2000,
    searchQuery.trim() !== "",
  ].filter(Boolean).length;

  const collectionName = searchParams.get("collection");

  return (
    <>
      <Header />
      <main className="pt-20 md:pt-24 min-h-screen bg-background">
        {/* Page Header */}
        <section className="py-8 md:py-16 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-accent text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] text-primary mb-3 md:mb-4"
              >
                {collectionName ? "COLLECTION" : "SHOP"}
              </motion.p>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-3 md:mb-4 capitalize">
                {collectionName ? collectionName.replace(/-/g, ' ') : "Our Shop"}
              </h1>
              <p className="font-body text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
                {collectionName
                  ? `Explore our exclusive ${collectionName.replace(/-/g, ' ')} collection`
                  : "Discover our carefully curated collection of handcrafted ethnic wear"
                }
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-6 md:py-12">
          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-border"
          >
            {/* Left Side - Filter & Count */}
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden relative"
              >
                <Filter className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-primary text-primary-foreground text-[10px] md:text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
              <p className="font-body text-xs md:text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{filteredProducts.length}</span> Products
              </p>
            </div>

            {/* Right Side - Sort & View */}
            <div className="flex items-center gap-2 md:gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] md:w-[180px] text-xs md:text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>

              <div className="hidden md:flex items-center gap-1 border border-border rounded-md p-1">
                <button
                  onClick={() => setGridView(true)}
                  className={`p-1.5 rounded transition-colors ${gridView ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridView(false)}
                  className={`p-1.5 rounded transition-colors ${!gridView ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Desktop Sidebar Filters - Always visible on lg+ */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              {/* Search */}
              <div className="mb-6">
                <h4 className="font-display text-sm mb-3">Search</h4>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent pl-10 pr-10"
                  />
                  {voiceSupported && (
                    <button
                      type="button"
                      onClick={toggleVoiceSearch}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all ${isListening
                        ? "bg-primary text-primary-foreground animate-pulse"
                        : "text-muted-foreground hover:text-primary"
                        }`}
                      aria-label={isListening ? "Stop voice search" : "Start voice search"}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {isListening && (
                  <p className="text-xs text-primary mt-2 animate-pulse">🎤 Listening...</p>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-display text-sm mb-3">Categories</h4>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`block w-full text-left py-2 px-3 font-body text-sm rounded-md transition-all ${selectedCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                    >
                      {cat}
                      {/* Count hidden when searching collections as we filter the current list */}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-display text-sm mb-3">Price Range</h4>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={2000}
                  step={50}
                  className="mb-4"
                />
                <div className="flex items-center justify-between font-body text-sm text-muted-foreground">
                  <span className="px-2 py-1 bg-secondary rounded">${priceRange[0]}</span>
                  <span className="text-xs">to</span>
                  <span className="px-2 py-1 bg-secondary rounded">${priceRange[1]}</span>
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              )}
            </aside>

            {/* Mobile Filters Overlay */}
            <AnimatePresence>
              {showFilters && (
                <motion.aside
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="fixed inset-0 z-50 bg-background p-4 overflow-auto lg:hidden"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5 text-primary" />
                      <h3 className="font-display text-xl">Filters</h3>
                    </div>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-secondary rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="mb-6">
                    <h4 className="font-display text-sm mb-3">Search</h4>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent pl-10 pr-10"
                      />
                      {voiceSupported && (
                        <button
                          type="button"
                          onClick={toggleVoiceSearch}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all ${isListening
                            ? "bg-primary text-primary-foreground animate-pulse"
                            : "text-muted-foreground hover:text-primary"
                            }`}
                          aria-label={isListening ? "Stop voice search" : "Start voice search"}
                        >
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="mb-6">
                    <h4 className="font-display text-sm mb-3">Categories</h4>
                    <div className="space-y-1">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => handleCategoryChange(cat)}
                          className={`block w-full text-left py-2 px-3 font-body text-sm rounded-md transition-all ${selectedCategory === cat
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="font-display text-sm mb-3">Price Range</h4>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={0}
                      max={2000}
                      step={50}
                      className="mb-4"
                    />
                    <div className="flex items-center justify-between font-body text-sm text-muted-foreground">
                      <span className="px-2 py-1 bg-secondary rounded">${priceRange[0]}</span>
                      <span className="text-xs">to</span>
                      <span className="px-2 py-1 bg-secondary rounded">${priceRange[1]}</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2">
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={clearFilters}
                      >
                        Clear All Filters
                      </Button>
                    )}
                    <Button
                      variant="luxury"
                      className="w-full"
                      onClick={() => setShowFilters(false)}
                    >
                      Show {filteredProducts.length} Results
                    </Button>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Product Grid */}
            <div className="flex-1">
              {/* Active Filters Tags */}
              {activeFiltersCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2 mb-4 md:mb-6"
                >
                  {collectionName && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs md:text-sm rounded-full">
                      Collection: {collectionName}
                      <button onClick={() => setSearchParams({})} className="hover:text-primary/70">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedCategory !== "All" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs md:text-sm rounded-full">
                      {selectedCategory}
                      <button onClick={() => handleCategoryChange("All")} className="hover:text-primary/70">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs md:text-sm rounded-full">
                      "{searchQuery}"
                      <button onClick={() => setSearchQuery("")} className="hover:text-primary/70">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {(priceRange[0] > 0 || priceRange[1] < 2000) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs md:text-sm rounded-full">
                      ${priceRange[0]} - ${priceRange[1]}
                      <button onClick={() => setPriceRange([0, 2000])} className="hover:text-primary/70">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </motion.div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <motion.div
                  layout
                  className={`grid gap-3 sm:gap-4 md:gap-6 lg:gap-8 ${gridView
                    ? "grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-2"
                    }`}
                >
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <ProductCard product={product} index={index} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 md:py-16"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-secondary flex items-center justify-center">
                    <Search className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
                  </div>
                  <p className="font-display text-xl md:text-2xl text-foreground mb-3 md:mb-4">No products found</p>
                  <p className="font-body text-sm md:text-base text-muted-foreground mb-6">
                    {collectionName
                      ? "This collection is currently empty"
                      : "Try adjusting your filters or search query"
                    }
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BackToTop />
      <FloatingContactButton />
    </>
  );
};

export default Shop;

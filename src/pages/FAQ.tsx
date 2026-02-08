import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import FloatingContactButton from "@/components/FloatingContactButton";
import {
  ChevronDown, Search, HelpCircle, Package, RefreshCw, CreditCard,
  Shield, Truck, MessageCircle, Mail, Phone, Clock, CheckCircle2,
  Star, Sparkles, ArrowRight, BookOpen, Users, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

interface FAQItem {
  q: string;
  a: string;
  popular?: boolean;
}

interface FAQCategory {
  category: string;
  icon: React.ElementType;
  color: string;
  questions: FAQItem[];
}

// Data will be fetched from API

const quickLinks = [
  { label: "Shipping Policy", path: "/shipping-policy", icon: Truck },
  { label: "Privacy Policy", path: "/privacy", icon: Shield },
  { label: "Terms of Service", path: "/terms", icon: BookOpen },
  { label: "Contact Us", path: "/contact", icon: MessageCircle },
];

const FAQ = () => {
  const [faqData, setFaqData] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await api.faqs.getGrouped();
        if (res.success) {
          const groupedData = Object.entries(res.data).map(([category, questions]) => {
            const catInfo = getCategoryInfo(category);
            return {
              category,
              icon: catInfo.icon,
              color: catInfo.color,
              questions: (questions as any[]).map(q => ({
                q: q.question,
                a: q.answer,
                popular: Boolean(q.popular)
              }))
            };
          });
          setFaqData(groupedData);
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case "Orders & Shipping":
        return { icon: Package, color: "from-blue-500 to-cyan-500" };
      case "Returns & Exchanges":
        return { icon: RefreshCw, color: "from-green-500 to-emerald-500" };
      case "Products & Care":
        return { icon: Sparkles, color: "from-purple-500 to-pink-500" };
      case "Account & Pricing":
        return { icon: CreditCard, color: "from-orange-500 to-red-500" };
      default:
        return { icon: HelpCircle, color: "from-gray-500 to-slate-500" };
    }
  };

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter FAQs based on search and category
  const filteredFAQData = faqData
    .map((category) => ({
      ...category,
      questions: category.questions.filter((q) => {
        const matchesSearch =
          searchQuery === "" ||
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === null || category.category === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    }))
    .filter((category) => category.questions.length > 0);

  // Get popular questions
  const popularQuestions = faqData
    .flatMap((cat) =>
      cat.questions
        .filter((q) => q.popular)
        .map((q) => ({ ...q, category: cat.category, icon: cat.icon, color: cat.color }))
    )
    .slice(0, 3);

  return (
    <>
      <Header />
      <main className="pt-20 md:pt-24 min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-secondary/50 via-background to-secondary/30 overflow-hidden">
          {/* Animated Background Pattern */}
          <motion.div
            className="absolute inset-0 opacity-5"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              backgroundImage:
                "radial-gradient(circle at center, hsl(var(--primary)) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />

          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6"
              >
                <HelpCircle className="w-4 h-4 text-primary" />
                <span className="font-accent text-xs tracking-[0.3em] text-primary uppercase">
                  Help Center
                </span>
              </motion.div>

              {/* Title */}
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 tracking-tight">
                How Can We{" "}
                <span className="text-primary relative inline-block">
                  Help You?
                  <motion.span
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/30"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                </span>
              </h1>

              <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                Find answers to common questions about orders, shipping, returns, and more.
                Can't find what you're looking for? Our support team is here to help!
              </p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-2xl mx-auto relative"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-background border-2 border-border rounded-2xl focus:outline-none focus:border-primary transition-all shadow-lg font-body text-foreground placeholder:text-muted-foreground"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕
                  </button>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Popular Questions */}
        {searchQuery === "" && selectedCategory === null && (
          <section className="py-12 md:py-16 border-b border-border">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <div className="inline-flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-primary fill-primary" />
                  <h2 className="font-display text-2xl md:text-3xl text-foreground">
                    Popular Questions
                  </h2>
                  <Star className="w-5 h-5 text-primary fill-primary" />
                </div>
                <p className="text-muted-foreground font-body">
                  Most frequently asked by our customers
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {popularQuestions.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group relative bg-gradient-to-br from-background to-secondary/30 border border-border rounded-2xl p-6 hover:border-primary/50 transition-all shadow-lg hover:shadow-xl"
                  >
                    <div
                      className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-10 rounded-bl-full`}
                    />
                    <item.icon className="w-8 h-8 text-primary mb-4 relative z-10" />
                    <h3 className="font-body font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {item.q}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {item.a}
                    </p>
                    <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Read more <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Category Filter */}
        <section className="py-8 border-b border-border sticky top-16 md:top-20 bg-background/95 backdrop-blur-sm z-30">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(null)}
                className={`px-5 py-2.5 rounded-full font-body text-sm font-medium transition-all ${selectedCategory === null
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-secondary/50 text-foreground hover:bg-secondary"
                  }`}
              >
                All Topics
              </motion.button>
              {faqData.map((category, idx) => (
                <motion.button
                  key={category.category}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.category)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm font-medium transition-all ${selectedCategory === category.category
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary/50 text-foreground hover:bg-secondary"
                    }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.category}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-body text-muted-foreground animate-pulse tracking-wide italic">Loading amazing answers...</p>
              </div>
            ) : filteredFAQData.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-display text-2xl text-foreground mb-3">
                  No results found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or browse all categories
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </motion.div>
            ) : (
              filteredFAQData.map((category, catIndex) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: catIndex * 0.1 }}
                  className="mb-16 last:mb-0"
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}
                    >
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl md:text-3xl text-foreground">
                        {category.category}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {category.questions.length} question
                        {category.questions.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-4">
                    {category.questions.map((item, qIndex) => {
                      const key = `${catIndex}-${qIndex}`;
                      const isOpen = openItems[key];
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: qIndex * 0.05 }}
                          className="group bg-background border-2 border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all shadow-sm hover:shadow-lg"
                        >
                          <button
                            onClick={() => toggleItem(key)}
                            className="w-full flex items-start justify-between p-6 text-left transition-colors"
                          >
                            <div className="flex-1 pr-4">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0 mt-0.5`}
                                >
                                  <HelpCircle className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <span className="font-body font-bold text-foreground group-hover:text-primary transition-colors block mb-1">
                                    {item.q}
                                  </span>
                                  {item.popular && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
                                      <Star className="w-3 h-3 fill-current" />
                                      Popular
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex-shrink-0"
                            >
                              <ChevronDown className="w-6 h-6 text-primary" />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="px-6 pb-6 pl-[4.5rem]">
                                  <div className="bg-secondary/30 rounded-xl p-5 border-l-4 border-primary">
                                    <p className="font-body text-muted-foreground leading-relaxed">
                                      {item.a}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 bg-secondary/30 border-y border-border">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="font-display text-2xl md:text-3xl text-foreground mb-2">
                Quick Links
              </h2>
              <p className="text-muted-foreground font-body">
                More information you might need
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {quickLinks.map((link, idx) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className="group flex items-center gap-3 p-4 bg-background border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <link.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-body font-medium text-foreground group-hover:text-primary transition-colors">
                      {link.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-primary/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-gradient-to-br from-background to-secondary/30 border-2 border-primary/20 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -ml-32 -mb-32" />

                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>

                  <h3 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                    Still Have Questions?
                  </h3>
                  <p className="font-body text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Our dedicated customer support team is here to help you. Reach out via email,
                    phone, or live chat for personalized assistance.
                  </p>

                  <div className="grid sm:grid-cols-3 gap-4 mb-8">
                    <motion.a
                      href="mailto:support@rumibymanisha.com"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-2 p-4 bg-background/50 border border-border rounded-xl hover:border-primary/50 transition-all"
                    >
                      <Mail className="w-6 h-6 text-primary" />
                      <span className="text-sm font-body font-medium text-foreground">
                        Email Us
                      </span>
                      <span className="text-xs text-muted-foreground">24h response</span>
                    </motion.a>

                    <motion.a
                      href="tel:+1234567890"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-2 p-4 bg-background/50 border border-border rounded-xl hover:border-primary/50 transition-all"
                    >
                      <Phone className="w-6 h-6 text-primary" />
                      <span className="text-sm font-body font-medium text-foreground">
                        Call Us
                      </span>
                      <span className="text-xs text-muted-foreground">Mon-Sat 9-6</span>
                    </motion.a>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex flex-col items-center gap-2 p-4 bg-background/50 border border-border rounded-xl"
                    >
                      <Clock className="w-6 h-6 text-primary" />
                      <span className="text-sm font-body font-medium text-foreground">
                        Live Chat
                      </span>
                      <span className="text-xs text-muted-foreground">Instant help</span>
                    </motion.div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      asChild
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                    >
                      <Link to="/contact">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Contact Support
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <a href="mailto:support@rumibymanisha.com">
                        <Mail className="w-5 h-5 mr-2" />
                        Send Email
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
      <FloatingContactButton />
    </>
  );
};

export default FAQ;

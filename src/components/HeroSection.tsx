import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[85vh] mt-[105px] md:mt-[155px] flex items-center justify-center overflow-hidden bg-background">
      {/* Video Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-110"
          poster="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=2070&auto=format&fit=crop"
        >
          <source
            src="https://videos.pexels.com/video-files/13554030/13554030-uhd_2560_1440_24fps.mp4"
            type="video/mp4"
          />
        </video>

        {/* Composite Overlay for Ultimate Text Clarity */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60" />
      </div>

      {/* Grid Pattern Texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNjNGI1YTAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-10 z-10 pointer-events-none" />

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-1/4 -left-32 w-64 h-64 border border-primary rounded-full"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
        className="absolute bottom-1/4 -right-32 w-96 h-96 border border-primary rounded-full"
      />

      {/* Content Container */}
      <div className="container mx-auto px-4 py-24 text-center relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-accent text-lg md:text-xl tracking-[0.5em] text-white/90 mb-6 drop-shadow-lg"
          >
            CURATED ELEGANCE
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-display text-5xl md:text-7xl lg:text-9xl font-medium text-white mb-8 leading-[1.05] drop-shadow-2xl"
          >
            Timeless
            <br />
            <span className="italic font-light">Tradition</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="font-body text-base md:text-xl text-white/80 max-w-2xl mx-auto mb-12 tracking-wide leading-relaxed drop-shadow-lg"
          >
            Discover our handcrafted collection of ethnic wear, where ancient artistry meets contemporary luxury.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button asChild variant="hero" size="xl" className="min-w-[220px] bg-white text-black hover:bg-white/90 shadow-xl transition-all hover:scale-105">
              <Link to="/shop">Explore Collection</Link>
            </Button>
            <Button asChild variant="hero-outline" size="xl" className="min-w-[220px] border-white text-white hover:bg-white/10 shadow-lg transition-all hover:scale-105">
              <Link to="/about">Our Story</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        onClick={scrollToContent}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/60 hover:text-white transition-colors z-20"
        aria-label="Scroll down"
      >
        <span className="font-body text-xs tracking-[0.3em] uppercase font-medium">Explore More</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.button>
    </section>
  );
};

export default HeroSection;

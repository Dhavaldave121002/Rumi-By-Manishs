import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import BrandStory from "@/components/BrandStory";
import InstagramFeed from "@/components/InstagramFeed";
import Preloader from "@/components/Preloader";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <AnimatePresence>
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        <Header />
        <main>
          <HeroSection />
          <CategorySection />
          <FeaturedProducts />
          <BrandStory />
          <InstagramFeed />
        </main>
        <Footer />
      </motion.div>
    </>
  );
};

export default Index;

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import BrandStory from "@/components/BrandStory";
import InstagramFeed from "@/components/InstagramFeed";

const Index = () => {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <CategorySection />
        <FeaturedProducts />
        <BrandStory />
        <InstagramFeed />
      </main>
      <Footer />
    </>
  );
};

export default Index;

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface Banner {
  id: number;
  image: string;
}

// Banners optimized for the new professional high-quality images
const banners: Banner[] = [
  { id: 1, image: "/banners/banner1.jpg" },
  { id: 2, image: "/banners/banner2.jpg" },
  { id: 3, image: "/banners/banner3.jpg" },
  { id: 4, image: "/banners/banner4.jpg" },
  { id: 5, image: "/banners/banner5.jpg" },
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Set this to 'true' as we are using graphic banners with integrated text
  const isTextInImage = true;

  const bannerText = [
    {
      title: "RUMI BY MANISHA",
      subtitle: "ISHQ IN EVERY THREAD",
      description: "Discover luxury ethnic wear crafted with love and tradition."
    },
    {
      title: "ROYAL HERITAGE",
      subtitle: "BRIDAL COLLECTION",
      description: "Timeless elegance for your most special moments."
    },
    {
      title: "MODERN MINIMALISM",
      subtitle: "CONTEMPORARY SAREES",
      description: "Where tradition meets modern sophistication."
    },
    {
      title: "CRAFTED WITH SOUL",
      subtitle: "HAND-WOVEN LUXURY",
      description: "Experience the magic of authentic craftsmanship."
    },
    {
      title: "ETHEREAL RADIANCE",
      subtitle: "FESTIVE EDIT",
      description: "Shine bright in our latest collection of vibrant silhouettes."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 7000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <section className="relative w-full h-[85vh] md:h-screen overflow-hidden bg-black">
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", duration: 1, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.8 },
            }}
            className="absolute inset-0 w-full h-full"
          >
            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, ease: "linear" }}
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${banners[currentIndex].image})` }}
            >
              <div className="absolute inset-0 bg-black/10" />

              {/* Luxury Text Overlay - Only shows if isTextInImage is false */}
              {!isTextInImage && (
                <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="max-w-4xl"
                  >
                    <p className="font-accent text-sm md:text-base tracking-[0.4em] text-white/90 mb-4 uppercase">
                      {bannerText[currentIndex].subtitle}
                    </p>
                    <h2 className="font-display text-4xl md:text-7xl lg:text-8xl text-white mb-6 tracking-tight font-medium">
                      {bannerText[currentIndex].title}
                    </h2>
                    <p className="font-body text-sm md:text-lg text-white/80 max-w-xl mx-auto mb-8">
                      {bannerText[currentIndex].description}
                    </p>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Luxury Navigation Indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className="group py-4 px-2"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div
                className={`h-[2px] transition-all duration-700 ${currentIndex === index ? "w-12 bg-primary" : "w-4 bg-white/30 group-hover:bg-white/60"
                  }`}
              />
            </button>
          ))}
        </div>

        {/* Floating Controls */}
        <div className="absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-4 md:px-12 pointer-events-none">
          <button
            onClick={handlePrev}
            className="p-3 border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all pointer-events-auto backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="p-3 border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all pointer-events-auto backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

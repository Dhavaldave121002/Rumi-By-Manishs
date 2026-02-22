import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface Banner {
  id: number;
  image: string;
}

// Banners rearranged to put the most professional "Integrated" ones first
const banners: Banner[] = [
  { id: 1, image: "/banners/img_69861a37516b8.png" }, // Festive Integrated Final
  { id: 2, image: "/banners/img_698619b87157d.png" }, // Branding Integrated 2
  { id: 3, image: "/banners/img_6981ca938c037.png" },
  { id: 4, image: "/banners/img_6981c814db111.png" },
  { id: 5, image: "/banners/img_6981c3d5ae1f1.png" },
  { id: 6, image: "/banners/img_6981c4f2ada7f.png" },
  { id: 7, image: "/banners/img_6981c390b21b8.png" },
  { id: 8, image: "/banners/img_6981c783bfdfc.png" },
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

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
              <div className="absolute inset-0 bg-black/5" />
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

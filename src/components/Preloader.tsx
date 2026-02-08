import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Delay showing content for smooth entrance
    const contentTimer = setTimeout(() => setShowContent(true), 200);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        // Accelerate as we get closer to completion
        const increment = prev < 70 ? 2 : prev < 90 ? 3 : 5;
        return Math.min(prev + increment, 100);
      });
    }, 40);

    return () => {
      clearInterval(timer);
      clearTimeout(contentTimer);
    };
  }, [onComplete]);

  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.6,
        ease: "easeOut" as const,
      },
    }),
  };

  const brandName = "RUMI";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-hidden"
      >
        {/* Animated Background Gradient */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"
        />

        {/* Floating Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top Left Circle */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.2 }}
            transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
            className="absolute -top-20 -left-20 w-40 h-40 md:w-64 md:h-64 border border-primary/30 rounded-full"
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ delay: 0.7, duration: 1.5, ease: "easeOut" }}
            className="absolute -top-10 -left-10 w-32 h-32 md:w-48 md:h-48 border border-primary/20 rounded-full"
          />

          {/* Bottom Right Circle */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.2 }}
            transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
            className="absolute -bottom-20 -right-20 w-48 h-48 md:w-72 md:h-72 border border-primary/30 rounded-full"
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
            className="absolute -bottom-10 -right-10 w-36 h-36 md:w-56 md:h-56 border border-primary/20 rounded-full"
          />

          {/* Floating Dots */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100 }}
              animate={{
                opacity: [0, 0.4, 0],
                y: [-20, -100],
              }}
              transition={{
                delay: i * 0.3,
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute w-1 h-1 md:w-2 md:h-2 bg-primary rounded-full"
              style={{
                left: `${20 + i * 12}%`,
                bottom: "10%",
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative z-10 text-center px-4"
            >
              {/* Brand Logo Animation */}
              <div className="mb-6 md:mb-8">
                <div className="flex justify-center items-center overflow-hidden">
                  {brandName.split("").map((letter, i) => (
                    <motion.span
                      key={i}
                      custom={i}
                      variants={letterVariants}
                      initial="hidden"
                      animate="visible"
                      className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-widest text-foreground inline-block"
                      style={{ textShadow: "0 0 40px rgba(var(--primary), 0.3)" }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>

                {/* Tagline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="mt-3 md:mt-4"
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
                    className="w-16 md:w-24 h-[1px] bg-primary/50 mx-auto mb-3 md:mb-4"
                  />
                  <p className="font-accent text-base md:text-lg lg:text-xl tracking-[0.25em] md:tracking-[0.3em] text-muted-foreground">
                    by Manisha
                  </p>
                </motion.div>
              </div>

              {/* Progress Container */}
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "100%" }}
                transition={{ duration: 0.8, delay: 1 }}
                className="max-w-[200px] md:max-w-[280px] mx-auto"
              >
                {/* Progress Bar Background */}
                <div className="relative h-[2px] bg-border overflow-hidden rounded-full">
                  {/* Progress Fill */}
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-primary/70"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                  
                  {/* Shimmer Effect */}
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </div>

                {/* Progress Text */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="flex items-center justify-center gap-2 mt-4 md:mt-6"
                >
                  <span className="font-body text-xs md:text-sm tracking-[0.15em] md:tracking-[0.2em] text-muted-foreground">
                    {progress < 100 ? "LOADING" : "WELCOME"}
                  </span>
                  <span className="font-body text-xs md:text-sm tracking-wider text-foreground font-medium">
                    {progress}%
                  </span>
                </motion.div>

                {/* Loading Dots Animation */}
                {progress < 100 && (
                  <div className="flex justify-center gap-1 mt-4">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                        className="w-1 h-1 md:w-1.5 md:h-1.5 bg-primary rounded-full"
                      />
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Elegant Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: progress >= 50 ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="font-accent text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] text-muted-foreground/70 mt-8 md:mt-12"
              >
                TIMELESS ELEGANCE • HANDCRAFTED HERITAGE
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default Preloader;

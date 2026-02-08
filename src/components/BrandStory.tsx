import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const BrandStory = () => {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80"
                alt="Our Atelier"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Decorative Frame */}
            <div className="absolute -top-4 -left-4 w-full h-full border border-primary/30 -z-10" />
            <div className="absolute -bottom-4 -right-4 w-full h-full border border-primary/30 -z-10" />
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="font-accent text-sm tracking-[0.3em] text-primary mb-4">OUR STORY</p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-8 leading-tight">
              Crafting Dreams,
              <br />
              <span className="italic">One Thread at a Time</span>
            </h2>
            <div className="space-y-6 text-muted-foreground font-body leading-relaxed">
              <p>
                Born from a passion for preserving India's rich textile heritage, Rumi by Manisha 
                brings together centuries-old craftsmanship with contemporary design sensibilities.
              </p>
              <p>
                Each piece in our collection is meticulously handcrafted by skilled artisans, 
                ensuring that the traditions passed down through generations continue to thrive 
                in the modern world.
              </p>
              <p>
                From the vibrant streets of Jaipur to the silk looms of Varanasi, we source 
                only the finest materials to create garments that tell stories of culture, 
                artistry, and timeless beauty.
              </p>
            </div>
            <div className="mt-10">
              <Button asChild variant="luxury" size="lg">
                <Link to="/about">Discover More</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;

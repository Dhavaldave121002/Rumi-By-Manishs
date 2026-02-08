import { motion } from "framer-motion";

const images = [
  "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80",
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80",
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80",
  "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80",
  "https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?w=400&q=80",
];

const InstagramFeed = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="font-accent text-sm tracking-[0.3em] text-primary mb-4">FOLLOW US</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">@rumibymanisha</h2>
          <p className="font-body text-muted-foreground">Join our community for daily inspiration</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {images.map((image, index) => (
            <motion.a
              key={index}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="relative group aspect-square overflow-hidden"
            >
              <img
                src={image}
                alt={`Instagram post ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300 flex items-center justify-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="text-background text-2xl"
                >
                  ♥
                </motion.span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;

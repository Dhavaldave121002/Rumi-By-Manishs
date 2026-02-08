import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
  const milestones = [
    { year: "2015", title: "The Beginning", description: "Founded with a vision to preserve traditional Indian textiles" },
    { year: "2017", title: "First Boutique", description: "Opened our flagship store in Mumbai" },
    { year: "2019", title: "Going Global", description: "Expanded to international shipping across 30+ countries" },
    { year: "2022", title: "Artisan Network", description: "Partnered with over 500 skilled artisans across India" },
    { year: "2024", title: "Digital Evolution", description: "Launched our enhanced online shopping experience" },
  ];

  const values = [
    { title: "Craftsmanship", description: "Every piece is handcrafted by skilled artisans using traditional techniques" },
    { title: "Sustainability", description: "We use eco-friendly materials and support ethical production practices" },
    { title: "Heritage", description: "Preserving India's rich textile traditions for future generations" },
    { title: "Quality", description: "Only the finest fabrics and materials make it into our collections" },
  ];

  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-24 bg-secondary/30 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <p className="font-accent text-sm tracking-[0.3em] text-primary mb-4">ABOUT US</p>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
                  A Legacy of
                  <br />
                  <span className="italic">Elegance</span>
                </h1>
                <p className="font-body text-muted-foreground leading-relaxed mb-8">
                  Rumi by Manisha is more than a fashion brand—it's a celebration of India's rich textile heritage. 
                  Founded by Manisha Kaushik in 2015, our journey began with a simple mission: to bring the 
                  exquisite craftsmanship of Indian artisans to the global stage.
                </p>
                <Button asChild variant="luxury" size="lg">
                  <Link to="/shop">Explore Collections</Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80"
                    alt="Founder"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 w-48 h-48 border border-primary/30" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <p className="font-accent text-sm tracking-[0.3em] text-primary mb-4">OUR STORY</p>
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-8">
                Where Tradition Meets Contemporary
              </h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                What started as a small atelier in Mumbai has grown into a beloved brand that connects 
                discerning customers worldwide with the finest Indian ethnic wear. Each piece in our 
                collection tells a story—of skilled hands that weave magic into fabric, of traditions 
                passed down through generations, and of timeless beauty that transcends borders.
              </p>
            </motion.div>

            {/* Timeline */}
            <div className="max-w-4xl mx-auto">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex items-center gap-8 mb-8 ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "text-right" : "text-left"}`}>
                    <span className="font-display text-3xl text-primary">{milestone.year}</span>
                    <h3 className="font-display text-xl text-foreground mt-2">{milestone.title}</h3>
                    <p className="font-body text-sm text-muted-foreground mt-1">{milestone.description}</p>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <p className="font-accent text-sm tracking-[0.3em] text-primary mb-4">OUR VALUES</p>
              <h2 className="font-display text-4xl md:text-5xl text-foreground">What We Stand For</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-background p-8 text-center shadow-card hover:shadow-elegant transition-shadow duration-300"
                >
                  <h3 className="font-display text-xl text-foreground mb-4">{value.title}</h3>
                  <p className="font-body text-sm text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <p className="font-accent text-sm tracking-[0.3em] text-primary mb-4">OUR FOUNDER</p>
              <h2 className="font-display text-4xl md:text-5xl text-foreground">Meet Manisha</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80"
                  alt="Manisha - Founder"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-display text-2xl text-foreground mb-2">Manisha Kaushik</h3>
                <p className="font-accent text-primary mb-6">Founder & Creative Director</p>
                <p className="font-body text-muted-foreground leading-relaxed mb-4">
                  With a background in fashion design from NIFT and over 15 years of experience 
                  in the textile industry, Manisha brings both expertise and passion to every collection.
                </p>
                <p className="font-body text-muted-foreground leading-relaxed">
                  "My vision has always been to create pieces that make every woman feel like royalty, 
                  while ensuring our artisans receive the recognition and support they deserve."
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default About;

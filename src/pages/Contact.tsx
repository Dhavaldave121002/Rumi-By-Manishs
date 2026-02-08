import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import FloatingContactButton from "@/components/FloatingContactButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15),
  inquiryType: z.string().min(1, "Please select an inquiry type"),
  subject: z.string().trim().min(2, "Subject is required").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
});

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "",
    subject: "",
    message: "",
    preferredDate: "",
    preferredTime: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      contactSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await api.inquiries.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        inquiry_type: formData.inquiryType.toLowerCase().replace(/\s+/g, '_'),
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime
      });

      if (res.success) {
        toast.success("Your inquiry has been submitted successfully! We'll get back to you within 24 hours.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          inquiryType: "",
          subject: "",
          message: "",
          preferredDate: "",
          preferredTime: "",
        });
      } else {
        toast.error(res.error || "Failed to submit inquiry. Please try again.");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Boutique",
      details: ["123 Fashion Street, Linking Road", "Mumbai, Maharashtra 400001", "India"],
    },
    {
      icon: Phone,
      title: "Call Us Anytime",
      details: ["+91 123 456 7890", "+1 (416) 555-0123 (Canada)"],
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["hello@rumibymanisha.com", "support@rumibymanisha.com"],
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: ["Monday - Saturday: 10AM - 8PM IST", "Sunday: 12PM - 6PM IST"],
    },
  ];

  const inquiryTypes = [
    "General Inquiry",
    "Product Question",
    "Bridal Consultation",
    "Custom Design Request",
    "Order Status",
    "Alteration Services",
    "Bulk/Wholesale Order",
    "Partnership Inquiry",
  ];

  const timeSlots = [
    "10:00 AM", "11:00 AM", "12:00 PM",
    "2:00 PM", "3:00 PM", "4:00 PM",
    "5:00 PM", "6:00 PM",
  ];

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const showDateTimeFields = formData.inquiryType === "Bridal Consultation" ||
    formData.inquiryType === "Custom Design Request";

  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen bg-background">
        {/* Hero */}
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="font-accent text-sm tracking-[0.3em] text-primary mb-4">GET IN TOUCH</p>
              <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">Contact Us</h1>
              <p className="font-body text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
                We'd love to hear from you. Reach out for personalized styling advice, custom orders,
                bridal consultations, or any inquiries about our exclusive ethnic wear collections.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-12 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-16">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-2 order-2 lg:order-1"
              >
                <h2 className="font-display text-xl md:text-2xl text-foreground mb-6 md:mb-8">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block font-body text-sm text-muted-foreground mb-2">
                        Full Name *
                      </label>
                      <Input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className={`bg-transparent ${errors.name ? "border-destructive" : ""}`}
                        placeholder="Enter your full name"
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive mt-1">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block font-body text-sm text-muted-foreground mb-2">
                        Email Address *
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`bg-transparent ${errors.email ? "border-destructive" : ""}`}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block font-body text-sm text-muted-foreground mb-2">
                        Phone Number *
                      </label>
                      <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`bg-transparent ${errors.phone ? "border-destructive" : ""}`}
                        placeholder="+91 123 456 7890"
                      />
                      {errors.phone && (
                        <p className="text-xs text-destructive mt-1">{errors.phone}</p>
                      )}
                    </div>
                    <div>
                      <label className="block font-body text-sm text-muted-foreground mb-2">
                        Inquiry Type *
                      </label>
                      <Select
                        value={formData.inquiryType}
                        onValueChange={(v) => handleSelectChange("inquiryType", v)}
                      >
                        <SelectTrigger className={`bg-transparent ${errors.inquiryType ? "border-destructive" : ""}`}>
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          {inquiryTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.inquiryType && (
                        <p className="text-xs text-destructive mt-1">{errors.inquiryType}</p>
                      )}
                    </div>
                  </div>

                  {/* Show date/time fields for consultation requests */}
                  {showDateTimeFields && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
                    >
                      <div>
                        <label className="block font-body text-sm text-muted-foreground mb-2">
                          Preferred Date (optional)
                        </label>
                        <Input
                          name="preferredDate"
                          type="date"
                          min={getMinDate()}
                          value={formData.preferredDate}
                          onChange={handleChange}
                          className="bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="block font-body text-sm text-muted-foreground mb-2">
                          Preferred Time (optional)
                        </label>
                        <Select
                          value={formData.preferredTime}
                          onValueChange={(v) => handleSelectChange("preferredTime", v)}
                        >
                          <SelectTrigger className="bg-transparent">
                            <SelectValue placeholder="Select a time slot" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label className="block font-body text-sm text-muted-foreground mb-2">
                      Subject *
                    </label>
                    <Input
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`bg-transparent ${errors.subject ? "border-destructive" : ""}`}
                      placeholder="Brief subject of your inquiry"
                    />
                    {errors.subject && (
                      <p className="text-xs text-destructive mt-1">{errors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-body text-sm text-muted-foreground mb-2">
                      Message *
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={`bg-transparent min-h-[120px] md:min-h-[150px] ${errors.message ? "border-destructive" : ""}`}
                      placeholder="Tell us about your requirements, occasion, preferences, budget range, etc."
                    />
                    {errors.message && (
                      <p className="text-xs text-destructive mt-1">{errors.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="luxury"
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="order-1 lg:order-2"
              >
                <h2 className="font-display text-xl md:text-2xl text-foreground mb-6 md:mb-8">Contact Information</h2>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 md:gap-8">
                  {contactInfo.map((info) => (
                    <div key={info.title} className="flex flex-col md:flex-row gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-sm md:text-lg text-foreground mb-1 md:mb-2">{info.title}</h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="font-body text-xs md:text-sm text-muted-foreground">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="h-64 md:h-96 bg-secondary/50 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <MapPin className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-4" />
              <p className="font-display text-lg md:text-xl text-foreground mb-2">Visit Our Flagship Boutique</p>
              <p className="font-body text-sm md:text-base text-muted-foreground">123 Fashion Street, Linking Road, Mumbai</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
      <FloatingContactButton />
    </>
  );
};

export default Contact;

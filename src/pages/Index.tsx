import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import TabNavigation from "@/components/TabNavigation";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <TabNavigation className="py-20" />
      
      {/* Contact Section */}
      <section className="py-20 px-6 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Get In Touch
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a project in mind or want to collaborate? I'd love to hear from you!
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;

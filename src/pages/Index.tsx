import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import TabNavigation from "@/components/TabNavigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <TabNavigation className="py-20" />
    </div>
  );
};

export default Index;

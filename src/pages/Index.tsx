import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ProjectGrid from "@/components/ProjectGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <ProjectGrid />
    </div>
  );
};

export default Index;

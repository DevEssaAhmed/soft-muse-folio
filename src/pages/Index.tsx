import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import RecentProjects from "@/components/home/RecentProjects";
import RecentArticles from "@/components/home/RecentArticles";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <RecentProjects />
      <RecentArticles />
    </div>
  );
};

export default Index;

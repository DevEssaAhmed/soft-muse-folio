import Navigation from "@/components/Navigation";
import ProjectGrid from "@/components/ProjectGrid";

const ProjectsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              My Projects
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A collection of data analysis and machine learning projects showcasing various techniques and technologies
            </p>
          </div>
        </div>
        <ProjectGrid />
      </div>
    </div>
  );
};

export default ProjectsPage;
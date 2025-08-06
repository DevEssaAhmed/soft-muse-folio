import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ProjectCard from "./ProjectCard";
import { supabase } from "@/integrations/supabase/client";

const categories = ["All", "Data Analysis", "Visualization", "Machine Learning", "Reporting"];

const dummyProjects = [
  {
    id: 1,
    title: "E-commerce Sales Dashboard",
    description: "Interactive Tableau dashboard analyzing 3 years of sales data with predictive insights. Identified key revenue drivers and seasonal patterns, resulting in 15% increase in targeted marketing ROI.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    tags: ["Tableau", "SQL", "Python", "Statistics"],
    category: "Visualization",
    demoUrl: "#",
    githubUrl: "#",
    views: 1245,
    likes: 89,
    comments: 12
  },
  {
    id: 2,
    title: "Customer Churn Prediction",
    description: "Machine learning model predicting customer churn with 89% accuracy. Built using Random Forest and XGBoost algorithms, deployed with automated reporting system.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    tags: ["Python", "Scikit-learn", "Pandas", "ML"],
    category: "Machine Learning",
    demoUrl: "#",
    githubUrl: "#",
    views: 2156,
    likes: 134,
    comments: 23
  },
  {
    id: 3,
    title: "Financial Risk Assessment",
    description: "Comprehensive risk analysis for investment portfolio using Monte Carlo simulations. Created automated reporting system with real-time market data integration.",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=400&fit=crop",
    tags: ["R", "Monte Carlo", "Finance", "Statistics"],
    category: "Data Analysis",
    demoUrl: "#",
    views: 967,
    likes: 67,
    comments: 8
  },
  {
    id: 4,
    title: "Social Media Analytics",
    description: "Real-time social media sentiment analysis tracking brand perception across platforms. Implemented NLP algorithms for automated sentiment scoring.",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop",
    tags: ["Python", "NLP", "API", "Sentiment Analysis"],
    category: "Data Analysis",
    githubUrl: "#",
    views: 1578,
    likes: 98,
    comments: 15
  },
  {
    id: 5,
    title: "Supply Chain Optimization",
    description: "Data-driven supply chain analysis reducing costs by 22%. Optimized inventory levels and supplier relationships using advanced analytics and forecasting models.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop",
    tags: ["Excel", "Power BI", "Forecasting", "Operations"],
    category: "Reporting",
    demoUrl: "#",
    views: 834,
    likes: 45,
    comments: 6
  },
  {
    id: 6,
    title: "Healthcare Data Insights",
    description: "Analysis of patient outcomes and treatment effectiveness. Built interactive visualizations helping healthcare providers make data-driven treatment decisions.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop",
    tags: ["R", "ggplot2", "Healthcare", "Statistics"],
    category: "Visualization",
    demoUrl: "#",
    githubUrl: "#",
    views: 1423,
    likes: 112,
    comments: 19
  }
];

const ProjectGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const filteredProjects = selectedCategory === "All" 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Featured Projects
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore my data analysis projects showcasing various techniques from visualization to machine learning
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-up delay-200">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-gradient-primary shadow-soft scale-105"
                  : "hover:bg-primary/5 hover:border-primary/30"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Projects grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-up delay-300">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProjectCard
                id={project.id}
                title={project.title}
                description={project.description}
                image={project.image_url || "/placeholder.svg"}
                tags={project.tags || []}
                category={project.category}
                demoUrl={project.demo_url}
                githubUrl={project.github_url}
                views={project.views || 0}
                likes={project.likes || 0}
                comments={project.comments || 0}
              />
            </div>
          ))}
        </div>

        {/* Load more button */}
        <div className="text-center mt-12 animate-fade-up delay-500">
          <Button 
            variant="outline" 
            size="lg"
            className="hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
          >
            Load More Projects
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProjectGrid;
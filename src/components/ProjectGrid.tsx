import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ProjectCard from "./ProjectCard";
import { supabase } from "@/integrations/supabase/client";

const ProjectGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState(["All"]);

  useEffect(() => {
    fetchProjects();
  }, []);

  // const fetchProjects = async () => {
  //   try {
  //     // const { data } = await supabase
  //     //   .from("projects")
  //     //   .select("*")
  //     //   .order("created_at", { ascending: false });
  //          const { data } = await supabase
  // .from("projects")
  // .select("*, categories(name)")
  // .order("created_at", { ascending: false })
  





  //     if (data) {
  //       setProjects(data);
        
  //       // Extract unique categories dynamically - we'll fetch from categories table now
  //       const { data: categoriesData } = await supabase
  //         .from('categories')
  //         .select('name')
  //         .order('name');
  //       const categoryNames = categoriesData?.map(cat => cat.name) || [];
  //       setCategories(["All", ...categoryNames]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching projects:", error);
  //   }
  // };
const fetchProjects = async () => {
  try {
    const { data } = await supabase
      .from("projects")
      .select(`
        *,
        categories(name),
        projects_tags (
          tags (
            name
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (data) {
      setProjects(data);

      // Extract unique categories dynamically from categories table
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("name")
        .order("name");

      const categoryNames = categoriesData?.map((cat) => cat.name) || [];
      setCategories(["All", ...categoryNames]);
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
};s



  const filteredProjects = selectedCategory === "All" 
    ? projects 
    : projects.filter(project => {
        // Since projects now use category_id, we need to fetch the category name
        // For now, filter by category_id existence
        return project.category_id || false;
      });

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
                category={project.categories?.name|| "Uncategorized"}
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
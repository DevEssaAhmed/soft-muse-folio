import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  User, 
  Save, 
  Upload,
  X,
  Plus,
  Link,
  MapPin,
  Mail,
  Github,
  Linkedin,
  Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  title: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  github_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  website_url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileManagePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profile, setProfile] = useState(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      username: "",
      title: "",
      bio: "",
      location: "",
      email: "",
      github_url: "",
      linkedin_url: "",
      website_url: "",
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // First try to get all profiles and use the most recent one
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      // Use the first (most recent) profile if available
      const profileData = data && data.length > 0 ? data[0] : null;

      if (profileData) {
        setProfile(profileData);
        setValue("name", profileData.name || "");
        setValue("username", profileData.username || "");
        setValue("title", profileData.title || "");
        setValue("bio", profileData.bio || "");
        setValue("location", profileData.location || "");
        setValue("email", profileData.email || "");
        setValue("github_url", profileData.github_url || "");
        setValue("linkedin_url", profileData.linkedin_url || "");
        setValue("website_url", profileData.website_url || "");
        setSkills(profileData.skills || []);
        setAvatarUrl(profileData.avatar_url || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Error loading profile data");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const updateData = {
        ...data,
        skills: skills,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = profile 
        ? await supabase
            .from("profile")
            .update(updateData)
            .eq("id", profile.id)
        : await supabase
            .from("profile")
            .insert([updateData]);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      navigate("/admin");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navigation />
        <div className="pt-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/admin")}
              className="mb-6 hover:shadow-soft transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
            
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Profile Management
            </h1>
            <p className="text-lg text-muted-foreground">
              Update your personal information and portfolio details
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Avatar Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarUrl} alt="Profile" />
                    <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                      {watch("name")?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" className="hover:shadow-soft transition-all duration-300">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </Button>
                    </Label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Recommended: Square image, at least 256x256px
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Alex Chen"
                      className="mt-2"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      {...register("username")}
                      placeholder="alex_chen_data"
                      className="mt-2"
                    />
                    {errors.username && (
                      <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="title">Professional Title</Label>
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="Senior Data Analyst"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      {...register("location")}
                      placeholder="San Francisco, CA"
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      {...register("bio")}
                      placeholder="Tell visitors about yourself..."
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle>Contact & Social</CardTitle>
                <CardDescription>
                  Your contact details and social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    {...register("email")}
                    type="email"
                    placeholder="alex@example.com"
                    className="mt-2"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="website_url">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Website
                  </Label>
                  <Input
                    id="website_url"
                    {...register("website_url")}
                    placeholder="https://yourwebsite.com"
                    className="mt-2"
                  />
                  {errors.website_url && (
                    <p className="text-red-500 text-sm mt-1">{errors.website_url.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="github_url">
                    <Github className="w-4 h-4 inline mr-1" />
                    GitHub
                  </Label>
                  <Input
                    id="github_url"
                    {...register("github_url")}
                    placeholder="https://github.com/username"
                    className="mt-2"
                  />
                  {errors.github_url && (
                    <p className="text-red-500 text-sm mt-1">{errors.github_url.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="linkedin_url">
                    <Linkedin className="w-4 h-4 inline mr-1" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin_url"
                    {...register("linkedin_url")}
                    placeholder="https://linkedin.com/in/username"
                    className="mt-2"
                  />
                  {errors.linkedin_url && (
                    <p className="text-red-500 text-sm mt-1">{errors.linkedin_url.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle>Skills & Technologies</CardTitle>
                <CardDescription>
                  Add the skills and technologies you work with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addSkill}
                    variant="outline"
                    className="hover:shadow-soft transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="px-3 py-1 cursor-pointer group hover:bg-destructive/10 transition-colors"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill}
                      <X className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={saving}
                size="lg"
                className="bg-gradient-primary hover:shadow-soft transition-all duration-300"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagePage;
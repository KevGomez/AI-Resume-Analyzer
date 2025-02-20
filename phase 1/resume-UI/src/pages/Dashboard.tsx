import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { resumeService, Resume } from "../services/resumeService";
import { Loading } from "../components/common/Loading";
import {
  DocumentTextIcon,
  TrashIcon,
  ChartBarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { ApplicantFilter } from "../components/dashboard/ApplicantFilter";

interface SkillDistribution {
  [category: string]: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillDistribution, setSkillDistribution] = useState<SkillDistribution>(
    {}
  );

  // Add formatSkillCategory function
  const formatSkillCategory = (category: string): string => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Check authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load resumes and calculate skill distribution
  useEffect(() => {
    const loadResumes = async () => {
      try {
        setIsLoading(true);
        const loadedResumes = await resumeService.getResumes();
        setResumes(loadedResumes);

        // Calculate skill distribution from all resumes
        const distribution: SkillDistribution = {};
        for (const resume of loadedResumes) {
          try {
            const skillsData = await resumeService.getResumeSkills(resume.id);
            if (skillsData && skillsData.skills) {
              Object.entries(skillsData.skills).forEach(
                ([category, skillList]) => {
                  if (Array.isArray(skillList)) {
                    distribution[category] =
                      (distribution[category] || 0) + skillList.length;
                  }
                }
              );
            }
          } catch (error) {
            console.error(
              `Error loading skills for resume ${resume.id}:`,
              error
            );
          }
        }
        setSkillDistribution(distribution);
      } catch (err) {
        console.error("Error loading resumes:", err);
        if (err instanceof Error && err.message.includes("401")) {
          navigate("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load resumes");
      } finally {
        setIsLoading(false);
      }
    };

    loadResumes();
  }, [navigate]);

  const handleDeleteResume = async (resumeId: number) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) {
      return;
    }

    try {
      await resumeService.deleteResume(resumeId);
      setResumes((prevResumes) => prevResumes.filter((r) => r.id !== resumeId));

      // Recalculate skill distribution
      const distribution: SkillDistribution = {};
      for (const resume of resumes.filter((r) => r.id !== resumeId)) {
        try {
          const skillsData = await resumeService.getResumeSkills(resume.id);
          if (skillsData && skillsData.skills) {
            Object.entries(skillsData.skills).forEach(
              ([category, skillList]) => {
                if (Array.isArray(skillList)) {
                  distribution[category] =
                    (distribution[category] || 0) + skillList.length;
                }
              }
            );
          }
        } catch (error) {
          console.error(`Error loading skills for resume ${resume.id}:`, error);
        }
      }
      setSkillDistribution(distribution);
    } catch (err) {
      console.error("Error deleting resume:", err);
      setError(err instanceof Error ? err.message : "Failed to delete resume");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skills Distribution */}
        <div className="bg-dark-300/30 backdrop-blur-sm rounded-lg p-8 border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex items-center gap-2 mb-6">
            <ChartBarIcon className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-white">
              Skills Distribution
            </h2>
          </div>
          {Object.entries(skillDistribution).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(skillDistribution).map(([category, count]) => (
                <div key={category} className="bg-dark-200/40 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-white/80">
                      {formatSkillCategory(category)}
                    </h3>
                    <span className="text-sm text-primary-400">
                      {count} skills
                    </span>
                  </div>
                  <div className="w-full bg-dark-100/30 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (count /
                            Math.max(...Object.values(skillDistribution))) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/70">No skills data available</p>
              <button
                onClick={() => navigate("/upload")}
                className="mt-4 px-4 py-2 text-sm text-white/90 hover:text-white bg-primary-500/20 hover:bg-primary-500/30 rounded-lg transition-colors duration-200"
              >
                Upload Resume
              </button>
            </div>
          )}
        </div>

        {/* Resume Management */}
        <div className="bg-dark-300/30 backdrop-blur-sm rounded-lg p-8 border border-white/10 hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-white">
                Resume Management
              </h2>
            </div>
            <button
              onClick={() => navigate("/upload")}
              className="px-4 py-2 text-sm text-white/90 hover:text-white bg-primary-500/20 hover:bg-primary-500/30 rounded-lg transition-colors duration-200"
            >
              Upload New
            </button>
          </div>
          {resumes.length > 0 ? (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="bg-dark-200/40 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <DocumentTextIcon className="w-5 h-5 text-primary-400" />
                      <div>
                        <h3 className="text-sm font-medium text-white truncate">
                          {resume.filename}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <ClockIcon className="w-4 h-4 text-white/50" />
                          <span className="text-xs text-white/50">
                            {format(
                              new Date(resume.created_at),
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <button
                      onClick={() => navigate(`/analysis?id=${resume.id}`)}
                      className="px-3 py-1.5 text-sm text-white/90 hover:text-white bg-primary-500/20 hover:bg-primary-500/30 rounded-lg transition-colors duration-200"
                    >
                      View Analysis
                    </button>
                    <button
                      onClick={() => handleDeleteResume(resume.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/70">No resumes uploaded yet</p>
              <button
                onClick={() => navigate("/upload")}
                className="mt-4 px-4 py-2 text-sm text-white/90 hover:text-white bg-primary-500/20 hover:bg-primary-500/30 rounded-lg transition-colors duration-200"
              >
                Upload Resume
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Applicant Filter Section */}
      <div className="border border-white/10 hover:border-white/20 transition-colors rounded-lg overflow-hidden">
        <ApplicantFilter />
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from "react";
import {
  ChartBarIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  SparklesIcon,
  BeakerIcon,
  RocketLaunchIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { resumeService } from "../../services/resumeService";
import { Loading } from "../common/Loading";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  ScatterChart,
  Scatter,
  Cell,
} from "recharts";

interface FilterCriteria {
  skills: string[];
  education_levels: string[];
  min_experience: number | null;
  max_experience: number | null;
}

interface FilteredResume {
  id: number;
  filename: string;
  created_at: string;
  years_of_experience: number;
  education_level: string;
  skills: {
    [category: string]: string[];
  };
  education: {
    degree: string;
    field: string;
    institution: string;
    graduation_year: number;
    gpa: number;
  }[];
}

interface JobRecommendation {
  title: string;
  matchScore: number;
  keySkills: string[];
  experienceLevel: string;
  description: string;
}

export const ApplicantFilter = () => {
  const [filters, setFilters] = useState<FilterCriteria>({
    skills: [],
    education_levels: [],
    min_experience: null,
    max_experience: null,
  });
  const [results, setResults] = useState<FilteredResume[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState("");

  const educationLevels = [
    "High School",
    "Associate's",
    "Bachelor's",
    "Master's",
    "PhD",
  ];

  const handleSkillAdd = () => {
    if (skillInput.trim() && !filters.skills.includes(skillInput.trim())) {
      setFilters((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const handleSkillRemove = (skill: string) => {
    setFilters((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleEducationToggle = (level: string) => {
    setFilters((prev) => ({
      ...prev,
      education_levels: prev.education_levels.includes(level)
        ? prev.education_levels.filter((l) => l !== level)
        : [...prev.education_levels, level],
    }));
  };

  const clearFilters = () => {
    setFilters({
      skills: [],
      education_levels: [],
      min_experience: null,
      max_experience: null,
    });
    setSkillInput("");
    setResults([]);
  };

  const applyFilters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Applying filters with criteria:", filters);
      const response = await resumeService.filterResumes(filters);
      console.log("Filter response:", response);
      setResults(response.resumes);
    } catch (err) {
      console.error("Error applying filters:", err);
      setError(err instanceof Error ? err.message : "Failed to apply filters");
    } finally {
      setIsLoading(false);
    }
  };

  const prepareChartData = (results: FilteredResume[]) => {
    // Prepare bubble chart data (Experience vs Skills)
    const bubbleData = results.map((resume) => ({
      name: resume.filename,
      experience: resume.years_of_experience,
      skills: Object.values(resume.skills).flat().length,
      education: resume.education_level,
    }));

    // Prepare skills trend data
    const skillsCount: { [key: string]: number } = {};
    results.forEach((resume) => {
      Object.entries(resume.skills).forEach(([category, skills]) => {
        skills.forEach((skill) => {
          skillsCount[skill] = (skillsCount[skill] || 0) + 1;
        });
      });
    });

    const skillsTrendData = Object.entries(skillsCount)
      .map(([skill, count]) => ({
        skill,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Prepare heatmap data
    const heatmapData = results.map((resume) => {
      const skillCategories = Object.entries(resume.skills).reduce(
        (acc, [category, skills]) => ({
          ...acc,
          [category]: skills.length,
        }),
        {}
      );
      return {
        name: resume.filename,
        ...skillCategories,
      };
    });

    return { bubbleData, skillsTrendData, heatmapData };
  };

  // Prepare data for charts
  const chartData = results
    .map((resume) => ({
      name:
        resume.filename.length > 20
          ? resume.filename.substring(0, 17) + "..."
          : resume.filename,
      experience: resume.years_of_experience,
      skills: Object.values(resume.skills).flat().length,
      education: resume.education_level,
    }))
    .sort((a, b) => a.experience - b.experience); // Sort by experience

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-dark-300/90 border border-white/10 rounded-lg p-3 shadow-lg">
          <p className="text-white/90 text-sm font-medium mb-2">{label}</p>
          <p className="text-primary-400 text-sm">
            {payload[0].name}: {payload[0].value}{" "}
            {payload[0].name === "Years" ? "years" : "skills"}
          </p>
          <p className="text-white/70 text-xs mt-1">
            Education: {payload[0].payload.education}
          </p>
        </div>
      );
    }
    return null;
  };

  const generateJobRecommendations = (
    resume: FilteredResume[]
  ): JobRecommendation[] => {
    // This is a simplified logic for job recommendations
    // In a real application, this would involve more sophisticated matching algorithms
    const allSkills = new Set<string>();
    const experienceLevels = new Set<string>();

    resume.forEach((r) => {
      Object.values(r.skills).forEach((skillArray) => {
        skillArray.forEach((skill) => allSkills.add(skill.toLowerCase()));
      });
      experienceLevels.add(r.education_level);
    });

    const avgExperience =
      resume.reduce((acc, r) => acc + r.years_of_experience, 0) / resume.length;

    const recommendations: JobRecommendation[] = [
      {
        title: "Software Engineer",
        matchScore: 95,
        keySkills: ["Python", "JavaScript", "React", "Node.js"],
        experienceLevel:
          avgExperience < 3
            ? "Junior"
            : avgExperience < 7
            ? "Mid-Level"
            : "Senior",
        description:
          "Development of web applications and software systems using modern technologies.",
      },
      {
        title: "Data Scientist",
        matchScore: 88,
        keySkills: ["Python", "Machine Learning", "SQL", "Data Analysis"],
        experienceLevel:
          avgExperience < 3
            ? "Junior"
            : avgExperience < 7
            ? "Mid-Level"
            : "Senior",
        description:
          "Analysis of complex data sets to drive business decisions and insights.",
      },
      {
        title: "DevOps Engineer",
        matchScore: 85,
        keySkills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
        experienceLevel:
          avgExperience < 3
            ? "Junior"
            : avgExperience < 7
            ? "Mid-Level"
            : "Senior",
        description:
          "Management and automation of development and deployment processes.",
      },
      {
        title: "Full Stack Developer",
        matchScore: 92,
        keySkills: ["JavaScript", "React", "Node.js", "MongoDB"],
        experienceLevel:
          avgExperience < 3
            ? "Junior"
            : avgExperience < 7
            ? "Mid-Level"
            : "Senior",
        description: "End-to-end development of web applications and services.",
      },
      {
        title: "Machine Learning Engineer",
        matchScore: 82,
        keySkills: ["Python", "TensorFlow", "PyTorch", "Computer Vision"],
        experienceLevel:
          avgExperience < 3
            ? "Junior"
            : avgExperience < 7
            ? "Mid-Level"
            : "Senior",
        description:
          "Development and deployment of machine learning models and systems.",
      },
    ];

    return recommendations;
  };

  return (
    <div className="bg-tertiary shadow-sm border border-white/10 rounded-lg p-8">
      <div className="flex items-center gap-2 mb-6">
        <ChartBarIcon className="w-5 h-5 text-primary-500" />
        <h2 className="text-lg font-semibold text-primary">
          Advanced Applicant Filter
        </h2>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Skills Filter */}
        <div className="space-y-4 bg-background p-4 rounded-lg border border-white/10 shadow-sm">
          <h3 className="text-sm font-medium text-primary">Skills</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSkillAdd()}
              placeholder="Add a skill..."
              className="w-full bg-tertiary border border-border-color rounded-lg px-4 py-2 text-primary placeholder-secondary focus:outline-none focus:border-primary-500/50"
            />
            <button
              onClick={handleSkillAdd}
              className="w-full px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-primary-500/20 text-primary text-sm rounded-full flex items-center gap-2"
              >
                {skill}
                <button
                  onClick={() => handleSkillRemove(skill)}
                  className="text-secondary hover:text-primary"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Education Filter */}
        <div className="space-y-4 bg-background p-4 rounded-lg border border-white/10 shadow-sm">
          <h3 className="text-sm font-medium text-primary">Education Level</h3>
          <div className="flex flex-wrap gap-2">
            {educationLevels.map((level) => (
              <button
                key={level}
                onClick={() => handleEducationToggle(level)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  filters.education_levels.includes(level)
                    ? "bg-primary-500 text-white"
                    : "bg-tertiary text-secondary hover:text-primary hover:bg-primary-500/10"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Filter */}
        <div className="space-y-4 bg-background p-4 rounded-lg border border-white/10 shadow-sm">
          <h3 className="text-sm font-medium text-primary">
            Years of Experience
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-secondary text-sm">Min</label>
              <input
                type="number"
                min="0"
                value={filters.min_experience || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    min_experience: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
                className="w-full mt-1 bg-tertiary border border-border-color rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-primary-500/50"
              />
            </div>
            <div>
              <label className="text-secondary text-sm">Max</label>
              <input
                type="number"
                min="0"
                value={filters.max_experience || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    max_experience: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
                className="w-full mt-1 bg-tertiary border border-border-color rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-primary-500/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Apply Filters Button */}
      <div className="flex justify-end gap-4 mb-8">
        <button
          onClick={clearFilters}
          className="px-6 py-2 bg-tertiary text-secondary hover:text-primary rounded-lg hover:bg-primary-500/10 transition-colors border border-border-color"
        >
          Clear Filters
        </button>
        <button
          onClick={applyFilters}
          disabled={isLoading}
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Applying..." : "Apply Filters"}
        </button>
      </div>

      {/* Results Visualization */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loading size="lg" text="Applying filters..." />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-8">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Experience vs Skills Bubble Chart */}
            <div className="bg-tertiary rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <RocketLaunchIcon className="w-5 h-5 text-primary-400" />
                <h3 className="text-sm font-medium text-primary">
                  Experience vs Skills Distribution
                </h3>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border-color)"
                    />
                    <XAxis
                      type="number"
                      dataKey="experience"
                      name="Years of Experience"
                      stroke="var(--text-secondary)"
                      label={{
                        value: "Years of Experience",
                        position: "bottom",
                        fill: "var(--text-secondary)",
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="skills"
                      name="Number of Skills"
                      stroke="var(--text-secondary)"
                      label={{
                        value: "Number of Skills",
                        angle: -90,
                        position: "left",
                        fill: "var(--text-secondary)",
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-tertiary border border-white/10 rounded-lg p-3 shadow-lg">
                              <p className="text-primary text-sm font-medium mb-1">
                                {data.name}
                              </p>
                              <p className="text-primary-400 text-sm">
                                Experience: {data.experience} years
                              </p>
                              <p className="text-accent-400 text-sm">
                                Skills: {data.skills}
                              </p>
                              <p className="text-secondary text-xs mt-1">
                                Education: {data.education}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter
                      data={prepareChartData(results).bubbleData}
                      fill="var(--primary-color)"
                    >
                      {prepareChartData(results).bubbleData.map(
                        (entry, index) => (
                          <Cell
                            key={index}
                            fill={
                              entry.education.includes("Master") ||
                              entry.education.includes("PhD")
                                ? "var(--accent-color)"
                                : "var(--primary-color)"
                            }
                          />
                        )
                      )}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Industry Skills Trends */}
            <div className="bg-tertiary rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-primary-400" />
                <h3 className="text-sm font-medium text-primary">
                  Top Industry Skills Trends
                </h3>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareChartData(results).skillsTrendData}
                    layout="vertical"
                    margin={{ top: 20, right: 20, bottom: 20, left: 100 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border-color)"
                    />
                    <XAxis type="number" stroke="var(--text-secondary)" />
                    <YAxis
                      dataKey="skill"
                      type="category"
                      stroke="var(--text-secondary)"
                      tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-tertiary border border-white/10 rounded-lg p-3 shadow-lg">
                              <p className="text-primary text-sm font-medium">
                                {data.skill}
                              </p>
                              <p className="text-primary-400 text-sm">
                                Appears in {data.count}{" "}
                                {data.count === 1 ? "resume" : "resumes"}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="var(--primary-color)"
                      background={{ fill: "var(--bg-tertiary)" }}
                    >
                      {prepareChartData(results).skillsTrendData.map(
                        (entry, index) => (
                          <Cell
                            key={index}
                            fill={`var(--primary-color)`}
                            opacity={1 - index * 0.07}
                          />
                        )
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Replace the Resume Skills Distribution Heatmap with Job Recommendations */}
          <div className="bg-tertiary rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <BuildingOfficeIcon className="w-5 h-5 text-primary-400" />
              <h3 className="text-sm font-medium text-primary">
                Job Recommendations
              </h3>
            </div>
            <div className="space-y-4">
              {results.length > 0 &&
                generateJobRecommendations(results).map((job, index) => (
                  <div
                    key={index}
                    className="bg-background border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-primary font-medium">
                          {job.title}
                        </h4>
                        <p className="text-secondary text-sm">
                          {job.experienceLevel} Level
                        </p>
                      </div>
                      <div className="bg-primary-500/20 px-3 py-1 rounded-full">
                        <span className="text-primary-400 text-sm">
                          {job.matchScore}% Match
                        </span>
                      </div>
                    </div>
                    <p className="text-secondary text-sm mb-3">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.keySkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-primary-500/10 text-primary-400 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Total Matches Summary */}
          <div className="bg-tertiary rounded-lg p-4">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-primary-400" />
              <h3 className="text-sm font-medium text-primary">
                Total Matches
              </h3>
            </div>
            <p className="text-2xl font-semibold text-primary mt-2">
              {results.length} resumes
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-white/70">No results match your filters</p>
        </div>
      )}
    </div>
  );
};

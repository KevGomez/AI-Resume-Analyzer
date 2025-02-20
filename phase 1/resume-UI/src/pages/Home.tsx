import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="text-center max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[500px] h-[500px] bg-gradient-to-r from-primary-500/30 to-accent-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative space-y-6 py-12">
          <h1 className="text-5xl font-display font-bold">
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 text-transparent bg-clip-text">
              Welcome to Resume Analyzer
            </span>
          </h1>

          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Transform your resume with AI-powered insights. Get detailed
            analysis and recommendations to make your resume stand out.
          </p>

          <div className="flex items-center justify-center space-x-6 pt-8">
            <Link
              to="/upload"
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-primary-500/25"
            >
              Upload Resume
            </Link>
            <Link
              to="/analysis"
              className="px-8 py-3 rounded-lg bg-dark-200 text-white font-semibold hover:bg-dark-300 border border-white/10 backdrop-blur-sm transform hover:scale-105 transition-all duration-200"
            >
              View Analysis
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: "AI-Powered Analysis",
            description:
              "Advanced machine learning algorithms analyze your resume for optimal results",
          },
          {
            title: "Instant Feedback",
            description:
              "Get immediate insights and suggestions to improve your resume",
          },
          {
            title: "Industry Standards",
            description:
              "Recommendations based on current industry best practices",
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="p-6 rounded-xl backdrop-blur-sm bg-dark-300/30 border border-white/10 hover:border-primary-500/50 transition-all duration-300 hover:transform hover:-translate-y-1"
          >
            <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-primary-400 to-accent-400 text-transparent bg-clip-text">
              {feature.title}
            </h3>
            <p className="text-white/70">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;

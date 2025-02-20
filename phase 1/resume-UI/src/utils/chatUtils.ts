// Response formatting utilities
const formatSection = (title: string, content: string[] | string): string => {
  const formattedContent = Array.isArray(content)
    ? content.map((item) => `• ${item}`).join("\n")
    : content;
  return `${title}\n${formattedContent}\n`;
};

const formatList = (items: string[]): string => {
  return items.map((item) => `• ${item}`).join("\n");
};

const formatSteps = (steps: { title: string; items: string[] }[]): string => {
  return steps
    .map((step, index) => {
      const items = step.items.map((item) => `   • ${item}`).join("\n");
      return `${index + 1}. ${step.title}\n${items}`;
    })
    .join("\n\n");
};

export const DEFAULT_RESPONSES = {
  WHAT_IS_THIS: `🤖 AI Resume Assistant

${formatSection("About Me:", [
  "I am an advanced AI tool designed to transform your job search and career development journey",
  "I combine resume analysis with personalized career guidance",
  "I help optimize your professional profile using AI-powered insights",
])}

${formatSection("My Core Functions:", [
  "Analyze resumes with advanced AI technology",
  "Extract and evaluate skills, experience, and qualifications",
  "Provide personalized job recommendations",
  "Offer career guidance and development insights",
  "Help with resume optimization",
])}

${formatSection("How I Can Help You:", [
  "Upload & analyze your resume for instant insights",
  "Get personalized job recommendations",
  "Receive resume improvement suggestions",
  "Explore career development opportunities",
  "Access industry trends and insights",
])}

Ready to get started? Try asking me:
• "How do I upload my resume?"
• "What features do you offer?"
• "Can you analyze my resume?"
• "Show me job recommendations"`,

  FEATURES: `🌟 Available Features

${formatSection("📊 Resume Analysis:", [
  "Smart PDF/DOCX parsing and data extraction",
  "Comprehensive skill identification and categorization",
  "Experience level evaluation",
  "Education and qualification assessment",
  "Automated resume scoring",
])}

${formatSection("💼 Career Development:", [
  "Personalized job recommendations",
  "Skills gap analysis with market demands",
  "Career progression pathways",
  "Industry trend insights",
  "Salary range information",
])}

${formatSection("🔍 Advanced Search & Filtering:", [
  "Multi-criteria resume matching",
  "Skills-based candidate filtering",
  "Education level matching",
  "Experience-based filtering",
  "Keyword-based search",
])}

${formatSection("🤝 Interactive Support:", [
  "Real-time resume feedback",
  "Personalized career guidance",
  "Interview preparation assistance",
  "Skill development recommendations",
  "Job market insights",
])}

Would you like to explore any of these features in detail? Just ask!`,

  HOW_TO_USE: `📱 Quick Start Guide

${formatSteps([
  {
    title: "Resume Upload",
    items: [
      "Navigate to the Upload section",
      "Drag & drop your resume file",
      "Supported formats: PDF, DOCX",
      "Wait for automatic analysis",
    ],
  },
  {
    title: "View Analysis",
    items: [
      "Review extracted skills and experience",
      "Check qualification assessment",
      "View skill categorization",
      "Access initial insights",
    ],
  },
  {
    title: "Explore Opportunities",
    items: [
      "Check job recommendations",
      "Use Advanced Applicant Filter",
      "View skills distribution",
      "Analyze market trends",
    ],
  },
  {
    title: "Get Guidance",
    items: [
      "Ask specific questions about your resume",
      "Request career advice",
      "Get improvement suggestions",
      "Explore job opportunities",
    ],
  },
])}

${formatSection("💡 Pro Tips:", [
  "Keep your resume updated regularly",
  "Use the chat feature for specific questions",
  "Check job recommendations weekly",
  "Review all AI suggestions carefully",
])}

Need help with a specific step? Just ask!`,

  OUT_OF_SCOPE: `⚠️ Scope Limitation Notice

${formatSection("✅ I Can Help With:", [
  "Resume analysis and optimization",
  "Career guidance and planning",
  "Job search strategies",
  "Skills assessment and development",
  "Interview preparation",
  "Industry insights",
  "Professional development",
])}

${formatSection("❌ Outside My Scope:", [
  "Non-career related topics",
  "Personal matters",
  "Technical support",
  "General conversation",
  "Non-professional advice",
])}

Please feel free to ask anything related to your professional development!`,

  ERROR: `❌ Error Processing Request

${formatSection("Troubleshooting Steps:", [
  "Try rephrasing your question",
  "Be more specific about your needs",
  "Ensure your question is resume/career related",
  "Check if you're asking about available features",
])}

${formatSection("Need Help?", "Type 'help' to see what I can do for you!")}`,

  GREETING: `👋 Welcome to AI Resume Assistant!

${formatSection("I'm Here to Help With:", [
  "Resume analysis and optimization",
  "Career guidance and planning",
  "Job matching and recommendations",
  "Skills assessment and development",
])}

How may I assist you today? Try asking about:
• Uploading your resume
• Viewing available features
• Getting career advice
• Analyzing your skills`,

  HELP: `🆘 Help Center

${formatSection("📝 Resume Assistance:", [
  '"Analyze my resume"',
  '"How can I improve my resume?"',
  '"What skills should I highlight?"',
  '"Review my work experience"',
])}

${formatSection("💼 Career Guidance:", [
  '"What jobs match my profile?"',
  '"How can I advance my career?"',
  '"What skills are in demand?"',
  '"Suggest career paths"',
])}

${formatSection("📚 Learning & Growth:", [
  '"Recommend certifications"',
  '"How to develop my skills?"',
  '"What technologies should I learn?"',
  '"Suggest training programs"',
])}

Choose a topic or ask a specific question!`,
};

export const isJobOrResumeRelated = (question: string): boolean => {
  const relevantKeywords = [
    "resume",
    "cv",
    "job",
    "career",
    "skill",
    "experience",
    "education",
    "work",
    "employment",
    "interview",
    "position",
    "role",
    "salary",
    "qualification",
    "certification",
    "degree",
    "professional",
    "industry",
    "company",
    "employer",
    "recruitment",
    "hire",
    "application",
  ];

  const questionLower = question.toLowerCase();

  // Check for default queries about the tool itself
  if (
    questionLower.includes("what is this") ||
    questionLower.includes("what can you do") ||
    questionLower.includes("how to use") ||
    questionLower.includes("help me") ||
    questionLower.includes("features")
  ) {
    return true;
  }

  // Check if the question contains any relevant keywords
  return relevantKeywords.some((keyword) => questionLower.includes(keyword));
};

export const getDefaultResponse = (question: string): string | null => {
  const questionLower = question.toLowerCase();

  // Greeting patterns
  if (
    questionLower.match(
      /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening))/
    )
  ) {
    return DEFAULT_RESPONSES.GREETING;
  }

  // What is this / Who are you patterns
  if (
    questionLower.includes("what is this") ||
    questionLower.includes("what are you") ||
    questionLower.includes("who are you") ||
    questionLower.includes("what do you do") ||
    questionLower.includes("what's this") ||
    questionLower.includes("what is this tool") ||
    questionLower.includes("what's this tool")
  ) {
    return DEFAULT_RESPONSES.WHAT_IS_THIS;
  }

  // Features and capabilities patterns
  if (
    questionLower.includes("what can you do") ||
    questionLower.includes("features") ||
    questionLower.includes("capabilities") ||
    questionLower.includes("what are your features") ||
    questionLower.includes("what features") ||
    questionLower.includes("show me what you can do") ||
    questionLower.includes("list features") ||
    questionLower.includes("available features")
  ) {
    return DEFAULT_RESPONSES.FEATURES;
  }

  // Help patterns
  if (
    questionLower.includes("help") ||
    questionLower.includes("assist") ||
    questionLower.includes("guide") ||
    questionLower.includes("support") ||
    questionLower.includes("what should i") ||
    questionLower.includes("how should i") ||
    questionLower.includes("what can i")
  ) {
    return DEFAULT_RESPONSES.HELP;
  }

  // How to use patterns
  if (
    questionLower.includes("how to use") ||
    questionLower.includes("how do i use") ||
    questionLower.includes("help me use") ||
    questionLower.includes("how to start") ||
    questionLower.includes("getting started") ||
    questionLower.includes("begin") ||
    questionLower.includes("tutorial") ||
    questionLower.includes("guide me")
  ) {
    return DEFAULT_RESPONSES.HOW_TO_USE;
  }

  return null;
};

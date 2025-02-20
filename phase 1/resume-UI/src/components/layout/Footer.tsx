import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 backdrop-blur-sm bg-dark-300/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-center text-white/60 text-sm">
          © {new Date().getFullYear()} Resume Analyzer by Kevin Gomez. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-400">404</h1>
        <h2 className="text-2xl font-semibold text-primary mt-4">
          Page Not Found
        </h2>
        <p className="text-secondary mt-2">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 text-sm text-primary bg-primary-500/20 hover:bg-primary-500/30 rounded-lg transition-colors duration-200"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

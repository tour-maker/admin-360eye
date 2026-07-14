import { Link } from "react-router-dom"; // Assuming you're using React Router for navigation

const Error = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary-50 p-6">
      {/* Error Icon */}
      <div className="text-8xl text-error-500 mb-6">⚠️</div>

      {/* Error Message */}
      <h1 className="text-4xl font-semibold text-primary-700 mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-accent-600 mb-8 text-center">
        We're sorry, but the page you're looking for cannot be found or an error
        occurred. Please try again later.
      </p>

      {/* Back to Home Button */}
      <Link
        to="/" // Replace with your home route
        className="bg-primary-500 text-white px-6 py-3 rounded-md hover:bg-primary-600 transition duration-300"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default Error;
import { Button } from "@Components/index";
import { Link, useRouteError } from "react-router-dom";

interface ErrorProps {
  title?: string;
  message?: string;
}

const Error = ({ title, message }: ErrorProps) => {
  const error: any = useRouteError();
  const errorMessage = error?.message || error?.data || error?.statusText || "Something went wrong. Please try again later.";

  return (
    <div className="flex items-center justify-center h-[80vh] ">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center drop-shadow-md max-w-2xl">
        <h1 className="text-6xl font-bold text-red-600 mb-4">
          {title || "Error"}
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          {message || errorMessage}
        </p>
        {error?.stack && (
          <pre className="text-left text-xs text-red-500 overflow-auto p-4 bg-red-50 rounded mb-4 max-h-48">
            {error.stack}
          </pre>
        )}
        <Link to="/" className="">
          <Button variant="ghost" className="ml-4">
            Go to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Error;
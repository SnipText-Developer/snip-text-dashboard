// React
import { useEffect } from "react";

// External

// Local
import { errorRedirect } from "utils/index";

interface ErrorRedirecterProps {
  statusCode: number;
  message: string;
}

const ErrorRedirecter: React.FC<ErrorRedirecterProps> = ({
  statusCode,
  message,
}) => {
  useEffect(() => {
    errorRedirect({ statusCode, message });
  }, [statusCode, message]);

  return null;
};

export default ErrorRedirecter;

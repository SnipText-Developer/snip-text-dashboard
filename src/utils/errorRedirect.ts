// External

// Local
import { errorRedirectUrl } from "config";

const errorRedirect = ({
  statusCode,
  message,
}: {
  statusCode: number;
  message: string;
}) => {
  setTimeout(
    () => {
      window.location?.replace(errorRedirectUrl);
    },
    statusCode === 429 ? 1000 : 0,
  );
};

export { errorRedirect };

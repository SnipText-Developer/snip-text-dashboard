// React

// External

// Local
import "components/Spinner.css";

interface SpinnerProps {}

const Spinner: React.FC<SpinnerProps> = () => {
  return (
    <div className="dot-spinner">
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
    </div>
  );
};

export default Spinner;

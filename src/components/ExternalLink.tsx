// React
import React from "react";

// External

// Local

interface ExternalLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

const ExternalLink: React.FC<ExternalLinkProps> = ({
  href,
  children,
  ...props
}) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
};

export default ExternalLink;

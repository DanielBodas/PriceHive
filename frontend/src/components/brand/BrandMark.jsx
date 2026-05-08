import React from 'react';

const BrandMark = ({ className = "w-8 h-8", ...props }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Hexagonal Hive Base */}
      <path
        d="M12 2L20.6603 7V17L12 22L3.33975 17V7L12 2Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Inner Professional Hive Geometry */}
      <path
        d="M12 6L17.1962 9V15L12 18L6.80385 15V9L12 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Tech/Data Nodes */}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <path d="M12 2V6M12 18V22M3.34 7L6.8 9M17.2 15L20.66 17M3.34 17L6.8 15M17.2 9L20.66 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
};

export default BrandMark;

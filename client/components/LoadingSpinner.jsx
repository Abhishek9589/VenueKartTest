const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-venue-teal border-t-transparent rounded-full animate-spin`}
        style={{
          animation: "spin 1s linear infinite",
        }}
      />
    </div>
  );
};

export default LoadingSpinner;

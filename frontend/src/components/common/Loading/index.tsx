interface LoadingProps {
  login?: string | boolean;
  className?: string;
}

const Loading = ({ className }: LoadingProps) => {
  return (
    <div className={`flex items-center justify-center ${className || ""}`}>
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
    </div>
  );
};

export default Loading;

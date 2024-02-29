const AuthLayoutPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full flex items-center justify-center w-full">
      {children}
    </div>
  );
};

export default AuthLayoutPage;

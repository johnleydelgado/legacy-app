import * as React from "react";

const ApproveLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col w-full">
      <div className="flex flex-1">
        <div className="flex-1">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default ApproveLayout;

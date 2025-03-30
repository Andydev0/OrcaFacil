import React, { ReactNode } from "react";
import SidebarLayout from "./SidebarLayout";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

function PageLayout({ children, title, description }: PageLayoutProps) {
  return (
    <SidebarLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          <div className="py-4">
            {children}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

export default PageLayout;

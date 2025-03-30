import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
  valueClassName?: string;
}

export function DashboardCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
  iconClassName,
  valueClassName,
}: DashboardCardProps) {
  return (
    <Card className={cn("dashboard-card animate-slideInUp", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className={cn("stats-icon gradient-bg text-white", iconClassName)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className={cn("stats-value", valueClassName)}>{value}</div>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  "text-xs font-medium flex items-center",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 01-1 1H9v1a1 1 0 01-2 0V8H6a1 1 0 010-2h1V5a1 1 0 112 0v1h1a1 1 0 011 1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">em relação ao mês anterior</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

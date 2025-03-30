import { createRoot } from "react-dom/client";
import React, { useState, useEffect } from 'react';
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "@/hooks/use-auth";

// Loading screen component that shows before the app is ready
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-secondary-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-secondary-600">Carregando a aplicação...</p>
      </div>
    </div>
  );
}

// Main application with initial loading state
function AppWithProviders() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Ensure DOM is fully loaded before mounting the app
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(<AppWithProviders />);

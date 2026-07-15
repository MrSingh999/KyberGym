import { RouterProvider } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "../providers/ThemeProvider";
import { AuthInitializer } from "../features/auth/providers/AuthInitializer";
import { queryClient } from "../lib/queryClient";
import { router } from "../routes";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="kybergym-theme">
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>
          <RouterProvider router={router} />
          <Toaster position="bottom-right" richColors />
        </AuthInitializer>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

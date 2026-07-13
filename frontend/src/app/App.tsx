import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "../providers/ThemeProvider";
import { AuthInitializer } from "../features/auth/providers/AuthInitializer";
import { router } from "../routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

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

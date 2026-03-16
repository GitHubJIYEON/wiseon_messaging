import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/react";
import { Toaster } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "../ui/tooltip";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>{children}</TooltipProvider>
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster position="bottom-center" />
      </QueryClientProvider>
    </NuqsAdapter>
  );
}

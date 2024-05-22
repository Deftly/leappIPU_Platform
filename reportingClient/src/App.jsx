import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./ui/AppLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<div>Dashboard</div>} />
            <Route path="workflows" element={<div>Workflows</div>} />
            <Route
              path="workflows/:hostname/:txId/stages"
              element={<div>Workflow stages</div>}
            />
            <Route path="hosts" element={<div>Hosts</div>} />
            <Route path="FAQ" element={<div>FAQ</div>} />
          </Route>
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
      {/*TODO: Add <Toaster /> if using react-hot-toast for notifications*/}
    </QueryClientProvider>
  );
};

export default App;

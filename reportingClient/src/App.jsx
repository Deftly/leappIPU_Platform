import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// import Dashboard from "./pages/Dashboard";
import Workflows from "./pages/Workflows";
import Stages from "./pages/Stages";
// import Hosts from "./pages/Hosts";
// import Faq from "./pages/FAQ";
import PageNotFound from "./pages/PageNotFound";
import UnderConstruction from "./pages/UnderConstruction";

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
            {/* <Route index element={<Dashboard />} /> */}
            <Route index element={<UnderConstruction page="Dashboard" />} />
            <Route path="workflows" element={<Workflows />} />
            <Route
              path="workflows/:hostname/:txId/stages"
              element={<Stages />}
            />
            <Route path="hosts" element={<UnderConstruction page="Hosts" />} />
            <Route path="FAQ" element={<UnderConstruction page="FAQ" />} />
            {/* <Route path="hosts" element={<Hosts />} /> */}
            {/* <Route path="FAQ" element={<Faq />} /> */}
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
};

export default App;

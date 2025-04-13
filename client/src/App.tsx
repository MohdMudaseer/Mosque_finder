import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import FindMosques from "@/pages/find-mosques";
import RegisterMosque from "@/pages/register-mosque";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import LoginPage from "@/pages/login"; // Added import for login page
import NotFound from "@/pages/not-found"; // Added import for 404 page
import { useState } from "react";

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter> {/* Added BrowserRouter for react-router-dom */}
        <div className="flex flex-col min-h-screen">
          <Header />
          <MobileNav isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />
          <main className="flex-grow">
            <Routes> {/* Changed to Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} /> {/* Added login route */}
              <Route path="/find-mosques" element={<FindMosques />} />
              <Route path="/register-mosque" element={<RegisterMosque />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/communities/:id" element={<CommunityChat />} />
              <Route path="/create-community" element={<CreateCommunity />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
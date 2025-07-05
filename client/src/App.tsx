import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import RequireAdmin from "@/components/auth/RequireAdmin";
import Home from "@/pages/home";
import FindMosques from "@/pages/find-mosques";
import RegisterMosque from "@/pages/register-mosque";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import NotFound from "@/pages/not-found";
import Communities from "@/pages/communities";
import CommunityChat from "@/pages/community-chat";
import CreateCommunity from "@/pages/create-community";
import PendingMosques from "@/pages/admin/pending-mosques";
import PendingMosqueAdmins from "@/pages/admin/pending-mosque-admins";
import AdminDashboard from "@/pages/admin/dashboard";
import { useState } from "react";

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Header />
          <MobileNav isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/find-mosques" element={<FindMosques />} />
              <Route path="/register-mosque" element={<RegisterMosque />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/communities/:id" element={<CommunityChat />} />
              <Route path="/create-community" element={<CreateCommunity />} />
              <Route path="/admin" element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              } />
              <Route path="/admin/dashboard" element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              } />
              <Route path="/admin/pending-mosques" element={
                <RequireAdmin>
                  <PendingMosques />
                </RequireAdmin>
              } />
              <Route path="/admin/pending-mosque-admins" element={
                <RequireAdmin>
                  <PendingMosqueAdmins />
                </RequireAdmin>
              } />
              <Route path="/admin/pending-mosque-admins" element={
                <RequireAdmin>
                  <PendingMosqueAdmins />
                </RequireAdmin>
              } />
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
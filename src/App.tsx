import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import prLogo from "@/assets/logo-pr-soccer.png";

import Index from "./pages/Index";
import About from "./pages/About";
import Programs from "./pages/Programs";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";

import { AuthProvider } from "@/context/AuthContext";
import { AdminRoute } from "@/components/admin/AdminRoute";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";

const queryClient = new QueryClient();

const SiteHeader = ({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) => (
  <header className="border-b bg-background/80 backdrop-blur">
    <div className="container flex items-center justify-between py-3 md:py-4">
      <a href="/" className="flex items-center gap-3">
        <img
          src={prLogo}
          alt="PR Soccer School logo with Brazilian and American flags"
          className="h-10 w-auto"
        />
        <div className="flex flex-col">
          <span className="text-lg font-semibold tracking-tight">PR Soccer School</span>
          <span className="text-xs font-medium text-muted-foreground">Elite Youth Training</span>
        </div>
      </a>
      <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
        <NavLink
          to="/"
          className="text-muted-foreground transition-colors hover:text-foreground"
          activeClassName="text-foreground"
          end
        >
          Home
        </NavLink>
        <NavLink
          to="/about"
          className="text-muted-foreground transition-colors hover:text-foreground"
          activeClassName="text-foreground"
        >
          About
        </NavLink>
        <NavLink
          to="/programs"
          className="text-muted-foreground transition-colors hover:text-foreground"
          activeClassName="text-foreground"
        >
          Programs
        </NavLink>
        <NavLink
          to="/pricing"
          className="text-muted-foreground transition-colors hover:text-foreground"
          activeClassName="text-foreground"
        >
          Pricing
        </NavLink>
        <NavLink
          to="/gallery"
          className="text-muted-foreground transition-colors hover:text-foreground"
          activeClassName="text-foreground"
        >
          Gallery
        </NavLink>
        <NavLink
          to="/contact"
          className="text-muted-foreground transition-colors hover:text-foreground"
          activeClassName="text-foreground"
        >
          Contact
        </NavLink>
      </nav>
      <div className="flex items-center gap-3">
        <a
          href="tel:+14089089805"
          className="hidden text-xs font-medium text-muted-foreground hover:text-foreground md:inline"
        >
          Call Now
        </a>
        <Button size="sm" className="hidden md:inline-flex" asChild>
          <NavLink to="/contact" className="no-underline">
            Book Trial
          </NavLink>
        </Button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </div>
    {mobileOpen && (
      <div className="border-t bg-background/95 py-3 md:hidden animate-slide-in-right">
        <div className="container flex flex-col gap-2 text-sm font-medium">
          <NavLink
            to="/"
            end
            className="py-1 text-muted-foreground hover:text-foreground"
            activeClassName="text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className="py-1 text-muted-foreground hover:text-foreground"
            activeClassName="text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            About
          </NavLink>
          <NavLink
            to="/programs"
            className="py-1 text-muted-foreground hover:text-foreground"
            activeClassName="text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Programs
          </NavLink>
          <NavLink
            to="/pricing"
            className="py-1 text-muted-foreground hover:text-foreground"
            activeClassName="text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </NavLink>
          <NavLink
            to="/gallery"
            className="py-1 text-muted-foreground hover:text-foreground"
            activeClassName="text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Gallery
          </NavLink>
          <NavLink
            to="/contact"
            className="py-1 text-muted-foreground hover:text-foreground"
            activeClassName="text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            Contact
          </NavLink>
          <Button size="sm" className="mt-2 w-full" asChild>
            <NavLink to="/contact" className="no-underline" onClick={() => setMobileOpen(false)}>
              Book Trial
            </NavLink>
          </Button>
        </div>
      </div>
    )}
  </header>
);

const SiteFooter = () => (
  <footer className="border-t bg-muted/40">
    <div className="container flex flex-col gap-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <img src={prLogo} alt="PR Soccer School logo in footer" className="h-8 w-auto" />
        <p>© {new Date().getFullYear()} PR Soccer School. All rights reserved.</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <span>San Jose, CA</span>
        <a href="mailto:prsoccerschool@outlook.com" className="hover:text-foreground">
          prsoccerschool@outlook.com
        </a>
        <a href="/legal" className="hover:text-foreground">
          Terms & Privacy
        </a>
      </div>
    </div>
  </footer>
);

const WhatsAppFloating = () => (
  <a
    href={
      "https://wa.me/14089089805?text=" +
      encodeURIComponent("Hi, I would like to know more about PR Soccer School programs.")
    }
    className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-2xl ring-2 ring-background/60 transition hover:scale-105 hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/80"
    aria-label="Send a message on WhatsApp to PR Soccer School"
    target="_blank"
    rel="noreferrer"
  >
    <span className="text-xl" aria-hidden="true">
      •
    </span>
    <span>WhatsApp</span>
  </a>
);

const SiteLayout = () => {
  const location = useLocation();
  const isAdmin = useMemo(() => location.pathname.startsWith("/admin"), [location.pathname]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Close mobile nav on route change
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {!isAdmin && <SiteHeader mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />}

      <main className="flex-1">
        <Outlet />
      </main>

      {!isAdmin && <SiteFooter />}
      {!isAdmin && <WhatsAppFloating />}
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route element={<SiteLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/programs" element={<Programs />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/legal" element={<Legal />} />

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

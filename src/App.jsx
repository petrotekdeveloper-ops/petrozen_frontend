import React from "react";
import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import About from "@/pages/about";
import Services from "@/pages/services";
import Certifications from "@/pages/certifications";
import Category from "@/pages/product/category";
import Subcategory from "@/pages/product/subcategory";
import Product from "@/pages/product/product";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";
import NotFound from "@/pages/not-found";

import AdminLogin from "@/pages/admin/login";
import AdminCategories from "@/pages/admin/categories";
import AdminSubCategories from "@/pages/admin/subcategories";
import AdminProducts from "@/pages/admin/products";
import AdminSeo from "@/pages/admin/seo";
import AdminEnquiries from "@/pages/admin/enquiries";
import AdminBrands from "@/pages/admin/brands";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/services" component={Services} />
        <Route path="/certifications" component={Certifications} />
        <Route path="/products/:categoryId/:subcategoryId" component={Product} />
        <Route path="/products/:categoryId" component={Subcategory} />
        <Route path="/products" component={Category} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/categories" component={AdminCategories} />
        <Route path="/admin/subcategories" component={AdminSubCategories} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/enquiries" component={AdminEnquiries} />
        <Route path="/admin/brands" component={AdminBrands} />
        <Route path="/admin/seo" component={AdminSeo} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

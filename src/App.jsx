import React, { Suspense, lazy, useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";

const Home = lazy(() => import("@/pages/home"));
const About = lazy(() => import("@/pages/about"));
const Services = lazy(() => import("@/pages/services"));
const Certifications = lazy(() => import("@/pages/certifications"));
const Category = lazy(() => import("@/pages/product/category"));
const Subcategory = lazy(() => import("@/pages/product/subcategory"));
const Product = lazy(() => import("@/pages/product/product"));
const Contact = lazy(() => import("@/pages/contact"));
const Privacy = lazy(() => import("@/pages/privacy"));
const NotFound = lazy(() => import("@/pages/not-found"));

const AdminLogin = lazy(() => import("@/pages/admin/login"));
const AdminCategories = lazy(() => import("@/pages/admin/categories"));
const AdminSubCategories = lazy(() => import("@/pages/admin/subcategories"));
const AdminProducts = lazy(() => import("@/pages/admin/products"));
const AdminSeo = lazy(() => import("@/pages/admin/seo"));
const AdminEnquiries = lazy(() => import("@/pages/admin/enquiries"));
const AdminChatEnquiries = lazy(() => import("@/pages/admin/chat-enquiries"));
const AdminChatbotProducts = lazy(() => import("@/pages/admin/chat_management/chatbot-products"));
const AdminChatbotQuestions = lazy(() => import("@/pages/admin/chat_management/chatbot-questions"));
const AdminChatbotServiceQuestions = lazy(() => import("@/pages/admin/chat_management/chatbot-service-questions"));
const AdminChatbotQuoteQuestions = lazy(() => import("@/pages/admin/chat_management/chatbot-quote-questions"));
const AdminBrands = lazy(() => import("@/pages/admin/brands"));
const AdminBlogs = lazy(() => import("@/pages/admin/blogs"));
const ChatbotWidget = lazy(() => import("@/components/chatbot/ChatbotWidget"));
const Toaster = lazy(() => import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })));

let gaModulePromise = null;
function getGa() {
  if (!gaModulePromise) {
    gaModulePromise = import("react-ga4").then((m) => m.default);
  }
  return gaModulePromise;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function GA4PageView() {
  const [location] = useLocation();
  useEffect(() => {
    let cancelled = false;
    let retries = 0;

    const send = () => {
      if (cancelled) return;
      if (window.__petrozenGaReady !== true) {
        if (retries < 6) {
          retries += 1;
          window.setTimeout(send, 500);
        }
        return;
      }
      getGa()
        .then((ga) => {
          if (!cancelled) ga.send({ hitType: "pageview", page: location });
        })
        .catch(() => {});
    };

    send();
    return () => {
      cancelled = true;
    };
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <GA4PageView />
      <Suspense fallback={<div className="min-h-[20vh]" />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/services" component={Services} />
          <Route path="/certifications" component={Certifications} />
          <Route path="/products/:categorySlug/:subcategorySlug/:productSlug" component={Product} />
          <Route path="/products/:categorySlug/:subcategorySlug" component={Product} />
          <Route path="/products/:categorySlug" component={Subcategory} />
          <Route path="/products" component={Category} />
          <Route path="/contact" component={Contact} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin/categories" component={AdminCategories} />
          <Route path="/admin/subcategories" component={AdminSubCategories} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/enquiries" component={AdminEnquiries} />
          <Route path="/admin/chat-enquiries" component={AdminChatEnquiries} />
          <Route path="/admin/chatbot-products" component={AdminChatbotProducts} />
          <Route path="/admin/chatbot-questions" component={AdminChatbotQuestions} />
          <Route path="/admin/chatbot-service-questions" component={AdminChatbotServiceQuestions} />
          <Route path="/admin/chatbot-quote-questions" component={AdminChatbotQuoteQuestions} />
          <Route path="/admin/brands" component={AdminBrands} />
          <Route path="/admin/blogs" component={AdminBlogs} />
          <Route path="/admin/seo" component={AdminSeo} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
  );
}

function App() {
  const [loadChatbot, setLoadChatbot] = useState(false);
  const [loadToaster, setLoadToaster] = useState(false);

  useEffect(() => {
    const run = () => {
      setLoadChatbot(true);
      setLoadToaster(true);
    };
    const onFirstInteraction = () => {
      run();
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("scroll", onFirstInteraction);
    };

    window.addEventListener("pointerdown", onFirstInteraction, { passive: true, once: true });
    window.addEventListener("keydown", onFirstInteraction, { once: true });
    window.addEventListener("touchstart", onFirstInteraction, { passive: true, once: true });
    window.addEventListener("scroll", onFirstInteraction, { passive: true, once: true });

    const fallbackTimer = window.setTimeout(run, 8000);
    return () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("scroll", onFirstInteraction);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <>
      {loadToaster ? (
        <Suspense fallback={null}>
          <Toaster />
        </Suspense>
      ) : null}
      <Router />
      {loadChatbot ? (
        <Suspense fallback={null}>
          <ChatbotWidget />
        </Suspense>
      ) : null}
    </>
  );
}

export default App;

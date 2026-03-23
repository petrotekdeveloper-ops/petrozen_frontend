import { useMemo, useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, User, ChevronRight, ChevronLeft, ExternalLink, MessageCirclePlus } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { IMAGES } from "@/lib/images";

// ── API helpers ──────────────────────────────────────────────────────────────

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}

async function getSession(sessionId) {
  const res = await apiClient.get("/api/chat/session", {
    headers: { "X-Chat-Session-Id": sessionId },
  });
  return res.data;
}

async function advanceChat(sessionId, step, answer) {
  const res = await apiClient.post(
    "/api/chat/advance",
    { step, answer },
    { headers: { "X-Chat-Session-Id": sessionId } }
  );
  return res.data;
}

async function submitProductEnquiry(sessionId, payload) {
  const res = await apiClient.post(
    "/api/chat/submit",
    { type: "product", ...payload },
    { headers: { "X-Chat-Session-Id": sessionId } }
  );
  return res.data;
}

async function submitServiceEnquiry(sessionId, payload) {
  const res = await apiClient.post(
    "/api/chat/submit",
    { type: "service", ...payload },
    { headers: { "X-Chat-Session-Id": sessionId } }
  );
  return res.data;
}

// ── Reusable UI components ───────────────────────────────────────────────────

function BotAvatar() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary shadow-sm">
      <img
        src={IMAGES.LOGO_WHITE}
        alt=""
        loading="lazy"
        decoding="async"
        width={64}
        height={64}
        className="h-4 w-4 object-contain"
      />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
      <User className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}

function BotMessage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex items-end gap-2"
    >
      <BotAvatar />
      <div className="max-w-[82%] rounded-2xl rounded-bl-sm border border-border/50 bg-muted/50 px-3.5 py-2.5 text-sm text-foreground shadow-sm">
        {children}
      </div>
    </motion.div>
  );
}

function UserMessage({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex items-end justify-end gap-2"
    >
      <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground shadow-sm">
        {text}
      </div>
      <UserAvatar />
    </motion.div>
  );
}

function BackBtn({ onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex w-full items-center gap-2 rounded-xl border border-border/50 bg-transparent px-3.5 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
    >
      <ChevronLeft className="h-4 w-4 shrink-0" />
      Back
    </motion.button>
  );
}

function ChoiceBtn({ onClick, children, disabled, muted, index = 0 }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || muted}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05, ease: "easeOut" }}
      whileHover={!muted ? { scale: 1.02, x: 2 } : {}}
      whileTap={!muted ? { scale: 0.98 } : {}}
      className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors ${
        muted
          ? "cursor-not-allowed border-primary/30 bg-primary/5 text-primary/60"
          : "border-primary/40 bg-primary/10 text-primary hover:border-primary/60 hover:bg-primary/20"
      }`}
    >
      <span>{children}</span>
      {!muted && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary" />}
    </motion.button>
  );
}

function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-end gap-2"
    >
      <BotAvatar />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border/50 bg-muted/50 px-4 py-3 shadow-sm">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
      </div>
    </motion.div>
  );
}

const MENU_LABELS = {
  quote: "Request a Quote",
  service: "Service",
  operator: "Chat with Operator",
};

// ── Main widget ──────────────────────────────────────────────────────────────

export default function ChatbotWidget() {
  const [location] = useLocation();
  const isAdminRoute = location?.startsWith("/admin");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    apiClient
      .get("/api/chat/visible")
      .then((res) => setVisible(res?.data?.enabled !== false))
      .catch(() => setVisible(false));
  }, []);

  // ── Session / step state ──────────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => createSessionId());
  const [step, setStep] = useState("capture_phone");
  const [flowData, setFlowData] = useState({});

  // ── Data lists ────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // ── Message history ───────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);

  // ── Product custom questions ──────────────────────────────────────────────
  const [productQuestions, setProductQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // ── Service custom questions ──────────────────────────────────────────────
  const [serviceQuestions, setServiceQuestions] = useState([]);
  const [currentServiceQuestion, setCurrentServiceQuestion] = useState(null);

  // ── Quote flow (credentials first, then questions) ────────────────────────
  const [quoteQuestions, setQuoteQuestions] = useState([]);
  const [currentQuoteQuestion, setCurrentQuoteQuestion] = useState(null);

  // ── Shared text input (phone + per-field details) ─────────────────────────
  const [inputValue, setInputValue] = useState("");
  const [detailsStage, setDetailsStage] = useState("name");
  const [collectedDetails, setCollectedDetails] = useState({ name: "", company: "", email: "" });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    }
  }, [messages, open, loading]);

  const mkId = () => `${Date.now()}-${Math.random()}`;

  function pushBot(text) {
    setMessages((prev) => [...prev, { id: mkId(), from: "bot", text }]);
  }

  function pushUser(text) {
    setMessages((prev) => [...prev, { id: mkId(), from: "user", text }]);
  }

  const selectedProduct = useMemo(
    () => products.find((p) => String(p._id) === String(flowData.productId)),
    [products, flowData.productId]
  );

  // ── Open / close ──────────────────────────────────────────────────────────
  function onOpen() {
    const next = !open;
    setOpen(next);
    if (!next) return;
    setTimeout(() => inputRef.current?.focus(), 150);
  }

  // ── Staggered welcome messages (1s after open, then 1s after first) ────────
  const hasShownWelcome = useRef(false);
  useEffect(() => {
    if (!open || hasShownWelcome.current) return;
    hasShownWelcome.current = true;
    const t1 = setTimeout(() => {
      setMessages((prev) => [...prev, { id: `${Date.now()}-1`, from: "bot", text: "Welcome to Petrozen! 👋" }]);
    }, 1000);
    const t2 = setTimeout(() => {
      setMessages((prev) => [...prev, { id: `${Date.now()}-2`, from: "bot", text: "To get started, please enter your phone number below." }]);
    }, 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [open]);

  // ── Phone ─────────────────────────────────────────────────────────────────
  async function handlePhoneSubmit() {
    const phone = inputValue.trim();
    if (!phone || loading) return;
    pushUser(phone);
    setInputValue("");
    setLoading(true);
    try {
      const data = await advanceChat(sessionId, "capture_phone", { phone });
      setStep(data.nextStep);
      setFlowData(data.flowData || {});
      pushBot("Thanks! How can I help you today?");
    } catch (err) {
      pushBot(err?.response?.data?.message || "Invalid phone number. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Main menu ─────────────────────────────────────────────────────────────
  async function chooseMainMenu(choice) {
    if (choice !== "product" && choice !== "service" && choice !== "quote") {
      pushUser(MENU_LABELS[choice] || choice);
      pushBot("This option will be available soon. Please select an option above.");
      return;
    }
    const label = choice === "service" ? "Service" : choice === "quote" ? "Request a Quote" : "Product Information";
    pushUser(label);
    setLoading(true);
    try {
      const next = await advanceChat(sessionId, "main_menu", { choice });
      setStep(next.nextStep);
      setFlowData(next.flowData || {});
      if (choice === "product") {
        const data = await apiClient.get("/api/chat/categories");
        setCategories(data.data.items || []);
        pushBot("Please select a product category:");
      } else if (choice === "quote") {
        setDetailsStage("name");
        setCollectedDetails({ name: "", company: "", email: "" });
        pushBot("I need a few details first.\n\nWhat is your name?");
      } else {
        if (next.nextStep === "service_questions" && next.serviceQuestions?.length > 0) {
          setServiceQuestions(next.serviceQuestions);
          setCurrentServiceQuestion(next.serviceQuestions[0]);
          pushBot(next.serviceQuestions[0].questionText + (next.serviceQuestions[0].required ? "" : " (optional)"));
        } else {
          setDetailsStage("name");
          setCollectedDetails({ name: "", company: "", email: "" });
          pushBot("I need a few details to send your enquiry.\n\nWhat is your name?");
        }
      }
    } catch (err) {
      pushBot(err?.response?.data?.message || "Unable to continue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Category ──────────────────────────────────────────────────────────────
  async function chooseCategory(categoryId, title) {
    pushUser(title);
    setLoading(true);
    try {
      const next = await advanceChat(sessionId, "product_category", { categoryId });
      setStep(next.nextStep);
      setFlowData(next.flowData || {});
      const data = await apiClient.get("/api/chat/subcategories", { params: { categoryId } });
      setSubCategories(data.data.items || []);
      pushBot("Now select a sub-category:");
    } catch (err) {
      pushBot(err?.response?.data?.message || "Unable to load sub-categories.");
    } finally {
      setLoading(false);
    }
  }

  // ── Subcategory ───────────────────────────────────────────────────────────
  async function chooseSubCategory(subCategoryId, title) {
    pushUser(title);
    setLoading(true);
    try {
      const next = await advanceChat(sessionId, "product_subcategory", { subCategoryId });
      setStep(next.nextStep);
      setFlowData(next.flowData || {});
      const data = await apiClient.get("/api/chat/products", { params: { subCategoryId } });
      setProducts(data.data.items || []);
      pushBot("Select the product you're interested in:");
    } catch (err) {
      pushBot(err?.response?.data?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }

  // ── Service custom questions ──────────────────────────────────────────────
  async function handleServiceQuestionSubmit(answerVal) {
    if (!currentServiceQuestion || loading) return;
    const val = answerVal !== undefined ? String(answerVal).trim() : inputValue.trim();
    if (currentServiceQuestion.required && !val) return;
    pushUser(val || "—");
    setInputValue("");
    setLoading(true);
    try {
      const next = await advanceChat(sessionId, "service_questions", {
        questionId: currentServiceQuestion._id,
        answer: val,
      });
      setFlowData(next.flowData || {});

      if (next.nextStep === "service_details") {
        setServiceQuestions([]);
        setCurrentServiceQuestion(null);
        setDetailsStage("name");
        setCollectedDetails({ name: "", company: "", email: "" });
        pushBot("I need a few details to send your enquiry.\n\nWhat is your name?");
      } else if (next.nextQuestion) {
        setCurrentServiceQuestion(next.nextQuestion);
        pushBot(next.nextQuestion.questionText + (next.nextQuestion.required ? "" : " (optional)"));
      }
      setStep(next.nextStep);
    } catch (err) {
      pushBot(err?.response?.data?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Back navigation ───────────────────────────────────────────────────────
  function goBackToMainMenu() {
    setStep("main_menu");
    setCategories([]);
    setSubCategories([]);
    setProducts([]);
    setServiceQuestions([]);
    setCurrentServiceQuestion(null);
    setQuoteQuestions([]);
    setCurrentQuoteQuestion(null);
    setFlowData({});
    pushBot("How can I help you today?");
  }

  function goBackToCategory() {
    setStep("product_category");
    setSubCategories([]);
    setProducts([]);
    setFlowData((prev) => ({ ...prev, categoryId: undefined, subCategoryId: undefined, productId: undefined, productLink: undefined }));
    pushBot("Please select a product category:");
  }

  function goBackToSubCategory() {
    setStep("product_subcategory");
    setProducts([]);
    setFlowData((prev) => ({ ...prev, productId: undefined, productLink: undefined }));
    pushBot("Now select a sub-category:");
  }

  // ── Product ───────────────────────────────────────────────────────────────
  async function chooseProduct(productId, title) {
    pushUser(title);
    setLoading(true);
    try {
      const next = await advanceChat(sessionId, "product_product", { productId });
      setStep(next.nextStep);
      setFlowData(next.flowData || {});
      setDetailsStage("name");
      setCollectedDetails({ name: "", company: "", email: "" });

      if (next.nextStep === "product_questions" && next.productQuestions?.length > 0) {
        setProductQuestions(next.productQuestions);
        setCurrentQuestion(next.productQuestions[0]);
        pushBot(next.productQuestions[0].questionText + (next.productQuestions[0].required ? "" : " (optional)"));
      } else {
        pushBot("Great pick! I need a few details to send your enquiry.\n\nWhat is your name?");
      }
    } catch (err) {
      pushBot(err?.response?.data?.message || "Unable to select product.");
    } finally {
      setLoading(false);
    }
  }

  // ── Product custom questions ──────────────────────────────────────────────
  async function handleProductQuestionSubmit(answerVal) {
    if (!currentQuestion || loading) return;
    const val = answerVal !== undefined ? String(answerVal).trim() : inputValue.trim();
    if (currentQuestion.required && !val) return;
    pushUser(val || "—");
    setInputValue("");
    setLoading(true);
    try {
      const next = await advanceChat(sessionId, "product_questions", {
        questionId: currentQuestion._id,
        answer: val,
      });
      setFlowData(next.flowData || {});

      if (next.nextStep === "product_details") {
        setProductQuestions([]);
        setCurrentQuestion(null);
        pushBot("I need a few details to send your enquiry.\n\nWhat is your name?");
      } else if (next.nextQuestion) {
        setCurrentQuestion(next.nextQuestion);
        pushBot(next.nextQuestion.questionText + (next.nextQuestion.required ? "" : " (optional)"));
      }
      setStep(next.nextStep);
    } catch (err) {
      pushBot(err?.response?.data?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Quote custom questions (after credentials) ────────────────────────────
  async function handleQuoteQuestionSubmit(answerVal) {
    if (!currentQuoteQuestion || loading) return;
    const val = answerVal !== undefined ? String(answerVal).trim() : inputValue.trim();
    if (currentQuoteQuestion.required && !val) return;
    pushUser(val || "—");
    setInputValue("");
    setLoading(true);
    try {
      const next = await advanceChat(sessionId, "quote_questions", {
        questionId: currentQuoteQuestion._id,
        answer: val,
      });
      setFlowData(next.flowData || {});

      if (next.nextStep === "enquiry_complete") {
        setQuoteQuestions([]);
        setCurrentQuoteQuestion(null);
        setStep("enquiry_complete");
        pushBot("Thank you for your enquiry! 🙏");
        pushBot("We appreciate your interest in Petrozen. Our team will review your request and get back to you shortly.");
        setFlowData({});
        setCategories([]);
        setSubCategories([]);
        setProducts([]);
        setCollectedDetails({ name: "", company: "", email: "" });
        setDetailsStage("name");
        setSessionId(createSessionId());
      } else if (next.nextQuestion) {
        setCurrentQuoteQuestion(next.nextQuestion);
        pushBot(next.nextQuestion.questionText + (next.nextQuestion.required ? "" : " (optional)"));
      }
      setStep(next.nextStep);
    } catch (err) {
      pushBot(err?.response?.data?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Details (one field per send) ──────────────────────────────────────────
  const isServiceFlow = step === "service_details";
  const isQuoteFlow = step === "quote_details";
  async function handleDetailInput() {
    if (loading) return;
    const val = inputValue.trim();

    if (detailsStage === "name") {
      if (!val) return;
      pushUser(val);
      setCollectedDetails((prev) => ({ ...prev, name: val }));
      setInputValue("");
      setDetailsStage("company");
      pushBot("What is your company name? (optional — press Send to skip)");
    } else if (detailsStage === "company") {
      pushUser(val || "—");
      setCollectedDetails((prev) => ({ ...prev, company: val }));
      setInputValue("");
      setDetailsStage("email");
      pushBot("What is your email address?");
    } else if (detailsStage === "email") {
      if (!val) return;
      const finalDetails = { ...collectedDetails, email: val };
      pushUser(val);
      setInputValue("");
      setLoading(true);
      try {
        if (isQuoteFlow) {
          const next = await advanceChat(sessionId, "quote_details", finalDetails);
          setFlowData(next.flowData || {});
          if (next.nextStep === "enquiry_complete") {
            setStep("enquiry_complete");
            pushBot("Thank you for your enquiry! 🙏");
            pushBot("We appreciate your interest in Petrozen. Our team will review your request and get back to you shortly.");
            setFlowData({});
            setCategories([]);
            setSubCategories([]);
            setProducts([]);
            setCollectedDetails({ name: "", company: "", email: "" });
            setDetailsStage("name");
            setSessionId(createSessionId());
          } else if (next.nextStep === "quote_questions" && next.nextQuestion) {
            setQuoteQuestions(next.quoteQuestions || []);
            setCurrentQuoteQuestion(next.nextQuestion);
            setStep("quote_questions");
            pushBot(next.nextQuestion.questionText + (next.nextQuestion.required ? "" : " (optional)"));
          }
        } else if (isServiceFlow) {
          await advanceChat(sessionId, "service_details", finalDetails);
          await submitServiceEnquiry(sessionId, {
            ...finalDetails,
            customAnswers: flowData.customAnswers || {},
          });
          setStep("enquiry_complete");
          pushBot("Thank you for your enquiry! 🙏");
          pushBot("We appreciate your interest in Petrozen. Our team will review your request and get back to you shortly.");
          setFlowData({});
          setCategories([]);
          setSubCategories([]);
          setProducts([]);
          setCollectedDetails({ name: "", company: "", email: "" });
          setDetailsStage("name");
          setSessionId(createSessionId());
        } else {
          await advanceChat(sessionId, "product_details", finalDetails);
          await submitProductEnquiry(sessionId, {
            ...finalDetails,
            customAnswers: flowData.customAnswers || {},
          });
          setStep("enquiry_complete");
          pushBot("Thank you for your enquiry! 🙏");
          pushBot("We appreciate your interest in Petrozen. Our team will review your request and get back to you shortly.");
          setFlowData({});
          setCategories([]);
          setSubCategories([]);
          setProducts([]);
          setCollectedDetails({ name: "", company: "", email: "" });
          setDetailsStage("name");
          setSessionId(createSessionId());
        }
      } catch (err) {
        pushBot(err?.response?.data?.message || "Unable to submit enquiry. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  }

  // ── Unified send handler ──────────────────────────────────────────────────
  function handleSend() {
    if (loading) return;
    if (step === "capture_phone") handlePhoneSubmit();
    else if (step === "product_questions") handleProductQuestionSubmit();
    else if (step === "service_questions") handleServiceQuestionSubmit();
    else if (step === "quote_questions") handleQuoteQuestionSubmit();
    else if (step === "product_details" || step === "service_details" || step === "quote_details") handleDetailInput();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Start new conversation (after enquiry complete) ────────────────────────
  function startNewConversation() {
    setMessages([]);
    setStep("capture_phone");
    setInputValue("");
    setFlowData({});
    setCategories([]);
    setSubCategories([]);
    setProducts([]);
    setProductQuestions([]);
    setCurrentQuestion(null);
    setServiceQuestions([]);
    setCurrentServiceQuestion(null);
    setQuoteQuestions([]);
    setCurrentQuoteQuestion(null);
    setCollectedDetails({ name: "", company: "", email: "" });
    setDetailsStage("name");
    setSessionId(createSessionId());
    hasShownWelcome.current = false;
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: `${Date.now()}-1`, from: "bot", text: "Welcome to Petrozen! 👋" }]);
    }, 500);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: `${Date.now()}-2`, from: "bot", text: "To get started, please enter your phone number below." }]);
    }, 1500);
  }

  // ── Derived: footer input config ──────────────────────────────────────────
  const isProductQuestionOption =
    step === "product_questions" && currentQuestion?.answerType === "option";
  const isServiceQuestionOption =
    step === "service_questions" && currentServiceQuestion?.answerType === "option";
  const isQuoteQuestionOption =
    step === "quote_questions" && currentQuoteQuestion?.answerType === "option";
  const isTextInputStep =
    step === "capture_phone" ||
    (step === "product_questions" && !isProductQuestionOption) ||
    (step === "service_questions" && !isServiceQuestionOption) ||
    (step === "quote_questions" && !isQuoteQuestionOption) ||
    step === "product_details" ||
    step === "service_details" ||
    step === "quote_details";

  const inputPlaceholder =
    step === "capture_phone"
      ? "Your phone number..."
      : step === "product_questions"
      ? currentQuestion?.required
        ? "Your answer..."
        : "Your answer (optional)..."
      : step === "service_questions"
      ? currentServiceQuestion?.required
        ? "Your answer..."
        : "Your answer (optional)..."
      : step === "quote_questions"
      ? currentQuoteQuestion?.required
        ? "Your answer..."
        : "Your answer (optional)..."
      : step === "product_details" || step === "service_details" || step === "quote_details"
      ? detailsStage === "name"
        ? "Your name..."
        : detailsStage === "company"
        ? "Company name (optional)..."
        : "Your email address..."
      : "Type here...";

  const sendDisabled =
    loading ||
    (step === "capture_phone"
      ? !inputValue.trim()
      : step === "product_questions" && !isProductQuestionOption
      ? currentQuestion?.required && !inputValue.trim()
      : step === "service_questions" && !isServiceQuestionOption
      ? currentServiceQuestion?.required && !inputValue.trim()
      : step === "quote_questions" && !isQuoteQuestionOption
      ? currentQuoteQuestion?.required && !inputValue.trim()
      : step === "product_details" || step === "service_details" || step === "quote_details"
      ? detailsStage !== "company"
        ? !inputValue.trim()
        : false
      : false);

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (isAdminRoute || !visible) return null;

  return (
    <>
      {/* Floating action button */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl active:scale-95"
      >
        <span
          className="flex items-center justify-center transition-transform duration-300"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </span>
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {open ? (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed bottom-24 right-6 z-[90] flex w-[92vw] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl"
            style={{ height: 620 }}
          >
          {/* ── Header ── */}
          <div className="flex shrink-0 items-center gap-3 bg-primary px-4 py-3 shadow-sm">
            <img
              src={IMAGES.LOGO_WHITE}
              alt="Petrozen"
              loading="lazy"
              decoding="async"
              width={220}
              height={76}
              className="h-8 w-auto shrink-0 object-contain"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-none text-white">
                Petrozen Assistant
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── Message body ── */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 px-4 py-4">
            {messages.map((msg) =>
              msg.from === "bot" ? (
                <BotMessage key={msg.id}>
                  <span className="whitespace-pre-wrap leading-relaxed">{msg.text}</span>
                </BotMessage>
              ) : (
                <UserMessage key={msg.id} text={msg.text} />
              )
            )}

            {/* Typing indicator */}
            {loading && <TypingDots />}

            {/* ── Choice buttons (inline after last bot message) ── */}
            {!loading && step === "main_menu" && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
                className="space-y-1.5 pl-9"
              >
                <ChoiceBtn index={0} onClick={() => chooseMainMenu("product")}>
                  Product Information
                </ChoiceBtn>
                <ChoiceBtn index={1} onClick={() => chooseMainMenu("quote")}>
                  Request a Quote
                </ChoiceBtn>
                <ChoiceBtn index={2} onClick={() => chooseMainMenu("service")}>
                  Service
                </ChoiceBtn>
                <ChoiceBtn index={3} muted onClick={() => chooseMainMenu("operator")}>
                  Chat with Operator
                </ChoiceBtn>
              </motion.div>
            )}

            {!loading && step === "product_category" && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
                className="space-y-1.5 pl-9"
              >
                <BackBtn onClick={goBackToMainMenu} />
                {categories.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border/50 bg-muted/20 px-3.5 py-2.5 text-center text-sm text-muted-foreground">
                    No categories available at the moment.
                  </p>
                ) : (
                  categories.map((cat, i) => (
                    <ChoiceBtn
                      key={cat._id}
                      index={i}
                      onClick={() => chooseCategory(cat._id, cat.title)}
                    >
                      {cat.title}
                    </ChoiceBtn>
                  ))
                )}
              </motion.div>
            )}

            {!loading && step === "service_questions" && !isServiceQuestionOption && (
              <motion.div
                initial="hidden"
                animate="visible"
                className="space-y-1.5 pl-9"
              >
                <BackBtn onClick={goBackToMainMenu} />
              </motion.div>
            )}
            {!loading && step === "quote_questions" && !isQuoteQuestionOption && (
              <motion.div
                initial="hidden"
                animate="visible"
                className="space-y-1.5 pl-9"
              >
                <BackBtn onClick={goBackToMainMenu} />
              </motion.div>
            )}
            {!loading && step === "quote_questions" && isQuoteQuestionOption && currentQuoteQuestion?.options?.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
                className="space-y-1.5 pl-9"
              >
                <BackBtn onClick={goBackToMainMenu} />
                {currentQuoteQuestion.options.map((opt, i) => (
                  <ChoiceBtn
                    key={i}
                    index={i}
                    onClick={() => handleQuoteQuestionSubmit(opt)}
                  >
                    {opt}
                  </ChoiceBtn>
                ))}
                {currentQuoteQuestion.required === false ? (
                  <ChoiceBtn index={currentQuoteQuestion.options.length} muted onClick={() => handleQuoteQuestionSubmit("")}>
                    Skip
                  </ChoiceBtn>
                ) : null}
              </motion.div>
            )}

            {!loading && step === "service_questions" && isServiceQuestionOption && currentServiceQuestion?.options?.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
                className="space-y-1.5 pl-9"
              >
                <BackBtn onClick={goBackToMainMenu} />
                {currentServiceQuestion.options.map((opt, i) => (
                  <ChoiceBtn
                    key={i}
                    index={i}
                    onClick={() => handleServiceQuestionSubmit(opt)}
                  >
                    {opt}
                  </ChoiceBtn>
                ))}
                {currentServiceQuestion.required === false ? (
                  <ChoiceBtn index={currentServiceQuestion.options.length} muted onClick={() => handleServiceQuestionSubmit("")}>
                    Skip
                  </ChoiceBtn>
                ) : null}
              </motion.div>
            )}

            {!loading && step === "product_subcategory" && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
                className="space-y-1.5 pl-9"
              >
                <BackBtn onClick={goBackToCategory} />
                {subCategories.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border/50 bg-muted/20 px-3.5 py-2.5 text-center text-sm text-muted-foreground">
                    No sub-categories available in this category.
                  </p>
                ) : (
                  subCategories.map((sub, i) => (
                    <ChoiceBtn
                      key={sub._id}
                      index={i}
                      onClick={() => chooseSubCategory(sub._id, sub.title)}
                    >
                      {sub.title}
                    </ChoiceBtn>
                  ))
                )}
              </motion.div>
            )}

            {!loading && step === "product_questions" && isProductQuestionOption && currentQuestion?.options?.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
                className="space-y-1.5 pl-9"
              >
                {currentQuestion.options.map((opt, i) => (
                  <ChoiceBtn
                    key={i}
                    index={i}
                    onClick={() => handleProductQuestionSubmit(opt)}
                  >
                    {opt}
                  </ChoiceBtn>
                ))}
                {currentQuestion.required === false ? (
                  <ChoiceBtn index={currentQuestion.options.length} muted onClick={() => handleProductQuestionSubmit("")}>
                    Skip
                  </ChoiceBtn>
                ) : null}
              </motion.div>
            )}

            {!loading && step === "product_product" && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
                className="space-y-1.5 pl-9"
              >
                <BackBtn onClick={goBackToSubCategory} />
                {products.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border/50 bg-muted/20 px-3.5 py-2.5 text-center text-sm text-muted-foreground">
                    No products available in this sub-category.
                  </p>
                ) : (
                  products.map((prod, i) => (
                    <ChoiceBtn
                      key={prod._id}
                      index={i}
                      onClick={() => chooseProduct(prod._id, prod.title)}
                    >
                      {prod.title}
                    </ChoiceBtn>
                  ))
                )}
              </motion.div>
            )}

            {/* Service link card shown during service details step */}
            {!loading && step === "service_details" && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="pl-9"
              >
                <motion.a
                  href="/services"
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  View services
                </motion.a>
              </motion.div>
            )}

            {/* Product link card shown during details step */}
            {!loading && step === "product_details" && flowData.productLink && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="pl-9"
              >
                <motion.a
                  href={flowData.productLink}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  View product page
                </motion.a>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Footer ── */}
          <div className="shrink-0 border-t border-border/60 bg-muted/40 px-3 py-2.5">
            {step === "enquiry_complete" ? (
              <motion.button
                type="button"
                onClick={startNewConversation}
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 1 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <MessageCirclePlus className="h-4 w-4 shrink-0" />
                Start new conversation
              </motion.button>
            ) : isTextInputStep ? (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type={
                    step === "capture_phone"
                      ? "tel"
                      : step === "product_details" && detailsStage === "email"
                      ? "email"
                      : "text"
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={inputPlaceholder}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-input bg-muted/30 px-3.5 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sendDisabled}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="py-1 text-center text-[11px] text-muted-foreground/70">
                Select an option above to continue
              </p>
            )}
          </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

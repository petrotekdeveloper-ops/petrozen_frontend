/**
 * Reconstructs a chat transcript from a ChatSession enquiry.
 * Since we don't persist individual messages, we rebuild the flow from stored data.
 */

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * @param {object} item - ChatSession document
 * @returns {Array<{ from: 'bot' | 'user', text: string }>}
 */
export function buildChatTranscript(item) {
  const messages = [];
  const flowData = item.flowData || {};
  const customAnswers = item.customAnswers || flowData.customAnswers || {};
  const name = item.name || flowData.name || "";
  const company = item.company || flowData.company || "";
  const email = item.email || flowData.email || "";
  const phone = item.phone || "";
  const enquiryType = item.enquiryType || "product";

  // ── Common start ──
  messages.push({ from: "bot", text: "Welcome to Petrozen!" });
  messages.push({ from: "bot", text: "To get started, please enter your phone number below." });
  messages.push({ from: "user", text: phone || "—" });
  messages.push({ from: "bot", text: "Thanks! How can I help you today?" });

  const typeLabel =
    enquiryType === "product"
      ? "Product Information"
      : enquiryType === "service"
        ? "Service"
        : enquiryType === "quote"
          ? "Request a Quote"
          : enquiryType;

  messages.push({ from: "user", text: typeLabel });

  if (enquiryType === "product") {
    // ── Product flow ──
    if (flowData.categoryTitle) {
      messages.push({ from: "bot", text: "Please select a product category:" });
      messages.push({ from: "user", text: flowData.categoryTitle });
    }
    if (flowData.subCategoryTitle) {
      messages.push({ from: "bot", text: "Now select a sub-category:" });
      messages.push({ from: "user", text: flowData.subCategoryTitle });
    }
    if (flowData.productTitle) {
      messages.push({ from: "bot", text: "Select the product you're interested in:" });
      messages.push({ from: "user", text: flowData.productTitle });
    }
    // Product questions
    const productQuestions = flowData.productQuestions || [];
    productQuestions.forEach((q) => {
      messages.push({
        from: "bot",
        text: q.questionText + (q.required ? "" : " (optional)"),
      });
      messages.push({
        from: "user",
        text: customAnswers[String(q._id)] ?? "—",
      });
    });
  } else if (enquiryType === "service") {
    // ── Service flow: questions first, then credentials ──
    const serviceQuestions = flowData.serviceQuestions || [];
    serviceQuestions.forEach((q) => {
      messages.push({
        from: "bot",
        text: q.questionText + (q.required ? "" : " (optional)"),
      });
      messages.push({
        from: "user",
        text: customAnswers[String(q._id)] ?? "—",
      });
    });
  } else if (enquiryType === "quote") {
    // ── Quote flow: credentials first, then questions ──
    // (credentials come after the common "What is your name?" etc below)
  }

  // ── Credentials (common for product & service; for quote, credentials come before questions) ──
  if (enquiryType === "quote") {
    messages.push({ from: "bot", text: "I need a few details first.\n\nWhat is your name?" });
  } else {
    messages.push({ from: "bot", text: "I need a few details to send your enquiry.\n\nWhat is your name?" });
  }
  messages.push({ from: "user", text: name || "—" });
  messages.push({ from: "bot", text: "What is your company name? (optional — press Send to skip)" });
  messages.push({ from: "user", text: company || "—" });
  messages.push({ from: "bot", text: "What is your email address?" });
  messages.push({ from: "user", text: email || "—" });

  // ── Quote questions (after credentials) ──
  if (enquiryType === "quote") {
    const quoteQuestions = flowData.quoteQuestions || [];
    quoteQuestions.forEach((q) => {
      messages.push({
        from: "bot",
        text: q.questionText + (q.required ? "" : " (optional)"),
      });
      messages.push({
        from: "user",
        text: customAnswers[String(q._id)] ?? "—",
      });
    });
  }

  // ── Closing ──
  messages.push({ from: "bot", text: "Thank you for your enquiry!" });
  messages.push({
    from: "bot",
    text: "We appreciate your interest in Petrozen. Our team will review your request and get back to you shortly.",
  });

  return messages;
}

/**
 * @param {object} item - ChatSession document
 * @returns {object} Metadata for PDF header
 */
export function getTranscriptMeta(item) {
  const enquiryType = item.enquiryType || "product";
  const typeLabel =
    enquiryType === "product"
      ? "Product Enquiry"
      : enquiryType === "service"
        ? "Service Enquiry"
        : enquiryType === "quote"
          ? "Quote Request"
          : "Chat Enquiry";

  return {
    sessionId: item.sessionId || "—",
    enquiryType: typeLabel,
    date: formatDate(item.createdAt),
    name: item.name || item.flowData?.name || "—",
    email: item.email || item.flowData?.email || "—",
    phone: item.phone || "—",
  };
}

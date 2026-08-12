import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import AdminShell from "@/components/admin/AdminShell";
import { Pencil, Trash2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminChatbotServiceQuestions() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionRequired, setNewQuestionRequired] = useState(true);
  const [newQuestionAnswerType, setNewQuestionAnswerType] = useState("plain_text");
  const [newQuestionOptions, setNewQuestionOptions] = useState([""]);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRequired, setEditRequired] = useState(true);
  const [editAnswerType, setEditAnswerType] = useState("plain_text");
  const [editOptions, setEditOptions] = useState([""]);
  const [editSortOrder, setEditSortOrder] = useState(0);

  const [showAddForm, setShowAddForm] = useState(false);

  const fetchQuestions = async () => {
    try {
      const res = await apiClient.get("/api/chat/admin/service-questions");
      setQuestions(res?.data?.items ?? []);
      setLoadError("");
    } catch (err) {
      setLoadError(err?.response?.data?.message || "Failed to load questions.");
      setQuestions([]);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchQuestions().finally(() => setIsLoading(false));
  }, []);

  const createQuestion = async () => {
    const text = newQuestionText.trim();
    if (!text) return;
    const opts = newQuestionAnswerType === "option"
      ? newQuestionOptions.map((o) => o.trim()).filter(Boolean)
      : [];
    if (newQuestionAnswerType === "option" && opts.length === 0) {
      toast({ title: "Add at least one option", variant: "destructive" });
      return;
    }
    try {
      const res = await apiClient.post("/api/chat/admin/service-questions", {
        questionText: text,
        sortOrder: questions.length,
        required: newQuestionRequired,
        answerType: newQuestionAnswerType,
        options: opts,
      });
      setQuestions((prev) => [...prev, res.data.item]);
      setNewQuestionText("");
      setNewQuestionRequired(true);
      setNewQuestionAnswerType("plain_text");
      setNewQuestionOptions([""]);
      setShowAddForm(false);
      toast({ title: "Question created" });
    } catch {
      toast({ title: "Failed to create question", variant: "destructive" });
    }
  };

  const updateQuestion = async () => {
    if (!editingId) return;
    const opts = editAnswerType === "option"
      ? editOptions.map((o) => o.trim()).filter(Boolean)
      : [];
    if (editAnswerType === "option" && opts.length === 0) {
      toast({ title: "Add at least one option", variant: "destructive" });
      return;
    }
    try {
      const res = await apiClient.put(`/api/chat/admin/service-questions/${editingId}`, {
        questionText: editText.trim(),
        sortOrder: editSortOrder,
        required: editRequired,
        answerType: editAnswerType,
        options: opts,
      });
      setQuestions((prev) =>
        prev.map((q) => (q._id === editingId ? res.data.item : q))
      );
      setEditingId(null);
      toast({ title: "Question updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const deleteQuestion = async (id) => {
    try {
      await apiClient.delete(`/api/chat/admin/service-questions/${id}`);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
      if (editingId === id) setEditingId(null);
      toast({ title: "Question deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const startEdit = (q) => {
    setEditingId(q._id);
    setEditText(q.questionText);
    setEditRequired(q.required ?? true);
    setEditSortOrder(q.sortOrder ?? 0);
    setEditAnswerType(q.answerType === "option" ? "option" : "plain_text");
    const opts = q.options && Array.isArray(q.options) ? q.options : [];
    setEditOptions(opts.length ? opts : [""]);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <AdminShell
      testId="page-admin-chatbot-service-questions"
      title="Service Questions"
      subtitle="Manage questions shown to users who select Service in the chatbot. Questions appear before contact details. No categories—answers are free-form or from options."
      sectionBare
    >
      {loadError ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm">Loading...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Add question */}
          <div>
            {showAddForm ? (
              <div className="rounded-xl border border-border/70 bg-card p-4 space-y-4">
                <h3 className="text-sm font-semibold">Add question</h3>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Question text</label>
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="e.g. What type of service do you need?"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Sort order</label>
                  <input
                    type="number"
                    value={questions.length}
                    readOnly
                    className="w-20 rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newQuestionRequired}
                    onChange={(e) => setNewQuestionRequired(e.target.checked)}
                  />
                  Required
                </label>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Answer type</label>
                  <select
                    value={newQuestionAnswerType}
                    onChange={(e) => {
                      setNewQuestionAnswerType(e.target.value);
                      if (e.target.value === "plain_text") setNewQuestionOptions([""]);
                    }}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="plain_text">Plain text</option>
                    <option value="option">Options (select from list)</option>
                  </select>
                </div>
                {newQuestionAnswerType === "option" ? (
                  <div>
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">Options (one per line)</label>
                    {newQuestionOptions.map((opt, i) => (
                      <div key={i} className="mb-2 flex gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const next = [...newQuestionOptions];
                            next[i] = e.target.value;
                            setNewQuestionOptions(next);
                          }}
                          placeholder={`Option ${i + 1}`}
                          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setNewQuestionOptions((p) => p.filter((_, j) => j !== i))}
                          className="rounded-lg px-2 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setNewQuestionOptions((p) => [...p, ""])}
                      className="rounded-lg border border-dashed px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50"
                    >
                      + Add option
                    </button>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={createQuestion}
                    disabled={!newQuestionText.trim()}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewQuestionText("");
                      setNewQuestionAnswerType("plain_text");
                      setNewQuestionOptions([""]);
                    }}
                    className="rounded-lg border px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="rounded-lg border border-dashed border-border/70 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                + Add question
              </button>
            )}
          </div>

          {/* Questions list */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Questions ({questions.length})</h3>
            {questions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
                No questions yet. Add one above. Users will go straight to contact details if there are no questions.
              </div>
            ) : (
              <div className="space-y-2">
                {questions.map((q) => (
                  <div
                    key={q._id}
                    className="rounded-xl border border-border/70 bg-card px-4 py-3"
                  >
                    {editingId === q._id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                          autoFocus
                        />
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">Sort order</label>
                          <input
                            type="number"
                            value={editSortOrder}
                            onChange={(e) => setEditSortOrder(Number(e.target.value) || 0)}
                            className="w-20 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={editRequired}
                            onChange={(e) => setEditRequired(e.target.checked)}
                          />
                          Required
                        </label>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">Answer type</label>
                          <select
                            value={editAnswerType}
                            onChange={(e) => {
                              setEditAnswerType(e.target.value);
                              if (e.target.value === "plain_text") setEditOptions([""]);
                            }}
                            className="rounded-lg border border-input bg-background px-2 py-1 text-sm"
                          >
                            <option value="plain_text">Plain text</option>
                            <option value="option">Options</option>
                          </select>
                        </div>
                        {editAnswerType === "option" ? (
                          <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">Options</label>
                            {editOptions.map((opt, i) => (
                              <div key={i} className="mb-1 flex gap-2">
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const next = [...editOptions];
                                    next[i] = e.target.value;
                                    setEditOptions(next);
                                  }}
                                  placeholder={`Option ${i + 1}`}
                                  className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm"
                                />
                                <button type="button" onClick={() => setEditOptions((p) => p.filter((_, j) => j !== i))} className="text-red-600">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => setEditOptions((p) => [...p, ""])}
                              className="rounded border border-dashed px-2 py-1 text-xs"
                            >
                              + Add
                            </button>
                          </div>
                        ) : null}
                        <div className="flex gap-2">
                          <button onClick={updateQuestion} className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground">Save</button>
                          <button onClick={cancelEdit} className="rounded-lg border px-3 py-1.5 text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">{q.questionText}</p>
                          <span className="text-xs text-muted-foreground">
                            #{q.sortOrder ?? 0} · {q.required ? "Required" : "Optional"}
                            {q.answerType === "option" && q.options?.length ? ` · ${q.options.length} option(s)` : ""}
                          </span>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(q)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteQuestion(q._id)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}

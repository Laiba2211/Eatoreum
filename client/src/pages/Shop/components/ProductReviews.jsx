import { useCallback, useEffect, useState } from "react";
import {
  fetchProductReviews,
  postProductReview,
  postProductReviewReply,
} from "../services/shopApi.js";

function formatReviewDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ProductReviews({ productSlug }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyErrors, setReplyErrors] = useState({});
  const [replySubmitting, setReplySubmitting] = useState({});

  const load = useCallback(async () => {
    if (!productSlug) return;
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchProductReviews(productSlug);
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch {
      setLoadError("Could not load reviews.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmitReview(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const name = authorName.trim();
    const text = body.trim();

    if (!name) return setFormError("Enter your name");
    if (text.length < 5) return setFormError("Min 5 characters");

    setSubmitting(true);
    try {
      const data = await postProductReview(productSlug, {
        authorName: name,
        rating,
        body: text,
      });

      const created = data?.review;
      if (created) {
        setReviews((prev) => [created, ...prev]);
      }

      setAuthorName("");
      setBody("");
      setRating(5);
      setFormSuccess("Review posted!");
    } catch (err) {
      setFormError(err?.message || "Error posting review");
    } finally {
      setSubmitting(false);
    }
  }

  function setReplyField(reviewId, field, value) {
    setReplyDrafts((prev) => ({
      ...prev,
      [reviewId]: {
        ...(prev[reviewId] || { authorName: "", body: "" }),
        [field]: value,
      },
    }));
  }

  async function handleSubmitReply(reviewId) {
    const draft = replyDrafts[reviewId] || {};
    const name = draft.authorName?.trim();
    const text = draft.body?.trim();

    if (!name)
      return setReplyErrors((p) => ({ ...p, [reviewId]: "Enter name" }));
    if (!text || text.length < 3)
      return setReplyErrors((p) => ({ ...p, [reviewId]: "Too short" }));

    setReplySubmitting((p) => ({ ...p, [reviewId]: true }));

    try {
      const data = await postProductReviewReply(
        productSlug,
        reviewId,
        { authorName: name, body: text }
      );

      const reply = data?.reply;

      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, replies: [...(r.replies || []), reply] }
            : r
        )
      );

      setReplyDrafts((p) => ({
        ...p,
        [reviewId]: { authorName: "", body: "" },
      }));
    } catch {
      setReplyErrors((p) => ({
        ...p,
        [reviewId]: "Error posting reply",
      }));
    } finally {
      setReplySubmitting((p) => ({ ...p, [reviewId]: false }));
    }
  }

  return (
    <section className="mt-16 w-full sm:px-6 lg:px-2">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold text-(--ink)">
          Customer Reviews
        </h2>

        {/* Review Form */}
        <form
          onSubmit={handleSubmitReview}
          className="mt-6 space-y-3 rounded-xl border border-(--brown)/30 bg-(--card) p-4"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name"
              className="rounded-lg border border-(--brown)/40 bg-(--black) px-3 py-2 text-sm text-(--ink)"
            />

            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="rounded-lg border border-(--brown)/40 bg-(--black) px-3 py-2 text-sm text-(--ink) [&>option]:bg-(--card) [&>option]:text-(--ink)"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n}>{n}★</option>
              ))}
            </select>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-(--gold) py-2 text-sm font-semibold text-(--on-primary)"
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>

          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write review..."
            className="w-full rounded-lg border border-(--brown)/40 bg-(--black) px-3 py-2 text-sm text-(--ink)"
          />

          {formError && <p className="text-red-400 text-xs">{formError}</p>}
          {formSuccess && (
            <p className="text-green-400 text-xs">{formSuccess}</p>
          )}
        </form>

        {/* Reviews Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading && <p className="text-(--gray)">Loading...</p>}
          {loadError && <p className="text-red-400">{loadError}</p>}

          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-(--brown)/25 bg-(--card) p-4 transition hover:border-(--gold)/40"
            >
              {/* Header */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-(--ink) capitalize font-medium">
                  {r.authorName}
                  <span className="ml-2 text-xs text-(--gold)">
                    ★ {r.rating}
                  </span>
                </span>
                <span className="text-xs text-(--gray)">
                  {formatReviewDate(r.createdAt)}
                </span>
              </div>

              {/* Body */}
              <p className="mt-2 line-clamp-4 text-sm text-(--gray)">
                {r.body}
              </p>

              <ul className="mt-3 space-y-3 border-l border-(--brown)/30 pl-3">
  {r.replies.map((rep) => (
    <li key={rep.id} className="flex gap-3">
      
      {/* Avatar */}
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-(--gold)/20 text-[10px] font-bold uppercase text-(--gold)">
        {rep.authorName?.charAt(0)}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-(--ink) capitalize">
            {rep.authorName}
          </span>
          <span className="text-[10px] text-(--gray)">
            {formatReviewDate(rep.createdAt)}
          </span>
        </div>

        <p className="mt-1 text-xs leading-relaxed text-(--gray)">
          {rep.body}
        </p>
      </div>
    </li>
  ))}
</ul>

              {/* Reply Form */}
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-(--gold) hover:text-(--gold-light)">
                  Reply
                </summary>

                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={replyDrafts[r.id]?.authorName || ""}
                    onChange={(e) =>
                      setReplyField(r.id, "authorName", e.target.value)
                    }
                    className="w-full rounded-lg border border-(--brown)/40 bg-(--black) px-2 py-1 text-xs text-(--ink)"
                  />

                  <textarea
                    rows={2}
                    placeholder="Write reply..."
                    value={replyDrafts[r.id]?.body || ""}
                    onChange={(e) =>
                      setReplyField(r.id, "body", e.target.value)
                    }
                    className="w-full rounded-lg border border-(--brown)/40 bg-(--black) px-2 py-1 text-xs text-(--ink)"
                  />

                  <button
                    type="button"
                    onClick={() => handleSubmitReply(r.id)}
                    disabled={replySubmitting[r.id]}
                    className="rounded border border-(--gold)/50 px-3 py-1 text-xs text-(--gold) transition hover:bg-(--gold)/10"
                  >
                    {replySubmitting[r.id] ? "..." : "Post"}
                  </button>

                  {replyErrors[r.id] && (
                    <p className="text-red-400 text-xs">
                      {replyErrors[r.id]}
                    </p>
                  )}
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductReviews;
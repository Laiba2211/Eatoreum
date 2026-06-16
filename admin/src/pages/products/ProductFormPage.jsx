import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiImage, FiTrash2, FiUpload } from "react-icons/fi";
import { mediaUrl } from "../../utils/mediaUrl.js";
import {
  createAdminCategory,
  createAdminProduct,
  getAdminProduct,
  listAdminCategories,
  updateAdminProduct,
  uploadProductImage,
} from "./services/productsApi.js";

const emptyForm = {
  name: "",
  slug: "",
  sku: "",
  originalPrice: "",
  salePrice: "",
  currency: "PKR",
  stock: "0",
  categorySlug: "",
  weightGrams: "",
  description: "",
  shortDescription: "",
  isPublished: false,
  isFeatured: false,
};

function productToForm(product) {
  const imgs = Array.isArray(product.images) ? product.images : [];
  const main =
    (typeof product.mainImage === "string" && product.mainImage.trim()) ||
    (imgs[0] && String(imgs[0])) ||
    "";
  const variants =
    Array.isArray(product.variantImages) && product.variantImages.length
      ? product.variantImages.map(String)
      : imgs.length > 1
        ? imgs.slice(1).map(String)
        : [];

  const pay = Number(product.price);
  const cmpRaw = product.compareAtPrice;
  const cmp = cmpRaw != null && cmpRaw !== "" ? Number(cmpRaw) : NaN;
  const onSale = Number.isFinite(cmp) && Number.isFinite(pay) && cmp > pay;

  return {
    name: product.name ?? "",
    slug: product.slug ?? "",
    sku: product.sku ?? "",
    originalPrice: String(onSale ? cmp : (product.price ?? "")),
    salePrice: onSale ? String(product.price ?? "") : "",
    currency: product.currency ?? "PKR",
    stock: String(product.stock ?? 0),
    categorySlug: String(product.category ?? "").trim().toLowerCase(),
    weightGrams:
      product.weightGrams != null && product.weightGrams !== ""
        ? String(product.weightGrams)
        : "",
    description: product.description ?? "",
    shortDescription: product.shortDescription ?? "",
    isPublished: Boolean(product.isPublished),
    isFeatured: Boolean(product.isFeatured),
    mainImage: main,
    variantImages: variants,
  };
}

const thumbClass =
  "h-14 w-14 shrink-0 rounded-md border border-zinc-700 bg-zinc-900 object-cover";

function ProductFormPage() {
  const { productId } = useParams();
  const isEdit = Boolean(productId);
  const navigate = useNavigate();

  const mainInputRef = useRef(null);
  const variantsInputRef = useRef(null);

  const [form, setForm] = useState(emptyForm);
  const [mainImage, setMainImage] = useState("");
  const [variantImages, setVariantImages] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCategoriesError("");
      try {
        const data = await listAdminCategories();
        if (cancelled) return;
        setCategories(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        if (!cancelled) {
          setCategoriesError(
            err?.response?.data?.message ?? err?.message ?? "Could not load categories."
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isEdit) {
      setForm(emptyForm);
      setMainImage("");
      setVariantImages([]);
      setLoadingProduct(false);
      setLoadError("");
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadError("");
      setLoadingProduct(true);
      try {
        const { product } = await getAdminProduct(productId);
        if (cancelled) return;
        const mapped = productToForm(product);
        const { mainImage: m, variantImages: v, ...rest } = mapped;
        setForm(rest);
        setMainImage(m);
        setVariantImages(v);
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err?.response?.data?.message ?? err?.message ?? "Failed to load product."
        );
      } finally {
        if (!cancelled) setLoadingProduct(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEdit, productId]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleMainFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImageError("");
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setMainImage(url);
    } catch (err) {
      setImageError(
        err?.response?.data?.message ?? err?.message ?? "Main image upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleVariantFiles(e) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (!files.length) return;
    setImageError("");
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        urls.push(await uploadProductImage(file));
      }
      setVariantImages((prev) => [...prev, ...urls]);
    } catch (err) {
      setImageError(
        err?.response?.data?.message ?? err?.message ?? "Variant upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  function removeVariantAt(index) {
    setVariantImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    setError("");
    setAddingCategory(true);
    try {
      const { category } = await createAdminCategory({ name });
      setCategories((prev) => {
        const next = [...prev.filter((c) => c.slug !== category.slug), category];
        next.sort((a, b) => a.name.localeCompare(b.name));
        return next;
      });
      setField("categorySlug", category.slug);
      setNewCategoryName("");
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? "Could not add category.");
    } finally {
      setAddingCategory(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    const original = Number(String(form.originalPrice ?? "").trim());
    if (!name) {
      setError("Name is required.");
      return;
    }
    if (!Number.isFinite(original) || original < 0) {
      setError("Original price must be a valid non-negative number.");
      return;
    }

    const saleRaw = String(form.salePrice ?? "").trim();
    let price;
    let compareAtPayload;
    if (saleRaw === "") {
      price = original;
      compareAtPayload = isEdit ? null : undefined;
    } else {
      const sale = Number(saleRaw);
      if (!Number.isFinite(sale) || sale < 0) {
        setError("Sale price must be a valid non-negative number.");
        return;
      }
      if (sale >= original) {
        setError("Sale price must be less than the original price.");
        return;
      }
      price = sale;
      compareAtPayload = original;
    }

    const stock = Number(form.stock);
    const weightRaw = String(form.weightGrams ?? "").trim();
    let weightPayload;
    if (weightRaw !== "") {
      const wg = Number(weightRaw);
      if (!Number.isFinite(wg) || wg < 0) {
        setError("Weight (grams) must be a valid non-negative number.");
        return;
      }
      weightPayload = wg;
    } else if (isEdit) {
      weightPayload = null;
    }

    const payload = {
      name,
      price,
      stock: Number.isFinite(stock) && stock >= 0 ? stock : 0,
      currency: (form.currency || "PKR").trim().toUpperCase().slice(0, 3) || "PKR",
      category: form.categorySlug.trim(),
      description: form.description,
      shortDescription: form.shortDescription.trim(),
      isPublished: Boolean(form.isPublished),
      isFeatured: Boolean(form.isFeatured),
      mainImage: mainImage.trim(),
      variantImages: variantImages.filter(Boolean),
    };
    const slug = form.slug.trim();
    if (slug) payload.slug = slug;
    const sku = form.sku.trim();
    if (sku) payload.sku = sku;
    if (compareAtPayload !== undefined) {
      payload.compareAtPrice = compareAtPayload;
    }
    if (weightPayload !== undefined) {
      payload.weightGrams = weightPayload;
    }

    setSubmitting(true);
    try {
      if (isEdit) await updateAdminProduct(productId, payload);
      else await createAdminProduct(payload);
      navigate("/products");
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? "Save failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isEdit && loadingProduct) {
    return (
      <div className="space-y-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
        <p className="text-sm text-zinc-500">Loading product…</p>
      </div>
    );
  }

  if (isEdit && loadError) {
    return (
      <div className="space-y-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
        <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200" role="alert">
          {loadError}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
        <h1 className="text-xl font-semibold text-zinc-50">
          {isEdit ? "Edit product" : "Add product"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 sm:p-8"
      >
        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200" role="alert">
            {error}
          </p>
        ) : null}
        {imageError ? (
          <p className="rounded-lg border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-100" role="alert">
            {imageError}
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div>
              <label htmlFor="pf-name" className="mb-1 block text-xs font-medium text-zinc-400">
                Product name *
              </label>
              <input
                id="pf-name"
                required
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
              />
            </div>

            <div>
              <label htmlFor="pf-slug" className="mb-1 block text-xs font-medium text-zinc-400">
                Slug (optional)
              </label>
              <input
                id="pf-slug"
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
                placeholder="Auto from name if empty"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
              />
            </div>

            <div>
              <label htmlFor="pf-original" className="mb-1 block text-xs font-medium text-zinc-400">
                Original price *
              </label>
              <input
                id="pf-original"
                type="number"
                required
                min="0"
                step="0.01"
                value={form.originalPrice}
                onChange={(e) => setField("originalPrice", e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
              />
            </div>

            <div>
              <label htmlFor="pf-sale" className="mb-1 block text-xs font-medium text-zinc-400">
                Sale price (optional)
              </label>
              <input
                id="pf-sale"
                type="number"
                min="0"
                step="0.01"
                value={form.salePrice}
                onChange={(e) => setField("salePrice", e.target.value)}
                placeholder="Leave empty to sell at original price only"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
              />
              <p className="mt-1 text-xs text-zinc-500">
                If set below original, the store shows a Sale label, the sale price as the main price, and the original
                with a strikethrough.
              </p>
            </div>

            <div>
              <label htmlFor="pf-stock" className="mb-1 block text-xs font-medium text-zinc-400">
                Stock
              </label>
              <input
                id="pf-stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setField("stock", e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pf-currency" className="mb-1 block text-xs font-medium text-zinc-400">
                  Currency
                </label>
                <input
                  id="pf-currency"
                  maxLength={3}
                  value={form.currency}
                  onChange={(e) => setField("currency", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm uppercase text-zinc-100 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
                />
              </div>
              <div>
                <label htmlFor="pf-sku" className="mb-1 block text-xs font-medium text-zinc-400">
                  SKU
                </label>
                <input
                  id="pf-sku"
                  value={form.sku}
                  onChange={(e) => setField("sku", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
                />
              </div>
            </div>

            <div>
              <label htmlFor="pf-category" className="mb-1 block text-xs font-medium text-zinc-400">
                Category
              </label>
              <select
                id="pf-category"
                value={form.categorySlug}
                onChange={(e) => setField("categorySlug", e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              {categoriesError ? (
                <p className="mt-1 text-xs text-amber-400">{categoriesError}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <div className="min-w-0 flex-1">
                  <label htmlFor="pf-new-cat" className="mb-1 block text-xs font-medium text-zinc-500">
                    New category name
                  </label>
                  <input
                    id="pf-new-cat"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Pantry staples"
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
                  />
                </div>
                <button
                  type="button"
                  disabled={addingCategory || !newCategoryName.trim()}
                  onClick={handleAddCategory}
                  className="rounded-lg border border-zinc-600 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
                >
                  {addingCategory ? "Adding…" : "Add & select"}
                </button>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Categories are saved to the database. New products can reuse them in this list.
              </p>
            </div>

            <div>
              <label htmlFor="pf-weight" className="mb-1 block text-xs font-medium text-zinc-400">
                Weight (grams)
              </label>
              <input
                id="pf-weight"
                type="number"
                min="0"
                step="1"
                value={form.weightGrams}
                onChange={(e) => setField("weightGrams", e.target.value)}
                placeholder="e.g. 500"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
              />
              <p className="mt-1 text-xs text-zinc-500">Shown on the shop product card and product page.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="pf-short" className="mb-1 block text-xs font-medium text-zinc-400">
                Short description
              </label>
              <input
                id="pf-short"
                value={form.shortDescription}
                onChange={(e) => setField("shortDescription", e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
              />
            </div>

            <div>
              <label htmlFor="pf-desc" className="mb-1 block text-xs font-medium text-zinc-400">
                Description
              </label>
              <textarea
                id="pf-desc"
                rows={5}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                className="mt-1 w-full resize-y rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setField("isPublished", e.target.checked)}
                className="rounded border-zinc-600 bg-zinc-900 text-amber-500 focus:ring-amber-500/40"
              />
              Published (visible on store catalog)
            </label>

            <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setField("isFeatured", e.target.checked)}
                className="mt-0.5 rounded border-zinc-600 bg-zinc-900 text-amber-500 focus:ring-amber-500/40"
              />
              <span>
                Featured on homepage
                <span className="mt-0.5 block text-xs font-normal text-zinc-500">
                  Only one product can be featured. Saving this clears the flag on all other products.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <FiImage className="h-4 w-4 text-amber-500/90" aria-hidden />
            Images
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Upload a single main image and optional variant gallery shots (JPEG, PNG, GIF, WebP — max 5MB each).
          </p>

          <div className="mt-6 space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Main image</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <input
                  ref={mainInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleMainFile}
                />
                {mainImage ? (
                  <div className="relative">
                    <img
                      src={mediaUrl(mainImage)}
                      alt=""
                      className={thumbClass}
                    />
                    <button
                      type="button"
                      onClick={() => setMainImage("")}
                      className="absolute -right-1 -top-1 rounded-full border border-zinc-700 bg-zinc-900 p-1 text-zinc-400 hover:bg-red-950/80 hover:text-red-300"
                      aria-label="Remove main image"
                    >
                      <FiTrash2 className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className={`${thumbClass} flex items-center justify-center text-zinc-600`}>
                    <FiImage className="h-6 w-6" aria-hidden />
                  </div>
                )}
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => mainInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
                >
                  <FiUpload className="h-4 w-4" />
                  {mainImage ? "Replace main" : "Upload main"}
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Variant images</p>
              <div className="mt-2 flex flex-wrap items-start gap-3">
                <input
                  ref={variantsInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleVariantFiles}
                />
                <div className="flex flex-wrap gap-2">
                  {variantImages.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative">
                      <img
                        src={mediaUrl(url)}
                        alt=""
                        className="h-12 w-12 rounded-md border border-zinc-700 bg-zinc-900 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariantAt(index)}
                        className="absolute -right-1 -top-1 rounded-full border border-zinc-700 bg-zinc-900 p-0.5 text-zinc-400 hover:bg-red-950/80 hover:text-red-300"
                        aria-label="Remove variant"
                      >
                        <FiTrash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => variantsInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
                >
                  <FiUpload className="h-4 w-4" />
                  Add variants
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:justify-end">
          <Link
            to="/products"
            className="rounded-lg border border-zinc-800 px-5 py-3 text-center text-sm font-medium text-zinc-300 hover:bg-zinc-900"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
          >
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductFormPage;

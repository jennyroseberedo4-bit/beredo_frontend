import { useEffect, useState } from "react";
import api from "./api";
import "./Products.css";

const empty = { product_name: "", description: "", price: "", quantity: "" };
const peso = (n) => `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const Icon = ({ children, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const TagIcon = () => (
  <Icon>
    <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
    <circle cx="7.5" cy="7.5" r="1.2" />
  </Icon>
);

const BoxIcon = () => (
  <Icon>
    <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
    <path d="M3 8l9 5 9-5M12 13v8" />
  </Icon>
);

export default function Products({ user }) {
  const isAdmin = user.role === "admin";
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/api/products");
      setProducts(data.data);
    } catch {
      setError("Could not load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const reset = () => { setForm(empty); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editingId) await api.put(`/api/products/${editingId}`, form);
      else await api.post("/api/products", form);
      reset();
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const edit = (p) => {
    setEditingId(p.id);
    setForm({
      product_name: p.product_name,
      description: p.description || "",
      price: p.price,
      quantity: p.quantity,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.product_name}"?`)) return;
    setError("");
    try {
      await api.delete(`/api/products/${p.id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Delete failed.");
    }
  };

  return (
    <main className="container">
      {/* Hero banner */}
      <section className="hero">
        <div>
          <p className="eyebrow">{isAdmin ? "Admin" : "Catalog"}</p>
          <h1>Products</h1>
          <p className="hero-sub">
            {isAdmin ? "Manage your product catalog." : "Browse the product catalog (view only)."}
          </p>
        </div>
        <span className="hero-count">
          <strong>{products.length}</strong> {products.length === 1 ? "item" : "items"}
        </span>
      </section>

      {error && <div className="alert">{error}</div>}

      {/* Admin editor */}
      {isAdmin && (
        <form onSubmit={submit} className="editor">
          <h2>{editingId ? "Edit product" : "Add product"}</h2>

          <div className="editor-grid">
            <label className="pill-field wide">
              <span className="pill-icon"><TagIcon /></span>
              <input
                placeholder="Product name"
                aria-label="Product name"
                value={form.product_name}
                onChange={set("product_name")}
                maxLength={100}
                required
              />
            </label>

            <textarea
              className="pill-area wide"
              rows="3"
              placeholder="Description"
              aria-label="Description"
              value={form.description}
              onChange={set("description")}
            />

            <label className="pill-field">
              <span className="pill-icon pill-peso">₱</span>
              <input
                type="number" step="0.01" min="0"
                placeholder="Price"
                aria-label="Price"
                value={form.price}
                onChange={set("price")}
                required
              />
            </label>

            <label className="pill-field">
              <span className="pill-icon"><BoxIcon /></span>
              <input
                type="number" min="0" step="1"
                placeholder="Quantity"
                aria-label="Quantity"
                value={form.quantity}
                onChange={set("quantity")}
                required
              />
            </label>
          </div>

          <div className="row">
            <button className="pill-btn" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Update product" : "Add product"}
            </button>
            {editingId && (
              <button type="button" className="pill-btn ghost" onClick={reset}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Product cards */}
      <section className="product-grid">
        {loading ? (
          <p className="empty">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="empty">No products yet.</p>
        ) : (
          products.map((p) => (
            <article className="product" key={p.id}>
              <div className="product-top">
                <span className="product-avatar">
                  {(p.product_name || "?").charAt(0).toUpperCase()}
                </span>
                <span className="product-price">{peso(p.price)}</span>
              </div>

              <h2>{p.product_name}</h2>
              <p className="muted">{p.description || "No description"}</p>

              <div className="product-foot">
                <span className="chip">{p.quantity} in stock</span>
                {isAdmin && (
                  <div className="row">
                    <button className="btn btn-ghost btn-sm" onClick={() => edit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Delete</button>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

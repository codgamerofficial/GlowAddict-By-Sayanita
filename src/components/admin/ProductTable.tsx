"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { Product } from "@/context/ShopContext";
import {
  Search, ChevronDown, ChevronUp, MoreVertical, Edit3, Copy, Archive, Trash2,
  Eye, Sparkles, Package, ArrowUpDown, ChevronLeft, ChevronRight,
} from "lucide-react";
import { getConfidenceLabel, formatRelativeTime } from "@/lib/ai-utils";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDuplicate: (productId: string) => void;
  onArchive: (productId: string) => void;
  onDelete: (productId: string) => void;
}

type SortKey = "title" | "category" | "stock" | "price" | "ai_confidence" | "created_at";
type SortDir = "asc" | "desc";

const ITEMS_PER_PAGE = 20;

export default function ProductTable({ products, onEdit, onDuplicate, onArchive, onDelete }: ProductTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [search]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActiveMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).sort();
  }, [products]);

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...products];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((p) =>
        p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") result = result.filter((p) => (p.status || "active") === statusFilter);
    if (categoryFilter !== "all") result = result.filter((p) => p.category === categoryFilter);

    result.sort((a, b) => {
      let aVal: string | number = "", bVal: string | number = "";
      switch (sortKey) {
        case "title": aVal = a.title.toLowerCase(); bVal = b.title.toLowerCase(); break;
        case "category": aVal = a.category; bVal = b.category; break;
        case "stock": aVal = a.stock; bVal = b.stock; break;
        case "price": aVal = a.price; bVal = b.price; break;
        case "ai_confidence": aVal = a.ai_confidence || 0; bVal = b.ai_confidence || 0; break;
        case "created_at": aVal = a.created_at || ""; bVal = b.created_at || ""; break;
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [products, debouncedSearch, statusFilter, categoryFilter, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, categoryFilter]);

  const toggleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }, [sortKey]);

  const handleDelete = (id: string) => {
    if (confirmDelete === id) { onDelete(id); setConfirmDelete(null); setActiveMenu(null); }
    else setConfirmDelete(id);
  };

  const getStockDot = (stock: number) => {
    if (stock === 0) return "red";
    if (stock <= 5) return "amber";
    return "green";
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown size={10} className="text-foreground/20 ml-1" />;
    return sortDir === "asc" ? <ChevronUp size={10} className="text-brand-magenta ml-1" /> : <ChevronDown size={10} className="text-brand-magenta ml-1" />;
  };

  // Empty state
  if (products.length === 0) {
    return (
      <div className="bg-[#1E0629] border border-white/8 rounded-2xl p-10 text-center space-y-3">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#D946EF]/10 to-[#A855F7]/10 flex items-center justify-center border border-white/8">
          <Package size={28} className="text-[#D3B6FF]" />
        </div>
        <div>
          <p className="text-sm font-extrabold text-white uppercase tracking-wider">No products yet</p>
          <p className="text-[10px] text-[#9F7AC2] mt-1.5 max-w-sm mx-auto leading-relaxed">
            Upload your first product packaging image or paste a URL above. Sayanita's AI will extract all details automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9F7AC2]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title, brand, SKU…" aria-label="Search products"
            className="admin-glass-input pl-9 text-xs text-white placeholder-[#9F7AC2]" />
        </div>
        {/* Filters */}
        <div className="flex gap-2 flex-wrap text-[10px]">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status"
            className="admin-glass-input !w-auto !py-2 !px-3 cursor-pointer text-[10px] font-bold text-[#D3B6FF] border border-white/8">
            <option value="all" className="bg-[#1E0629] text-white">All Status</option>
            <option value="active" className="bg-[#1E0629] text-white">Active</option>
            <option value="draft" className="bg-[#1E0629] text-white">Draft</option>
            <option value="archived" className="bg-[#1E0629] text-white">Archived</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Filter by category"
            className="admin-glass-input !w-auto !py-2 !px-3 cursor-pointer text-[10px] font-bold text-[#D3B6FF] border border-white/8">
            <option value="all" className="bg-[#1E0629] text-white">All Categories</option>
            {categories.map((c) => <option key={c} value={c} className="bg-[#1E0629] text-white">{c}</option>)}
          </select>
          <span className="text-[#9F7AC2] self-center font-bold tracking-wide uppercase text-[9px] ml-2">
            {filtered.length} of {products.length} products
          </span>
        </div>
      </div>

      {/* Table — Desktop */}
      <div className="hidden md:block bg-[#1E0629] border border-white/8 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans" role="grid">
            <thead className="admin-table-header bg-[#2B083A] border-b border-white/8">
              <tr>
                <th className="text-left p-3.5 font-bold text-[#D3B6FF] uppercase text-[9px] tracking-wider">
                  <button onClick={() => toggleSort("title")} className="inline-flex items-center cursor-pointer hover:text-[#D946EF] transition-colors">
                    Product <SortIcon column="title" />
                  </button>
                </th>
                <th className="text-left p-3.5 font-bold text-[#D3B6FF] uppercase text-[9px] tracking-wider">
                  <button onClick={() => toggleSort("category")} className="inline-flex items-center cursor-pointer hover:text-[#D946EF] transition-colors">
                    Category <SortIcon column="category" />
                  </button>
                </th>
                <th className="text-center p-3.5 font-bold text-[#D3B6FF] uppercase text-[9px] tracking-wider">
                  <button onClick={() => toggleSort("stock")} className="inline-flex items-center cursor-pointer hover:text-[#D946EF] transition-colors">
                    Stock <SortIcon column="stock" />
                  </button>
                </th>
                <th className="text-center p-3.5 font-bold text-[#D3B6FF] uppercase text-[9px] tracking-wider">Status</th>
                <th className="text-right p-3.5 font-bold text-[#D3B6FF] uppercase text-[9px] tracking-wider">
                  <button onClick={() => toggleSort("price")} className="inline-flex items-center cursor-pointer hover:text-[#D946EF] transition-colors">
                    Price <SortIcon column="price" />
                  </button>
                </th>
                <th className="text-center p-3.5 font-bold text-[#D3B6FF] uppercase text-[9px] tracking-wider">
                  <button onClick={() => toggleSort("ai_confidence")} className="inline-flex items-center cursor-pointer hover:text-[#D946EF] transition-colors">
                    AI <SortIcon column="ai_confidence" />
                  </button>
                </th>
                <th className="text-center p-3.5 font-bold text-[#D3B6FF] uppercase text-[9px] tracking-wider w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {paginated.map((prod) => {
                const conf = getConfidenceLabel(prod.ai_confidence || 0);
                const stockDot = getStockDot(prod.stock);
                return (
                  <tr key={prod.id} className="admin-table-row hover:bg-[#2B083A]/40 transition-all border-b border-white/8 cursor-pointer" onClick={() => onEdit(prod)}>
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#2B083A] border border-white/8 shrink-0">
                          {prod.image ? (
                            <>
                              <Image 
                                src={prod.image} 
                                alt="" 
                                fill 
                                className="object-cover" 
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const sibling = e.currentTarget.nextSibling as HTMLElement;
                                  if (sibling) sibling.style.display = 'flex';
                                }}
                                unoptimized 
                              />
                              <div style={{ display: 'none' }} className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#2B083A]">
                                <Package size={14} className="text-[#9F7AC2]/30" />
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package size={14} className="text-[#9F7AC2]/30" /></div>
                          )}
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="font-extrabold text-white text-xs leading-tight truncate max-w-[200px]">{prod.title}</p>
                          <p className="text-[9px] text-[#9F7AC2] mt-0.5 font-bold tracking-wider">{prod.brand} • {prod.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-left text-[#D3B6FF] text-[10px] font-semibold">{prod.category}</td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center text-[10px] font-bold text-white">
                        <span className={`admin-stock-dot ${stockDot} mr-1.5`} />
                        {prod.stock}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                        prod.status === "active" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" :
                        prod.status === "draft" ? "bg-amber-500/15 text-amber-400 border border-amber-500/25" :
                        "bg-gray-500/15 text-gray-400 border border-gray-500/25"
                      }`}>
                        {prod.status || "active"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="font-extrabold text-white text-xs">₹{prod.price}</span>
                      {prod.mrp > prod.price && (
                        <span className="text-[9px] text-[#9F7AC2]/50 line-through ml-1.5">₹{prod.mrp}</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {prod.ai_confidence ? (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-[#D946EF]`}>
                          {prod.ai_confidence}%
                        </span>
                      ) : <span className="text-[9px] text-[#6E4E85]">—</span>}
                    </td>
                    <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="relative" ref={activeMenu === prod.id ? menuRef : undefined}>
                        <button onClick={() => setActiveMenu(activeMenu === prod.id ? null : prod.id)}
                          aria-label="Product actions" aria-expanded={activeMenu === prod.id}
                          className="p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/8 cursor-pointer transition-all">
                          <MoreVertical size={14} className="text-[#9F7AC2]" />
                        </button>
                        {activeMenu === prod.id && (
                          <div className="admin-action-menu bg-[#2B083A] border border-white/10 rounded-xl shadow-2xl p-1 z-30 absolute right-0 mt-1 w-44">
                            <button onClick={() => { onEdit(prod); setActiveMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-[10px] font-bold rounded-lg hover:bg-[#351049] text-[#D3B6FF] hover:text-white cursor-pointer transition-all">
                              <Edit3 size={12} /> Edit Details
                            </button>
                            <button onClick={() => { window.open(`/product/${prod.id}`, "_blank"); setActiveMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-[10px] font-bold rounded-lg hover:bg-[#351049] text-[#D3B6FF] hover:text-white cursor-pointer transition-all">
                              <Eye size={12} /> Preview
                            </button>
                            <button onClick={() => { onDuplicate(prod.id); setActiveMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-[10px] font-bold rounded-lg hover:bg-[#351049] text-[#D3B6FF] hover:text-white cursor-pointer transition-all">
                              <Copy size={12} /> Duplicate
                            </button>
                            <button onClick={() => { onArchive(prod.id); setActiveMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-[10px] font-bold rounded-lg hover:bg-[#351049] text-[#D3B6FF] hover:text-white cursor-pointer transition-all">
                              <Archive size={12} /> Archive
                            </button>
                            <div className="border-t border-white/8 my-1" />
                            <button onClick={() => handleDelete(prod.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[10px] font-bold rounded-lg hover:bg-red-500/10 text-red-400 cursor-pointer transition-all">
                              <Trash2 size={12} /> {confirmDelete === prod.id ? "Confirm Delete" : "Delete"}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2.5">
        {paginated.map((prod) => {
          const conf = getConfidenceLabel(prod.ai_confidence || 0);
          const stockDot = getStockDot(prod.stock);
          return (
            <div key={prod.id} onClick={() => onEdit(prod)}
              className="bg-[#1E0629] border border-white/8 rounded-2xl p-4 cursor-pointer active:scale-[0.99] transition-transform shadow-xl relative overflow-hidden group">
              <div className="flex gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#2B083A] border border-white/8 shrink-0">
                  {prod.image ? (
                    <>
                      <Image 
                        src={prod.image} 
                        alt="" 
                        fill 
                        className="object-cover" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const sibling = e.currentTarget.nextSibling as HTMLElement;
                          if (sibling) sibling.style.display = 'flex';
                        }}
                        unoptimized 
                      />
                      <div style={{ display: 'none' }} className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#2B083A]">
                        <Package size={18} className="text-[#9F7AC2]/40" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package size={18} className="text-[#9F7AC2]/40" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between text-left">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-extrabold text-white text-xs leading-tight truncate flex-1">{prod.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase shrink-0 tracking-wider ${
                        prod.status === "active" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" :
                        prod.status === "draft" ? "bg-amber-500/15 text-amber-400 border border-amber-500/25" :
                        "bg-gray-500/15 text-gray-400 border border-gray-500/25"
                      }`}>
                        {prod.status || "active"}
                      </span>
                    </div>
                    <p className="text-[9px] text-[#9F7AC2] mt-0.5 font-bold uppercase tracking-wider">{prod.brand} • {prod.category}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/6">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-white">₹{prod.price}</span>
                      {prod.mrp > prod.price && <span className="text-[9px] text-[#9F7AC2]/50 line-through">₹{prod.mrp}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-[#D3B6FF]">
                        <span className={`admin-stock-dot ${stockDot}`} />{prod.stock} in stock
                      </span>
                      {prod.ai_confidence ? (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/25 text-[#D946EF]">
                          {prod.ai_confidence}%
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-[10px] text-[#9F7AC2] font-bold uppercase tracking-wider">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page"
              className="p-2 rounded-lg hover:bg-white/5 border border-transparent disabled:opacity-25 cursor-pointer transition-colors">
              <ChevronLeft size={14} className="text-[#D3B6FF]" />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next page"
              className="p-2 rounded-lg hover:bg-white/5 border border-transparent disabled:opacity-25 cursor-pointer transition-colors">
              <ChevronRight size={14} className="text-[#D3B6FF]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

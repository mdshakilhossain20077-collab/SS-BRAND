import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Check,
  Search,
  ArrowUpRight,
  SlidersHorizontal,
  X,
  Copy,
  PackageCheck,
  MessageCircle,
  Truck,
  ShieldCheck,
  RefreshCw,
  PhoneCall,
} from 'lucide-react';
import {
  PRODUCTS,
  HERO_IMAGE,
  CUSTOMER_REVIEWS,
  WHATSAPP_NUMBER,
  FREE_DELIVERY_THRESHOLD,
  type Product,
  type CartItem,
  type ConfirmedOrder,
} from './data/products';

function ResilientImage({
  src,
  alt,
  className = '',
  fallbackLabel,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200 text-stone-600 p-6 text-center ${className}`}
      >
        <ShoppingBag className="w-8 h-8 mb-2 text-stone-500 stroke-[1.5]" />
        <span className="text-xs font-medium tracking-wide text-stone-700">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}

export default function App() {
  // Cart state persisted in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ss_brand_cart_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return [
      {
        product: PRODUCTS[0],
        variant: PRODUCTS[0].defaultVariant,
        quantity: 1,
      },
    ];
  });

  // Selected variant per product card
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() =>
    PRODUCTS.reduce(
      (acc, p) => {
        acc[p.id] = p.defaultVariant;
        return acc;
      },
      {} as Record<string, string>
    )
  );

  // Filter & Search state
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Product Detail Modal (Contiguous Purchase Module)
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [modalVariant, setModalVariant] = useState<string>('');
  const [modalQty, setModalQty] = useState<number>(1);

  // Checkout Customer Form State
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [deliveryZone, setDeliveryZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [promoInput, setPromoInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Recent Orders & Confirmation Receipt
  const [orders, setOrders] = useState<ConfirmedOrder[]>(() => {
    try {
      const saved = localStorage.getItem('ss_brand_orders_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });
  const [latestOrder, setLatestOrder] = useState<ConfirmedOrder | null>(null);
  const [trackOrderInput, setTrackOrderInput] = useState<string>('');
  const [trackedOrderResult, setTrackedOrderResult] = useState<ConfirmedOrder | 'not_found' | null>(
    null
  );

  // Feedback states
  const [addedToastId, setAddedToastId] = useState<string | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('ss_brand_cart_v1', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('ss_brand_orders_v1', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesCat = activeCategory === 'All' || p.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.bengaliSubtitle.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [activeCategory, searchQuery, sortBy]);

  // Cart Calculations
  const totalItemsCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  const discountAmount = useMemo(() => {
    if (appliedPromo === 'SS10') {
      return Math.round(subtotal * 0.1);
    }
    return 0;
  }, [subtotal, appliedPromo]);

  const shippingFee = useMemo(() => {
    if (cart.length === 0) return 0;
    if (subtotal - discountAmount >= FREE_DELIVERY_THRESHOLD) return 0;
    return deliveryZone === 'inside_dhaka' ? 60 : 120;
  }, [cart.length, subtotal, discountAmount, deliveryZone]);

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Handlers
  const handleAddToCart = (product: Product, variant?: string, qty = 1) => {
    const chosenVariant = variant || selectedVariants[product.id] || product.defaultVariant;
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.variant === chosenVariant
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
        };
        return updated;
      }
      return [...prev, { product, variant: chosenVariant, quantity: qty }];
    });

    setAddedToastId(product.id);
    setFormError(null);
    setTimeout(() => {
      setAddedToastId((prev) => (prev === product.id ? null : prev));
    }, 1600);
  };

  const handleUpdateQty = (index: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const nextQty = updated[index].quantity + delta;
      if (nextQty <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index] = { ...updated[index], quantity: nextQty };
      }
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (clean === 'SS10') {
      setAppliedPromo('SS10');
      setFormError(null);
    } else {
      setFormError('Promo code not recognized. Try "SS10" for 10% privilege discount.');
    }
  };

  const openProductModal = (product: Product) => {
    setActiveProductModal(product);
    setModalVariant(selectedVariants[product.id] || product.defaultVariant);
    setModalQty(1);
  };

  const buildWhatsAppMessage = (
    orderId: string,
    name: string,
    phone: string,
    address: string,
    zone: 'inside_dhaka' | 'outside_dhaka',
    notes: string
  ) => {
    const details = cart
      .map(
        (item) =>
          `• ${item.product.name} (${item.variant}) × ${item.quantity} — ৳${
            item.product.price * item.quantity
          }`
      )
      .join('\n');

    const zoneLabel = zone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka';
    const lines = [
      `SS BRAND ORDER (${orderId})`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Delivery Area: ${zoneLabel}`,
      `Address: ${address}`,
      notes ? `Notes: ${notes}` : '',
      `Products:`,
      details,
      `Subtotal: ৳${subtotal}`,
      discountAmount > 0 ? `Discount (SS10): -৳${discountAmount}` : '',
      `Delivery Charge: ${shippingFee === 0 ? 'FREE' : `৳${shippingFee}`}`,
      `Total Payable (COD): ৳${grandTotal}`,
    ].filter(Boolean);

    return lines.join('\n');
  };

  const handleOrderNow = (e: React.FormEvent) => {
    e.preventDefault();
    const name = customerName.trim();
    const phone = customerPhone.trim();
    const address = customerAddress.trim();
    const notes = orderNotes.trim();

    if (cart.length === 0) {
      setFormError('Your shopping bag is empty. Please add at least one product before ordering.');
      return;
    }

    if (!name || !phone || !address) {
      setFormError('Please complete your Name, Mobile Number, and Full Delivery Address.');
      return;
    }

    setFormError(null);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `SS-${randomNum}`;
    const message = buildWhatsAppMessage(orderId, name, phone, address, deliveryZone, notes);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    const confirmed: ConfirmedOrder = {
      orderId,
      createdAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      customerName: name,
      customerPhone: phone,
      deliveryZone,
      customerAddress: address,
      notes,
      items: [...cart],
      subtotal,
      discount: discountAmount,
      shippingFee,
      total: grandTotal,
      whatsappUrl,
      whatsappMessage: message,
      status: 'Confirmed — Preparing Dispatch',
    };

    setOrders((prev) => [confirmed, ...prev]);
    setLatestOrder(confirmed);

    // Trigger external WhatsApp window via anchor click to respect browser security policies
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackOrderInput.trim().toUpperCase();
    if (!query) return;
    const found = orders.find(
      (o) =>
        o.orderId.toUpperCase() === query ||
        o.customerPhone.replace(/\s+/g, '').includes(query.replace(/\s+/g, ''))
    );
    setTrackedOrderResult(found || 'not_found');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#141413]">
      {/* Top Navigation Bar — Strict 3-Zone Contract */}
      <header className="sticky top-0 z-40 bg-[#141413] text-[#FAF9F5] border-b border-stone-800">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#home"
            className="font-display text-xl font-bold tracking-tight text-[#F5C542] whitespace-nowrap shrink-0"
          >
            SS BRAND
          </a>

          {/* Zone 2: 4 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-300">
            <a
              href="#products"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Collection
            </a>
            <a
              href="#cart"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Checkout
            </a>
            <a
              href="#track-order"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Track Order
            </a>
            <a
              href="#reviews"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Reviews
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <a
              href="#cart"
              className="inline-flex items-center gap-2.5 px-4 py-2 text-xs font-semibold bg-[#E6B82E] text-[#141413] rounded-lg hover:bg-[#f5c542] transition-colors whitespace-nowrap shrink-0 font-mono tabular-nums"
            >
              <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>
                Bag ({totalItemsCount}) · ৳{grandTotal.toLocaleString()}
              </span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Section 1: Storefront Hero (Split 2-Column with items-stretch + Full-Width Trust Bar below) */}
        <section id="home" className="bg-[#171716] text-[#FAF9F5] border-b border-stone-800">
          <div className="max-w-[1240px] mx-auto px-6 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              {/* Left Column: Campaign Typography & Primary Route */}
              <div className="lg:col-span-6 flex flex-col justify-between py-2">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-400 tracking-wide mb-5">
                    <span>Your Trusted Online Shopping Store</span>
                    <span aria-hidden="true">·</span>
                    <span>আপনার বিশ্বস্ত অনলাইন শপ</span>
                  </div>

                  <h1
                    className="font-display font-bold text-[#FAF9F5] tracking-tight leading-[1.08] mb-6"
                    style={{
                      fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
                      textWrap: 'balance',
                    }}
                  >
                    Everyday Essentials Crafted for Modern Wardrobe & Tech.
                  </h1>

                  <p className="text-stone-300 text-base leading-relaxed max-w-[58ch] mb-8">
                    Shop our signature heavyweight organic cotton apparel, sapphire-glass smart
                    chronographs, minimalist court footwear, and wireless studio headphones. Direct
                    WhatsApp ordering with nationwide Cash on Delivery across Bangladesh.
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-4 mb-8">
                    <a
                      href="#products"
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#E6B82E] text-[#141413] text-sm font-semibold rounded-lg hover:bg-[#f5c542] transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Shop Collection</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>

                    <a
                      href="#cart"
                      className="inline-flex items-center gap-2 px-5 py-3.5 border border-stone-700 text-stone-200 text-sm font-medium rounded-lg hover:border-stone-500 hover:text-white transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>View Shopping Cart ({totalItemsCount})</span>
                    </a>
                  </div>

                  <div className="pt-6 border-t border-stone-800/90 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-400 font-mono tabular-nums">
                    <span>Direct WhatsApp: +880 1838-077166</span>
                    <span aria-hidden="true">·</span>
                    <span>Free Delivery on Orders ৳2,000+</span>
                    <span aria-hidden="true">·</span>
                    <span>Pay Cash on Delivery</span>
                  </div>
                </div>
              </div>

              {/* Right Column: 16:9 Studio Collection Showcase Image */}
              <div className="lg:col-span-6 flex">
                <div className="relative w-full overflow-hidden rounded-xl border border-stone-800 bg-stone-900 min-h-[280px] sm:min-h-[360px]">
                  <ResilientImage
                    src={HERO_IMAGE}
                    alt="SS BRAND curated collection featuring heavyweight cotton t-shirt, chronograph smart watch, minimalist sneakers, and wireless headphones"
                    className="w-full h-full lg:h-full object-cover"
                    fallbackLabel="SS BRAND Signature Collection"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-6">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs text-stone-300 mb-1">
                          2026 Signature Edition · 4 Core Essentials
                        </p>
                        <p className="font-display text-lg font-semibold text-white">
                          Apparel, Horology, Footwear & Studio Audio
                        </p>
                      </div>
                      <span className="font-mono tabular-nums text-xs text-[#F5C542] shrink-0">
                        From ৳450
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full-Width 4-Column Service Guarantee Bar below the Hero Split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 pt-8 border-t border-stone-800/80">
              <div className="flex items-start gap-3.5">
                <Truck className="w-5 h-5 text-[#E6B82E] shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold text-white">24–48h Express Dispatch</h2>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    ৳60 Inside Dhaka · ৳120 Nationwide courier right to your doorstep.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-[#E6B82E] shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold text-white">Inspect Before Payment</h2>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    100% Cash on Delivery. Verify product quality upon receiving your parcel.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <RefreshCw className="w-5 h-5 text-[#E6B82E] shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold text-white">7-Day Size & Defect Exchange</h2>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Hassle-free size replacement on T-Shirts and Shoes within 7 days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <PhoneCall className="w-5 h-5 text-[#E6B82E] shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold text-white">Instant WhatsApp Checkout</h2>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    No account passwords needed. Place your order directly on WhatsApp in seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Featured Products Collection */}
        <section id="products" className="max-w-[1240px] mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                <span>Our Products</span>
                <span aria-hidden="true">·</span>
                <span>আমাদের পণ্যসমূহ</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{filteredProducts.length} Items</span>
              </div>
              <h2
                className="font-display text-2xl sm:text-3xl font-bold text-[#141413] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Curated Collection
              </h2>
            </div>

            {/* Interactive Filter & Search Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Segmented Controls */}
              <div
                role="tablist"
                aria-label="Product categories"
                className="flex items-center gap-1 p-1 bg-stone-200/75 rounded-lg"
              >
                {['All', 'Apparel', 'Electronics', 'Footwear', 'Audio'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-white text-[#141413] shadow-xs font-semibold'
                        : 'text-stone-600 hover:text-[#141413]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-[#141413] placeholder:text-stone-400 focus:outline-none focus:border-stone-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="inline-flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')
                  }
                  aria-label="Sort products"
                  className="text-xs font-medium text-stone-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
              <p className="text-base font-medium text-stone-800 mb-2">
                No products match your filter criteria.
              </p>
              <p className="text-xs text-stone-500 mb-5">
                Try clearing your search query or switching back to All categories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                  setSortBy('featured');
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#141413] text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const currentVariant = selectedVariants[product.id] || product.defaultVariant;
                const isJustAdded = addedToastId === product.id;
                const inCartCount = cart
                  .filter((c) => c.product.id === product.id)
                  .reduce((sum, c) => sum + c.quantity, 0);

                return (
                  <article
                    key={product.id}
                    className="group bg-white border border-stone-200/90 rounded-xl overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    <div>
                      {/* 4:3 Product Studio Image */}
                      <div
                        onClick={() => openProductModal(product)}
                        className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden cursor-pointer"
                      >
                        <ResilientImage
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                          fallbackLabel={product.name}
                        />
                      </div>

                      {/* Card Body */}
                      <div className="p-5">
                        {/* Unboxed Clean Metadata — Zero Pills */}
                        <div className="flex items-center justify-between gap-2 text-xs text-stone-500 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span>{product.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono">{product.sku}</span>
                          </div>
                          <span className="text-emerald-700 font-medium">
                            {product.availability}
                          </span>
                        </div>

                        {/* Title & Price */}
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <h3 className="font-display text-lg font-bold text-[#141413]">
                            <button
                              type="button"
                              onClick={() => openProductModal(product)}
                              className="hover:underline underline-offset-4 text-left cursor-pointer"
                            >
                              {product.name}
                            </button>
                          </h3>
                          <span className="font-mono tabular-nums text-base font-bold text-[#B38300] shrink-0">
                            ৳{product.price.toLocaleString()}
                          </span>
                        </div>

                        <p className="text-xs text-stone-500 mb-3">{product.bengaliSubtitle}</p>

                        <p className="text-xs text-stone-600 leading-relaxed line-clamp-2 mb-4">
                          {product.summary}
                        </p>

                        {/* Variant Selector */}
                        <div className="mb-4">
                          <label
                            htmlFor={`variant-${product.id}`}
                            className="block text-[11px] font-medium text-stone-500 mb-1.5"
                          >
                            Select Option
                          </label>
                          <select
                            id={`variant-${product.id}`}
                            value={currentVariant}
                            onChange={(e) =>
                              setSelectedVariants((prev) => ({
                                ...prev,
                                [product.id]: e.target.value,
                              }))
                            }
                            className="w-full px-2.5 py-1.5 text-xs font-medium bg-[#FAF9F5] border border-stone-200 rounded-md text-[#141413] focus:outline-none focus:border-stone-500 cursor-pointer"
                          >
                            {product.variants.map((v) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-5 pb-5 pt-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product, currentVariant, 1)}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isJustAdded
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#E6B82E] text-[#141413] hover:bg-[#f5c542]'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Added to Cart</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                            <span>
                              Add to Cart{inCartCount > 0 ? ` (${inCartCount})` : ''}
                            </span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => openProductModal(product)}
                        className="py-2.5 px-3 rounded-lg text-xs font-medium border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Specs
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Section 3: Shopping Cart & Direct WhatsApp Checkout */}
        <section id="cart" className="bg-stone-100/80 border-y border-stone-200/90 py-16">
          <div className="max-w-[1240px] mx-auto px-6">
            <div className="mb-8">
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                <span>Direct WhatsApp & Cash on Delivery Checkout</span>
                <span aria-hidden="true">·</span>
                <span>ক্যাশ অন ডেলিভারি অর্ডার</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#141413] tracking-tight">
                Shopping Cart & Customer Dispatch
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left 7 Columns: Cart Items & Promo */}
              <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-6">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-200">
                  <h3 className="font-display text-lg font-bold text-[#141413]">
                    Selected Items ({totalItemsCount})
                  </h3>
                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCart([])}
                      className="text-xs text-stone-500 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      Clear Bag
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="py-10 text-center">
                    <ShoppingBag className="w-9 h-9 text-stone-400 mx-auto mb-3 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-stone-800 mb-1">
                      Your cart is currently empty.
                    </p>
                    <p className="text-xs text-stone-500 mb-6">
                      Add one of our signature products below or browse the collection above.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {PRODUCTS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleAddToCart(p, p.defaultVariant, 1)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#FAF9F5] border border-stone-300 rounded-lg hover:border-[#141413] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>
                            {p.name} (৳{p.price})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-200/80">
                    {cart.map((item, idx) => (
                      <div
                        key={`${item.product.id}-${item.variant}`}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                            <ResilientImage
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                              <span>{item.product.category}</span>
                              <span aria-hidden="true">·</span>
                              <span>{item.variant}</span>
                            </div>
                            <h4 className="font-display text-base font-bold text-[#141413]">
                              {item.product.name}
                            </h4>
                            <p className="font-mono tabular-nums text-xs text-stone-600 mt-0.5">
                              Unit Price: ৳{item.product.price.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          {/* Stepper */}
                          <div className="inline-flex items-center border border-stone-200 rounded-lg bg-[#FAF9F5]">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(idx, -1)}
                              aria-label={`Decrease quantity of ${item.product.name}`}
                              className="p-2 text-stone-600 hover:text-[#141413] cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-mono tabular-nums font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(idx, 1)}
                              aria-label={`Increase quantity of ${item.product.name}`}
                              className="p-2 text-stone-600 hover:text-[#141413] cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right min-w-[76px]">
                            <span className="font-mono tabular-nums text-sm font-bold text-[#141413]">
                              ৳{(item.product.price * item.quantity).toLocaleString()}
                            </span>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveCartItem(idx)}
                            aria-label={`Remove ${item.product.name} from cart`}
                            className="p-2 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Free Shipping Progress & Promo Bar */}
                {cart.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-stone-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      {subtotal - discountAmount >= FREE_DELIVERY_THRESHOLD ? (
                        <span className="text-emerald-700 font-medium">
                          ✓ Your order qualifies for Free Express Nationwide Delivery.
                        </span>
                      ) : (
                        <span className="text-stone-600">
                          Add{' '}
                          <strong className="font-mono tabular-nums text-[#141413]">
                            ৳{(FREE_DELIVERY_THRESHOLD - (subtotal - discountAmount)).toLocaleString()}
                          </strong>{' '}
                          more to unlock Free Nationwide Delivery (Orders ৳2,000+).
                        </span>
                      )}
                      <span className="font-mono tabular-nums text-stone-500">
                        Privilege Code: SS10 (10% Off)
                      </span>
                    </div>

                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Enter promo code (e.g. SS10)"
                        className="flex-1 px-3 py-2 text-xs bg-[#FAF9F5] border border-stone-200 rounded-lg focus:outline-none focus:border-stone-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-semibold bg-[#141413] text-white rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Apply Code
                      </button>
                      {appliedPromo && (
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedPromo(null);
                            setPromoInput('');
                          }}
                          className="px-3 py-2 text-xs text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-100 cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </form>
                  </div>
                )}
              </div>

              {/* Right 5 Columns: Customer Information & Order on WhatsApp */}
              <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-6">
                <h3 className="font-display text-lg font-bold text-[#141413] mb-1">
                  Customer Information
                </h3>
                <p className="text-xs text-stone-500 mb-5">
                  Complete your delivery details below to send your order directly to our official
                  WhatsApp dispatch desk.
                </p>

                <form onSubmit={handleOrderNow} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-medium text-stone-700 mb-1.5"
                    >
                      Your Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Md. Shakil Hossain"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-stone-200 rounded-lg text-[#141413] placeholder:text-stone-400 focus:outline-none focus:border-[#141413]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-medium text-stone-700 mb-1.5"
                    >
                      Mobile Number *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 01838-077166"
                      className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-[#FAF9F5] border border-stone-200 rounded-lg text-[#141413] placeholder:text-stone-400 focus:outline-none focus:border-[#141413]"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-stone-700 mb-1.5">
                      Delivery Area
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setDeliveryZone('inside_dhaka')}
                        className={`py-2.5 px-3 text-xs font-medium rounded-lg border text-left transition-colors cursor-pointer ${
                          deliveryZone === 'inside_dhaka'
                            ? 'border-[#141413] bg-[#141413] text-white'
                            : 'border-stone-200 bg-[#FAF9F5] text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        <div className="font-semibold">Inside Dhaka</div>
                        <div className="font-mono tabular-nums text-[11px] opacity-80">
                          ৳60 · 24h Delivery
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryZone('outside_dhaka')}
                        className={`py-2.5 px-3 text-xs font-medium rounded-lg border text-left transition-colors cursor-pointer ${
                          deliveryZone === 'outside_dhaka'
                            ? 'border-[#141413] bg-[#141413] text-white'
                            : 'border-stone-200 bg-[#FAF9F5] text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        <div className="font-semibold">Outside Dhaka</div>
                        <div className="font-mono tabular-nums text-[11px] opacity-80">
                          ৳120 · 48h Courier
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-xs font-medium text-stone-700 mb-1.5"
                    >
                      Your Full Address *
                    </label>
                    <textarea
                      id="address"
                      rows={3}
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="House / Road / Area / Thana & District"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F5] border border-stone-200 rounded-lg text-[#141413] placeholder:text-stone-400 focus:outline-none focus:border-[#141413]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="notes"
                      className="block text-xs font-medium text-stone-700 mb-1.5"
                    >
                      Delivery Instruction (Optional)
                    </label>
                    <input
                      id="notes"
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Preferred delivery time or landmark"
                      className="w-full px-3.5 py-2 text-xs bg-[#FAF9F5] border border-stone-200 rounded-lg text-[#141413] placeholder:text-stone-400 focus:outline-none focus:border-[#141413]"
                    />
                  </div>

                  {/* Order Cost Breakdown */}
                  <div className="pt-4 border-t border-stone-200 space-y-2 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal ({totalItemsCount} items)</span>
                      <span className="font-mono tabular-nums">৳{subtotal.toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Privilege Discount (SS10)</span>
                        <span className="font-mono tabular-nums">
                          -৳{discountAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-600">
                      <span>
                        Delivery Charge (
                        {deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
                      </span>
                      <span className="font-mono tabular-nums">
                        {shippingFee === 0 ? 'FREE' : `৳${shippingFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t border-stone-200 text-base font-bold text-[#141413]">
                      <span>Total Payable (COD)</span>
                      <span id="total" className="font-mono tabular-nums text-lg text-[#B38300]">
                        ৳{grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {formError && (
                    <div
                      role="alert"
                      className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 font-medium"
                    >
                      {formError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 px-5 bg-[#E6B82E] hover:bg-[#f5c542] text-[#141413] font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 stroke-[2.2]" />
                    <span>Order on WhatsApp</span>
                  </button>
                </form>

                {/* Instant Post-Order Confirmation & WhatsApp Dispatch Panel */}
                {latestOrder && (
                  <div className="mt-6 p-4 rounded-xl bg-[#FAF9F5] border border-stone-300 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <PackageCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-xs font-bold text-[#141413]">
                          Order {latestOrder.orderId} Prepared
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-800">
                        {latestOrder.status}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      If WhatsApp did not open automatically in your browser tab, click the direct
                      link below or copy your formatted order slip to send to{' '}
                      <span className="font-mono font-semibold text-[#141413]">
                        +{WHATSAPP_NUMBER}
                      </span>
                      .
                    </p>

                    <pre className="p-3 rounded-lg bg-white border border-stone-200 text-[11px] font-mono text-stone-700 whitespace-pre-wrap overflow-x-auto">
                      {latestOrder.whatsappMessage}
                    </pre>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={latestOrder.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#141413] text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>Open WhatsApp Chat</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopyMessage(latestOrder.whatsappMessage)}
                        className="inline-flex items-center gap-1.5 py-2 px-3 border border-stone-300 bg-white text-xs font-medium text-stone-800 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                      >
                        {copiedReceipt ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Slip</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Order Verification & Attributable Customer Proof */}
        <section id="reviews" className="max-w-[1240px] mx-auto px-6 py-16 space-y-16">
          {/* Order Tracking Bar */}
          <div
            id="track-order"
            className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
                <span>Order Verification</span>
                <span aria-hidden="true">·</span>
                <span>অর্ডার ট্র্যাকিং</span>
              </div>
              <h2 className="font-display text-xl font-bold text-[#141413] mb-1">
                Track Your SS BRAND Order
              </h2>
              <p className="text-xs text-stone-600">
                Enter your Order ID (e.g. <span className="font-mono">SS-1042</span>) or mobile
                number used during checkout to inspect your dispatch status and itemized receipt.
              </p>
            </div>

            <div className="flex-1 max-w-md">
              <form onSubmit={handleTrackOrder} className="flex gap-2">
                <input
                  type="text"
                  value={trackOrderInput}
                  onChange={(e) => setTrackOrderInput(e.target.value)}
                  placeholder="Order ID (SS-xxxx) or Phone Number"
                  className="flex-1 px-3.5 py-2.5 text-xs font-mono bg-[#FAF9F5] border border-stone-200 rounded-lg focus:outline-none focus:border-[#141413]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-semibold bg-[#141413] text-white rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Check Status
                </button>
              </form>

              {trackedOrderResult === 'not_found' && (
                <p className="text-xs text-stone-600 mt-2.5">
                  No recent order found matching that ID or phone in this browser session. Place an
                  order above or message us on WhatsApp at +{WHATSAPP_NUMBER}.
                </p>
              )}

              {trackedOrderResult && trackedOrderResult !== 'not_found' && (
                <div className="mt-3 p-3.5 rounded-lg bg-[#FAF9F5] border border-stone-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-[#141413]">
                    <span className="font-mono">{trackedOrderResult.orderId}</span>
                    <span className="text-emerald-700">{trackedOrderResult.status}</span>
                  </div>
                  <p className="text-stone-600">
                    Recipient: {trackedOrderResult.customerName} ({trackedOrderResult.customerPhone})
                  </p>
                  <p className="text-stone-500 font-mono tabular-nums">
                    Total COD: ৳{trackedOrderResult.total.toLocaleString()} · Placed{' '}
                    {trackedOrderResult.createdAt}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Attributable Customer Testimonials */}
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                <span>Verified Deliveries Across Bangladesh</span>
                <span aria-hidden="true">·</span>
                <span>৪.৯/৫ গ্রাহক সন্তুষ্টি</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-[#141413] tracking-tight">
                What Our Customers Say
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CUSTOMER_REVIEWS.map((rev) => (
                <blockquote
                  key={rev.id}
                  className="bg-white border border-stone-200/90 rounded-xl p-6 flex flex-col justify-between"
                >
                  <p className="text-sm text-stone-700 leading-relaxed mb-6">“{rev.quote}”</p>
                  <footer className="pt-4 border-t border-stone-100">
                    <div className="font-display text-sm font-bold text-[#141413]">
                      {rev.author}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {rev.role} · {rev.location}
                    </div>
                    <div className="text-[11px] font-mono text-stone-500 mt-1.5">
                      {rev.verifiedItem}
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Contiguous Purchase Module (Product Detail Modal) */}
      {activeProductModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-product-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs"
          onClick={() => setActiveProductModal(null)}
        >
          <div
            className="bg-white border border-stone-200 rounded-2xl max-w-3xl w-full overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-12"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Gallery Column */}
            <div className="md:col-span-6 bg-stone-100 relative min-h-[260px] md:min-h-[420px]">
              <ResilientImage
                src={activeProductModal.image}
                alt={activeProductModal.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Contiguous Purchase Module */}
            <div className="md:col-span-6 p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-stone-500 mb-2">
                  <span>
                    {activeProductModal.category} · {activeProductModal.sku}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveProductModal(null)}
                    aria-label="Close product details"
                    className="p-1 text-stone-400 hover:text-[#141413] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h2
                  id="modal-product-title"
                  className="font-display text-2xl font-bold text-[#141413]"
                >
                  {activeProductModal.name}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5 mb-3">
                  {activeProductModal.bengaliSubtitle}
                </p>

                <div className="font-mono tabular-nums text-xl font-bold text-[#B38300] mb-4">
                  ৳{activeProductModal.price.toLocaleString()}
                </div>

                <p className="text-xs text-stone-600 leading-relaxed mb-5">
                  {activeProductModal.summary}
                </p>

                {/* Technical Specifications */}
                <div className="border-t border-b border-stone-200 py-3 mb-5 space-y-1.5">
                  {activeProductModal.specifications.map((spec) => (
                    <div key={spec.label} className="flex justify-between text-xs gap-4">
                      <span className="text-stone-500">{spec.label}</span>
                      <span className="font-medium text-[#141413] text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>

                {/* Variant & Quantity Picker */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium text-stone-500 mb-1">
                      Option / Size
                    </label>
                    <select
                      value={modalVariant}
                      onChange={(e) => setModalVariant(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium bg-[#FAF9F5] border border-stone-200 rounded-lg"
                    >
                      {activeProductModal.variants.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-500 mb-1">
                      Quantity
                    </label>
                    <div className="flex items-center justify-between border border-stone-200 rounded-lg bg-[#FAF9F5] px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                        className="text-stone-600 hover:text-black cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono tabular-nums text-xs font-semibold">
                        {modalQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalQty((q) => q + 1)}
                        className="text-stone-600 hover:text-black cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart(activeProductModal, modalVariant, modalQty);
                    setActiveProductModal(null);
                  }}
                  className="w-full py-3 px-4 bg-[#E6B82E] hover:bg-[#f5c542] text-[#141413] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Add {modalQty} to Cart — ৳
                  {(activeProductModal.price * modalQty).toLocaleString()}
                </button>
                <p className="text-[11px] text-stone-500 text-center">
                  {activeProductModal.careOrWarranty}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clean Footer */}
      <footer className="bg-[#111111] text-stone-400 border-t border-stone-800">
        <div className="max-w-[1240px] mx-auto px-6 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-lg font-bold text-[#F5C542]">SS BRAND</h2>
            <p className="text-xs text-stone-400 mt-1">
              Thank you for shopping with us · আপনার বিশ্বস্ত অনলাইন শপ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <a href="#home" className="hover:text-white transition-colors">
              Home
            </a>
            <a href="#products" className="hover:text-white transition-colors">
              Products
            </a>
            <a href="#cart" className="hover:text-white transition-colors">
              My Cart
            </a>
            <a href="#track-order" className="hover:text-white transition-colors">
              Track Order
            </a>
            <span className="font-mono tabular-nums text-stone-300">
              WhatsApp: +880 1838-077166
            </span>
          </div>

          <p className="text-xs text-stone-500">© 2026 SS BRAND. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

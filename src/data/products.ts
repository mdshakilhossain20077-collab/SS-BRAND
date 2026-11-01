export interface Product {
  id: string;
  sku: string;
  name: string;
  bengaliSubtitle: string;
  category: 'Apparel' | 'Electronics' | 'Footwear' | 'Audio';
  price: number;
  image: string;
  availability: string;
  variants: string[];
  defaultVariant: string;
  summary: string;
  specifications: { label: string; value: string }[];
  careOrWarranty: string;
}

export interface CartItem {
  product: Product;
  variant: string;
  quantity: number;
}

export interface ConfirmedOrder {
  orderId: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryZone: 'inside_dhaka' | 'outside_dhaka';
  customerAddress: string;
  notes: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  whatsappUrl: string;
  whatsappMessage: string;
  status: 'Confirmed — Preparing Dispatch';
}

export const WHATSAPP_NUMBER = '8801838077166';
export const FREE_DELIVERY_THRESHOLD = 2000;

export const PRODUCTS: Product[] = [
  {
    id: 'prod-tshirt',
    sku: 'SS-APP-01',
    name: 'Premium T-Shirt',
    bengaliSubtitle: 'প্রিমিয়াম হেভিওয়েট কটন টি-শার্ট',
    category: 'Apparel',
    price: 450,
    image: '/src/assets/images/product_premium_tshirt_1793565712869.jpg',
    availability: 'In Stock',
    variants: ['Size M', 'Size L', 'Size XL', 'Size XXL'],
    defaultVariant: 'Size L',
    summary:
      'Tailored from 240 GSM combed ring-spun organic cotton with a structured ribbed crew collar and pre-shrunk matte finish built for humid climates.',
    specifications: [
      { label: 'Fabric Weight', value: '240 GSM Combed Ring-Spun Cotton' },
      { label: 'Fit Profile', value: 'Modern Relaxed Tailored Fit' },
      { label: 'Collar', value: 'Double-Stitched 1x1 Ribbed Crewneck' },
      { label: 'Colorway', value: 'Charcoal Obsidian' },
    ],
    careOrWarranty: '7-day easy size exchange · Machine wash cold inside out',
  },
  {
    id: 'prod-watch',
    sku: 'SS-ELC-02',
    name: 'Smart Watch',
    bengaliSubtitle: 'অ্যামোলেড ক্রোনোগ্রাফ স্মার্ট ওয়াচ',
    category: 'Electronics',
    price: 1200,
    image: '/src/assets/images/product_smart_watch_1793565712758.jpg',
    availability: 'In Stock',
    variants: ['Obsidian / Brushed Gold', 'Matte Black / Slate'],
    defaultVariant: 'Obsidian / Brushed Gold',
    summary:
      'Precision alloy case with sapphire-coated glass display, Bluetooth calling, heart-rate and SpO2 telemetry, and 7-day battery endurance on a single charge.',
    specifications: [
      { label: 'Case Material', value: '44mm Anodized Zinc-Alloy & Brass Crown' },
      { label: 'Display', value: '1.43" High-Contrast Always-On Display' },
      { label: 'Water Resistance', value: 'IP68 Dust & Splash Sealed' },
      { label: 'Battery Runtime', value: 'Up to 7 Days Active / 20 Days Standby' },
    ],
    careOrWarranty: '6-month official SS BRAND replacement warranty included',
  },
  {
    id: 'prod-shoes',
    sku: 'SS-FTW-03',
    name: 'Shoes',
    bengaliSubtitle: 'মিনিমালিস্ট লেদার ও সোয়েড স্নিকার্স',
    category: 'Footwear',
    price: 950,
    image: '/src/assets/images/product_shoes_1793565713737.jpg',
    availability: 'In Stock',
    variants: ['EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44'],
    defaultVariant: 'EU 42',
    summary:
      'Low-profile court sneaker crafted with supple microfiber leather panels, breathable suede toe-box overlays, and a stitched vulcanized rubber cupsole.',
    specifications: [
      { label: 'Upper Material', value: 'Full-Grain Microfiber Leather & Suede' },
      { label: 'Outsole', value: 'High-Traction Vulcanized Natural Rubber' },
      { label: 'Insole', value: 'High-Density Ortho-Cushion Footbed' },
      { label: 'Colorway', value: 'Chalk Stone / Warm Alabaster' },
    ],
    careOrWarranty: '7-day size exchange guarantee · Delivered in protective box',
  },
  {
    id: 'prod-headphone',
    sku: 'SS-AUD-04',
    name: 'Headphone',
    bengaliSubtitle: 'ওয়ারলেস স্টুডিও ওভার-ইয়ার হেডফোন',
    category: 'Audio',
    price: 650,
    image: '/src/assets/images/product_headphone_1793565714604.jpg',
    availability: 'In Stock',
    variants: ['Matte Black / Brass', 'Graphite Studio'],
    defaultVariant: 'Matte Black / Brass',
    summary:
      '40mm custom neodymium acoustic drivers delivering warm, articulate bass and crisp vocal separation, paired with memory-foam acoustic ear cushions.',
    specifications: [
      { label: 'Driver Unit', value: '40mm Dynamic Neodymium Transducers' },
      { label: 'Connectivity', value: 'Bluetooth 5.3 + 3.5mm Auxiliary Port' },
      { label: 'Playtime', value: 'Up to 32 Hours Continuous Playback' },
      { label: 'Charging', value: 'USB-C Fast Charge (10 min = 4 hrs)' },
    ],
    careOrWarranty: '6-month official SS BRAND service warranty included',
  },
];

export const HERO_IMAGE = '/src/assets/images/hero_ss_brand_collection_1793565711131.jpg';

export const CUSTOMER_REVIEWS = [
  {
    id: 'rev-1',
    quote:
      'Ordered the Premium T-Shirt and Smart Watch on WhatsApp at 11 AM and received doorstep Cash on Delivery in Dhanmondi the next afternoon. The 240 GSM fabric weight and watch finish exceeded expectations at this price.',
    author: 'Tanvir Ahmed',
    role: 'Product Designer',
    location: 'Dhanmondi, Dhaka',
    verifiedItem: 'Premium T-Shirt & Smart Watch · Order #SS-8841',
  },
  {
    id: 'rev-2',
    quote:
      'Finding clean minimalist sneakers under ৳1,000 that actually hold their shape is rare. SS BRAND let me inspect the parcel on delivery in Chattogram before paying cash.',
    author: 'Mahmudul Hasan',
    role: 'Architectural Consultant',
    location: 'Nasirabad, Chattogram',
    verifiedItem: 'Shoes (EU 42) · Order #SS-8914',
  },
  {
    id: 'rev-3',
    quote:
      'The over-ear Headphone ear cushions stay comfortable during 4-hour study sessions and the WhatsApp order confirmation gave me instant peace of mind without complicated account signups.',
    author: 'Nusrat Jahan',
    role: 'Graduate Researcher',
    location: 'Sylhet Sadar',
    verifiedItem: 'Headphone · Order #SS-9022',
  },
];

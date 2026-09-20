# Real & Natural — Premium Natural Raisins & Dry Fruits

A modern, full-stack Next.js e-commerce application replicated from [Real & Natural Storefront](https://pure-dried-goods.preview.emergentagent.com/).

Built with **Next.js 14 (App Router)**, **React**, **Tailwind CSS**, and **Lucide Icons**.

---

## 🌟 Features

- **Brand Aesthetic & Warm Design**: Deep forest green (`#173B2A`), golden amber (`#C49A4A`), warm parchment cream (`#F7F1E5`, `#EFE6D2`), and refined typography.
- **Top Announcement Bar**: Highlighting brand value propositions and pan-India delivery.
- **Sticky Navigation Header**:
  - Responsive mobile drawer menu
  - Live modal search dialog (instant autocomplete with Esc shortcut)
  - Admin dashboard direct shortcut
  - Shopping cart indicator with live item badge
- **Hero Section**:
  - Natural badge ("100% Natural • No Added Sugar")
  - CTAs ("SHOP NOW" and "EXPLORE COLLECTION")
  - Floating trust cards ("Quality Checked", "Free Delivery above ₹999")
  - 5-star customer proof badge ("Loved by 10,000+ happy customers")
- **Trust Bar**: 100% Natural, Quality Checked, Hygienically Packed, Fast Delivery.
- **Product Catalog (4 Handpicked Varieties)**:
  1. Golden Raisins (Kishmish)
  2. Premium Jumbo Raisins
  3. California Almonds (Badam)
  4. Premium Cashews (Kaju)
- **Dynamic Pack Sizes**: 250g, 500g, and 1kg options with dynamic price calculation, struck-through MRPs, and savings percentages.
- **Featured Spotlight**: Dedicated showcase for Golden Raisins with quantity steppers and quick Buy Now.
- **Why Choose Us & Farm-to-Home Process**: 5-step visual roadmap (Select → Process → Quality Check → Pack → Deliver).
- **Product Benefits & Customer Reviews**: Authenticated customer cards with ratings.
- **Curated Photo Gallery**: Responsive masonry-style photo grid.
- **Interactive FAQ Accordion**: Expandable answers to popular ordering, delivery, and storage questions.
- **Shopping Cart**:
  - Free delivery progress bar (dynamic meter towards the ₹999 threshold)
  - Quantity steppers & instant remove actions
  - Savings breakdown and total payable calculation
  - One-click **Order on WhatsApp** integration with pre-filled cart text
- **Seamless Indian Checkout**:
  - Form fields for Name, 10-digit Mobile, Address, City, State dropdown, and 6-digit Pincode
  - Field validation with Sonner toast feedback
  - Cash on Delivery (COD) and Online/UPI options
- **Order Confirmation Page**: Unique Order ID reference (e.g. `RN-962614`), delivery breakdown, and WhatsApp tracking link.
- **Admin Management Portal (`/admin`)**:
  - Protected with passkey authentication (`admin123`)
  - Real-time revenue, total order count, and pending order statistics
  - Live order management table with status updater (Pending → Confirmed → Shipped → Delivered → Cancelled)
- **Local JSON Database**: Zero-setup file persistence in `data/orders.json`.
- **Floating Sticky WhatsApp Action Button**: Bottom-right quick assistance.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## 🔐 Admin Dashboard Access

- Click **Admin** in the navigation header (or navigate to view `'admin'`)
- Default Passkey: `admin123`
- Can be customized via environment variable `ADMIN_TOKEN` in `.env.local`.

---

## 🔌 API Endpoints

- `GET /api/products`: Returns the catalog with optional `category` or `q` search query.
- `POST /api/orders`: Submits a customer order, validates inputs, and writes to `data/orders.json`.
- `GET /api/orders`: Returns all orders (requires `Authorization: Bearer admin123`).
- `PATCH /api/orders/[id]`: Updates fulfillment status of an order (requires admin token).

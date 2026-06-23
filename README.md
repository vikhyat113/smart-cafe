# Smart Cafe QR Ordering System

A complete MVP for a QR-code based cafe ordering system. Customers scan the
QR code on their table, browse the menu, place an order, and track it live
— no app, no account, no waiter needed to take the order. Cafe staff manage
everything from a real-time admin dashboard.

**Version 1 has no payment gateway and no customer login by design** — the
data model (especially `priceAtOrderTime` on order items) is structured so a
payment step can be added later without reworking the order/menu schema.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, React Router, Axios, Socket.IO Client, Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcrypt (bcryptjs) |
| Real-time | Socket.IO |
| QR Codes | `qrcode` npm package (static, pre-generated) |
| File uploads | Multer |

---

## Project Structure

```
smart-cafe-qr/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route handler logic
│   ├── middleware/       # auth, upload, error handling
│   ├── models/           # Admin, MenuItem, Order, Settings
│   ├── routes/           # Express routers
│   ├── services/         # order validation / business logic
│   ├── sockets/          # Socket.IO room + event wiring
│   ├── utils/            # order-id generator, QR generator, seed script
│   ├── uploads/           # uploaded menu item images (gitignored)
│   ├── public/qrcodes/    # pre-generated table QR codes (30 tables)
│   └── server.js
└── frontend/
    └── src/
        ├── pages/customer/   # MenuPage, CartPage, OrderTrackingPage
        ├── pages/admin/      # Login, Dashboard, Orders, Menu, History, Settings
        ├── components/       # customer/, admin/, shared/ UI pieces
        ├── layouts/          # CustomerLayout, AdminLayout
        ├── contexts/         # Auth, Cart, Socket, Settings, Toast
        ├── hooks/            # useDarkMode
        ├── services/         # axios instance
        └── utils/            # currency/date formatting
```

---

## 1. Prerequisites

- Node.js 18+
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or any
  MongoDB connection string)

---

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/smart-cafe?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Seed the default admin account, demo menu, and demo orders:

```bash
npm run seed
```

This creates:
- Admin login: **admin@cafe.com / admin123** (password is hashed with bcrypt before storing)
- 15 demo menu items across all 7 categories
- 2 demo orders (one served, one preparing)
- Default cafe settings

(Re)generate the static table QR codes any time (already included, pointing
at `http://localhost:5173/table/<n>` by default — re-run if you change
`FRONTEND_URL` or deploy to a real domain):

```bash
npm run generate-qr
```

Start the backend:

```bash
npm run dev      # nodemon, auto-restart on changes
# or
npm start        # plain node
```

The API runs at `http://localhost:5000`. Health check: `GET /api/health`.

---

## 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

---

## 4. Using the App

**As a customer** — visit `http://localhost:5173/table/5` (simulating a
scanned QR for table 5), or open one of the generated images in
`backend/public/qrcodes/table-5.png` with a phone camera (once the backend
is deployed somewhere reachable from that phone).

**As cafe staff** — visit `http://localhost:5173/admin/login` and sign in
with `admin@cafe.com` / `admin123`.

---

## 5. How Each Required Feature Is Implemented

- **QR codes**: static PNGs generated once via `npm run generate-qr`,
  served from `/qrcodes/table-<n>.png`. Each encodes
  `<FRONTEND_URL>/table/<n>`. No dynamic generation at request time.
- **No login for customers**: the table number comes straight from the
  URL path; `CartContext` keys the persisted cart by table number in
  `localStorage`.
- **Cart persistence**: `CartContext` + `localStorage`, scoped per table so
  carts on different tables on the same device never mix.
- **Special instructions**: captured per cart item, stored on the order's
  embedded `items[].specialInstructions`.
- **Order IDs**: `crypto.randomUUID()` trimmed to a readable `ORD-AB12CD`
  format (`backend/utils/generateOrderId.js`), checked for uniqueness
  before saving.
- **Price integrity**: `priceAtOrderTime` is snapshotted server-side from
  the current `MenuItem.price` at the moment of order creation — never
  trusted from the client, and never mutated afterwards even if the menu
  price changes later.
- **Menu item deletion never breaks history**: `MenuItem.delete` is a soft
  delete (`isDeleted: true`); also each order item already carries its own
  copy of the name/price, so historical orders render correctly even if
  the underlying menu item is later deleted entirely.
- **Duplicate order prevention**: the "Place Order" button disables itself
  immediately on click (frontend), and the backend additionally rejects/
  dedupes an identical cart (same table + items + total) submitted again
  within a 10-second window.
- **Order status workflow**: enforced server-side in
  `backend/services/orderService.js` (`ALLOWED_TRANSITIONS`) — you can't
  skip from `NEW` straight to `SERVED`, for example.
- **Real-time updates**: Socket.IO rooms — `admin` (joined by every admin
  dashboard) and `order-<orderId>` (joined by a customer's tracking page).
  `order-created` fires to the admin room; status changes fire both a
  specific event (`order-accepted`, `order-preparing`, ...) and a generic
  `order-updated` to both relevant rooms.
- **Connection loss handling**: `SocketContext` tracks `connected` state;
  `ConnectionBanner` shows "Connection lost" with a manual **Retry** button
  on top of Socket.IO's own automatic reconnection.
- **Admin auth**: bcrypt-hashed passwords, JWT issued on login, `protect`
  middleware guards all admin routes, token persisted in `localStorage` and
  restored via `GET /api/auth/me` on page load (session persistence),
  cleared on logout.
- **Dark mode**: Tailwind `darkMode: 'class'`, toggled and persisted via
  `useDarkMode` hook.

---

## 6. API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | `{ email, password }` → `{ token, admin }` |
| GET | `/api/auth/me` | Admin | Returns current admin (session restore) |

### Menu
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/menu` | — | List menu items. Query: `category`, `search`, `admin=true` |
| POST | `/api/menu` | Admin | Create item (multipart form, field `image`) |
| PUT | `/api/menu/:id` | Admin | Update item (multipart form) |
| PATCH | `/api/menu/:id/availability` | Admin | Toggle hide/restore (`available`) |
| PATCH | `/api/menu/:id/restore` | Admin | Undo a soft delete |
| DELETE | `/api/menu/:id` | Admin | Soft-delete an item |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | — | `{ tableNumber, items: [{menuItemId, quantity, specialInstructions}] }` |
| GET | `/api/orders` | Admin | List/filter. Query: `status`, `tableNumber`, `orderId`, `date`, `search`, `page`, `limit`, `sort` |
| GET | `/api/orders/:orderId` | — | Fetch a single order for customer tracking |
| PATCH | `/api/orders/:orderId/status` | Admin | `{ status }` — validated against the allowed workflow |

### Settings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/settings` | — | Cafe name, currency symbol, etc. |
| PUT | `/api/settings` | Admin | Update cafe settings |

### Socket.IO Events
Client → server: `join-admin`, `join-order` (orderId), `leave-order` (orderId)

Server → client: `order-created`, `order-accepted`, `order-preparing`,
`order-ready`, `order-served`, `order-cancelled`, `order-updated` (generic,
fired alongside every status-specific event above)

---

## 7. Adding Payments Later (by design)

Version 1 intentionally has no payment gateway, but the schema is ready:
- `Order.totalAmount` and `Order.items[].priceAtOrderTime` already capture
  exactly what should be charged.
- Add a `paymentStatus` field and a `PAID`/`UNPAID` flag to `Order`, plug a
  payment provider into the `CartPage` "Place Order" step, and gate status
  transitions or kitchen visibility on `paymentStatus` if you want payment
  before preparation — no other model changes required.

---

## 8. Notes & Limitations (MVP scope)

- `bcryptjs` (pure JS) is used instead of native `bcrypt` for zero-friction
  installs across platforms — it's a drop-in compatible API.
- Image uploads are stored on local disk (`backend/uploads/`); swap in
  S3/Cloudinary storage for production deployments.
- The 10-second duplicate-order guard is a simple heuristic, not a full
  idempotency-key system — sufficient for the "double-tap" edge case it's
  designed to catch.

-- ============ BITES V1 SCHEMA ============
CREATE TABLE users (
  id              VARCHAR(40) PRIMARY KEY,
  email           VARCHAR(200) UNIQUE,
  phone           VARCHAR(20),
  display_name    VARCHAR(120) NOT NULL,
  password_hash   VARCHAR(255),
  role            VARCHAR(20) NOT NULL CHECK (role IN ('CUSTOMER','RESTAURANT_OWNER','COURIER','ADMIN')),
  locale          VARCHAR(5) NOT NULL DEFAULT 'id',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE addresses (
  id              VARCHAR(40) PRIMARY KEY,
  user_id         VARCHAR(40) NOT NULL REFERENCES users(id),
  label           VARCHAR(40) NOT NULL,
  detail          TEXT NOT NULL,
  notes           TEXT,
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  is_default      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_addresses_user ON addresses(user_id);

CREATE TABLE restaurants (
  id              VARCHAR(40) PRIMARY KEY,
  owner_id        VARCHAR(40) REFERENCES users(id),
  name            VARCHAR(120) NOT NULL,
  slug            VARCHAR(140) UNIQUE NOT NULL,
  tagline         TEXT,
  logo            TEXT,
  banner          TEXT,
  cuisine         TEXT NOT NULL DEFAULT '',
  rating_avg      NUMERIC(3,2) DEFAULT 0,
  rating_count    INT NOT NULL DEFAULT 0,
  distance_km     DOUBLE PRECISION NOT NULL DEFAULT 0,
  eta_minutes     INT NOT NULL DEFAULT 20,
  delivery_fee    BIGINT NOT NULL DEFAULT 0,
  min_order       BIGINT NOT NULL DEFAULT 0,
  address_detail  TEXT NOT NULL,
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  is_open         BOOLEAN NOT NULL DEFAULT true,
  is_busy         BOOLEAN NOT NULL DEFAULT false,
  opening_hours   VARCHAR(80),
  categories      TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_restaurants_loc ON restaurants(lat, lng);

CREATE TABLE menu_categories (
  id              VARCHAR(40) PRIMARY KEY,
  restaurant_id   VARCHAR(40) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            VARCHAR(80) NOT NULL,
  sort_order      INT NOT NULL DEFAULT 0
);

CREATE TABLE menu_items (
  id              VARCHAR(40) PRIMARY KEY,
  restaurant_id   VARCHAR(40) NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category        VARCHAR(80) NOT NULL,
  name            VARCHAR(160) NOT NULL,
  description     TEXT,
  price           BIGINT NOT NULL CHECK (price >= 0),
  original_price  BIGINT,
  image           TEXT,
  available       BOOLEAN NOT NULL DEFAULT true,
  is_bestseller   BOOLEAN NOT NULL DEFAULT false,
  is_spicy        BOOLEAN NOT NULL DEFAULT false,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);

CREATE TABLE modifier_groups (
  id              VARCHAR(40) PRIMARY KEY,
  menu_item_id    VARCHAR(40) NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name            VARCHAR(80) NOT NULL,
  required        BOOLEAN NOT NULL DEFAULT false,
  min_selection   INT NOT NULL DEFAULT 0,
  max_selection   INT NOT NULL DEFAULT 1,
  sort_order      INT NOT NULL DEFAULT 0
);

CREATE TABLE modifiers (
  id              VARCHAR(40) PRIMARY KEY,
  group_id        VARCHAR(40) NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
  name            VARCHAR(120) NOT NULL,
  price           BIGINT NOT NULL DEFAULT 0,
  is_default      BOOLEAN NOT NULL DEFAULT false,
  available       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INT NOT NULL DEFAULT 0
);

CREATE TABLE couriers (
  id              VARCHAR(40) PRIMARY KEY,
  user_id         VARCHAR(40) REFERENCES users(id),
  name            VARCHAR(120) NOT NULL,
  phone           VARCHAR(30),
  masked_phone    VARCHAR(30),
  vehicle         VARCHAR(40) NOT NULL DEFAULT 'Motor',
  plate_number    VARCHAR(20),
  photo           TEXT,
  rating_avg      NUMERIC(3,2) DEFAULT 5,
  trips_completed INT NOT NULL DEFAULT 0,
  status          VARCHAR(20) NOT NULL DEFAULT 'OFFLINE',
  current_lat     DOUBLE PRECISION NOT NULL DEFAULT -6.2297,
  current_lng     DOUBLE PRECISION NOT NULL DEFAULT 106.8532,
  heading         DOUBLE PRECISION NOT NULL DEFAULT 0
);

CREATE TABLE orders (
  id                    VARCHAR(40) PRIMARY KEY,
  order_number          VARCHAR(20) UNIQUE NOT NULL,
  customer_id           VARCHAR(40) REFERENCES users(id),
  restaurant_id         VARCHAR(40) NOT NULL REFERENCES restaurants(id),
  courier_id            VARCHAR(40) REFERENCES couriers(id),
  status                VARCHAR(30) NOT NULL,
  service_mode          VARCHAR(20) NOT NULL,
  customer_name         VARCHAR(120) NOT NULL,
  customer_phone        VARCHAR(30),
  delivery_address      TEXT NOT NULL,
  delivery_notes        TEXT,
  delivery_lat          DOUBLE PRECISION NOT NULL,
  delivery_lng          DOUBLE PRECISION NOT NULL,
  subtotal              BIGINT NOT NULL,
  delivery_fee          BIGINT NOT NULL DEFAULT 0,
  service_fee           BIGINT NOT NULL DEFAULT 0,
  discount              BIGINT NOT NULL DEFAULT 0,
  promo_code            VARCHAR(40),
  tip                   BIGINT NOT NULL DEFAULT 0,
  grand_total           BIGINT NOT NULL,
  payment_method        VARCHAR(30) NOT NULL,
  payment_status        VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
  payment_ref           VARCHAR(80),
  pin                   VARCHAR(4) NOT NULL,
  prep_time_minutes     INT NOT NULL DEFAULT 15,
  eta_minutes_remaining INT,
  placed_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at           TIMESTAMPTZ,
  preparing_at          TIMESTAMPTZ,
  ready_at              TIMESTAMPTZ,
  courier_assigned_at   TIMESTAMPTZ,
  picked_up_at          TIMESTAMPTZ,
  delivered_at          TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ,
  cancel_reason         TEXT,
  refund_amount         BIGINT NOT NULL DEFAULT 0,
  food_stars            INT,
  courier_stars         INT,
  rating_comment        TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_customer ON orders(customer_id, placed_at DESC);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id, placed_at DESC);
CREATE INDEX idx_orders_courier ON orders(courier_id);

CREATE TABLE order_items (
  id                    VARCHAR(40) PRIMARY KEY,
  order_id              VARCHAR(40) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id          VARCHAR(40),
  name_snapshot         VARCHAR(160) NOT NULL,
  image_snapshot        TEXT,
  unit_price            BIGINT NOT NULL,
  quantity              INT NOT NULL CHECK (quantity > 0),
  modifiers_json        TEXT,
  notes                 TEXT,
  line_total            BIGINT NOT NULL
);

CREATE TABLE order_events (
  id            VARCHAR(40) PRIMARY KEY,
  order_id      VARCHAR(40) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status   VARCHAR(30),
  to_status     VARCHAR(30) NOT NULL,
  actor         VARCHAR(20) NOT NULL,
  reason        TEXT,
  at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_events_order ON order_events(order_id, at);

CREATE TABLE payments (
  id              VARCHAR(40) PRIMARY KEY,
  order_id        VARCHAR(40) NOT NULL REFERENCES orders(id),
  provider        VARCHAR(20) NOT NULL,
  external_id     VARCHAR(120),
  method          VARCHAR(40),
  status          VARCHAR(20) NOT NULL,
  amount          BIGINT NOT NULL,
  qr_string       TEXT,
  va_number       VARCHAR(40),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at         TIMESTAMPTZ
);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE UNIQUE INDEX uq_payments_external ON payments(provider, external_id) WHERE external_id IS NOT NULL;

CREATE TABLE promo_codes (
  code                VARCHAR(40) PRIMARY KEY,
  title               VARCHAR(120) NOT NULL,
  description         TEXT,
  discount_type       VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage','flat','free_delivery')),
  discount_value      BIGINT NOT NULL DEFAULT 0,
  min_spend           BIGINT NOT NULL DEFAULT 0,
  max_discount        BIGINT,
  valid_until         TIMESTAMPTZ NOT NULL,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  max_redemptions     INT,
  redeemed_count      INT NOT NULL DEFAULT 0
);

CREATE TABLE idempotency_keys (
  key             VARCHAR(120) PRIMARY KEY,
  method          VARCHAR(10) NOT NULL,
  path            VARCHAR(200) NOT NULL,
  response_body   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

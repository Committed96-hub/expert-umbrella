-- Target PostgreSQL schema. Apply only after provisioning a persistent database.
CREATE TABLE residents(id uuid PRIMARY KEY, external_subject text UNIQUE NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE assets(id uuid PRIMARY KEY, object_key text UNIQUE NOT NULL, content_type text NOT NULL, size_bytes bigint NOT NULL CHECK(size_bytes>0), owner_id uuid REFERENCES residents(id));
CREATE TABLE catalog(id uuid PRIMARY KEY, section text NOT NULL, title text NOT NULL, body jsonb NOT NULL, source_mode text NOT NULL CHECK(source_mode IN ('demo','live')), media_id uuid REFERENCES assets(id), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE orders(id uuid PRIMARY KEY, resident_id uuid NOT NULL REFERENCES residents(id), kind text NOT NULL CHECK(kind IN('exchange','food','booking','affiliate')), status text NOT NULL, total_minor bigint NOT NULL CHECK(total_minor>=0), currency text NOT NULL DEFAULT 'RUB', idempotency_key text NOT NULL, request_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(resident_id,idempotency_key));
CREATE TABLE order_items(id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES orders(id), item_id uuid NOT NULL, quantity integer NOT NULL CHECK(quantity>0), unit_price_minor bigint NOT NULL CHECK(unit_price_minor>=0));
CREATE TABLE payment_intents(id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES orders(id), provider text NOT NULL, provider_reference text UNIQUE, status text NOT NULL, amount_minor bigint NOT NULL CHECK(amount_minor>=0));
CREATE TABLE bonus_accounts(resident_id uuid PRIMARY KEY REFERENCES residents(id), balance bigint NOT NULL CHECK(balance>=0), max_payment_percent integer NOT NULL DEFAULT 20 CHECK(max_payment_percent BETWEEN 0 AND 100));
CREATE TABLE bonus_ledger(id uuid PRIMARY KEY, resident_id uuid NOT NULL REFERENCES residents(id), order_id uuid REFERENCES orders(id), operation text NOT NULL CHECK(operation IN('earn','spend','refund','adjustment')), points bigint NOT NULL, reason text NOT NULL, idempotency_key text UNIQUE NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE bookings(id uuid PRIMARY KEY,resident_id uuid NOT NULL REFERENCES residents(id),provider_id uuid NOT NULL,start_at timestamptz NOT NULL,status text NOT NULL,source_mode text NOT NULL, UNIQUE(resident_id,provider_id,start_at));
CREATE TABLE monetization_rules(kind text PRIMARY KEY, enabled boolean NOT NULL DEFAULT false, rate_bps integer NOT NULL DEFAULT 0 CHECK(rate_bps BETWEEN 0 AND 10000));
CREATE TABLE pharmacy_offers(id uuid PRIMARY KEY, pharmacy_id uuid NOT NULL, medicine_id text NOT NULL, price_minor bigint CHECK(price_minor>=0), available boolean NOT NULL, source_reference text NOT NULL, updated_at timestamptz NOT NULL);
-- Booking/order/bonus updates must share a DB transaction; verify payment webhooks,
-- reconcile refunds, enforce tenant ownership, moderation and retention before live use.
CREATE TABLE comments(id uuid PRIMARY KEY, resident_id uuid NOT NULL REFERENCES residents(id), catalog_id uuid NOT NULL REFERENCES catalog(id), text text NOT NULL CHECK(length(text) BETWEEN 1 AND 1000), created_at timestamptz NOT NULL DEFAULT now());

-- Curated source snapshots and demo experience records. Existing live transaction tables are unaffected.
CREATE TABLE IF NOT EXISTS city_source_snapshots (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS demo_experience_records (
  id TEXT PRIMARY KEY,
  session_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('ticket', 'exchange', 'job_draft')),
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS demo_experience_session_idx ON demo_experience_records(session_id, kind);

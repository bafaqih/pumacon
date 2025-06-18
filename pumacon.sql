-- Final Project Software Engineering
-- Anggota Kelompok: Hasan Fadlullah - 2702357011, Joshua Stevenjho W. N. - 2702343731, Jonathan Alwi - 2702239851

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.0

-- Started on 2025-06-17 20:25:19

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 3552 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 258 (class 1255 OID 57704)
-- Name: calculatefinancialsummary(); Type: FUNCTION; Schema: public; Owner: bafaqih
--

CREATE FUNCTION public.calculatefinancialsummary(OUT total_omset_formatted text, OUT total_profit_formatted text) RETURNS record
    LANGUAGE plpgsql
    AS $$
DECLARE
    calculated_omset NUMERIC;
    calculated_cogs NUMERIC;
    calculated_profit NUMERIC;
    -- Daftar status order yang dianggap sebagai penjualan berhasil
    valid_order_statuses TEXT[] := ARRAY['Completed', 'Shipped', 'Delivered', 'Processing'];
BEGIN
    -- 1. Hitung Total Omset dari item order yang valid
    SELECT COALESCE(SUM(oi.price_at_order * oi.quantity), 0)
    INTO calculated_omset
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.order_status = ANY(valid_order_statuses);

    -- 2. Hitung Total Modal (COGS) dari item order yang valid
    SELECT COALESCE(SUM(p.capital_price * oi.quantity), 0)
    INTO calculated_cogs
    FROM order_items oi
    JOIN products p ON oi.product_sku = p.product_sku
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.order_status = ANY(valid_order_statuses);

    -- 3. Hitung Total Profit
    calculated_profit := calculated_omset - calculated_cogs;

    -- 4. Format output ke teks Rupiah
    -- Format 'FM999G999G999G990D00' akan menghasilkan format angka seperti 1.234.567,89
    -- (dengan asumsi pengaturan locale database Anda (LC_NUMERIC) adalah id_ID.
    -- Jika tidak, pemisah ribuan mungkin koma dan desimal mungkin titik)
    total_omset_formatted := 'Rp ' || TO_CHAR(calculated_omset, 'FM999G999G999G990D00');
    total_profit_formatted := 'Rp ' || TO_CHAR(calculated_profit, 'FM999G999G999G990D00');

END;
$$;


ALTER FUNCTION public.calculatefinancialsummary(OUT total_omset_formatted text, OUT total_profit_formatted text) OWNER TO bafaqih;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 229 (class 1259 OID 49581)
-- Name: carts; Type: TABLE; Schema: public; Owner: bafaqih
--

CREATE TABLE public.carts (
    cart_id integer NOT NULL,
    customer_id character varying(13) NOT NULL,
    product_sku character varying(13) NOT NULL,
    image text,
    title character varying(255) NOT NULL,
    regular_price numeric(12,2) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    total numeric(12,2) GENERATED ALWAYS AS ((regular_price * (quantity)::numeric)) STORED,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.carts OWNER TO bafaqih;

--
-- TOC entry 228 (class 1259 OID 49580)
-- Name: carts_cart_id_seq; Type: SEQUENCE; Schema: public; Owner: bafaqih
--

CREATE SEQUENCE public.carts_cart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carts_cart_id_seq OWNER TO bafaqih;

--
-- TOC entry 3553 (class 0 OID 0)
-- Dependencies: 228
-- Name: carts_cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bafaqih
--

ALTER SEQUENCE public.carts_cart_id_seq OWNED BY public.carts.cart_id;


--
-- TOC entry 227 (class 1259 OID 49513)
-- Name: customer_address; Type: TABLE; Schema: public; Owner: bafaqih
--

CREATE TABLE public.customer_address (
    address_id integer NOT NULL,
    customer_id character varying(13) NOT NULL,
    title character varying(100) NOT NULL,
    street character varying(100) NOT NULL,
    additional character varying(100),
    district_city character varying(100) NOT NULL,
    province character varying(100) NOT NULL,
    post_code character varying(100) NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.customer_address OWNER TO bafaqih;

--
-- TOC entry 226 (class 1259 OID 49512)
-- Name: customer_address_address_id_seq; Type: SEQUENCE; Schema: public; Owner: bafaqih
--

CREATE SEQUENCE public.customer_address_address_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_address_address_id_seq OWNER TO bafaqih;

--
-- TOC entry 3554 (class 0 OID 0)
-- Dependencies: 226
-- Name: customer_address_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bafaqih
--

ALTER SEQUENCE public.customer_address_address_id_seq OWNED BY public.customer_address.address_id;


--
-- TOC entry 225 (class 1259 OID 41345)
-- Name: customer_details; Type: TABLE; Schema: public; Owner: bafaqih
--

CREATE TABLE public.customer_details (
    customer_id character varying(13) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    image text,
    email character varying(255) NOT NULL,
    phone character varying(20),
    join_date date,
    birthday date,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.customer_details OWNER TO bafaqih;

--
-- TOC entry 237 (class 1259 OID 74089)
-- Name: customer_id_seq; Type: SEQUENCE; Schema: public; Owner: bafaqih
--

CREATE SEQUENCE public.customer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_id_seq OWNER TO bafaqih;

--
-- TOC entry 217 (class 1259 OID 16744)
-- Name: customers; Type: TABLE; Schema: public; Owner: bafaqih
--

CREATE TABLE public.customers (
    customer_id character varying(13) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    password character varying(255) NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.customers OWNER TO bafaqih;

--
-- TOC entry 239 (class 1259 OID 74091)
-- Name: department_id_seq; Type: SEQUENCE; Schema: public; Owner: bafaqih
--

CREATE SEQUENCE public.department_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.department_id_seq OWNER TO bafaqih;

--
-- TOC entry 221 (class 1259 OID 24936)
-- Name: departments; Type: TABLE; Schema: public; Owner: bafaqih
--

CREATE TABLE public.departments (
    department_id character varying(13) NOT NULL,
    department_name text NOT NULL,
    description text,
    status character varying(20) NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.departments OWNER TO bafaqih;

--
-- TOC entry 238 (class 1259 OID 74090)
-- Name: employee_id_seq; Type: SEQUENCE; Schema: public; Owner: bafaqih
--

CREATE SEQUENCE public.employee_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_id_seq OWNER TO bafaqih;

--
-- TOC entry 218 (class 1259 OID 16757)
-- Name: employees; Type: TABLE; Schema: public; Owner: bafaqih
--

CREATE TABLE public.employees (
    employee_id character varying(13) NOT NULL,
    image text,
    full_name text NOT NULL,
    birthday date,
    department character varying(7),
    email text NOT NULL,
    phone text,
    join_date date,
    role text,
    status text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.employees OWNER TO bafaqih;

--
-- TOC entry 220 (class 1259 OID 16823)
-- Name: employees_account; Type: TABLE; Schema: public; Owner: bafaqih
--

CREATE TABLE public.employees_account (
    employee_id character varying(13) NOT NULL,
    full_name text NOT NULL,
    role text NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.employees_account OWNER TO bafaqih;

--
-- TOC entry 219 (class 1259 OID 16809)
-- Name: employees_address; Type: TABLE; Schema: public; Owner: bafaqih
--

CREATE TABLE public.employees_address (
    employee_id character varying(13) NOT NULL,
    street text,
    district_city text,
    province text,
    post_code text,
    country text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.employees_address OWNER TO bafaqih;

--
-- TOC entry 246 (class 1259 OID 74131)
-- Name: news; Type: TABLE; Schema: public; Owner: bafaqih
--

CREATE TABLE public.news (
    news_id character varying(8) NOT NULL,
    title character varying(255) NOT NULL,
    image text,
    content text NOT NULL,
    category_id character varying(8) NOT NULL,
    author_id character varying(13) NOT NULL,
    publication_date timestamp with time zone NOT NULL,
    status character varying(20) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT news_status_check CHECK (((status)::text = ANY ((ARRAY['Published'::character varying, 'Draft'::character varying])::text[])))
);


ALTER TABLE public.news OWNER TO bafaqih;

--
-- TOC entry 244 (class 1259 OID 74119)
-- Name: news_categories; Type: TABLE; Schema: public; Owner: bafaqih
--

CREATE TABLE public.news_categories (
    category_id character varying(8) NOT NULL,
    category_name character varying(100) NOT NULL,
    description text,
    status character varying(20) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.news_categories OWNER TO bafaqih;

--
-- TOC entry 243 (class 1259 OID 74118)
-- Name: news_category_id_seq; Type: SEQUENCE; Schema: public; Owner: bafaqih
--

CREATE SEQUENCE public.news_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.news_category_id_seq OWNER TO bafaqih;

--
-- TOC entry 245 (class 1259 OID 74130)
-- Name: news_id_seq; Type: SEQUENCE; Schema: public; Owner: bafaqih
--

CREATE SEQUENCE public.news_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.news_id_seq OWNER TO bafaqih;

--
-- TOC entry 236 (class 1259 OID 74088)
-- Name: order_id_seq; Type: SEQUENCE; Schema: public; Owner: bafaqih
--

CREATE SEQUENCE public.order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_id_seq OWNER TO bafaqih;

--
-- TOC entry 232 (class 1259 OID 49737)
-- Name: order_items; Type: TABLE; Schema: public; Owner: bafaqih
--

CREATE TABLE public.order_items (
    order_item_id integer NOT NULL,
    order_id character varying(10) NOT NULL,
    product_sku character varying(13) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price_at_order numeric(12,2) NOT NULL,
    product_title_snapshot character varying(255) NOT NULL,
    product_image_snapshot text,
    sub_total numeric(12,2) GENERATED ALWAYS AS ((price_at_order * (quantity)::numeric)) STORED,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.order_items OWNER TO bafaqih;

--
-- TOC entry 231 (class 1259 OID 49736)
-- Name: order_items_order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: bafaqih
--

CREATE SEQUENCE public.order_items_order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_order_item_id_seq OWNER TO bafaqih;

--
-- TOC entry 3555 (class 0 OID 0)
-- Dependencies: 231
-- Name: order_items_order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bafaqih
--

ALTER SEQUENCE public.order_items_order_item_id_seq OWNED BY public.order_items.order_item_id;


--
-- TOC entry 230 (class 1259 OID 49715)
-- Name: orders; Type: TABLE; Schema: public; Owner: bafaqih
--

CREATE TABLE public.orders (
    order_id character varying(10) NOT NULL,
    customer_id character varying(13) NOT NULL,
    customer_fullname character varying(200) NOT NULL,
    customer_email character varying(255) NOT NULL,
    customer_phone character varying(20),
    shipping_address_id bigint NOT NULL,
    shipping_address_snapshot text NOT NULL,
    order_date_time timestamp without time zone NOT NULL,
    payment_method character varying(50) NOT NULL,
    order_status character varying(50) NOT NULL,
    grand_total numeric(12,2) NOT NULL,
    notes text,
    proof_of_payment text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.orders OWNER TO bafaqih;

--
-- TOC entry 222 (class 1259 OID 33128)
-- Name: product_categories; Type: TABLE; Schema: public; Owner: bafaqih
--

CREATE TABLE public.product_categories (
    category_id character varying(13) NOT NULL,
    category_name text NOT NULL,
    description text,
    status character varying(20) NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.product_categories OWNER TO bafaqih;

--
-- TOC entry 240 (class 1259 OID 74092)
-- Name: product_category_id_seq; Type: SEQUENCE; Schema: public; Owner: bafaqih
--

CREATE SEQUENCE public.product_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_category_id_seq OWNER TO bafaqih;

--
-- TOC entry 224 (class 1259 OID 33154)
-- Name: product_images; Type: TABLE; Schema: public; Owner: bafaqih
--

CREATE TABLE public.product_images (
    product_sku character varying(14),
    image text NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    id bigint NOT NULL
);


ALTER TABLE public.product_images OWNER TO bafaqih;

--
-- TOC entry 242 (class 1259 OID 74110)
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: bafaqih
--

CREATE SEQUENCE public.product_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_images_id_seq OWNER TO bafaqih;

--
-- TOC entry 3556 (class 0 OID 0)
-- Dependencies: 242
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bafaqih
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- TOC entry 241 (class 1259 OID 74093)
-- Name: product_sku_seq; Type: SEQUENCE; Schema: public; Owner: bafaqih
--

CREATE SEQUENCE public.product_sku_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_sku_seq OWNER TO bafaqih;

--
-- TOC entry 223 (class 1259 OID 33139)
-- Name: products; Type: TABLE; Schema: public; Owner: bafaqih
--

CREATE TABLE public.products (
    product_sku character varying(14) NOT NULL,
    title character varying(255) NOT NULL,
    brand character varying(100),
    product_category character varying(7),
    power_source character varying(100),
    warranty_period character varying(50),
    production_date date,
    descriptions text,
    stock integer DEFAULT 0,
    status character varying(20) NOT NULL,
    regular_price numeric(12,2),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    capital_price numeric(12,2)
);


ALTER TABLE public.products OWNER TO bafaqih;

--
-- TOC entry 234 (class 1259 OID 57710)
-- Name: view_customer_loyalty; Type: VIEW; Schema: public; Owner: bafaqih
--

CREATE VIEW public.view_customer_loyalty AS
 SELECT COALESCE((((cd.first_name)::text || ' '::text) || (cd.last_name)::text), (c.email)::text, (c.customer_id)::text) AS nama_customer,
    COALESCE(os.count_valid_orders, (0)::bigint) AS jumlah_order_valid,
    COALESCE(os.sum_grand_total_valid, 0.00) AS total_belanja_amount
   FROM ((public.customers c
     LEFT JOIN public.customer_details cd ON (((c.customer_id)::text = (cd.customer_id)::text)))
     LEFT JOIN ( SELECT o.customer_id,
            count(o.order_id) AS count_valid_orders,
            sum(o.grand_total) AS sum_grand_total_valid
           FROM public.orders o
          WHERE ((o.order_status)::text = ANY (ARRAY['Completed'::text, 'Shipped'::text, 'Delivered'::text, 'Processing'::text]))
          GROUP BY o.customer_id) os ON (((c.customer_id)::text = (os.customer_id)::text)));


ALTER VIEW public.view_customer_loyalty OWNER TO bafaqih;

--
-- TOC entry 233 (class 1259 OID 57705)
-- Name: view_product_popularity; Type: VIEW; Schema: public; Owner: bafaqih
--

CREATE VIEW public.view_product_popularity AS
 SELECT p.title AS nama_produk,
    COALESCE(sum(
        CASE
            WHEN ((o.order_status)::text = ANY (ARRAY['Completed'::text, 'Shipped'::text, 'Delivered'::text, 'Processing'::text])) THEN oi.quantity
            ELSE 0
        END), (0)::bigint) AS jumlah_terjual
   FROM ((public.products p
     LEFT JOIN public.order_items oi ON (((p.product_sku)::text = (oi.product_sku)::text)))
     LEFT JOIN public.orders o ON (((oi.order_id)::text = (o.order_id)::text)))
  GROUP BY p.product_sku, p.title
  ORDER BY COALESCE(sum(
        CASE
            WHEN ((o.order_status)::text = ANY (ARRAY['Completed'::text, 'Shipped'::text, 'Delivered'::text, 'Processing'::text])) THEN oi.quantity
            ELSE 0
        END), (0)::bigint) DESC, p.title;


ALTER VIEW public.view_product_popularity OWNER TO bafaqih;

--
-- TOC entry 235 (class 1259 OID 57715)
-- Name: view_top_and_bottom_loyal_customers; Type: VIEW; Schema: public; Owner: bafaqih
--

CREATE VIEW public.view_top_and_bottom_loyal_customers AS
 WITH customerloyaltymetrics AS (
         SELECT COALESCE((((cd.first_name)::text || ' '::text) || (cd.last_name)::text), (c.email)::text, (c.customer_id)::text) AS nama_customer,
            COALESCE(order_summary.count_valid_orders, (0)::bigint) AS jumlah_order_valid,
            COALESCE(order_summary.total_valid_amount, 0.00) AS total_belanja_amount
           FROM ((public.customers c
             LEFT JOIN public.customer_details cd ON (((c.customer_id)::text = (cd.customer_id)::text)))
             LEFT JOIN ( SELECT o.customer_id,
                    count(o.order_id) AS count_valid_orders,
                    sum(o.grand_total) AS total_valid_amount
                   FROM public.orders o
                  WHERE ((o.order_status)::text = ANY (ARRAY['Completed'::text, 'Shipped'::text, 'Delivered'::text, 'Processing'::text]))
                  GROUP BY o.customer_id) order_summary ON (((c.customer_id)::text = (order_summary.customer_id)::text)))
        )
( SELECT customerloyaltymetrics.nama_customer,
    customerloyaltymetrics.jumlah_order_valid,
    customerloyaltymetrics.total_belanja_amount,
    'Paling Loyal'::text AS keterangan_loyalitas
   FROM customerloyaltymetrics
  ORDER BY customerloyaltymetrics.total_belanja_amount DESC, customerloyaltymetrics.jumlah_order_valid DESC, customerloyaltymetrics.nama_customer
 LIMIT 1)
UNION ALL
( SELECT customerloyaltymetrics.nama_customer,
    customerloyaltymetrics.jumlah_order_valid,
    customerloyaltymetrics.total_belanja_amount,
    'Paling Tidak Loyal'::text AS keterangan_loyalitas
   FROM customerloyaltymetrics
  ORDER BY customerloyaltymetrics.total_belanja_amount, customerloyaltymetrics.jumlah_order_valid, customerloyaltymetrics.nama_customer
 LIMIT 1);


ALTER VIEW public.view_top_and_bottom_loyal_customers OWNER TO bafaqih;

--
-- TOC entry 3293 (class 2604 OID 49584)
-- Name: carts cart_id; Type: DEFAULT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.carts ALTER COLUMN cart_id SET DEFAULT nextval('public.carts_cart_id_seq'::regclass);


--
-- TOC entry 3292 (class 2604 OID 49516)
-- Name: customer_address address_id; Type: DEFAULT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.customer_address ALTER COLUMN address_id SET DEFAULT nextval('public.customer_address_address_id_seq'::regclass);


--
-- TOC entry 3296 (class 2604 OID 49740)
-- Name: order_items order_item_id; Type: DEFAULT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.order_items ALTER COLUMN order_item_id SET DEFAULT nextval('public.order_items_order_item_id_seq'::regclass);


--
-- TOC entry 3291 (class 2604 OID 74111)
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- TOC entry 3532 (class 0 OID 49581)
-- Dependencies: 229
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: bafaqih
--

INSERT INTO public.carts VALUES (50, 'CST00011', 'SKU00000015', 'uploads/images/products/4b3db5db-4a95-4fd5-9884-7a85e1a63cfc.jpg', 'Silo Level Indicator', 14000000.00, 4, DEFAULT, '2025-06-17 00:43:32.20379', '2025-06-17 00:43:32.20379');
INSERT INTO public.carts VALUES (51, 'CST00010', 'SKU00000017', 'uploads/images/products/3ce52af1-c291-4a5c-bbf3-63e30ba4d580.jpg', 'Impact Crusher', 57000000.00, 1, DEFAULT, '2025-06-17 00:44:42.566208', '2025-06-17 00:44:42.566208');
INSERT INTO public.carts VALUES (52, 'CST00010', 'SKU00000012', 'uploads/images/products/f21769b4-609e-4505-8f98-07c3757b16e1.jpg', 'Dust Extraction Unit', 84000000.00, 1, DEFAULT, '2025-06-17 00:44:46.971902', '2025-06-17 00:44:46.971902');
INSERT INTO public.carts VALUES (53, 'CST00009', 'SKU00000014', 'uploads/images/products/d3aa1a91-31d3-4369-952b-2bd0a6ed6de9.jpg', 'Mixer Blade Set', 1100000.00, 1, DEFAULT, '2025-06-17 00:45:03.395697', '2025-06-17 00:45:03.395697');
INSERT INTO public.carts VALUES (54, 'CST00009', 'SKU00000008', 'uploads/images/products/2c3ded19-322d-48f5-bee0-403a121e8b69.jpg', 'Mini Batching Plant', 98000000.00, 1, DEFAULT, '2025-06-17 00:45:08.138421', '2025-06-17 00:45:08.138421');
INSERT INTO public.carts VALUES (55, 'CST00009', 'SKU00000010', 'uploads/images/products/11317e83-be19-4b56-8578-0a72d856c442.jpg', 'Aggregate Hopper', 75000000.00, 1, DEFAULT, '2025-06-17 00:45:14.363539', '2025-06-17 00:45:14.363539');
INSERT INTO public.carts VALUES (56, 'CST00008', 'SKU00000017', 'uploads/images/products/3ce52af1-c291-4a5c-bbf3-63e30ba4d580.jpg', 'Impact Crusher', 57000000.00, 1, DEFAULT, '2025-06-17 00:45:31.845894', '2025-06-17 00:45:31.845894');
INSERT INTO public.carts VALUES (57, 'CST00008', 'SKU00000013', 'uploads/images/products/d45f8b25-d47d-4caf-8cea-8fc56c40788a.jpg', 'Electric Panel Box', 13000000.00, 1, DEFAULT, '2025-06-17 00:45:36.840993', '2025-06-17 00:45:36.840993');
INSERT INTO public.carts VALUES (58, 'CST00007', 'SKU00000015', 'uploads/images/products/4b3db5db-4a95-4fd5-9884-7a85e1a63cfc.jpg', 'Silo Level Indicator', 14000000.00, 2, DEFAULT, '2025-06-17 00:45:55.917063', '2025-06-17 00:45:55.917063');
INSERT INTO public.carts VALUES (59, 'CST00007', 'SKU00000011', 'uploads/images/products/9fb9c2b1-d7ef-46d9-9c15-016834482de1.jpg', 'Bucket Elevator', 57000000.00, 1, DEFAULT, '2025-06-17 00:46:02.226671', '2025-06-17 00:46:02.226671');
INSERT INTO public.carts VALUES (60, 'CST00006', 'SKU00000007', 'uploads/images/products/7de2d460-27cd-4b92-85a3-a03bceed0c02.jpg', 'Portable Batching Plant', 102000000.00, 1, DEFAULT, '2025-06-17 00:46:25.867495', '2025-06-17 00:46:25.867495');
INSERT INTO public.carts VALUES (61, 'CST00005', 'SKU00000001', 'uploads/images/products/558b7703-e4a7-4d23-b8e7-ed7f6549a1d5.jpg', 'Primary Jaw Crusher', 58000000.00, 2, DEFAULT, '2025-06-17 00:46:45.793718', '2025-06-17 00:46:45.793718');
INSERT INTO public.carts VALUES (62, 'CST00005', 'SKU00000005', 'uploads/images/products/8f5712c5-18e6-41c4-893e-b40efd839bbb.jpg', 'Air Compressor', 20000000.00, 1, DEFAULT, '2025-06-17 00:46:51.304791', '2025-06-17 00:46:51.304791');
INSERT INTO public.carts VALUES (63, 'CST00002', 'SKU00000008', 'uploads/images/products/2c3ded19-322d-48f5-bee0-403a121e8b69.jpg', 'Mini Batching Plant', 98000000.00, 2, DEFAULT, '2025-06-17 01:03:53.160557', '2025-06-17 01:03:53.160557');
INSERT INTO public.carts VALUES (64, 'CST00002', 'SKU00000006', 'uploads/images/products/95dbbf59-865a-406c-8130-4a45c20c1713.jpg', 'Drymix Batching Plant (Standard)', 150800000.00, 1, DEFAULT, '2025-06-17 01:03:57.855874', '2025-06-17 01:03:57.855874');


--
-- TOC entry 3530 (class 0 OID 49513)
-- Dependencies: 227
-- Data for Name: customer_address; Type: TABLE DATA; Schema: public; Owner: bafaqih
--

INSERT INTO public.customer_address VALUES (5, 'CST00002', 'Rumah', 'Jl. Nusa Indah Baru No. 4', 'Utara Stadion', 'Kota Probolinggo', 'Jawa Timur', '67219', '2025-06-09 23:46:02.523083', '2025-06-09 23:46:02.523083');
INSERT INTO public.customer_address VALUES (6, 'CST00002', 'Kos', 'Jl. Abdilah No.28 Tirtomoyo', 'Depan Warung Naspad', 'Kabupaten Malang', 'Jawa Timur', '68118', '2025-06-10 03:03:43.574174', '2025-06-10 03:03:43.574174');
INSERT INTO public.customer_address VALUES (7, 'CST00003', 'Kos', 'Jl. Borobudur', 'Utara Stadion', 'Kota Probolinggo', 'Jawa Timur', '67219', '2025-06-12 12:48:53.264425', '2025-06-12 12:48:53.264425');
INSERT INTO public.customer_address VALUES (8, 'CST00004', 'Rumah', 'Jl. Raya Singosari No. 12', 'Belakang Toko Bangunan', 'Malang', 'Jawa Timur', '68118', '2025-06-17 00:15:19.057781', '2025-06-17 00:15:19.057781');
INSERT INTO public.customer_address VALUES (9, 'CST00005', 'Rumah', 'Jl. Garden Hill No. 13', 'Pojokan', 'Kota Malang', 'Jawa Timur', '67219', '2025-06-17 00:18:32.101432', '2025-06-17 00:18:32.101432');
INSERT INTO public.customer_address VALUES (10, 'CST00006', 'Kos', 'Jl. Mangliawan No. 7', 'Perumahan Buntu', 'Kabupaten Malang', 'Jawa Timur', '67219', '2025-06-17 00:22:01.923636', '2025-06-17 00:22:01.923636');
INSERT INTO public.customer_address VALUES (11, 'CST00007', 'Kos', 'Jl. Tirtomoyo No. 22', 'Kos Wahab', 'Kabupaten Malang', 'Jawa Timur', '23421', '2025-06-17 00:25:53.211014', '2025-06-17 00:25:53.211014');
INSERT INTO public.customer_address VALUES (12, 'CST00008', 'Kos', 'Jl. Tirto Rahayu No. 77', 'Perum Rahayu', 'Kabupaten Probolinggo', 'Jawa Timur', '68118', '2025-06-17 00:29:42.575693', '2025-06-17 00:29:42.575693');
INSERT INTO public.customer_address VALUES (13, 'CST00009', 'Rumah', 'Jl. Raya Bromo No. 1', 'Depan Basmalah', 'Kabupaten Probolinggo', 'Jawa Timur', '67219', '2025-06-17 00:36:00.327832', '2025-06-17 00:36:00.327832');
INSERT INTO public.customer_address VALUES (14, 'CST00010', 'Rumah', 'Jl. Nusa Indah Baru No. 4', 'Utara Stadion', 'Kota Probolinggo', 'Jawa Timur', '67219', '2025-06-17 00:38:54.479949', '2025-06-17 00:38:54.479949');
INSERT INTO public.customer_address VALUES (15, 'CST00011', 'Rumah', 'Jl. Supriadi No. 5', 'Depan Warung Naspad', 'Kota Probolinggo', 'Jawa Timur', '68118', '2025-06-17 00:42:27.895768', '2025-06-17 00:42:27.895768');


--
-- TOC entry 3528 (class 0 OID 41345)
-- Dependencies: 225
-- Data for Name: customer_details; Type: TABLE DATA; Schema: public; Owner: bafaqih
--

INSERT INTO public.customer_details VALUES ('CST00010', 'Najwa', 'BF', 'uploads/images/profile/avatar-1.jpg', 'najwa@gmail.com', '081212042004', '2025-06-17', '2008-07-25', '2025-06-17 00:38:11.96587', '2025-06-17 00:38:32.323568');
INSERT INTO public.customer_details VALUES ('CST00011', 'Hekel', 'Angga', 'uploads/images/profile/avatar-1.jpg', 'hekel@gmail.com', '081212042004', '2025-06-17', '1999-04-09', '2025-06-17 00:41:41.462185', '2025-06-17 00:42:06.047351');
INSERT INTO public.customer_details VALUES ('CST00002', 'Fadil', 'Bafaqih', 'uploads/images/profile/avatar-1.jpg', 'bafaqih@gmail.com', '081212042004', '2025-06-09', '2004-09-18', '2025-06-09 23:37:27.526894', '2025-06-09 23:45:40.653576');
INSERT INTO public.customer_details VALUES ('CST00003', 'Fulvian', 'Rayhan', 'uploads/images/profile/avatar-1.jpg', 'fulvian@gmail.com', '081218902004', '2025-06-12', '2025-06-12', '2025-06-12 12:45:24.258718', '2025-06-17 00:12:42.8168');
INSERT INTO public.customer_details VALUES ('CST00004', 'Raihan', 'Firmansyah', 'uploads/images/profile/avatar-1.jpg', 'raihan@gmail.com', '081212042004', '2025-06-17', '2004-12-17', '2025-06-17 00:14:15.728117', '2025-06-17 00:14:40.930926');
INSERT INTO public.customer_details VALUES ('CST00005', 'Yosia', 'Hermanto', 'uploads/images/profile/avatar-1.jpg', 'yosia@gmail.com', '081212042004', '2025-06-17', '2003-10-21', '2025-06-17 00:17:16.963709', '2025-06-17 00:18:45.602383');
INSERT INTO public.customer_details VALUES ('CST00006', 'Deva', 'Nadindra', 'uploads/images/profile/avatar-1.jpg', 'deva@gmail.com', '081212042004', '2025-06-17', '2002-10-17', '2025-06-17 00:21:07.156451', '2025-06-17 00:23:14.118386');
INSERT INTO public.customer_details VALUES ('CST00007', 'Hasun', 'Dawileh', 'uploads/images/profile/avatar-1.jpg', 'hasun@gmail.com', '081212042004', '2025-06-17', '2006-06-07', '2025-06-17 00:25:01.833253', '2025-06-17 00:25:22.601583');
INSERT INTO public.customer_details VALUES ('CST00008', 'Hasyim', 'Bafaqih', 'uploads/images/profile/avatar-1.jpg', 'hasyim@gmail.com', '081212042004', '2025-06-17', '2002-03-30', '2025-06-17 00:27:56.139416', '2025-06-17 00:28:21.404373');
INSERT INTO public.customer_details VALUES ('CST00009', 'Nur', 'Lintang', 'uploads/images/profile/avatar-1.jpg', 'lintang@gmail.com', '081212042004', '2025-06-17', '2007-11-17', '2025-06-17 00:35:02.790707', '2025-06-17 00:35:37.127314');


--
-- TOC entry 3520 (class 0 OID 16744)
-- Dependencies: 217
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: bafaqih
--

INSERT INTO public.customers VALUES ('CST00002', 'bafaqih@gmail.com', '081212042004', '$2a$10$OEFjSZo6P4aURwquQU/9xuWHV1EXXKFbyLXOVHJGd3wXhsl3hIuwO', '2025-06-09 23:37:27.525372', '2025-06-09 23:45:40.651288');
INSERT INTO public.customers VALUES ('CST00003', 'fulvian@gmail.com', '081218902004', '$2a$10$OU6nChRBdzvjgULYnUrY0.pbHDUZOh7FGNvJHbXoou1.nqDRXLUS2', '2025-06-12 12:45:24.25642', '2025-06-17 00:12:42.814439');
INSERT INTO public.customers VALUES ('CST00004', 'raihan@gmail.com', '081212042004', '$2a$10$s5/vp2VJSW4YsStEF5Mw.uMBSdmk3XpOzRbgHj6B0JKC5.AS3sYkq', '2025-06-17 00:14:15.725917', '2025-06-17 00:14:40.92934');
INSERT INTO public.customers VALUES ('CST00005', 'yosia@gmail.com', '081212042004', '$2a$10$HbMLUxXUTMHmmhADILNnO.HFkeKuJdWZzv0XYb.I7bcfHcaTQzedu', '2025-06-17 00:17:16.96271', '2025-06-17 00:18:45.600886');
INSERT INTO public.customers VALUES ('CST00006', 'deva@gmail.com', '081212042004', '$2a$10$uFUolN/y/RWpR763/Gdoleyv2tehTeUo70rS/0YyClDqSQfTvnBPu', '2025-06-17 00:21:07.155454', '2025-06-17 00:23:14.117302');
INSERT INTO public.customers VALUES ('CST00007', 'hasun@gmail.com', '081212042004', '$2a$10$gcv.C7m6IZoMYiDvlThPPOoTDDRE/k8SF.j.el3RU0atVGA.YqsiO', '2025-06-17 00:25:01.832255', '2025-06-17 00:25:22.600383');
INSERT INTO public.customers VALUES ('CST00008', 'hasyim@gmail.com', '081212042004', '$2a$10$LLnCz.i/k2pm9bD30oloV.NETdD7LTrD.lfqlhyKu0bRLVnKn0woi', '2025-06-17 00:27:56.138416', '2025-06-17 00:28:21.403328');
INSERT INTO public.customers VALUES ('CST00009', 'lintang@gmail.com', '081212042004', '$2a$10$8MUxkwTlNhIme2kqLXe4ruz4r4eBUUAYlRa/BNS0nIU7QNxfBNGui', '2025-06-17 00:35:02.789691', '2025-06-17 00:35:37.125587');
INSERT INTO public.customers VALUES ('CST00010', 'najwa@gmail.com', '081212042004', '$2a$10$dhmebHcJoNt0K56hzps/lOw6Md.ReIb/iy1LTIcTDfRm4BtHl9thm', '2025-06-17 00:38:11.96447', '2025-06-17 00:38:32.321672');
INSERT INTO public.customers VALUES ('CST00011', 'hekel@gmail.com', '081212042004', '$2a$10$SWschjf4QseI3byWnGSG4u77F1fg1TAn9QI4Pn5u1oJy0icpu77yS', '2025-06-17 00:41:41.460143', '2025-06-17 00:42:06.04585');


--
-- TOC entry 3524 (class 0 OID 24936)
-- Dependencies: 221
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: bafaqih
--

INSERT INTO public.departments VALUES ('DEP0001', 'Human Resource', '<p>The Human Resources (HR) department is a department within PumaCon. Its function is to manage human resources (HR). The main tasks of HR are to manage everything related to employees, from the recruitment process to development and termination of employment.</p>', 'active', '2025-06-09 23:18:30.171706', '2025-06-09 23:18:30.171706');
INSERT INTO public.departments VALUES ('DEP0002', 'Information Technology', '<p>The Information Technology Department is part of PumaCon and is responsible for managing information technology systems.</p>', 'active', '2025-06-09 23:19:24.486073', '2025-06-09 23:19:24.486073');
INSERT INTO public.departments VALUES ('DEP0003', 'Production', '<p>Responsible for the manufacturing and assembly processes. Ensures all machinery and components are produced according to specifications and deadlines. Coordinates closely with the Quality Control and Engineering teams.</p>', 'active', '2025-06-16 23:45:06.817597', '2025-06-16 23:45:06.817597');
INSERT INTO public.departments VALUES ('DEP0004', 'Engineering', '<p>Focuses on product design, structural analysis, and customization. Engineers in this division develop new product innovations, create technical drawings, and assist with project-specific adaptations.</p>', 'active', '2025-06-16 23:45:22.412908', '2025-06-16 23:45:22.412908');
INSERT INTO public.departments VALUES ('DEP0005', 'Quality Control (QC)', '<p>Monitors and inspects materials, components, and finished products to ensure they meet internal standards and client requirements. They handle testing, certification, and compliance documentation.</p>', 'active', '2025-06-16 23:45:34.82668', '2025-06-16 23:45:34.82668');
INSERT INTO public.departments VALUES ('DEP0006', 'Research & Development (R&D)', '<p>Drives innovation by developing new machinery, improving existing systems, and testing advanced technologies. They stay updated on industry trends to keep the company competitive.</p>', 'active', '2025-06-16 23:45:50.943226', '2025-06-16 23:45:50.943226');
INSERT INTO public.departments VALUES ('DEP0007', 'Sales & Marketing', '<p>Handles customer relationships, lead generation, and market expansion. This team creates sales strategies, promotes products, and communicates the value of solutions offered by the company.</p>', 'active', '2025-06-16 23:46:16.901973', '2025-06-16 23:46:16.901973');
INSERT INTO public.departments VALUES ('DEP0008', 'Procurement & Supply Chain', '<p>Responsible for sourcing raw materials, spare parts, and equipment. Manages vendor relationships, inventory levels, and timely delivery to support uninterrupted production.</p>', 'active', '2025-06-16 23:46:29.316054', '2025-06-16 23:46:29.316054');
INSERT INTO public.departments VALUES ('DEP0009', 'Finance & Accounting', '<p>Oversees budgeting, financial planning, cash flow, tax reporting, and bookkeeping. Ensures the financial health of the company and supports strategic investment decisions.</p>', 'active', '2025-06-16 23:46:43.360677', '2025-06-16 23:46:43.360677');
INSERT INTO public.departments VALUES ('DEP0010', 'Maintenance & Facility', '<p>Ensures all factory machines and utilities are functioning properly. Conducts routine inspections, handles repairs, and manages safety protocols across the plant.</p>', 'active', '2025-06-16 23:47:10.879161', '2025-06-16 23:47:10.879161');


--
-- TOC entry 3521 (class 0 OID 16757)
-- Dependencies: 218
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: bafaqih
--

INSERT INTO public.employees VALUES ('EMP00001', 'uploads/images/profile/emp_11936c0d-ac40-4c37-a818-039ebb36f20c.jpg', 'Hasan Fadlullah', '2004-09-18', 'DEP0001', 'hasan@pumacon.com', '081212042004', '2025-06-09', 'Admin HR', 'active', '2025-06-09 23:22:14.88833', '2025-06-09 23:22:14.88833');
INSERT INTO public.employees VALUES ('EMP00002', 'uploads/images/profile/emp_affc64d3-cae6-4194-bcb5-6961a2bd29b9.png', 'Joshua Stevenjo', '2004-10-02', 'DEP0009', 'joshua@pumacon.com', '085694153662', '2025-06-16', 'Staff', 'active', '2025-06-16 23:57:25.73805', '2025-06-16 23:57:44.823215');
INSERT INTO public.employees VALUES ('EMP00003', 'uploads/images/profile/emp_324188c1-d7f9-4333-b168-8eac6d044e1b.png', 'Jonathan Alwi', '2004-01-28', 'DEP0004', 'jonathan@pumacon.com', '082134567892', '2025-06-16', 'Staff', 'active', '2025-06-17 00:01:34.071159', '2025-06-17 00:01:34.071159');
INSERT INTO public.employees VALUES ('EMP00006', 'uploads/images/profile/emp_883de059-598e-4784-b969-199e8b3e4961.jpg', 'Rina Marlina', '1998-04-23', 'DEP0010', 'rina@pumacon.com', '081256789134', '2025-06-17', 'Staff', 'active', '2025-06-17 00:04:53.825657', '2025-06-17 00:04:53.825657');
INSERT INTO public.employees VALUES ('EMP00007', 'uploads/images/profile/emp_bc182010-ac0b-4249-83db-64c607bb94d9.jpg', 'Ahmad Fauzi', '1989-12-15', 'DEP0008', 'ahmad@pumacon.com', '081278913456', '2025-06-17', 'Staff', 'active', '2025-06-17 00:05:44.796261', '2025-06-17 00:05:44.796261');
INSERT INTO public.employees VALUES ('EMP00010', 'uploads/images/profile/emp_24bde0bb-1c13-43f0-926e-da1284f64bc5.jpg', 'Indah Permata', '1997-11-12', 'DEP0006', 'indah@pumacon.com', '081367843295', '2025-06-17', 'Staff', 'active', '2025-06-17 00:09:53.078753', '2025-06-17 00:09:53.078753');
INSERT INTO public.employees VALUES ('EMP00009', 'uploads/images/profile/emp_f4e72a2a-1130-4255-81dc-f52fa16c884b.jpg', 'Fajar Nugroho', '1997-11-19', 'DEP0005', 'fajar@pumacon.com', '082167894532', '2025-06-17', 'Staff', 'active', '2025-06-17 00:08:33.75968', '2025-06-17 00:10:06.744613');
INSERT INTO public.employees VALUES ('EMP00005', 'uploads/images/profile/emp_10ef7a38-bfe6-4a23-aad1-106c7f5eda1c.jpg', 'Budi Santoso', '1990-01-20', 'DEP0002', 'budi@pumacon.com', '081345678912', '2025-06-17', 'Staff', 'active', '2025-06-17 00:03:53.608311', '2025-06-17 00:10:26.302445');
INSERT INTO public.employees VALUES ('EMP00004', 'uploads/images/profile/emp_e76c81bc-4efc-4e97-9f9a-3d1c08cf3a75.jpg', 'Siti Nurhaliza', '2025-06-17', 'DEP0007', 'siti@pumacon.com', '082134567892', '2025-06-17', 'Staff', 'active', '2025-06-17 00:02:47.330089', '2025-06-17 00:11:01.221776');
INSERT INTO public.employees VALUES ('EMP00008', 'uploads/images/profile/82ff437d-8b95-4e46-8463-b180f837f965.jpg', 'Dewi Lestari', '1999-02-28', 'DEP0003', 'dewi@pumacon.com', '081298745631', '2025-06-17', 'Staff', 'active', '2025-06-17 00:06:44.393916', '2025-06-17 00:52:40.593544');


--
-- TOC entry 3523 (class 0 OID 16823)
-- Dependencies: 220
-- Data for Name: employees_account; Type: TABLE DATA; Schema: public; Owner: bafaqih
--

INSERT INTO public.employees_account VALUES ('EMP00001', 'Hasan Fadlullah', 'Admin HR', '$2a$10$aJM5qYMHV0wFmTbtwqEYSu4JrJu8I3BSFOue9QU0axfpm8GF/j.Wa', '2025-06-09 23:23:00.524', '2025-06-09 23:23:00.524');
INSERT INTO public.employees_account VALUES ('EMP00002', 'Joshua Stevenjo', 'Staff', '$2a$10$uryVUdVvFqA4PdEnc5hzveXDAB5JidY1CtoZMP/82530HPrlvdZ.C', '2025-06-17 00:47:20.827481', '2025-06-17 00:47:20.827481');
INSERT INTO public.employees_account VALUES ('EMP00003', 'Jonathan Alwi', 'Staff', '$2a$10$QWuuzatgEP5BLhiVgbZ8juxHPtwowU9jddxvTZkA9qerx2wcSHUZ6', '2025-06-17 00:47:29.05594', '2025-06-17 00:47:29.05594');
INSERT INTO public.employees_account VALUES ('EMP00006', 'Rina Marlina', 'Staff', '$2a$10$JdYgwKsF5c6l1atYwbWIku3AS7Jv.grcizJ72p2KB/qCogpXnyh2K', '2025-06-17 00:47:37.339096', '2025-06-17 00:47:37.339096');
INSERT INTO public.employees_account VALUES ('EMP00007', 'Ahmad Fauzi', 'Staff', '$2a$10$UQJq.vqZZkZg6O/ygOQKAuR4zLgjaXroj.GBDgHyspvajaqu45yjG', '2025-06-17 00:47:46.585588', '2025-06-17 00:47:46.585588');
INSERT INTO public.employees_account VALUES ('EMP00010', 'Indah Permata', 'Staff', '$2a$10$RxP2Wi37UlzL2czuPPWs7u5UkwMVRdRlX6l45F1r3vPeCFnfNGjnG', '2025-06-17 00:47:55.000831', '2025-06-17 00:47:55.000831');
INSERT INTO public.employees_account VALUES ('EMP00009', 'Fajar Nugroho', 'Staff', '$2a$10$GKh4tIZkURGuEuH5Fm0d1OchKVArLuhP3RrTWZLpAjXy0RVWJ7HF6', '2025-06-17 00:48:11.165232', '2025-06-17 00:48:11.165232');
INSERT INTO public.employees_account VALUES ('EMP00008', 'Dewi Lestari', 'Staff', '$2a$10$9mynOh2VEgQ7kePCkL/nxOeEOT6JBgcno5bief1iXOcCG2nXHVApS', '2025-06-17 00:48:27.069785', '2025-06-17 00:48:27.069785');
INSERT INTO public.employees_account VALUES ('EMP00005', 'Budi Santoso', 'Staff', '$2a$10$3FXL/.CiEX/HY1cU0MxFA.abJOrIibiNFsGlz0QtvVWa/QnYoOQKW', '2025-06-17 00:48:34.662522', '2025-06-17 00:48:34.662522');
INSERT INTO public.employees_account VALUES ('EMP00004', 'Siti Nurhaliza', 'Staff', '$2a$10$.hEOlOJqjBQd5Al2woSoGuUeLsGG3yEwZC3vDOzIr9negH1qZvvui', '2025-06-17 00:48:44.993348', '2025-06-17 00:48:44.993348');


--
-- TOC entry 3522 (class 0 OID 16809)
-- Dependencies: 219
-- Data for Name: employees_address; Type: TABLE DATA; Schema: public; Owner: bafaqih
--

INSERT INTO public.employees_address VALUES ('EMP00001', 'Jl. Nusa Indah Baru No.4', 'Kota Probolinggo', 'Jawa Timur', '67219', 'Indonesia', '2025-06-09 23:22:14.889866', '2025-06-09 23:22:14.889866');
INSERT INTO public.employees_address VALUES ('EMP00002', 'Jl. Melati Raya No.12', 'Kota Bandung', 'Jawa Barat', '40251', 'Indonesia', '2025-06-16 23:57:25.740686', '2025-06-16 23:57:44.830891');
INSERT INTO public.employees_address VALUES ('EMP00003', 'Jl. Anggrek No.45', 'Surabaya', 'Jawa Timur', '60231', 'Indonesia', '2025-06-17 00:01:34.072408', '2025-06-17 00:01:34.072408');
INSERT INTO public.employees_address VALUES ('EMP00006', 'Jl. Flamboyan No.7', 'Semarang', 'Jawa Tengah', '50145', 'Indonesia', '2025-06-17 00:04:53.826319', '2025-06-17 00:04:53.826319');
INSERT INTO public.employees_address VALUES ('EMP00007', 'Jl. Cempaka Putih No.3', 'Medan', 'Sumatera Utara', '20112', 'Indonesia', '2025-06-17 00:05:44.796764', '2025-06-17 00:05:44.796764');
INSERT INTO public.employees_address VALUES ('EMP00010', 'Jl. Sawo Kecik No.22', 'Balikpapan', 'Kalimantan Timur', '76112', 'Indonesia', '2025-06-17 00:09:53.079877', '2025-06-17 00:09:53.079877');
INSERT INTO public.employees_address VALUES ('EMP00009', 'Jl. Kenanga No.16', 'Makassar', 'Sulawesi Selatan', '90123', 'Indonesia', '2025-06-17 00:08:33.760378', '2025-06-17 00:10:06.745638');
INSERT INTO public.employees_address VALUES ('EMP00005', 'Jl. Anggrek No.45', 'Kota Bandung', 'Jawa Barat', '60231', 'Indonesia', '2025-06-17 00:03:53.608894', '2025-06-17 00:10:26.303799');
INSERT INTO public.employees_address VALUES ('EMP00004', 'Jl. Flamboyan No.7', 'Semarang', 'Jawa Tengah', '50145', 'Indonesia', '2025-06-17 00:02:47.331116', '2025-06-17 00:11:01.222286');
INSERT INTO public.employees_address VALUES ('EMP00008', 'Jl. Mawar Merah No.5', 'Yogyakarta', 'DI Yogyakarta', '55282', 'Indonesia', '2025-06-17 00:06:44.394455', '2025-06-17 00:52:40.594841');


--
-- TOC entry 3546 (class 0 OID 74131)
-- Dependencies: 246
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: bafaqih
--

INSERT INTO public.news VALUES ('NEW00002', '5 Tips Merawat Batching Plant Agar Tetap Optimal', 'uploads/images/news/news_NEW00002_1749524801569314800.jpg', '<p>Batching plant adalah salah satu aset paling krusial dalam proyek konstruksi berskala besar. Mesin ini tidak hanya menunjang produktivitas, tetapi juga menjamin mutu beton yang dihasilkan. Karena nilainya yang tinggi dan perannya yang vital, penting bagi setiap operator dan manajer proyek untuk menjaga kondisi batching plant agar tetap optimal.</p><p>Berikut adalah <strong>5 tips perawatan batching plant</strong> yang terbukti efektif untuk memperpanjang usia mesin dan meminimalisir risiko kerusakan:</p><h4><strong>1. Lakukan Pemeriksaan Harian Secara Menyeluruh</strong></h4><p>Pemeriksaan rutin setiap hari adalah langkah pertama dalam perawatan batching plant. Komponen seperti <strong>mixer, screw conveyor, belt conveyor, silo, dan aggregate bin</strong> harus diperiksa untuk mendeteksi tanda-tanda keausan, retakan, kebocoran, atau penyumbatan. Deteksi dini terhadap potensi kerusakan akan mencegah terjadinya kerusakan besar yang berakibat pada penghentian produksi.</p><p><strong>Tips tambahan:</strong></p><p> Gunakan checklist harian agar tim operasional tidak melewatkan bagian penting dalam inspeksi.</p><h4><strong>2. Rutin Membersihkan Seluruh Bagian Mesin</strong></h4><p>Debu semen, sisa beton, dan material lainnya dapat menumpuk di area seperti <strong>hopper, timbangan, dan mixer</strong>. Penumpukan ini tidak hanya menurunkan akurasi pencampuran, tapi juga dapat merusak sensor dan memperlambat proses produksi.</p><p>Lakukan pembersihan menyeluruh <strong>setiap selesai produksi</strong>, terutama pada bagian yang bersentuhan langsung dengan material campuran. Gunakan alat semprot air bertekanan tinggi jika perlu, dan hindari bahan kimia yang dapat merusak logam.</p><h4><strong>3. Pantau Sistem Kelistrikan dan Kontrol Otomatis</strong></h4><p>Batching plant modern biasanya dilengkapi sistem kontrol otomatis yang sangat bergantung pada komponen kelistrikan seperti <strong>sensor berat, PLC, timer, dan aktuator</strong>. Gangguan kecil pada kabel atau sensor bisa menyebabkan kesalahan penimbangan, keterlambatan produksi, atau bahkan berhentinya operasi.</p><p>Lakukan pengecekan visual dan teknis secara berkala untuk memastikan sistem kelistrikan berjalan normal. Pastikan area panel kontrol terlindungi dari kelembapan dan debu.</p><h4><strong>4. Ganti Oli dan Pelumas Secara Berkala</strong></h4><p>Bagian-bagian bergerak seperti <strong>bearing, gear, shaft, dan motor</strong> membutuhkan pelumasan yang tepat untuk mengurangi gesekan dan mencegah keausan dini. Tanpa pelumasan yang baik, efisiensi mesin akan menurun drastis dan komponen menjadi cepat rusak.</p><p>Pastikan untuk:</p><p>Menggunakan jenis pelumas yang sesuai dengan spesifikasi pabrikan.</p><p>Menjadwalkan penggantian oli berdasarkan jam kerja mesin, bukan hanya waktu kalender.</p><h4><strong>5. Jadwalkan Servis Berkala oleh Teknisi Profesional</strong></h4><p>Meskipun perawatan ringan dapat dilakukan oleh tim internal, <strong>servis besar</strong> tetap harus dilakukan oleh teknisi ahli secara berkala, minimal setiap 3 bulan sekali. Teknisi akan memeriksa kondisi internal mesin, melakukan kalibrasi ulang sensor, serta memperbaiki komponen yang mulai aus.</p><p>Servis berkala ini penting untuk menjaga <strong>presisi sistem kontrol</strong>, performa mixer, dan efisiensi produksi secara keseluruhan.</p><h3><strong>Kesimpulan: Perawatan Adalah Investasi Jangka Panjang</strong></h3><p>Merawat batching plant bukan sekadar tugas rutin, melainkan bentuk investasi jangka panjang untuk menjaga kontinuitas dan keberhasilan proyek konstruksi. Dengan melakukan perawatan harian, pembersihan rutin, pengecekan sistem, pelumasan berkala, dan servis profesional, operasional batching plant akan lebih stabil, efisien, dan minim gangguan.</p><p>Ingat, <strong>kerusakan mendadak bisa menimbulkan kerugian besar</strong>, baik dari sisi waktu maupun biaya. Maka, rawat batching plant Anda dengan disiplin — dan nikmati manfaat maksimal dari setiap tetes beton yang dihasilkan.</p>', 'CAT00002', 'EMP00001', '2025-06-10 00:00:00+00', 'Published', '2025-06-10 03:06:41.571372+00', '2025-06-10 03:06:41.571372+00');
INSERT INTO public.news VALUES ('NEW00004', 'PumaCon Ekspor 3 Unit Batching Plant ke Malaysia', 'uploads/images/news/news_NEW00004_1749839155114636500.jpg', '<p>Pada bulan Mei 2025, <strong>PumaCon</strong> kembali menorehkan prestasi internasional dengan mengekspor <strong>tiga unit batching plant tipe Containerized</strong> ke <strong>Malaysia</strong>. Ekspor ini merupakan bagian dari proyek besar pembangunan infrastruktur publik yang dicanangkan oleh pemerintah Malaysia untuk memperluas jaringan transportasi dan fasilitas umum di wilayah Selangor dan Johor.</p><p>Proyek ini merupakan hasil kerja sama strategis antara PumaCon dan salah satu <strong>kontraktor multinasional berbasis ASEAN</strong> yang telah menjalin kemitraan erat dengan PumaCon selama lebih dari lima tahun. Kepercayaan ini didasarkan pada rekam jejak PumaCon yang selalu mengedepankan kualitas, ketepatan waktu pengiriman, serta dukungan teknis yang andal.</p><h4><strong>Spesifikasi Unit yang Diekspor</strong></h4><p>Ketiga unit batching plant yang diekspor merupakan tipe <strong>Containerized Modular System</strong>, yang dirancang khusus untuk memudahkan proses mobilisasi dan instalasi di berbagai kondisi medan proyek. Unit-unit ini memiliki kapasitas produksi hingga <strong>80 m³ per jam</strong>, dan telah dilengkapi dengan:</p><ol><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Sistem pengendali otomatis berbasis PLC &amp; HMI touchscreen</strong></li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Integrasi sistem pelaporan berbasis cloud</strong> untuk monitoring produksi secara real-time</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Kalibrasi digital bersertifikat internasional</strong></li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Efisiensi konsumsi energi</strong> berkat teknologi motor inverter dan pengaturan flow air otomatis</li></ol><p>Sebelum dikirim, seluruh unit telah menjalani <strong>uji kelayakan teknis dan standar ekspor internasional</strong>, termasuk pengujian performa dan pengawasan mutu dari pihak ketiga yang independen.</p><h4><strong>Komitmen Terhadap Pasar Global</strong></h4><p>Ekspor ke Malaysia ini menjadi bukti nyata komitmen PumaCon dalam memperluas jangkauan pasar ke tingkat regional dan internasional. Sebagai produsen batching plant terkemuka di Indonesia, PumaCon menargetkan peningkatan ekspor sebesar 30% pada akhir 2025, dengan fokus pada negara-negara Asia Tenggara dan Timur Tengah yang tengah giat mengembangkan sektor konstruksi.</p><p>CEO PumaCon, dalam pernyataan resminya, mengatakan:</p><blockquote><em>"Ekspor ini bukan hanya pengiriman unit mesin, tetapi juga bagian dari kontribusi kami terhadap pembangunan infrastruktur kawasan. Kami percaya bahwa teknologi dan rekayasa buatan Indonesia mampu bersaing di pasar global."</em></blockquote><h4><strong>Penutup</strong></h4><p>Melalui keberhasilan ekspor ke Malaysia ini, PumaCon semakin memperkuat posisinya sebagai mitra terpercaya dalam penyediaan solusi batching plant untuk berbagai kebutuhan industri konstruksi modern. Dengan kualitas produk yang tinggi, dukungan teknis profesional, dan layanan purnajual yang responsif, PumaCon siap melangkah lebih jauh dalam mendukung pembangunan berkelanjutan di Asia dan dunia.</p>', 'CAT00003', 'EMP00001', '2025-06-14 00:00:00+00', 'Published', '2025-06-13 18:25:55.117336+00', '2025-06-13 18:33:20.495+00');
INSERT INTO public.news VALUES ('NEW00001', 'Apa Itu Batching Plant dan Bagaimana Cara Kerjanya?', 'uploads/images/news/news_NEW00001_1749507915294906700.jpg', '<p>Batching Plant adalah fasilitas atau instalasi industri yang dirancang khusus untuk memproduksi beton dalam jumlah besar secara cepat, efisien, dan konsisten. Dalam dunia konstruksi modern, kehadiran batching plant menjadi sangat penting untuk memastikan mutu beton sesuai standar dan dapat memenuhi kebutuhan volume proyek besar seperti pembangunan jalan tol, gedung bertingkat, jembatan, dan infrastruktur lainnya.</p><h4><strong>Komponen Utama Batching Plant</strong></h4><p>Secara umum, batching plant terdiri dari beberapa komponen utama, yaitu:</p><ol><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Silo Semen: </strong>Digunakan untuk menyimpan semen dalam jumlah besar agar tetap kering dan terlindung dari kelembapan.</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Aggregate Bins (Bin Agregat): </strong>Tempat penyimpanan material agregat seperti pasir, kerikil, dan batu pecah. Masing-masing material disimpan dalam kompartemen yang terpisah untuk menjaga kualitas dan proporsi campuran.</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Conveyor Belt:</strong> Alat yang berfungsi untuk mengangkut material agregat dari bin ke dalam mixer atau timbangan.</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Water Tank dan Dosing System: </strong>Menyediakan air yang akan dicampurkan dalam jumlah yang sudah diukur secara akurat.</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Mixer (Pengaduk Beton): </strong>Tempat di mana semua material dicampur hingga membentuk adonan beton yang homogen. Tipe mixer bisa berupa pan mixer, twin shaft mixer, atau drum mixer tergantung kapasitas dan kebutuhan produksi.</li></ol><h4><strong>Cara Kerja Batching Plant</strong></h4><p>Proses produksi beton dalam batching plant dimulai dari penimbangan setiap bahan berdasarkan komposisi campuran (mix design) yang telah ditentukan. Proses ini dilakukan secara otomatis menggunakan sistem digital atau manual dengan pengawasan operator.</p><p>Langkah-langkahnya meliputi:</p><ol><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Penimbangan Agregat dan Semen: </strong>Agregat kering dan semen ditimbang dengan akurasi tinggi menggunakan sistem load cell.</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Penambahan Air dan Additive: </strong>Air dan bahan tambahan (admixture) ditambahkan sesuai takaran untuk meningkatkan kualitas beton sesuai kebutuhan proyek.</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Pencampuran (Mixing): </strong>Semua bahan dimasukkan ke dalam mixer untuk diaduk hingga mencapai kekentalan dan homogenitas yang diinginkan.</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Distribusi Beton: </strong>Setelah proses pencampuran selesai, beton dikirim menggunakan concrete mixer truck ke lokasi proyek untuk digunakan.</li></ol><h4><strong>Jenis-Jenis Batching Plant: Wetmix dan Drymix</strong></h4><p>Batching plant terbagi menjadi dua jenis utama berdasarkan proses pencampurannya:</p><ol><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Wetmix Batching Plant: </strong>Dalam sistem ini, semua bahan termasuk air dicampur di dalam mixer yang terdapat di dalam plant. Hasilnya adalah beton segar yang sudah siap digunakan. Sistem wetmix cocok untuk proyek besar yang membutuhkan mutu beton yang sangat stabil dan konsisten.</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Drymix Batching Plant: </strong>Pada sistem ini, semua bahan kering ditakar dan langsung dimasukkan ke dalam mixer truck. Pencampuran dengan air baru dilakukan di dalam truk selama perjalanan ke lokasi proyek. Drymix lebih fleksibel dan cocok untuk proyek yang membutuhkan mobilitas tinggi.</li></ol><h4><strong>Keunggulan Menggunakan Batching Plant</strong></h4><ol><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Mutu Beton Lebih Terjamin:</strong> Proses otomatisasi memungkinkan kontrol mutu yang lebih baik dibanding pencampuran manual.</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Efisiensi Waktu dan Biaya:</strong> Produksi dapat dilakukan dalam waktu singkat dengan volume besar.</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Ramah Lingkungan:</strong> Sistem tertutup mengurangi debu dan limbah material.</li></ol><h4><strong>Kesimpulan</strong></h4><p>Batching plant merupakan teknologi vital dalam industri konstruksi modern karena mampu menghasilkan beton berkualitas tinggi dengan efisiensi tinggi. Pemilihan antara sistem wetmix dan drymix harus disesuaikan dengan kebutuhan proyek, lokasi, serta spesifikasi teknis yang diinginkan. Dengan pemanfaatan teknologi batching plant yang tepat, kelancaran dan keberhasilan proyek konstruksi dapat lebih terjamin.</p>', 'CAT00001', 'EMP00001', '2025-06-10 00:00:00+00', 'Published', '2025-06-09 22:25:15.29645+00', '2025-06-10 03:07:33.313384+00');
INSERT INTO public.news VALUES ('NEW00006', 'Cara Menentukan Lokasi Ideal untuk Pemasangan Batching Plant', 'uploads/images/news/news_NEW00006_1750090817803709500.png', '<p>Salah satu faktor penting dalam keberhasilan proyek konstruksi besar adalah penempatan batching plant. Kesalahan dalam memilih lokasi bisa menyebabkan keterlambatan proyek, biaya tambahan, dan bahkan penurunan kualitas beton. Dalam artikel ini, kami akan membagikan cara memilih lokasi yang tepat untuk batching plant Anda.</p><h4><strong>1. Dekat dengan Area Kebutuhan Beton</strong></h4><p>Penempatan batching plant sebaiknya tidak lebih dari 20–30 menit dari lokasi pengecoran untuk menjaga kualitas beton segar. Transportasi terlalu lama berisiko membuat beton mulai mengeras sebelum digunakan.</p><h4><strong>2. Aksesibilitas Jalan</strong></h4><p>Pastikan jalan menuju batching plant cukup lebar dan kuat untuk dilewati truk mixer. Kemacetan atau medan berat akan memperlambat distribusi beton dan meningkatkan biaya operasional.</p><h4><strong>3. Sumber Air dan Listrik</strong></h4><p>Batching plant memerlukan pasokan air bersih dan listrik stabil. Pilih lokasi dengan ketersediaan sumber daya ini untuk menghindari downtime akibat gangguan operasional.</p><h4><strong>4. Legalitas dan Izin</strong></h4><p>Periksa peraturan daerah terkait izin pendirian batching plant. Hindari pembangunan di zona larangan seperti daerah konservasi atau terlalu dekat dengan pemukiman.</p><h4><strong>5. Faktor Lingkungan</strong></h4><p>Pertimbangkan dampak suara, debu, dan getaran terhadap lingkungan sekitar. Gunakan sistem penekan debu dan penghalang suara jika berada dekat pemukiman.</p><h4><strong>Kesimpulan</strong></h4><p>Memilih lokasi batching plant bukan hanya soal teknis, tapi juga strategis. Perhitungkan jarak, akses, sumber daya, regulasi, dan dampak lingkungan untuk memastikan operasional yang efisien dan berkelanjutan.</p>', 'CAT00002', 'EMP00001', '2025-06-16 00:00:00+00', 'Published', '2025-06-16 16:20:17.806292+00', '2025-06-16 16:20:17.806292+00');
INSERT INTO public.news VALUES ('NEW00007', 'Tips Menyimpan Semen di Silo agar Tetap Kering dan Efektif', 'uploads/images/news/news_NEW00007_1750090897124159900.jpg', '<p>Semen yang menggumpal akibat kelembaban akan menurunkan kualitas beton. Oleh karena itu, penyimpanan semen di silo perlu memperhatikan beberapa prinsip penting untuk menjaga mutu dan efisiensi produksi. Simak tips berikut.</p><h4><strong>1. Gunakan Silo dengan Seal Ketat</strong></h4><p>Pastikan silo dilengkapi dengan penutup yang rapat serta sistem valve antilembap. Ini mencegah masuknya uap air dari udara sekitar, terutama di daerah tropis dengan kelembapan tinggi.</p><h4><strong>2. Pasang Level Indicator dan Filter Debu</strong></h4><p>Level indicator membantu operator mengetahui volume material, sementara filter debu menjaga tekanan udara dalam silo tetap stabil tanpa mengganggu proses keluar-masuk semen.</p><h4><strong>3. Hindari Overfilling</strong></h4><p>Mengisi silo melebihi kapasitas bisa menyebabkan tekanan internal berlebih dan merusak struktur silo. Gunakan alarm pengisian untuk mencegah hal ini.</p><h4><strong>4. Rutin Cek Kondisi Bagian Dalam</strong></h4><p>Setidaknya sebulan sekali, kosongkan silo dan periksa bagian dalam dari kelembaban, retakan, atau residu yang bisa mengganggu aliran semen.</p><h4><strong>Kesimpulan</strong></h4><p>Penyimpanan semen yang baik akan menjaga performa produksi dan memperpanjang umur silo. Dengan sistem tertutup dan perawatan rutin, Anda dapat menghindari kerugian akibat semen rusak.</p>', 'CAT00002', 'EMP00001', '2025-06-16 00:00:00+00', 'Published', '2025-06-16 16:21:37.125378+00', '2025-06-16 16:21:37.125378+00');
INSERT INTO public.news VALUES ('NEW00008', 'Bagaimana Menghitung Kebutuhan Beton dalam Suatu Proyek', 'uploads/images/news/news_NEW00008_1750091037645401500.jpg', '<p>Perencanaan volume beton yang tepat sangat penting untuk efisiensi proyek dan mencegah kekurangan atau kelebihan material. Artikel ini membahas cara mudah menghitung kebutuhan beton dan tips untuk mengoptimalkannya.</p><h4><strong>1. Rumus Dasar Volume</strong></h4><p>Gunakan rumus volume (Panjang × Lebar × Tinggi) untuk area pengecoran. Untuk struktur tak beraturan, pecah menjadi bentuk-bentuk sederhana lalu jumlahkan hasilnya.</p><p>Contoh:</p><p> Slab lantai seluas 10 m x 5 m x 0.15 m = <strong>7.5 m³ beton</strong>.</p><h4><strong>2. Tambahkan Faktor Kehilangan</strong></h4><p>Tambahkan 5–10% sebagai cadangan terhadap penyusutan, tumpahan, dan kesalahan tak terduga. Jadi, untuk kebutuhan 7.5 m³ beton, sebaiknya disiapkan sekitar <strong>8.3 m³</strong>.</p><h4><strong>3. Gunakan Software Estimasi</strong></h4><p>PumaCon merekomendasikan penggunaan software seperti MS Project atau aplikasi khusus untuk perhitungan beton, sehingga lebih akurat dan terdokumentasi.</p><h4><strong>Kesimpulan</strong></h4><p>Menghitung kebutuhan beton tidak harus rumit jika dilakukan sejak awal dengan metode yang benar. Dengan perencanaan matang, Anda bisa menghemat biaya dan memastikan proses pengecoran berjalan lancar.</p>', 'CAT00002', 'EMP00001', '2025-06-16 00:00:00+00', 'Published', '2025-06-16 16:23:57.64598+00', '2025-06-16 16:23:57.64598+00');
INSERT INTO public.news VALUES ('NEW00014', 'Perbedaan Wetmix dan Drymix Batching Plant: Mana yang Cocok untuk Proyek Anda?', 'uploads/images/news/news_NEW00014_1750091798773536500.jpg', '<p>Memilih jenis <strong>batching plant</strong> yang tepat merupakan langkah krusial dalam memastikan kelancaran dan efisiensi proyek konstruksi. Salah satu pertanyaan yang paling sering diajukan oleh kontraktor, khususnya yang baru terjun ke industri ini, adalah: <strong>apa perbedaan antara Wetmix dan Drymix</strong>, dan mana yang lebih sesuai untuk proyek mereka?</p><p>Untuk membantu Anda membuat keputusan yang tepat, berikut adalah penjelasan lengkap mengenai kedua tipe batching plant beserta keunggulannya masing-masing.</p><h3><strong>1. Wetmix Batching Plant: Untuk Proyek Skala Besar dan Presisi Tinggi</strong></h3><p>Pada sistem <strong>Wetmix</strong>, seluruh material—termasuk air—dicampur langsung di dalam plant sebelum dikirim ke lokasi proyek. Hasilnya adalah campuran beton yang <strong>lebih homogen, stabil, dan konsisten</strong>.</p><h4>✅ Keunggulan:</h4><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Kualitas beton lebih terkontrol</strong> karena proses pencampuran terjadi dalam kondisi terstandarisasi.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Waktu pengadukan di lapangan lebih singkat</strong>, sehingga cocok untuk proyek dengan waktu yang ketat.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Mengurangi risiko segregasi material selama pengangkutan.</li></ol><h4>📌 Ideal untuk:</h4><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Jalan tol dan jalan nasional</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Bandara dan pelabuhan</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Jembatan dan struktur besar lainnya</li></ol><blockquote>“Wetmix cocok untuk proyek-proyek yang membutuhkan beton berkualitas tinggi dalam volume besar dan konsistensi tanpa kompromi.”</blockquote><h3><strong>2. Drymix Batching Plant: Untuk Proyek Fleksibel dan Berjangka Panjang</strong></h3><p>Berbeda dari Wetmix, <strong>Drymix</strong> hanya mencampur material kering di dalam plant, lalu <strong>air ditambahkan di dalam truk mixer</strong> saat menuju atau tiba di lokasi proyek. Proses ini memberi fleksibilitas lebih besar terhadap logistik dan pengiriman beton.</p><h4>✅ Keunggulan:</h4><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Fleksibel untuk pengiriman ke berbagai lokasi</strong>, terutama yang sulit dijangkau.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Lebih hemat biaya awal investasi</strong> dan perawatan.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Cocok untuk daerah dengan infrastruktur yang belum sepenuhnya tersedia.</li></ol><h4>📌 Ideal untuk:</h4><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Perumahan menengah</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Pembangunan kawasan industri baru</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Proyek kecil hingga menengah di area terpencil</li></ol><blockquote>“Drymix menjadi pilihan tepat untuk proyek yang membutuhkan pengiriman beton ke berbagai lokasi berbeda atau dengan volume variatif.”</blockquote><h3><strong>3. Mana yang Harus Dipilih?</strong></h3><p>Tidak ada jawaban yang mutlak. Pemilihan antara Wetmix dan Drymix sangat tergantung pada beberapa faktor berikut:</p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Volume beton harian yang dibutuhkan</strong></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Lokasi proyek dan aksesibilitas</strong></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Ketersediaan air bersih di sekitar area kerja</strong></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Anggaran operasional dan peralatan pendukung</strong></li></ol><p>Jika proyek Anda bersifat besar dan menuntut presisi tinggi dalam waktu singkat, <strong>Wetmix</strong> adalah solusi terbaik. Namun jika fleksibilitas, efisiensi logistik, dan biaya menjadi prioritas, <strong>Drymix</strong> bisa menjadi pilihan yang lebih rasional.</p><h3>Konsultasikan dengan Tim PumaCon</h3><p>Masih ragu menentukan jenis plant yang paling sesuai? <strong>Tim Teknik PumaCon siap membantu Anda melakukan analisis kebutuhan proyek secara menyeluruh</strong>. Mulai dari estimasi volume beton, layout lahan, hingga rekomendasi tipe mesin dan integrasi sistem kontrol—kami siap menjadi mitra andal dalam kesuksesan proyek Anda.</p><p>Hubungi kami sekarang untuk sesi konsultasi teknis GRATIS!</p>', 'CAT00001', 'EMP00001', '2025-06-16 00:00:00+00', 'Published', '2025-06-16 16:36:38.776712+00', '2025-06-16 16:36:38.776712+00');
INSERT INTO public.news VALUES ('NEW00015', 'Apa Itu Stone Crusher dan Mengapa Penting dalam Proyek Konstruksi?', 'uploads/images/news/news_NEW00015_1750091913351412800.png', '<p>Dalam industri konstruksi, keberadaan <strong>agregat</strong>—seperti kerikil, pasir kasar, dan batu pecah—merupakan elemen penting dalam pembuatan beton, perkerasan jalan, dan berbagai struktur lainnya. Salah satu cara utama untuk menghasilkan agregat berkualitas tinggi adalah melalui <strong>Stone Crusher</strong>, yaitu mesin penghancur batu yang kini menjadi tulang punggung banyak proyek infrastruktur di Indonesia.</p><h3><strong>Apa Itu Stone Crusher?</strong></h3><p><strong>Stone Crusher</strong> adalah rangkaian mesin yang dirancang untuk <strong>menghancurkan batu besar menjadi potongan-potongan kecil</strong> sesuai ukuran yang dibutuhkan. Material hasil crushing biasanya digunakan sebagai bahan utama dalam beton ready-mix, fondasi jalan, drainase, hingga timbunan konstruksi lainnya.</p><blockquote>Dengan memiliki sistem crushing sendiri, kontraktor bisa memproduksi agregat secara mandiri, menurunkan biaya pembelian material, dan mengontrol kualitas hasil produksi.</blockquote><h3><strong>Jenis-Jenis Utama Stone Crusher</strong></h3><p>Berikut adalah tiga jenis utama Stone Crusher yang paling umum digunakan dalam berbagai tahap proses penghancuran:</p><h4>1. <strong>Jaw Crusher</strong> – Tahap Awal Penghancuran</h4><p>Digunakan untuk menghancurkan batu berukuran besar ke ukuran yang lebih kecil agar bisa diproses lebih lanjut. Jaw Crusher bekerja dengan prinsip tekanan, di mana dua pelat baja menjepit batu hingga pecah.</p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Fungsi:</strong> Primary crushing</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Keunggulan:</strong> Tangguh, cocok untuk batu keras dan ukuran besar</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Aplikasi:</strong> Quarry, proyek pemecahan batu awal</li></ol><h4>2. <strong>Cone Crusher</strong> – Produksi Agregat Seragam</h4><p>Digunakan pada tahap sekunder setelah proses Jaw Crusher. Cone Crusher memberikan hasil akhir yang <strong>lebih halus dan seragam</strong>, sangat cocok untuk agregat struktural.</p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Fungsi:</strong> Secondary crushing</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Keunggulan:</strong> Akurat, efisiensi tinggi</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Aplikasi:</strong> Beton precast, ready-mix, base course</li></ol><h4>3. <strong>Impact Crusher</strong> – Agregat Berkualitas Tinggi</h4><p>Mesin ini menghancurkan batu dengan memanfaatkan gaya benturan. Cocok untuk menghasilkan agregat berbentuk kubikal yang lebih baik dalam hal kualitas.</p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Fungsi:</strong> Secondary &amp; tertiary crushing</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Keunggulan:</strong> Menghasilkan agregat bentuk bagus</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Aplikasi:</strong> Proyek jalan raya, pelabuhan, bandara</li></ol><h3><strong>Manfaat Menggunakan Stone Crusher Sendiri</strong></h3><p>Memiliki sistem Stone Crusher internal memberikan berbagai manfaat strategis bagi kontraktor dan perusahaan konstruksi:</p><p>✅ <strong>Efisiensi Biaya</strong></p><p> Mengurangi ketergantungan terhadap supplier agregat dan menekan biaya pembelian jangka panjang.</p><p>✅ <strong>Kualitas Lebih Terjamin</strong></p><p> Kontrol penuh terhadap ukuran dan jenis material, menyesuaikan dengan kebutuhan proyek.</p><p>✅ <strong>Ketersediaan Material yang Stabil</strong></p><p> Produksi agregat sesuai permintaan proyek, tanpa harus menunggu pasokan dari luar.</p><p>✅ <strong>Fleksibilitas Operasional</strong></p><p> Bisa ditempatkan dekat lokasi proyek, mengurangi biaya transportasi material berat.</p><h3>Dapatkan Solusi Stone Crusher Terbaik dari PumaCon</h3><p>PumaCon menyediakan berbagai jenis <strong>Stone Crusher berkualitas tinggi</strong>, lengkap dengan layanan instalasi, pelatihan, dan perawatan. Tim kami siap membantu Anda menentukan konfigurasi yang paling sesuai dengan skala proyek, jenis batu, dan target produksi harian.</p><p>Hubungi kami sekarang untuk konsultasi gratis atau kunjungi fasilitas demo kami untuk melihat langsung performa mesin-mesin kami di lapangan.</p>', 'CAT00001', 'EMP00001', '2025-06-16 00:00:00+00', 'Published', '2025-06-16 16:38:33.416584+00', '2025-06-16 16:38:33.416584+00');
INSERT INTO public.news VALUES ('NEW00016', 'Fungsi Load Cell dalam Batching Plant: Kenali Teknologi di Baliknya', 'uploads/images/news/news_NEW00016_1750092005139692200.jpg', '<p>Dalam sistem batching plant modern, <strong>akurasi pencampuran material</strong> menjadi kunci utama dalam menghasilkan beton berkualitas tinggi. Salah satu komponen vital yang memastikan akurasi tersebut adalah <strong>load cell</strong>—sensor digital yang bekerja secara presisi dalam menimbang setiap material yang masuk ke dalam proses pencampuran.</p><h3><strong>Apa Itu Load Cell?</strong></h3><p><strong>Load cell</strong> adalah alat pengukur berat berbasis sensor yang <strong>mengubah tekanan atau beban menjadi sinyal listrik</strong>. Dalam batching plant, load cell ditempatkan di bawah timbangan material seperti semen, pasir, kerikil, dan air. Sensor ini secara real-time mengirimkan data berat ke sistem kontrol batching plant untuk memastikan <strong>komposisi campuran beton sesuai dengan formula yang telah ditentukan</strong>.</p><blockquote>Tanpa load cell, sistem tidak bisa mengetahui berapa banyak material yang sedang ditimbang, sehingga risiko kesalahan pencampuran akan meningkat drastis.</blockquote><h3><strong>Jenis-Jenis Load Cell yang Digunakan dalam Industri Batching Plant</strong></h3><p>Pemilihan jenis load cell disesuaikan dengan posisi dan karakteristik beban yang diukur. Berikut beberapa tipe load cell yang umum digunakan di batching plant:</p><h4>1. <strong>Compression Load Cell</strong></h4><p>Mengukur beban dari atas, sering digunakan untuk menimbang silo semen atau aggregate hopper. Cocok untuk beban besar yang statis.</p><h4>2. <strong>Tension Load Cell</strong></h4><p>Digunakan untuk aplikasi yang memerlukan pengukuran gaya tarik, seperti dalam conveyor belt atau hopper gantung.</p><h4>3. <strong>Shear Beam Load Cell</strong></h4><p>Populer di timbangan platform dan digunakan di area yang memerlukan sensitivitas tinggi dan ukuran yang kompak. Memberikan <strong>akurasi tinggi</strong> meskipun digunakan di lingkungan kerja yang keras.</p><h3><strong>Mengapa Load Cell Begitu Penting?</strong></h3><p>Akurasi load cell berdampak langsung terhadap kualitas beton yang dihasilkan. Kesalahan penimbangan sekecil apa pun bisa mengakibatkan:</p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Beton terlalu kering</strong> → Sulit dikerjakan dan tidak mencapai kekuatan yang diharapkan.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Beton terlalu encer</strong> → Retak dini dan daya tahan struktur menurun.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Waktu pengerjaan lebih lama</strong> → Mengganggu jadwal proyek dan menambah biaya.</li></ol><p>Dengan kata lain, <strong>load cell yang akurat adalah fondasi dari batching plant yang handal.</strong></p><h3><strong>Integrasi Load Cell dengan Sistem Otomasi</strong></h3><p>Di PumaCon, seluruh sistem batching plant—baik drymix maupun wetmix—telah dilengkapi load cell <strong>berakurasi tinggi</strong> yang terintegrasi langsung dengan <strong>SmartMix 2.0</strong>, sistem kontrol digital kami. Data dari setiap load cell ditampilkan secara real-time di layar sentuh operator dan dikalibrasi secara berkala untuk memastikan konsistensi.</p><blockquote>“Kami tidak hanya menjual mesin, tetapi juga menghadirkan sistem produksi beton yang presisi dan dapat diandalkan,” ujar Kepala Divisi Otomasi PumaCon.</blockquote><h3><strong>Tips Merawat Load Cell Agar Tetap Akurat</strong></h3><ol><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Kalibrasi rutin</strong>: Lakukan pengecekan akurasi secara berkala menggunakan beban standar.</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Lindungi dari getaran berlebih</strong>: Gunakan shock absorber jika diperlukan.</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Pastikan koneksi listrik stabil</strong>: Fluktuasi tegangan bisa mengganggu pembacaan sensor.</li><li data-list="ordered"><span class="ql-ui" contenteditable="false"></span><strong>Bersihkan dari debu dan air</strong>: Jaga load cell tetap bersih, terutama di lingkungan pabrik yang lembap dan berdebu.</li></ol><h3>Siap Tingkatkan Akurasi Batching Plant Anda?</h3><p>PumaCon menyediakan <strong>sistem load cell bersertifikasi</strong> yang dapat disesuaikan dengan jenis plant, kapasitas produksi, dan kebutuhan operasional Anda. Hubungi tim teknis kami untuk konsultasi dan solusi terbaik dalam sistem penimbangan otomatis.</p>', 'CAT00001', 'EMP00001', '2025-06-16 00:00:00+00', 'Published', '2025-06-16 16:40:05.14088+00', '2025-06-16 16:40:05.14088+00');
INSERT INTO public.news VALUES ('NEW00017', 'Apa Itu Cement Silo dan Bagaimana Cara Kerjanya?', 'uploads/images/news/news_NEW00017_1750092157032299100.jpg', '<p>Dalam sistem batching plant modern, <strong>Cement Silo</strong> memainkan peran penting dalam memastikan kelancaran produksi beton. Fungsinya bukan sekadar sebagai tempat penyimpanan semen, tetapi juga sebagai komponen vital yang mendukung <strong>efisiensi, keamanan, dan konsistensi kualitas material</strong>.</p><h3><strong>Apa Itu Cement Silo?</strong></h3><p><strong>Cement Silo</strong> adalah tangki penyimpanan vertikal berbahan baja yang dirancang khusus untuk <strong>menampung semen dalam jumlah besar</strong>, umumnya berkisar antara <strong>50 hingga 100 ton</strong>. Tangki ini digunakan di batching plant maupun proyek infrastruktur besar untuk menjaga pasokan semen tetap stabil dan siap digunakan kapan saja.</p><p>Silo berfungsi menjaga <strong>kekeringan material</strong>, menghindari gumpalan akibat kelembapan, serta memudahkan proses distribusi semen ke sistem pencampuran beton secara otomatis.</p><h3><strong>Bagian Utama Cement Silo</strong></h3><p>Sebuah cement silo modern terdiri dari beberapa komponen teknis penting:</p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Pipa Pengisian (Filling Pipe)</strong> – Jalur masuk semen dari truk bulk.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Sistem Aerasi</strong> – Memastikan aliran semen tetap lancar dan tidak menggumpal.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Level Sensor</strong> – Menginformasikan volume semen di dalam silo secara real-time.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Pressure Relief Valve</strong> – Mencegah tekanan berlebih akibat pengisian atau aliran udara.</li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Screw Conveyor</strong> – Alat pemindah semen dari silo ke timbangan atau mixer.</li></ol><h3><strong>Bagaimana Cara Kerja Cement Silo?</strong></h3><p>Berikut adalah alur operasional cement silo secara ringkas namun sistematis:</p><h4>1. <strong>Pengisian (Filling)</strong></h4><p>Truk semen curah (bulk truck) menyalurkan semen melalui pipa pengisian ke dalam silo. Proses ini biasanya menggunakan tekanan udara dari kompresor truk.</p><h4>2. <strong>Penyimpanan (Storage)</strong></h4><p>Di dalam silo, semen disimpan dalam kondisi <strong>kering dan terlindung dari kelembapan</strong>. Sistem aerasi di bagian bawah silo menjaga agar material tidak menggumpal (bridging) atau menempel di dinding silo.</p><h4>3. <strong>Pengeluaran (Discharge)</strong></h4><p>Saat produksi beton dimulai, semen dikeluarkan secara otomatis menggunakan <strong>screw conveyor</strong> atau <strong>pneumatic system</strong> menuju timbangan (weigh hopper) sebelum dicampur di mixer.</p><h3><strong>Kenapa Penting Memahami Cara Kerja Cement Silo?</strong></h3><p>Bagi operator dan teknisi, memahami cara kerja cement silo bukan hanya penting untuk kelancaran produksi, tetapi juga untuk <strong>mencegah berbagai potensi kerusakan</strong>, seperti:</p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Bridging (penggumpalan material)</strong></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Overpressure (tekanan berlebih akibat sistem tertutup)</strong></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Kerusakan screw conveyor akibat beban berlebih atau semen lembap</strong></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><strong>Kesalahan level sensor yang menyebabkan pengisian berlebihan atau kosong mendadak</strong></li></ol><blockquote>“Perawatan dan pengoperasian silo yang benar sangat memengaruhi kualitas beton dan umur pakai seluruh sistem plant,” ujar Tim Engineering PumaCon.</blockquote><h3><strong>Tips Pemeliharaan Cement Silo</strong></h3><p>✅ Lakukan <strong>pemeriksaan level sensor</strong> secara berkala.</p><p> ✅ Pastikan <strong>valve tekanan bekerja normal</strong> untuk mencegah ledakan internal.</p><p> ✅ Bersihkan saringan udara dan sistem aerasi secara berkala.</p><p> ✅ Gunakan <strong>semen dengan kadar kelembapan rendah</strong> untuk mencegah bridging.</p><h3>PumaCon: Solusi Cement Silo Terintegrasi</h3><p>PumaCon menyediakan berbagai model <strong>Cement Silo berkualitas tinggi</strong>, lengkap dengan sistem kontrol otomatis, rangka pendukung, hingga screw conveyor sesuai kapasitas dan konfigurasi plant Anda. Kami juga menyediakan <strong>layanan instalasi dan pelatihan teknisi</strong> agar sistem silo Anda bekerja optimal dan aman.</p>', 'CAT00001', 'EMP00001', '2025-06-16 00:00:00+00', 'Published', '2025-06-16 16:42:37.036807+00', '2025-06-16 16:42:37.036807+00');
INSERT INTO public.news VALUES ('NEW00009', 'Tips Memilih Jenis Crusher yang Tepat untuk Proyek Anda', 'uploads/images/news/news_NEW00009_1750091116609874500.png', '<p>Dalam proyek konstruksi atau pertambangan, pemilihan mesin crusher sangat menentukan efisiensi produksi agregat. Setiap jenis crusher memiliki fungsi spesifik tergantung material dan tujuan proyek.</p><h4><strong>1. Jaw Crusher untuk Batu Ukuran Besar</strong></h4><p>Jika Anda perlu menghancurkan batu berukuran besar menjadi potongan lebih kecil, <strong>Primary Jaw Crusher</strong> adalah pilihan tepat. Mesin ini ideal sebagai tahap awal dalam proses penghancuran.</p><h4><strong>2. Cone Crusher untuk Agregat Seragam</strong></h4><p>Untuk menghasilkan ukuran agregat yang seragam, <strong>Secondary Cone Crusher</strong> memberikan hasil lebih halus. Cocok untuk proyek aspal jalan dan campuran beton berkualitas tinggi.</p><h4><strong>3. Impact Crusher untuk Material Keras</strong></h4><p>Jenis ini menggunakan tumbukan untuk menghancurkan batu. Efektif untuk material keras dan abrasif, dan memberikan agregat berbentuk kubikal yang disukai di banyak proyek jalan dan rel kereta.</p><h4><strong>Kesimpulan</strong></h4><p>Memilih jenis crusher yang tepat akan mempercepat produksi, menekan biaya pemeliharaan, dan menghasilkan kualitas material yang diinginkan. Konsultasikan kebutuhan Anda dengan tim PumaCon untuk rekomendasi terbaik.</p>', 'CAT00002', 'EMP00001', '2025-06-16 00:00:00+00', 'Published', '2025-06-16 16:25:16.612009+00', '2025-06-16 16:25:16.612009+00');
INSERT INTO public.news VALUES ('NEW00010', 'PumaCon Luncurkan SmartMix 2.0, Teknologi Otomatisasi Terbaru', 'uploads/images/news/news_NEW00010_1750091314125893400.jpeg', '<p>Dalam upaya mempercepat transformasi digital di sektor konstruksi, <strong>PumaCon</strong> kembali membuktikan komitmennya melalui peluncuran <strong>SmartMix 2.0</strong>, sebuah sistem kontrol digital canggih untuk batching plant generasi terbaru. Teknologi ini dirancang untuk menjawab tantangan efisiensi produksi beton di lapangan, sekaligus meningkatkan akurasi dan kemudahan pengoperasian.</p><p>SmartMix 2.0 hadir dengan <strong>antarmuka layar sentuh modern</strong> yang intuitif serta <strong>fitur remote diagnostics</strong> yang memungkinkan pemantauan dan troubleshooting dilakukan dari jarak jauh. Operator kini dapat dengan mudah mengatur komposisi campuran beton, memantau konsumsi material secara real-time, hingga mengidentifikasi potensi masalah sebelum mengganggu proses produksi.</p><blockquote>“SmartMix 2.0 bukan sekadar pembaruan sistem, tapi langkah konkret kami dalam mendorong otomatisasi dan digitalisasi batching plant di Indonesia,” ungkap Kepala Divisi Inovasi dan R&amp;D PumaCon.</blockquote><p>Teknologi ini telah <strong>diuji coba di lima proyek besar dalam negeri</strong> sebagai bagian dari fase pilot, dan menunjukkan hasil signifikan. Berdasarkan evaluasi internal, SmartMix 2.0 mampu meningkatkan efisiensi operasional hingga <strong>18%</strong>, sekaligus menurunkan tingkat kesalahan manusia (human error) dalam proses pencampuran beton.</p><h3>Komitmen Jangka Panjang terhadap Inovasi</h3><p>Peluncuran SmartMix 2.0 menjadi bagian dari roadmap teknologi PumaCon dalam menghadirkan solusi berkelanjutan bagi industri konstruksi nasional. Dengan tantangan proyek-proyek skala besar dan kebutuhan akan ketepatan waktu serta mutu tinggi, PumaCon percaya bahwa adopsi teknologi cerdas merupakan kunci menuju keunggulan kompetitif.</p><blockquote>“Kami terus berinvestasi dalam pengembangan sistem otomatisasi dan integrasi IoT di lini produk kami. Inovasi adalah DNA dari PumaCon,” tambah perwakilan manajemen.</blockquote><p>Ke depannya, PumaCon menargetkan untuk mengimplementasikan SmartMix 2.0 secara menyeluruh pada unit batching plant yang diproduksi mulai kuartal ketiga 2025. Selain itu, tim R&amp;D telah merancang integrasi SmartMix dengan sistem ERP pelanggan, memungkinkan data produksi ditransfer langsung ke pusat analitik dan pelaporan proyek.</p>', 'CAT00003', 'EMP00001', '2025-06-16 00:00:00+00', 'Published', '2025-06-16 16:28:34.127006+00', '2025-06-16 16:28:34.127006+00');
INSERT INTO public.news VALUES ('NEW00011', 'PumaCon Raih Sertifikasi ISO 9001:2015 untuk Manajemen Mutu', 'uploads/images/news/news_NEW00011_1750091392548050800.jpg', '<p>PumaCon dengan bangga mengumumkan pencapaian penting dalam perjalanan bisnisnya—perolehan <strong>Sertifikasi ISO 9001:2015</strong> untuk sistem manajemen mutu. Sertifikasi ini diberikan oleh lembaga sertifikasi internasional terkemuka setelah <strong>melalui proses audit ketat selama dua bulan</strong>, yang mencakup seluruh aspek operasional perusahaan.</p><h3>Standar Mutu Kelas Dunia</h3><p>ISO 9001:2015 merupakan standar internasional yang mengatur sistem manajemen mutu (Quality Management System/QMS), berfokus pada kepuasan pelanggan, manajemen risiko, dan efisiensi proses. Dengan memperoleh sertifikasi ini, <strong>PumaCon secara resmi diakui telah memenuhi persyaratan global dalam pengelolaan mutu dan layanan</strong>.</p><blockquote>“Pencapaian ini bukan hanya simbol kualitas, tetapi juga representasi dari budaya kerja kami yang menempatkan mutu dan pelanggan sebagai prioritas utama,” ujar Kepala Departemen Quality Assurance PumaCon.</blockquote><p>Proses audit dilakukan secara menyeluruh, mencakup unit fabrikasi <strong>batching plant, stone crusher, sistem conveyor</strong>, serta divisi-divisi pendukung lainnya. Audit tersebut menilai bagaimana PumaCon merancang, memproduksi, dan mengelola proyek sesuai prinsip-prinsip mutu, termasuk dokumentasi, evaluasi kinerja, dan sistem perbaikan berkelanjutan.</p><h3>Fondasi untuk Ekspansi Global</h3><p>Sertifikasi ISO 9001:2015 tidak hanya memperkuat kredibilitas PumaCon di dalam negeri, tetapi juga membuka peluang ekspansi ke pasar internasional. PumaCon kini semakin siap menjalin kemitraan dengan kontraktor multinasional dan lembaga pemerintah di berbagai negara yang mensyaratkan standar mutu tinggi sebagai prasyarat kerja sama.</p><blockquote>“Kami melihat ini sebagai titik awal untuk memperluas jangkauan bisnis kami, khususnya ke negara-negara dengan pembangunan infrastruktur yang pesat. Sertifikasi ini menjadi nilai tambah utama dalam kompetisi global,” tambah perwakilan tim ekspor PumaCon.</blockquote><h3>Komitmen terhadap Perbaikan Berkelanjutan</h3><p>Sertifikasi ini tidak menjadikan PumaCon berhenti berinovasi. Justru sebaliknya, PumaCon semakin berkomitmen menjalankan prinsip <strong>continuous improvement</strong>, baik dalam proses internal, pengembangan teknologi, maupun pelayanan kepada pelanggan.</p><p>Langkah ini juga sejalan dengan visi PumaCon sebagai perusahaan berbasis teknologi dan mutu yang mendukung pembangunan infrastruktur nasional secara berkelanjutan dan bertanggung jawab.</p>', 'CAT00003', 'EMP00001', '2025-06-16 00:00:00+00', 'Published', '2025-06-16 16:29:52.549797+00', '2025-06-16 16:29:52.549797+00');
INSERT INTO public.news VALUES ('NEW00012', 'PumaCon Buka Workshop Baru di Surabaya untuk Percepatan Produksi', 'uploads/images/news/news_NEW00012_1750091470170438000.jpg', '<p>Sebagai respons atas meningkatnya permintaan pasar konstruksi di wilayah timur Indonesia, <strong>PumaCon resmi membuka fasilitas workshop baru di Surabaya</strong>. Workshop ini dirancang untuk menjadi pusat produksi strategis dengan teknologi terkini, mendukung percepatan pengiriman unit serta memperluas jangkauan layanan secara nasional.</p><p>Terletak di kawasan industri strategis Surabaya Timur, workshop terbaru ini <strong>dilengkapi dengan mesin CNC generasi terbaru</strong>, <strong>area perakitan modular</strong>, serta sistem logistik internal yang <strong>terintegrasi langsung dengan pelabuhan dan jalur distribusi utama</strong>. Semua ini ditujukan untuk mempercepat proses produksi dan pengiriman tanpa mengorbankan standar mutu yang selama ini menjadi ciri khas PumaCon.</p><h3>Peningkatan Kapasitas Produksi Hingga 40%</h3><p>Dengan dioperasikannya fasilitas baru ini, PumaCon mencatat peningkatan kapasitas produksi hingga <strong>40% lebih tinggi</strong> dibanding sebelumnya. Artinya, unit <strong>batching plant, crusher, dan conveyor system</strong> kini dapat diproduksi dan dikirimkan ke pelanggan dalam waktu yang lebih singkat, terutama untuk proyek-proyek besar di kawasan Indonesia bagian timur seperti Kalimantan, Sulawesi, Nusa Tenggara, hingga Papua.</p><blockquote>“Workshop Surabaya bukan hanya fasilitas baru, tapi merupakan simbol komitmen kami untuk hadir lebih dekat dengan pelanggan dan memastikan ketepatan waktu dalam setiap proyek,” ujar Kepala Divisi Operasional PumaCon.</blockquote><h3>Komitmen terhadap Pemberdayaan Lokal</h3><p>Lebih dari sekadar ekspansi fisik, kehadiran workshop ini juga mencerminkan komitmen PumaCon dalam <strong>memberdayakan tenaga kerja lokal</strong>. Hingga saat ini, lebih dari <strong>80 tenaga ahli dan teknisi lokal</strong> telah direkrut untuk mendukung operasional harian, mulai dari fabrikasi hingga quality control.</p><blockquote>“Kami percaya bahwa kemajuan industri harus dibarengi dengan pembangunan SDM lokal. Itulah sebabnya kami juga menyelenggarakan pelatihan rutin dan transfer teknologi kepada seluruh tim baru kami di Surabaya,” tambahnya.</blockquote><h3>Bagian dari Strategi Ekspansi Nasional</h3><p>Pembukaan workshop ini merupakan bagian dari strategi jangka panjang PumaCon untuk memperkuat kehadirannya secara nasional. Dengan mengadopsi pendekatan desentralisasi produksi, PumaCon dapat melayani pelanggan lebih cepat, efisien, dan fleksibel terhadap kebutuhan spesifik di setiap daerah.</p><p>Ke depan, PumaCon juga merencanakan pembangunan pusat servis dan gudang sparepart di kota-kota besar lainnya untuk memastikan layanan purnajual tetap terjaga di seluruh wilayah Indonesia.</p>', 'CAT00003', 'EMP00001', '2025-06-16 00:00:00+00', 'Published', '2025-06-16 16:31:10.172067+00', '2025-06-16 16:31:10.172067+00');
INSERT INTO public.news VALUES ('NEW00013', 'PumaCon Gelar Pelatihan Teknisi Batching Plant Bersertifikat', 'uploads/images/news/news_NEW00013_1750091530107264700.jpg', '<p>Sebagai bentuk komitmen terhadap layanan purnajual dan peningkatan kompetensi industri, <strong>PumaCon sukses menggelar program Pelatihan Teknisi Batching Plant Bersertifikat</strong>. Program ini diikuti oleh <strong>40 peserta dari berbagai perusahaan kontraktor terkemuka di seluruh Indonesia</strong>, dan berlangsung selama lima hari penuh di <strong>pusat pelatihan resmi PumaCon</strong>.</p><p>Pelatihan ini dirancang untuk menjawab kebutuhan di lapangan akan teknisi yang tidak hanya terampil secara praktik, tetapi juga memahami sistem dan filosofi kerja batching plant modern—baik <strong>tipe drymix maupun wetmix</strong>. Melalui pendekatan kombinasi antara teori dan praktik, para peserta dibekali kemampuan troubleshooting sistem kontrol, pemeliharaan komponen, serta optimalisasi proses produksi beton.</p><h3>Kurikulum Komprehensif dan Instruktur Berpengalaman</h3><p>Selama lima hari pelatihan intensif, peserta mengikuti <strong>kelas teori yang mencakup dasar-dasar batching plant, sistem kontrol digital, serta manajemen perawatan berkala</strong>. Setelah itu, mereka langsung terjun ke <strong>sesi praktik lapangan</strong>, melakukan simulasi pemrograman, pengaturan material, hingga inspeksi komponen pada unit yang telah disiapkan.</p><blockquote>“Kami percaya bahwa keberhasilan operasional batching plant bukan hanya soal mesin yang andal, tapi juga teknisi yang kompeten. Itulah sebabnya kami merancang pelatihan ini dengan standar tinggi dan narasumber dari tim engineering internal kami,” ujar Kepala Departemen Training &amp; Support PumaCon.</blockquote><h3>Sertifikasi dan Layanan Lanjutan</h3><p>Sebagai bentuk pengakuan kompetensi, <strong>seluruh peserta yang dinyatakan lulus akan menerima Sertifikat Teknisi Batching Plant resmi dari PumaCon</strong>. Tidak hanya itu, mereka juga mendapatkan <strong>akses ke layanan konsultasi teknis selama 12 bulan</strong>, yang dapat digunakan untuk menyelesaikan permasalahan teknis di proyek masing-masing.</p><p>Program ini disambut sangat positif oleh para peserta. Banyak di antara mereka yang menyatakan bahwa pelatihan ini memberi nilai tambah besar dalam pekerjaan sehari-hari, terutama dalam <strong>menghadapi kendala operasional dan mengoptimalkan performa mesin di lapangan</strong>.</p><h3>Mendorong Standarisasi Kompetensi Nasional</h3><p>PumaCon melihat program pelatihan ini sebagai bagian dari visi jangka panjang untuk <strong>menstandarisasi kompetensi teknisi di industri alat berat dan konstruksi Indonesia</strong>. Ke depannya, PumaCon berencana untuk memperluas skema pelatihan dengan modul lanjutan, termasuk digitalisasi sistem kontrol, pemrograman SCADA, dan integrasi IoT.</p><blockquote>“Ini bukan pelatihan sekali jalan. Kami ingin menciptakan ekosistem pengetahuan yang berkelanjutan untuk pelanggan kami,” tambah perwakilan tim pelatihan.</blockquote><p><br></p>', 'CAT00003', 'EMP00001', '2025-06-16 00:00:00+00', 'Published', '2025-06-16 16:32:10.107784+00', '2025-06-16 16:32:10.107784+00');


--
-- TOC entry 3544 (class 0 OID 74119)
-- Dependencies: 244
-- Data for Name: news_categories; Type: TABLE DATA; Schema: public; Owner: bafaqih
--

INSERT INTO public.news_categories VALUES ('CAT00002', 'Tips', '<p>This category contains practical tips for machine maintenance, operational cost savings, efficient use of tools, and troubleshooting guides. The articles in this category are intended for technicians, operators, and construction business owners.</p>', 'Published', '2025-06-09 21:09:37.233797+00', '2025-06-09 22:02:28.002995+00');
INSERT INTO public.news_categories VALUES ('CAT00001', 'Education', '<p>This category features educational articles on technology, machine operation systems, and general knowledge related to the construction industry and heavy equipment. The aim is to improve the audience''s technical understanding of PumaCon products and services.</p>', 'Published', '2025-06-09 20:53:04.705627+00', '2025-06-09 21:08:36.069052+00');
INSERT INTO public.news_categories VALUES ('CAT00003', 'Company News', '<p>This category provides the latest information about internal company activities, product launches, ongoing projects, participation in exhibitions, and strategic partnerships.</p>', 'Published', '2025-06-09 21:09:58.166429+00', '2025-06-09 21:09:58.166429+00');


--
-- TOC entry 3535 (class 0 OID 49737)
-- Dependencies: 232
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: bafaqih
--

INSERT INTO public.order_items VALUES (24, 'ORD00002', 'SKU00000001', 2, 58000000.00, 'Primary Jaw Crusher', 'uploads/images/products/558b7703-e4a7-4d23-b8e7-ed7f6549a1d5.jpg', DEFAULT, '2025-06-09 23:46:38.605654', '2025-06-09 23:46:38.605654');
INSERT INTO public.order_items VALUES (25, 'ORD00002', 'SKU00000002', 1, 118000000.00, 'Wetmix Batching Plant (Standard)', 'uploads/images/products/d56facc5-315d-4df7-80e7-21a5d40a4bf3.jpg', DEFAULT, '2025-06-09 23:46:38.605654', '2025-06-09 23:46:38.605654');
INSERT INTO public.order_items VALUES (28, 'ORD00005', 'SKU00000002', 1, 118000000.00, 'Wetmix Batching Plant (Standard)', 'uploads/images/products/d56facc5-315d-4df7-80e7-21a5d40a4bf3.jpg', DEFAULT, '2025-06-10 11:40:56.522467', '2025-06-10 11:40:56.522467');
INSERT INTO public.order_items VALUES (29, 'ORD00005', 'SKU00000005', 1, 20000000.00, 'Air Compressor', 'uploads/images/products/8f5712c5-18e6-41c4-893e-b40efd839bbb.jpg', DEFAULT, '2025-06-10 11:40:56.522467', '2025-06-10 11:40:56.522467');
INSERT INTO public.order_items VALUES (30, 'ORD00006', 'SKU00000005', 2, 20000000.00, 'Air Compressor', 'uploads/images/products/8f5712c5-18e6-41c4-893e-b40efd839bbb.jpg', DEFAULT, '2025-06-12 12:50:07.902211', '2025-06-12 12:50:07.902211');
INSERT INTO public.order_items VALUES (31, 'ORD00007', 'SKU00000018', 1, 89000000.00, 'Belt Conveyor', 'uploads/images/products/ef7f59fd-296d-4c2d-899e-c9e6e29ce3d2.jpeg', DEFAULT, '2025-06-17 00:16:39.545551', '2025-06-17 00:16:39.545551');
INSERT INTO public.order_items VALUES (32, 'ORD00007', 'SKU00000016', 1, 79000000.00, 'Secondary Cone Crusher', 'uploads/images/products/d8c774ef-c994-421d-82a0-d9426db2e9c0.jpg', DEFAULT, '2025-06-17 00:16:39.545551', '2025-06-17 00:16:39.545551');
INSERT INTO public.order_items VALUES (33, 'ORD00007', 'SKU00000013', 1, 13000000.00, 'Electric Panel Box', 'uploads/images/products/d45f8b25-d47d-4caf-8cea-8fc56c40788a.jpg', DEFAULT, '2025-06-17 00:16:39.545551', '2025-06-17 00:16:39.545551');
INSERT INTO public.order_items VALUES (34, 'ORD00008', 'SKU00000010', 1, 75000000.00, 'Aggregate Hopper', 'uploads/images/products/11317e83-be19-4b56-8578-0a72d856c442.jpg', DEFAULT, '2025-06-17 00:19:00.627466', '2025-06-17 00:19:00.627466');
INSERT INTO public.order_items VALUES (35, 'ORD00008', 'SKU00000015', 2, 14000000.00, 'Silo Level Indicator', 'uploads/images/products/4b3db5db-4a95-4fd5-9884-7a85e1a63cfc.jpg', DEFAULT, '2025-06-17 00:19:00.627466', '2025-06-17 00:19:00.627466');
INSERT INTO public.order_items VALUES (36, 'ORD00009', 'SKU00000012', 1, 84000000.00, 'Dust Extraction Unit', 'uploads/images/products/f21769b4-609e-4505-8f98-07c3757b16e1.jpg', DEFAULT, '2025-06-17 00:23:00.993056', '2025-06-17 00:23:00.993056');
INSERT INTO public.order_items VALUES (37, 'ORD00009', 'SKU00000011', 1, 57000000.00, 'Bucket Elevator', 'uploads/images/products/9fb9c2b1-d7ef-46d9-9c15-016834482de1.jpg', DEFAULT, '2025-06-17 00:23:00.993056', '2025-06-17 00:23:00.993056');
INSERT INTO public.order_items VALUES (38, 'ORD00009', 'SKU00000014', 2, 1100000.00, 'Mixer Blade Set', 'uploads/images/products/d3aa1a91-31d3-4369-952b-2bd0a6ed6de9.jpg', DEFAULT, '2025-06-17 00:23:00.993056', '2025-06-17 00:23:00.993056');
INSERT INTO public.order_items VALUES (39, 'ORD00010', 'SKU00000014', 3, 1100000.00, 'Mixer Blade Set', 'uploads/images/products/d3aa1a91-31d3-4369-952b-2bd0a6ed6de9.jpg', DEFAULT, '2025-06-17 00:24:05.989741', '2025-06-17 00:24:05.989741');
INSERT INTO public.order_items VALUES (40, 'ORD00011', 'SKU00000008', 2, 98000000.00, 'Mini Batching Plant', 'uploads/images/products/2c3ded19-322d-48f5-bee0-403a121e8b69.jpg', DEFAULT, '2025-06-17 00:27:18.642539', '2025-06-17 00:27:18.642539');
INSERT INTO public.order_items VALUES (41, 'ORD00011', 'SKU00000006', 1, 150800000.00, 'Drymix Batching Plant (Standard)', 'uploads/images/products/95dbbf59-865a-406c-8130-4a45c20c1713.jpg', DEFAULT, '2025-06-17 00:27:18.642539', '2025-06-17 00:27:18.642539');
INSERT INTO public.order_items VALUES (42, 'ORD00011', 'SKU00000007', 1, 102000000.00, 'Portable Batching Plant', 'uploads/images/products/7de2d460-27cd-4b92-85a3-a03bceed0c02.jpg', DEFAULT, '2025-06-17 00:27:18.642539', '2025-06-17 00:27:18.642539');
INSERT INTO public.order_items VALUES (43, 'ORD00012', 'SKU00000010', 1, 75000000.00, 'Aggregate Hopper', 'uploads/images/products/11317e83-be19-4b56-8578-0a72d856c442.jpg', DEFAULT, '2025-06-17 00:29:56.668983', '2025-06-17 00:29:56.668983');
INSERT INTO public.order_items VALUES (44, 'ORD00012', 'SKU00000004', 2, 85500000.00, 'Screw Conveyor', 'uploads/images/products/9f6fc1f3-8fc1-471a-9863-44e901ee18e4.jpg', DEFAULT, '2025-06-17 00:29:56.668983', '2025-06-17 00:29:56.668983');
INSERT INTO public.order_items VALUES (45, 'ORD00013', 'SKU00000014', 6, 1100000.00, 'Mixer Blade Set', 'uploads/images/products/d3aa1a91-31d3-4369-952b-2bd0a6ed6de9.jpg', DEFAULT, '2025-06-17 00:30:54.777992', '2025-06-17 00:30:54.777992');
INSERT INTO public.order_items VALUES (46, 'ORD00013', 'SKU00000007', 2, 102000000.00, 'Portable Batching Plant', 'uploads/images/products/7de2d460-27cd-4b92-85a3-a03bceed0c02.jpg', DEFAULT, '2025-06-17 00:30:54.777992', '2025-06-17 00:30:54.777992');
INSERT INTO public.order_items VALUES (47, 'ORD00013', 'SKU00000018', 1, 89000000.00, 'Belt Conveyor', 'uploads/images/products/ef7f59fd-296d-4c2d-899e-c9e6e29ce3d2.jpeg', DEFAULT, '2025-06-17 00:30:54.777992', '2025-06-17 00:30:54.777992');
INSERT INTO public.order_items VALUES (48, 'ORD00013', 'SKU00000017', 2, 57000000.00, 'Impact Crusher', 'uploads/images/products/3ce52af1-c291-4a5c-bbf3-63e30ba4d580.jpg', DEFAULT, '2025-06-17 00:30:54.777992', '2025-06-17 00:30:54.777992');
INSERT INTO public.order_items VALUES (49, 'ORD00014', 'SKU00000006', 1, 150800000.00, 'Drymix Batching Plant (Standard)', 'uploads/images/products/95dbbf59-865a-406c-8130-4a45c20c1713.jpg', DEFAULT, '2025-06-17 00:37:09.748128', '2025-06-17 00:37:09.748128');
INSERT INTO public.order_items VALUES (50, 'ORD00014', 'SKU00000012', 2, 84000000.00, 'Dust Extraction Unit', 'uploads/images/products/f21769b4-609e-4505-8f98-07c3757b16e1.jpg', DEFAULT, '2025-06-17 00:37:09.748128', '2025-06-17 00:37:09.748128');
INSERT INTO public.order_items VALUES (51, 'ORD00014', 'SKU00000011', 1, 57000000.00, 'Bucket Elevator', 'uploads/images/products/9fb9c2b1-d7ef-46d9-9c15-016834482de1.jpg', DEFAULT, '2025-06-17 00:37:09.748128', '2025-06-17 00:37:09.748128');
INSERT INTO public.order_items VALUES (52, 'ORD00014', 'SKU00000010', 1, 75000000.00, 'Aggregate Hopper', 'uploads/images/products/11317e83-be19-4b56-8578-0a72d856c442.jpg', DEFAULT, '2025-06-17 00:37:09.748128', '2025-06-17 00:37:09.748128');
INSERT INTO public.order_items VALUES (53, 'ORD00014', 'SKU00000004', 1, 85500000.00, 'Screw Conveyor', 'uploads/images/products/9f6fc1f3-8fc1-471a-9863-44e901ee18e4.jpg', DEFAULT, '2025-06-17 00:37:09.748128', '2025-06-17 00:37:09.748128');
INSERT INTO public.order_items VALUES (54, 'ORD00015', 'SKU00000005', 1, 20000000.00, 'Air Compressor', 'uploads/images/products/8f5712c5-18e6-41c4-893e-b40efd839bbb.jpg', DEFAULT, '2025-06-17 00:40:22.603434', '2025-06-17 00:40:22.603434');
INSERT INTO public.order_items VALUES (55, 'ORD00015', 'SKU00000013', 2, 13000000.00, 'Electric Panel Box', 'uploads/images/products/d45f8b25-d47d-4caf-8cea-8fc56c40788a.jpg', DEFAULT, '2025-06-17 00:40:22.603434', '2025-06-17 00:40:22.603434');
INSERT INTO public.order_items VALUES (56, 'ORD00015', 'SKU00000015', 2, 14000000.00, 'Silo Level Indicator', 'uploads/images/products/4b3db5db-4a95-4fd5-9884-7a85e1a63cfc.jpg', DEFAULT, '2025-06-17 00:40:22.603434', '2025-06-17 00:40:22.603434');
INSERT INTO public.order_items VALUES (57, 'ORD00015', 'SKU00000018', 1, 89000000.00, 'Belt Conveyor', 'uploads/images/products/ef7f59fd-296d-4c2d-899e-c9e6e29ce3d2.jpeg', DEFAULT, '2025-06-17 00:40:22.603434', '2025-06-17 00:40:22.603434');
INSERT INTO public.order_items VALUES (58, 'ORD00015', 'SKU00000017', 1, 57000000.00, 'Impact Crusher', 'uploads/images/products/3ce52af1-c291-4a5c-bbf3-63e30ba4d580.jpg', DEFAULT, '2025-06-17 00:40:22.603434', '2025-06-17 00:40:22.603434');
INSERT INTO public.order_items VALUES (59, 'ORD00015', 'SKU00000016', 1, 79000000.00, 'Secondary Cone Crusher', 'uploads/images/products/d8c774ef-c994-421d-82a0-d9426db2e9c0.jpg', DEFAULT, '2025-06-17 00:40:22.603434', '2025-06-17 00:40:22.603434');
INSERT INTO public.order_items VALUES (60, 'ORD00015', 'SKU00000001', 2, 58000000.00, 'Primary Jaw Crusher', 'uploads/images/products/558b7703-e4a7-4d23-b8e7-ed7f6549a1d5.jpg', DEFAULT, '2025-06-17 00:40:22.603434', '2025-06-17 00:40:22.603434');
INSERT INTO public.order_items VALUES (61, 'ORD00016', 'SKU00000002', 2, 118000000.00, 'Wetmix Batching Plant (Standard)', 'uploads/images/products/d56facc5-315d-4df7-80e7-21a5d40a4bf3.jpg', DEFAULT, '2025-06-17 00:41:03.469725', '2025-06-17 00:41:03.469725');
INSERT INTO public.order_items VALUES (62, 'ORD00016', 'SKU00000006', 1, 150800000.00, 'Drymix Batching Plant (Standard)', 'uploads/images/products/95dbbf59-865a-406c-8130-4a45c20c1713.jpg', DEFAULT, '2025-06-17 00:41:03.469725', '2025-06-17 00:41:03.469725');
INSERT INTO public.order_items VALUES (63, 'ORD00017', 'SKU00000018', 2, 89000000.00, 'Belt Conveyor', 'uploads/images/products/ef7f59fd-296d-4c2d-899e-c9e6e29ce3d2.jpeg', DEFAULT, '2025-06-17 00:43:22.345693', '2025-06-17 00:43:22.345693');


--
-- TOC entry 3533 (class 0 OID 49715)
-- Dependencies: 230
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: bafaqih
--

INSERT INTO public.orders VALUES ('ORD00008', 'CST00005', 'Yosia Hermanto', 'yosia@gmail.com', '081212042004', 9, 'Rumah, Jl. Garden Hill No. 13, Pojokan, Kota Malang, Jawa Timur, 67219', '2025-06-17 00:19:00.623662', 'Bank Transfer', 'Completed', 103000000.00, '', 'uploads/payments/proof_CST00005_1750094340622081900_d0f2ffef.jpg', '2025-06-17 00:19:00.626262', '2025-06-17 00:54:06.904655');
INSERT INTO public.orders VALUES ('ORD00016', 'CST00010', 'Najwa BF', 'najwa@gmail.com', '081212042004', 14, 'Rumah, Jl. Nusa Indah Baru No. 4, Utara Stadion, Kota Probolinggo, Jawa Timur, 67219', '2025-06-17 00:41:03.465351', 'Bank Transfer', 'Completed', 386800000.00, 'buat bangun tol', 'uploads/payments/proof_CST00010_1750095663463310200_15018e6c.jpg', '2025-06-17 00:41:03.46832', '2025-06-17 00:54:20.470605');
INSERT INTO public.orders VALUES ('ORD00005', 'CST00002', 'Fadil Bafaqih', 'bafaqih@gmail.com', '081212042004', 5, 'Rumah, Jl. Nusa Indah Baru No. 4, Utara Stadion, Kota Probolinggo, Jawa Timur, 67219', '2025-06-10 11:40:56.506934', 'Bank Transfer', 'Completed', 138000000.00, '', 'uploads/payments/proof_CST00002_1749530456493757700_701a3345.jpg', '2025-06-10 11:40:56.518248', '2025-06-12 10:21:17.408079');
INSERT INTO public.orders VALUES ('ORD00002', 'CST00002', 'Fadil Bafaqih', 'bafaqih@gmail.com', '081212042004', 5, 'Rumah, Jl. Nusa Indah Baru No. 4, Utara Stadion, Kota Probolinggo, Jawa Timur, 67219', '2025-06-09 23:46:38.60118', 'Bank Transfer', 'Completed', 234000000.00, 'kasi yg terbaik bossss', 'uploads/payments/proof_CST00002_1749487598593395400_e04d4ee4.jpg', '2025-06-09 23:46:38.604627', '2025-06-10 02:34:01.46437');
INSERT INTO public.orders VALUES ('ORD00015', 'CST00010', 'Najwa BF', 'najwa@gmail.com', '081212042004', 14, 'Rumah, Jl. Nusa Indah Baru No. 4, Utara Stadion, Kota Probolinggo, Jawa Timur, 67219', '2025-06-17 00:40:22.589847', 'Bank Transfer', 'Completed', 415000000.00, 'kasi yg besttt', 'uploads/payments/proof_CST00010_1750095622587482100_803366e9.jpg', '2025-06-17 00:40:22.602907', '2025-06-17 00:54:27.546079');
INSERT INTO public.orders VALUES ('ORD00009', 'CST00006', 'Deva Nadindra', 'deva@gmail.com', '081212042004', 10, 'Kos, Jl. Mangliawan No. 7, Perumahan Buntu, Kabupaten Malang, Jawa Timur, 67219', '2025-06-17 00:23:00.985365', 'Bank Transfer', 'Shipped', 143200000.00, 'kasi yang terbaik!!', 'uploads/payments/proof_CST00006_1750094580981754500_770d9c19.jpg', '2025-06-17 00:23:00.991074', '2025-06-17 00:54:42.094588');
INSERT INTO public.orders VALUES ('ORD00010', 'CST00006', 'Deva Nadindra', 'deva@gmail.com', '081212042004', 10, 'Kos, Jl. Mangliawan No. 7, Perumahan Buntu, Kabupaten Malang, Jawa Timur, 67219', '2025-06-17 00:24:05.987075', 'Bank Transfer', 'Shipped', 3300000.00, 'gabungin sama yang tadi boss', 'uploads/payments/proof_CST00006_1750094645986001800_d6007ef2.jpg', '2025-06-17 00:24:05.988656', '2025-06-17 00:54:48.967787');
INSERT INTO public.orders VALUES ('ORD00011', 'CST00007', 'Hasun Dawileh', 'hasun@gmail.com', '081212042004', 11, 'Kos, Jl. Tirtomoyo No. 22, Kos Wahab, Kabupaten Malang, Jawa Timur, 23421', '2025-06-17 00:27:18.63721', 'Bank Transfer', 'Shipped', 448800000.00, 'cepet proses bossss', 'uploads/payments/proof_CST00007_1750094838630643000_38321feb.jpg', '2025-06-17 00:27:18.642024', '2025-06-17 00:54:54.490714');
INSERT INTO public.orders VALUES ('ORD00014', 'CST00009', 'Nur Lintang', 'lintang@gmail.com', '081212042004', 13, 'Rumah, Jl. Raya Bromo No. 1, Depan Basmalah, Kabupaten Probolinggo, Jawa Timur, 67219', '2025-06-17 00:37:09.73974', 'Bank Transfer', 'Pending', 536300000.00, 'tak borong yoooo', 'uploads/payments/proof_CST00009_1750095429737603800_4e0eb94b.jpg', '2025-06-17 00:37:09.747096', '2025-06-17 00:37:09.747096');
INSERT INTO public.orders VALUES ('ORD00017', 'CST00011', 'Hekel Angga', 'hekel@gmail.com', '081212042004', 15, 'Rumah, Jl. Supriadi No. 5, Depan Warung Naspad, Kota Probolinggo, Jawa Timur, 68118', '2025-06-17 00:43:22.343338', 'Bank Transfer', 'Pending', 178000000.00, 'jangan yg gampang putus', 'uploads/payments/proof_CST00011_1750095802340930200_9aadd340.jpg', '2025-06-17 00:43:22.344684', '2025-06-17 00:43:22.344684');
INSERT INTO public.orders VALUES ('ORD00007', 'CST00004', 'Raihan Firmansyah', 'raihan@gmail.com', '081212042004', 8, 'Rumah, Jl. Raya Singosari No. 12, Belakang Toko Bangunan, Malang, Jawa Timur, 68118', '2025-06-17 00:16:39.536758', 'Bank Transfer', 'Completed', 181000000.00, 'cakepppp', 'uploads/payments/proof_CST00004_1750094199528606700_2630c958.jpg', '2025-06-17 00:16:39.544466', '2025-06-17 00:53:40.017983');
INSERT INTO public.orders VALUES ('ORD00006', 'CST00003', 'Ipul Fulvian', 'fulvian@gmail.com', '081218902004', 7, 'Kos, Jl. Borobudur, Utara Stadion, Kota Probolinggo, Jawa Timur, 67219', '2025-06-12 12:50:07.893256', 'Bank Transfer', 'Canceled', 40000000.00, 'yg rapi', 'uploads/payments/proof_CST00003_1749707407882871800_e88fdc25.jpg', '2025-06-12 12:50:07.899016', '2025-06-17 00:53:49.589545');
INSERT INTO public.orders VALUES ('ORD00012', 'CST00008', 'Hasyim Bafaqih', 'hasyim@gmail.com', '081212042004', 12, 'Kos, Jl. Tirto Rahayu No. 77, Perum Rahayu, Kabupaten Probolinggo, Jawa Timur, 68118', '2025-06-17 00:29:56.665476', 'Bank Transfer', 'Processed', 246000000.00, 'okeeeeeeeeee', 'uploads/payments/proof_CST00008_1750094996663885800_d2bcb170.jpg', '2025-06-17 00:29:56.66843', '2025-06-17 00:55:00.229627');
INSERT INTO public.orders VALUES ('ORD00013', 'CST00008', 'Hasyim Bafaqih', 'hasyim@gmail.com', '081212042004', 12, 'Kos, Jl. Tirto Rahayu No. 77, Perum Rahayu, Kabupaten Probolinggo, Jawa Timur, 68118', '2025-06-17 00:30:54.771429', 'Bank Transfer', 'Processed', 413600000.00, 'lagi bosssss', 'uploads/payments/proof_CST00008_1750095054769742600_4b490847.jpg', '2025-06-17 00:30:54.776791', '2025-06-17 00:55:07.615553');


--
-- TOC entry 3525 (class 0 OID 33128)
-- Dependencies: 222
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: bafaqih
--

INSERT INTO public.product_categories VALUES ('CAT0001', 'Batching Plant Series', '<p>Products for concrete mixing needs, both in stationary and portable systems. Suitable for large and small projects.</p>', 'published', '2025-06-09 23:31:49.076384', '2025-06-09 23:31:49.076384');
INSERT INTO public.product_categories VALUES ('CAT0002', 'Material Storage & Transfer Equipment', '<p>Equipment for the storage and transfer of materials such as cement and aggregates.</p>', 'published', '2025-06-09 23:33:09.442811', '2025-06-09 23:33:09.442811');
INSERT INTO public.product_categories VALUES ('CAT0003', 'Spare Parts & Accessories', '<p>Replacement and complementary components for the main engine.</p>', 'published', '2025-06-09 23:33:25.833944', '2025-06-09 23:33:25.833944');
INSERT INTO public.product_categories VALUES ('CAT0004', 'Stone Crushing Systems', '<p>Equipment for crushing rocks and aggregate materials and its supporting systems.</p>', 'published', '2025-06-09 23:33:41.047043', '2025-06-12 12:08:02.923553');


--
-- TOC entry 3527 (class 0 OID 33154)
-- Dependencies: 224
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: bafaqih
--

INSERT INTO public.product_images VALUES ('SKU00000001', 'uploads/images/products/558b7703-e4a7-4d23-b8e7-ed7f6549a1d5.jpg', '2025-06-09 23:42:09.0492', '2025-06-09 23:42:09.0492', 1);
INSERT INTO public.product_images VALUES ('SKU00000002', 'uploads/images/products/d56facc5-315d-4df7-80e7-21a5d40a4bf3.jpg', '2025-06-09 23:43:45.504448', '2025-06-09 23:43:45.504448', 2);
INSERT INTO public.product_images VALUES ('SKU00000004', 'uploads/images/products/9f6fc1f3-8fc1-471a-9863-44e901ee18e4.jpg', '2025-06-10 10:29:27.134742', '2025-06-10 10:29:27.134742', 4);
INSERT INTO public.product_images VALUES ('SKU00000005', 'uploads/images/products/8f5712c5-18e6-41c4-893e-b40efd839bbb.jpg', '2025-06-10 10:36:36.469919', '2025-06-10 10:36:36.469919', 5);
INSERT INTO public.product_images VALUES ('SKU00000006', 'uploads/images/products/95dbbf59-865a-406c-8130-4a45c20c1713.jpg', '2025-06-16 02:24:01.531523', '2025-06-16 02:24:01.531523', 6);
INSERT INTO public.product_images VALUES ('SKU00000007', 'uploads/images/products/7de2d460-27cd-4b92-85a3-a03bceed0c02.jpg', '2025-06-16 02:29:19.303722', '2025-06-16 02:29:19.303722', 7);
INSERT INTO public.product_images VALUES ('SKU00000008', 'uploads/images/products/2c3ded19-322d-48f5-bee0-403a121e8b69.jpg', '2025-06-16 02:32:33.463651', '2025-06-16 02:32:33.463651', 8);
INSERT INTO public.product_images VALUES ('SKU00000010', 'uploads/images/products/11317e83-be19-4b56-8578-0a72d856c442.jpg', '2025-06-16 02:40:31.541845', '2025-06-16 02:40:31.541845', 10);
INSERT INTO public.product_images VALUES ('SKU00000011', 'uploads/images/products/9fb9c2b1-d7ef-46d9-9c15-016834482de1.jpg', '2025-06-16 02:43:41.52198', '2025-06-16 02:43:41.52198', 11);
INSERT INTO public.product_images VALUES ('SKU00000012', 'uploads/images/products/f21769b4-609e-4505-8f98-07c3757b16e1.jpg', '2025-06-16 02:48:38.45614', '2025-06-16 02:48:38.45614', 14);
INSERT INTO public.product_images VALUES ('SKU00000013', 'uploads/images/products/d45f8b25-d47d-4caf-8cea-8fc56c40788a.jpg', '2025-06-16 02:57:12.378783', '2025-06-16 02:57:12.378783', 15);
INSERT INTO public.product_images VALUES ('SKU00000014', 'uploads/images/products/d3aa1a91-31d3-4369-952b-2bd0a6ed6de9.jpg', '2025-06-16 03:01:26.015192', '2025-06-16 03:01:26.015192', 16);
INSERT INTO public.product_images VALUES ('SKU00000015', 'uploads/images/products/4b3db5db-4a95-4fd5-9884-7a85e1a63cfc.jpg', '2025-06-16 03:03:31.451034', '2025-06-16 03:03:31.451034', 17);
INSERT INTO public.product_images VALUES ('SKU00000016', 'uploads/images/products/d8c774ef-c994-421d-82a0-d9426db2e9c0.jpg', '2025-06-16 03:08:06.958321', '2025-06-16 03:08:06.958321', 18);
INSERT INTO public.product_images VALUES ('SKU00000017', 'uploads/images/products/3ce52af1-c291-4a5c-bbf3-63e30ba4d580.jpg', '2025-06-16 03:10:00.894755', '2025-06-16 03:10:00.894755', 19);
INSERT INTO public.product_images VALUES ('SKU00000018', 'uploads/images/products/ef7f59fd-296d-4c2d-899e-c9e6e29ce3d2.jpeg', '2025-06-16 03:13:01.529432', '2025-06-16 03:13:01.529432', 20);


--
-- TOC entry 3526 (class 0 OID 33139)
-- Dependencies: 223
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: bafaqih
--

INSERT INTO public.products VALUES ('SKU00000005', 'Air Compressor', 'PumaCon', 'CAT0003', 'Electric', '3 Months', '2025-06-10', '<p>An air compressor is an air compressor unit that functions as a source of air pressure in a batching plant system. This device plays an important role in operating pneumatic components such as hopper doors (temporary storage for aggregates) and valves in cement storage silos or other materials. With the air pressure generated, this system can open and close doors or valves automatically and precisely, supporting the efficiency of the concrete mixing process.</p><p><br></p><p>Air compressors in batching plants are typically designed to operate continuously and stably, with pressure capacity tailored to the plant''s operational requirements. In addition to powering pneumatic mechanisms, these compressors can also be used to clean pipes or equipment with compressed air. Their reliable performance, relatively easy maintenance, and high durability make air compressors a vital component in batching plant automation systems.</p>', 16, 'Published', 20000000.00, '2025-06-10 10:36:36.468229', '2025-06-17 00:40:22.591511', 14750000.00);
INSERT INTO public.products VALUES ('SKU00000001', 'Primary Jaw Crusher', 'PumaCon', 'CAT0004', 'Electric', '12 Months', '2025-06-09', '<p>First stage rock crusher designed to crush large rocks into smaller sizes. Suitable for rock mining applications and large infrastructure projects. Features high compressive strength and good working efficiency. The crushing process is fast with efficient energy consumption.</p><p><br></p><p>First stage rock crusher designed to crush large rocks into smaller sizes. Suitable for rock mining applications and large infrastructure projects. Features high compressive strength and good working efficiency. The crushing process is fast with efficient energy consumption.</p><p><br></p><p>First stage rock crusher designed to crush large rocks into smaller sizes. Suitable for rock mining applications and large infrastructure projects. Features high compressive strength and good working efficiency. The crushing process is fast with efficient energy consumption.</p>', 14, 'Published', 58000000.00, '2025-06-09 23:42:09.047384', '2025-06-17 00:40:22.602405', 45740000.00);
INSERT INTO public.products VALUES ('SKU00000002', 'Wetmix Batching Plant (Standard)', 'PumaCon', 'CAT0001', 'Electric', '36 Months', '2025-06-09', '<p>A wetmix batching plant is a concrete mixing system that adds water directly to the mixture inside the plant. This allows for a more homogeneous mixture and higher quality concrete because the mixing process is carried out thoroughly.</p><p><br></p><p>This type of plant is ideal for projects that require large quantities of concrete with high consistency. It is suitable for use in the construction of roads, bridges, and other large structures.</p><p><br></p><p>This type of plant is ideal for projects that require large quantities of concrete with high consistency. It is suitable for use in the construction of roads, bridges, and other large structures.</p>', 15, 'Published', 118000000.00, '2025-06-09 23:43:45.503158', '2025-06-17 00:41:03.466516', 98850000.00);
INSERT INTO public.products VALUES ('SKU00000006', 'Drymix Batching Plant (Standard)', 'PumaCon', 'CAT0001', 'Electric', '36 Months', '2025-06-16', '<p>A Drymix Batching Plant is a type of concrete mixing system in which dry materials such as cement, sand, and aggregates are mixed first without adding water at the batching plant. The water mixing process is then carried out in the mixer truck while en route to the project site. This system is designed for high efficiency in dry concrete production and provides good control over material composition before final mixing is done on-site. Drymix allows the plant to operate with minimal water consumption, making it an ideal solution for areas with limited water resources or infrastructure.</p><p><br></p><p>The main advantages of the Drymix Batching Plant lie in its delivery flexibility and the durability of the mixture during distribution. Since final mixing is done inside the mixer truck, the concrete does not dry out or harden before reaching the pouring site, thereby reducing the potential for material waste. Additionally, this system is highly suitable for remote areas, small to medium-sized projects, and projects requiring high mobility. As a result, the Drymix Batching Plant is a strategic choice to ensure concrete quality remains consistent even under challenging field conditions.</p>', 17, 'Published', 150800000.00, '2025-06-16 02:24:01.528213', '2025-06-17 00:41:03.467799', 103000000.00);
INSERT INTO public.products VALUES ('SKU00000010', 'Aggregate Hopper', 'PumaCon', 'CAT0002', 'Electric', '12 Months', '2025-06-16', '<p>An aggregate hopper is a storage container designed to hold both coarse and fine aggregates before they are transferred to the batching system. It is typically connected to a conveyor system that moves the materials into the weighing unit or mixing chamber as part of the concrete production process.</p><p><br></p><p>The hopper ensures a consistent supply of aggregate materials, helping to maintain the batching plant''s efficiency and accuracy. Its design allows for easy loading and controlled discharge, which is essential for maintaining the proper mix proportions and ensuring high-quality concrete output.</p>', 17, 'Published', 75000000.00, '2025-06-16 02:40:31.54069', '2025-06-17 00:37:09.744541', 55000000.00);
INSERT INTO public.products VALUES ('SKU00000008', 'Mini Batching Plant', 'PumaCon', 'CAT0001', 'Electric', '12 Months', '2025-06-16', '<p>A Mini Batching Plant is a compact version of a traditional batching plant, specifically designed for small to medium-scale construction projects. Its smaller size allows for easier operation, simplified maintenance, and faster setup compared to larger plants. This makes it an ideal choice for contractors who require efficient concrete production without the need for large-scale infrastructure or space.</p><p><br></p><p>Due to its cost-effectiveness and mobility, the Mini Batching Plant is widely used by local contractors and is commonly deployed in residential construction projects, low-rise buildings, and other development sites with limited space. Despite its compact design, it delivers reliable performance and consistent concrete quality, making it a practical and efficient solution for various on-site applications.</p>', 18, 'Published', 98000000.00, '2025-06-16 02:32:33.462343', '2025-06-17 00:27:18.638503', 66700000.00);
INSERT INTO public.products VALUES ('SKU00000011', 'Bucket Elevator', 'PumaCon', 'CAT0002', 'Electric', '6 Months', '2025-06-16', '<p>A bucket elevator is a vertical material handling device designed to transport bulk materials—such as sand, gravel, cement, or other granular substances—from a lower level to a higher elevation. It consists of a series of buckets attached to a continuous belt or chain, which rotates around a pair of pulleys or sprockets. As the buckets scoop up the material at the bottom, they carry it upward and discharge it at the top, typically into a silo or hopper. This system is widely used in concrete batching plants, as well as in industries such as mining, agriculture, and construction.</p><p><br></p><p>The bucket elevator is particularly efficient for applications that require lifting materials to significant heights while conserving ground space. Its enclosed design minimizes dust emissions and material spillage, contributing to a cleaner and safer working environment. Additionally, it provides a consistent and controlled flow of materials, ensuring accurate batching and mixing in concrete production. With low power consumption, relatively low maintenance requirements, and a long service life, bucket elevators are a reliable and cost-effective solution for vertical material transport in high-capacity operations.</p>', 18, 'Published', 57000000.00, '2025-06-16 02:43:41.520757', '2025-06-17 00:37:09.743313', 35000000.00);
INSERT INTO public.products VALUES ('SKU00000012', 'Dust Extraction Unit', 'PumaCon', 'CAT0002', 'Electric', '12 Months', '2025-06-16', '<p>A dust extraction unit is a specialized system designed to capture and filter dust particles generated during the material handling and transfer processes in a batching plant. This unit is typically installed near aggregate hoppers, conveyor belts, silos, or mixers where dust emission is most likely to occur. By drawing in airborne particles through suction and passing them through a series of filters, the system helps maintain a clean and safe working environment.</p><p><br></p><p>Dust extraction units are essential not only for improving air quality but also for ensuring the health and safety of workers on site. Excessive dust can pose respiratory hazards, reduce visibility, and lead to the malfunction of sensitive equipment. By minimizing dust accumulation, these units also contribute to better equipment longevity and compliance with environmental regulations. Their use reflects a commitment to workplace safety, operational efficiency, and environmental responsibility.</p>', 17, 'Published', 84000000.00, '2025-06-16 02:47:18.283127', '2025-06-17 00:37:09.742291', 63000000.00);
INSERT INTO public.products VALUES ('SKU00000014', 'Mixer Blade Set', 'PumaCon', 'CAT0003', 'Manual', '3 Months', '2025-06-16', '<p>A mixer blade set is a collection of mixing paddles or blades installed inside concrete mixers, such as pan mixers or twin shaft mixers, used in batching plants. These blades are responsible for thoroughly blending cement, aggregates, and water to produce a consistent and high-quality concrete mix. The design and positioning of the blades are optimized to ensure uniform mixing, reduce dead zones, and improve the overall efficiency of the mixing process.</p><p>Made from wear-resistant materials like hardened steel or cast iron, mixer blade sets are built to endure the abrasive nature of concrete materials over prolonged use. They are also designed for easy replacement and maintenance, allowing operators to quickly swap out worn blades without significant downtime. This durability and serviceability make them an essential component in maintaining the performance and longevity of concrete mixers in both small-scale and high-output batching operations.</p>', 9, 'Published', 1100000.00, '2025-06-16 03:01:26.013962', '2025-06-17 00:30:54.772007', 450000.00);
INSERT INTO public.products VALUES ('SKU00000013', 'Electric Panel Box', 'PumaCon', 'CAT0003', 'Electric', '', '2025-06-16', '<p>An electric panel box is the central hub for electrical power distribution within a batching plant. It houses circuit breakers, control switches, relays, and other essential electrical components that manage and regulate the operation of various plant systems, such as mixers, conveyors, weighing scales, and dust collectors. The panel ensures stable and safe power supply across the plant, allowing operators to monitor and control equipment effectively from a single point.</p><p><br></p><p>Engineered for heavy-duty industrial environments, electric panel boxes used in batching plants are built to withstand harsh conditions, including exposure to dust, moisture, and vibrations. They are typically enclosed in weather-resistant and dustproof casings that meet industrial safety standards, ensuring long-term reliability and minimizing the risk of electrical failure. This robustness makes the electric panel box a critical component in ensuring uninterrupted operations and workplace safety in demanding construction and industrial settings.</p>', 17, 'Published', 13000000.00, '2025-06-16 02:57:12.377123', '2025-06-17 00:40:22.59341', 5500000.00);
INSERT INTO public.products VALUES ('SKU00000004', 'Screw Conveyor', 'PumaCon', 'CAT0002', 'Electric', '12 Months', '2025-06-10', '<p>A screw conveyor is a spiral-shaped (screw) material handling device that rotates inside a pipe or enclosed casing. It is commonly used to transport dry materials such as cement from one location to another, for example, from a storage silo into a concrete mixer. This system operates based on the principle of screw rotation, which pushes the material along the tube, enabling continuous and controlled material transfer.</p><p><br></p><p>Screw Conveyors offer the advantage of maintaining a clean work environment due to their enclosed system, which reduces dust and material spills. Additionally, this equipment boasts high efficiency in material handling over short to medium distances. Its compact design and low maintenance requirements make it an ideal choice for the construction industry, ready-mix concrete production, and other building material manufacturing facilities.</p>', 17, 'Published', 85500000.00, '2025-06-10 10:29:27.132738', '2025-06-17 00:37:09.74607', 48000000.00);
INSERT INTO public.products VALUES ('SKU00000007', 'Portable Batching Plant', 'PumaCon', 'CAT0001', 'Electric', '24 Months', '2025-06-16', '<p>Portable Batching Plant is a concrete mixing solution specifically designed for high mobility and quick installation. With its compact structure and modular system features, this plant can be easily moved from one project site to another without requiring a permanent foundation. This makes the Portable Batching Plant ideal for short-term projects or those located in remote areas where the construction of permanent facilities is not feasible or efficient.</p><p><br></p><p>The use of Portable Batching Plants is commonly found in highway projects, residential construction, and medium to small-scale infrastructure projects. The efficiency in installation and operational time provides significant advantages for contractors requiring high flexibility in project execution. Additionally, the system maintains consistent concrete mix quality even when moving locations, making it a reliable choice in dynamic field conditions that demand fast-paced work.</p>', 17, 'Published', 102000000.00, '2025-06-16 02:29:19.302495', '2025-06-17 00:30:54.773611', 88000000.00);
INSERT INTO public.products VALUES ('SKU00000018', 'Belt Conveyor', 'PumaCon', 'CAT0004', 'Electric', '6 Months', '2025-06-16', '<p>A belt conveyor is a continuous material handling system used to transport aggregates between machines within a crushing or batching plant production line. It consists of a durable rubber or synthetic belt that moves over rollers or pulleys, efficiently carrying materials such as crushed stone, sand, or gravel from one processing stage to another. This system ensures a smooth and uninterrupted flow of materials, which is crucial for maintaining high production efficiency.</p><p><br></p><p>Designed for heavy-duty operation, belt conveyors in aggregate processing are built to withstand abrasive materials, heavy loads, and demanding environmental conditions. They are engineered for minimal maintenance and long service life, with features like adjustable speed, dust covers, and automated controls to optimize performance. By reducing the need for manual handling and improving process automation, belt conveyors play a vital role in increasing operational efficiency, reducing labor costs, and enhancing the overall productivity of industrial crushing and batching systems.</p>', 15, 'Published', 89000000.00, '2025-06-16 03:13:01.528926', '2025-06-17 00:43:22.344026', 66000000.00);
INSERT INTO public.products VALUES ('SKU00000015', 'Silo Level Indicator', 'PumaCon', 'CAT0003', 'Electric', '1 Month', '2025-06-16', '<p>A silo level indicator is a sensor device used to monitor and detect the level of materials such as cement, fly ash, or other bulk powders stored in a silo. It provides real-time data on the material height, allowing operators to know whether the silo is full, partially filled, or near empty. This information is critical for preventing overfilling, minimizing downtime, and ensuring a continuous and efficient batching process.</p><p><br></p><p>The level indicator supports automated control by triggering signals for material refilling or stopping material input when necessary. It is typically integrated with the batching plant’s control system, allowing for seamless coordination between storage and production units. Designed to withstand dusty and pressurized environments, silo level indicators contribute to both operational efficiency and workplace safety by reducing the need for manual checks and ensuring a smooth material flow throughout the production cycle.</p>', 16, 'Published', 14000000.00, '2025-06-16 03:03:31.449962', '2025-06-17 00:40:22.595463', 9500000.00);
INSERT INTO public.products VALUES ('SKU00000017', 'Impact Crusher', 'PumaCon', 'CAT0004', 'Electric', '12 Months', '2025-06-16', '<p>An impact crusher is a type of crushing machine that breaks down stone and other materials using high-speed impact force rather than compression. As material enters the crusher, it is struck by rapidly rotating hammers or blow bars and propelled against impact plates or walls, causing it to shatter into smaller, more uniform particles. This method of crushing produces well-graded and angular aggregates that are particularly suitable for use in road construction and other infrastructure projects.</p><p><br></p><p>Impact crushers are highly effective for processing medium to hard materials and are often used when a consistent particle shape and size are essential. They are especially favored for applications that require high-quality, cubical aggregates, such as asphalt or concrete production. With adjustable settings, these machines offer flexibility in output size and can be tailored to meet specific project requirements. Their efficiency, ease of maintenance, and ability to produce superior end products make them a valuable asset in modern construction and quarrying operations.</p>', 17, 'Published', 57000000.00, '2025-06-16 03:10:00.892243', '2025-06-17 00:40:22.59864', 38000000.00);
INSERT INTO public.products VALUES ('SKU00000016', 'Secondary Cone Crusher', 'PumaCon', 'CAT0004', 'Electric', '12 Months', '2025-06-16', '<p>A secondary cone crusher is a type of crushing equipment used after the initial crushing process performed by a primary jaw crusher. Its main function is to further reduce the size of the crushed material, producing finer and more uniform aggregates. The cone crusher operates by compressing the material between a moving cone (mantle) and a fixed outer surface (concave), effectively breaking the stones into smaller pieces suitable for use in concrete production or road construction.</p><p><br></p><p>This machine is ideal for producing high-quality aggregates with consistent shape and gradation, which are essential in achieving strong and durable concrete mixes. Secondary cone crushers are widely used in quarrying, mining, and construction industries due to their high efficiency, reliability, and ability to handle various types of hard and abrasive materials. Additionally, their automated control systems and adjustable settings allow for precise output size control, enhancing overall production flexibility and performance.</p>', 15, 'Published', 79000000.00, '2025-06-16 03:08:06.955999', '2025-06-17 00:40:22.600453', 55000000.00);


--
-- TOC entry 3557 (class 0 OID 0)
-- Dependencies: 228
-- Name: carts_cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bafaqih
--

SELECT pg_catalog.setval('public.carts_cart_id_seq', 64, true);


--
-- TOC entry 3558 (class 0 OID 0)
-- Dependencies: 226
-- Name: customer_address_address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bafaqih
--

SELECT pg_catalog.setval('public.customer_address_address_id_seq', 15, true);


--
-- TOC entry 3559 (class 0 OID 0)
-- Dependencies: 237
-- Name: customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bafaqih
--

SELECT pg_catalog.setval('public.customer_id_seq', 11, true);


--
-- TOC entry 3560 (class 0 OID 0)
-- Dependencies: 239
-- Name: department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bafaqih
--

SELECT pg_catalog.setval('public.department_id_seq', 10, true);


--
-- TOC entry 3561 (class 0 OID 0)
-- Dependencies: 238
-- Name: employee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bafaqih
--

SELECT pg_catalog.setval('public.employee_id_seq', 10, true);


--
-- TOC entry 3562 (class 0 OID 0)
-- Dependencies: 243
-- Name: news_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bafaqih
--

SELECT pg_catalog.setval('public.news_category_id_seq', 3, true);


--
-- TOC entry 3563 (class 0 OID 0)
-- Dependencies: 245
-- Name: news_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bafaqih
--

SELECT pg_catalog.setval('public.news_id_seq', 17, true);


--
-- TOC entry 3564 (class 0 OID 0)
-- Dependencies: 236
-- Name: order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bafaqih
--

SELECT pg_catalog.setval('public.order_id_seq', 17, true);


--
-- TOC entry 3565 (class 0 OID 0)
-- Dependencies: 231
-- Name: order_items_order_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bafaqih
--

SELECT pg_catalog.setval('public.order_items_order_item_id_seq', 63, true);


--
-- TOC entry 3566 (class 0 OID 0)
-- Dependencies: 240
-- Name: product_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bafaqih
--

SELECT pg_catalog.setval('public.product_category_id_seq', 4, true);


--
-- TOC entry 3567 (class 0 OID 0)
-- Dependencies: 242
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bafaqih
--

SELECT pg_catalog.setval('public.product_images_id_seq', 20, true);


--
-- TOC entry 3568 (class 0 OID 0)
-- Dependencies: 241
-- Name: product_sku_seq; Type: SEQUENCE SET; Schema: public; Owner: bafaqih
--

SELECT pg_catalog.setval('public.product_sku_seq', 18, true);


--
-- TOC entry 3333 (class 2606 OID 49592)
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (cart_id);


--
-- TOC entry 3330 (class 2606 OID 49522)
-- Name: customer_address customer_address_pkey; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.customer_address
    ADD CONSTRAINT customer_address_pkey PRIMARY KEY (address_id);


--
-- TOC entry 3326 (class 2606 OID 41355)
-- Name: customer_details customer_details_email_key; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.customer_details
    ADD CONSTRAINT customer_details_email_key UNIQUE (email);


--
-- TOC entry 3328 (class 2606 OID 41353)
-- Name: customer_details customer_details_pkey; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.customer_details
    ADD CONSTRAINT customer_details_pkey PRIMARY KEY (customer_id);


--
-- TOC entry 3301 (class 2606 OID 41357)
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- TOC entry 3303 (class 2606 OID 16752)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (customer_id);


--
-- TOC entry 3314 (class 2606 OID 24944)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- TOC entry 3312 (class 2606 OID 16829)
-- Name: employees_account employees_account_pkey; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.employees_account
    ADD CONSTRAINT employees_account_pkey PRIMARY KEY (employee_id);


--
-- TOC entry 3310 (class 2606 OID 16817)
-- Name: employees_address employees_address_pkey; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.employees_address
    ADD CONSTRAINT employees_address_pkey PRIMARY KEY (employee_id);


--
-- TOC entry 3305 (class 2606 OID 16785)
-- Name: employees employees_email_key; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_email_key UNIQUE (email);


--
-- TOC entry 3307 (class 2606 OID 16765)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (employee_id);


--
-- TOC entry 3346 (class 2606 OID 74129)
-- Name: news_categories news_categories_category_name_key; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.news_categories
    ADD CONSTRAINT news_categories_category_name_key UNIQUE (category_name);


--
-- TOC entry 3348 (class 2606 OID 74127)
-- Name: news_categories news_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.news_categories
    ADD CONSTRAINT news_categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 3352 (class 2606 OID 74141)
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (news_id);


--
-- TOC entry 3344 (class 2606 OID 49748)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (order_item_id);


--
-- TOC entry 3340 (class 2606 OID 49725)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- TOC entry 3318 (class 2606 OID 33136)
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 3323 (class 2606 OID 33148)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_sku);


--
-- TOC entry 3316 (class 2606 OID 24946)
-- Name: departments uni_departments_department_name; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT uni_departments_department_name UNIQUE (department_name);


--
-- TOC entry 3320 (class 2606 OID 33138)
-- Name: product_categories uni_product_categories_category_name; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT uni_product_categories_category_name UNIQUE (category_name);


--
-- TOC entry 3337 (class 2606 OID 49606)
-- Name: carts uq_customer_product; Type: CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT uq_customer_product UNIQUE (customer_id, product_sku);


--
-- TOC entry 3334 (class 1259 OID 49624)
-- Name: idx_carts_customer_id; Type: INDEX; Schema: public; Owner: bafaqih
--

CREATE INDEX idx_carts_customer_id ON public.carts USING btree (customer_id);


--
-- TOC entry 3335 (class 1259 OID 49625)
-- Name: idx_carts_product_sku; Type: INDEX; Schema: public; Owner: bafaqih
--

CREATE INDEX idx_carts_product_sku ON public.carts USING btree (product_sku);


--
-- TOC entry 3331 (class 1259 OID 49543)
-- Name: idx_customer_address_customer_id; Type: INDEX; Schema: public; Owner: bafaqih
--

CREATE INDEX idx_customer_address_customer_id ON public.customer_address USING btree (customer_id);


--
-- TOC entry 3308 (class 1259 OID 24961)
-- Name: idx_employees_department; Type: INDEX; Schema: public; Owner: bafaqih
--

CREATE INDEX idx_employees_department ON public.employees USING btree (department);


--
-- TOC entry 3349 (class 1259 OID 74153)
-- Name: idx_news_author_id; Type: INDEX; Schema: public; Owner: bafaqih
--

CREATE INDEX idx_news_author_id ON public.news USING btree (author_id);


--
-- TOC entry 3350 (class 1259 OID 74152)
-- Name: idx_news_category_id; Type: INDEX; Schema: public; Owner: bafaqih
--

CREATE INDEX idx_news_category_id ON public.news USING btree (category_id);


--
-- TOC entry 3341 (class 1259 OID 49764)
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: bafaqih
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- TOC entry 3342 (class 1259 OID 49765)
-- Name: idx_order_items_product_sku; Type: INDEX; Schema: public; Owner: bafaqih
--

CREATE INDEX idx_order_items_product_sku ON public.order_items USING btree (product_sku);


--
-- TOC entry 3338 (class 1259 OID 49789)
-- Name: idx_orders_customer_id; Type: INDEX; Schema: public; Owner: bafaqih
--

CREATE INDEX idx_orders_customer_id ON public.orders USING btree (customer_id);


--
-- TOC entry 3324 (class 1259 OID 33184)
-- Name: idx_product_images_product_sku; Type: INDEX; Schema: public; Owner: bafaqih
--

CREATE INDEX idx_product_images_product_sku ON public.product_images USING btree (product_sku);


--
-- TOC entry 3321 (class 1259 OID 33201)
-- Name: idx_products_product_category_id; Type: INDEX; Schema: public; Owner: bafaqih
--

CREATE INDEX idx_products_product_category_id ON public.products USING btree (product_category);


--
-- TOC entry 3360 (class 2606 OID 49593)
-- Name: carts carts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;


--
-- TOC entry 3361 (class 2606 OID 49607)
-- Name: carts fk_carts_products; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT fk_carts_products FOREIGN KEY (product_sku) REFERENCES public.products(product_sku) ON DELETE CASCADE;


--
-- TOC entry 3359 (class 2606 OID 49538)
-- Name: customer_address fk_customers_addresses; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.customer_address
    ADD CONSTRAINT fk_customers_addresses FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- TOC entry 3362 (class 2606 OID 49619)
-- Name: carts fk_customers_carts; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT fk_customers_carts FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- TOC entry 3358 (class 2606 OID 41379)
-- Name: customer_details fk_customers_detail; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.customer_details
    ADD CONSTRAINT fk_customers_detail FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- TOC entry 3363 (class 2606 OID 49784)
-- Name: orders fk_customers_orders; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_customers_orders FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- TOC entry 3353 (class 2606 OID 16818)
-- Name: employees_address fk_employees_address; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.employees_address
    ADD CONSTRAINT fk_employees_address FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id);


--
-- TOC entry 3364 (class 2606 OID 65896)
-- Name: orders fk_orders_customers; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_customers FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE RESTRICT;


--
-- TOC entry 3367 (class 2606 OID 49759)
-- Name: order_items fk_orders_order_items; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_orders_order_items FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- TOC entry 3365 (class 2606 OID 49779)
-- Name: orders fk_orders_shipping_address; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_shipping_address FOREIGN KEY (shipping_address_id) REFERENCES public.customer_address(address_id);


--
-- TOC entry 3356 (class 2606 OID 33179)
-- Name: product_images fk_products_images; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT fk_products_images FOREIGN KEY (product_sku) REFERENCES public.products(product_sku);


--
-- TOC entry 3354 (class 2606 OID 33196)
-- Name: products fk_products_product_category; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_products_product_category FOREIGN KEY (product_category) REFERENCES public.product_categories(category_id);


--
-- TOC entry 3370 (class 2606 OID 74147)
-- Name: news news_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.employees(employee_id) ON DELETE SET NULL;


--
-- TOC entry 3371 (class 2606 OID 74142)
-- Name: news news_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.news_categories(category_id) ON DELETE RESTRICT;


--
-- TOC entry 3368 (class 2606 OID 49749)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- TOC entry 3369 (class 2606 OID 49754)
-- Name: order_items order_items_product_sku_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_sku_fkey FOREIGN KEY (product_sku) REFERENCES public.products(product_sku) ON DELETE RESTRICT;


--
-- TOC entry 3366 (class 2606 OID 49766)
-- Name: orders orders_shipping_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES public.customer_address(address_id) ON DELETE RESTRICT;


--
-- TOC entry 3357 (class 2606 OID 33161)
-- Name: product_images product_images_product_sku_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_sku_fkey FOREIGN KEY (product_sku) REFERENCES public.products(product_sku) ON DELETE CASCADE;


--
-- TOC entry 3355 (class 2606 OID 33185)
-- Name: products products_product_category_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bafaqih
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_product_category_fkey FOREIGN KEY (product_category) REFERENCES public.product_categories(category_id);


-- Completed on 2025-06-17 20:25:20

--
-- PostgreSQL database dump complete
--


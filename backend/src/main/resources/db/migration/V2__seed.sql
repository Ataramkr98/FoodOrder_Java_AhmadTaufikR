-- ============ SEED DATA (aligned with frontend mock-data) ============

INSERT INTO users (id, email, display_name, password_hash, role) VALUES
('usr-demo-cust', 'demo@bites.co.id', 'Andini Putri', '$2a$10$dummyhashfordev', 'CUSTOMER'),
('usr-owner-budi', 'budi@bites.co.id', 'Pak Budi', '$2a$10$dummyhashfordev', 'RESTAURANT_OWNER'),
('usr-courier-rio', 'rio@bites.co.id', 'Rio Pratama', '$2a$10$dummyhashfordev', 'COURIER'),
('usr-admin', 'admin@bites.co.id', 'Sari Admin', '$2a$10$dummyhashfordev', 'ADMIN');

INSERT INTO addresses (id, user_id, label, detail, notes, lat, lng, is_default) VALUES
('addr-home', 'usr-demo-cust', 'Rumah', 'Jl. Kebon Sirih Raya No. 21, Menteng, Jakarta Pusat', 'Gerbang hijau, lantai 2', -6.2197, 106.8280, true),
('addr-office', 'usr-demo-cust', 'Kantor', 'Wisma 46 Lt. 18, Jl. Jend. Sudirman Kav. 1, Jakarta Pusat', 'Lobby utara', -6.2035, 106.8165, false);

INSERT INTO restaurants (id, owner_id, name, slug, tagline, logo, banner, cuisine, rating_avg, rating_count, distance_km, eta_minutes, delivery_fee, min_order, address_detail, lat, lng, is_open, opening_hours, categories) VALUES
('res-pak-budi', 'usr-owner-budi', 'Ayam Crispy & Geprek Pak Budi — Tebet', 'ayam-geprek-pak-budi', 'Ayam krispy renyah bumbu rempah pilihan khas Nusantara', '/assets/food/Ayam Krispy.webp', '/assets/food/PaMer 7 Ayam Krispy Kari Medan.webp', 'Ayam & Nasi, Fast Food, Indonesian', 4.8, 1420, 1.8, 18, 8000, 15000, 'Jl. Tebet Raya No. 42, Tebet Barat, Jakarta Selatan', -6.2297, 106.8532, true, '08:00 - 22:00 WIB', 'Paket PaNas, PaMer Keluarga, Ayam Satuan & Whole Chicken, Paket HeBat Spaghetti, Minuman & Segar'),
('res-deluxe-burger', 'usr-owner-budi', 'Deluxe Burger & Grill House — Senopati', 'bites-deluxe-burger-grill', '100% Australian Beef Patty dengan Melted Cheddar & Brioche Buns', '/assets/food/Double Big Burger.webp', '/assets/food/Triple Cheeseburger.webp', 'Burger, Western, Snacks', 4.9, 980, 2.7, 24, 10000, 25000, 'Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan', -6.2345, 106.8099, true, '10:00 - 23:00 WIB', 'Deluxe Gourmet Burgers, Double & Triple Stacks, Crispy Chicken Burgers, Minuman & Soda'),
('res-artisan-coffee', 'usr-owner-budi', 'Kenangan Artisan Coffee & Brew — Kuningan', 'kenangan-coffee-artisan-roastery', 'Specialty coffee freshly roasted with premium whole milk & flavors', '/assets/food/Caramel Latte.webp', '/assets/food/Matcha Latte.webp', 'Coffee & Tea, Beverages, Dessert', 4.7, 1850, 1.2, 14, 6000, 18000, 'Menara Kuningan Lt. G, Jl. H.R. Rasuna Said, Jakarta Selatan', -6.2232, 106.8315, true, '07:00 - 21:00 WIB', 'Signature Lattes, Flavored Brews, Tea & Refreshments'),
('res-bites-refreshment', 'usr-owner-budi', 'Bites Cold Refreshment Bar — SCBD', 'bites-refreshment-drink-bar', 'Pilihan teh segar Indonesia & cold carbonated drinks pelepas dahaga', '/assets/food/Tehbotol Sosro.webp', '/assets/food/Fruit Tea Lemon.png', 'Beverages, Cold Drinks, Tea & Coffee', 4.6, 650, 3.1, 15, 8000, 10000, 'Fairgrounds SCBD Lot 14, Jl. Jend. Sudirman, Jakarta Pusat', -6.2268, 106.8078, true, '09:00 - 22:00 WIB', 'Teh Asli Indonesia, Carbonated Drinks & Sodas, Specialty Chillers');

INSERT INTO menu_items (id, restaurant_id, category, name, description, price, original_price, image, available, is_bestseller, is_spicy, sort_order) VALUES
('item-panas-1', 'res-pak-budi', 'Paket PaNas', 'PaNas 1 (1 Ayam + 1 Nasi + 1 Drink)', '1 potong Ayam Krispy renyah gurih disajikan dengan nasi hangat pulen dan segelas Fruit Tea Lemon.', 36000, 42000, '/assets/food/PaNas 1.webp', true, true, false, 1),
('item-panas-1-kari', 'res-pak-budi', 'Paket PaNas', 'PaNas 1 Ayam Krispy Kari Medan', 'Varian spesial dengan kuah kari Medan kental gurih beraroma rempah kapulaga dan daun kari wangi.', 39500, NULL, '/assets/food/PaNas 1 Ayam Krispy Kari Medan.webp', true, true, true, 2),
('item-panas-2-fries', 'res-pak-budi', 'Paket PaNas', 'PaNas 2 with French Fries', '2 potong Ayam Crispy renyah keemasan dipadukan dengan kentang goreng renyah berbumbu gurih.', 49000, NULL, '/assets/food/PaNas 2 with Fries.webp', true, true, false, 3),
('item-panas-2-rice', 'res-pak-budi', 'Paket PaNas', 'PaNas 2 with Steamed Rice', '2 potong Ayam Crispy renyah lezat disajikan dengan seporsi nasi hangat dan minuman segar.', 46500, NULL, '/assets/food/PaNas 2 with Rice.webp', true, false, false, 4),
('item-panas-spesial', 'res-pak-budi', 'Paket PaNas', 'PaNas Spesial (Ayam + Nasi + Telur Omelet)', 'Paket lengkap favorit! 1 potong Ayam Krispy, 1 Scrambled Egg lembut bermentega, nasi putih hangat, dan minuman.', 43000, NULL, '/assets/food/PaNas Spesial.webp', true, true, false, 5),
('item-panas-spesial-kari', 'res-pak-budi', 'Paket PaNas', 'PaNas Spesial Kari Medan', 'Kombinasi Ayam Krispy Kari Medan + Scrambled Egg gurih + Nasi Pulen yang memanjakan lidah.', 46000, NULL, '/assets/food/PaNas Spesial Ayam Krispy Kari Medan.webp', true, false, true, 6),
('item-pamer-5', 'res-pak-budi', 'PaMer Keluarga', 'PaMer 5 (Paket Rame-Rame 5 Ayam)', 'Paket hemat keluarga berisi 5 potong Ayam Krispy renyah (3 potongan besar + 2 potongan kecil).', 92000, 110000, '/assets/food/PaMer 5.webp', true, true, false, 7),
('item-pamer-5-kari', 'res-pak-budi', 'PaMer Keluarga', 'PaMer 5 Ayam Krispy Kari Medan', '5 potong Ayam Krispy lengkap dengan 2 porsi kuah kari kental rempah Medan yang gurih harum.', 104000, NULL, '/assets/food/PaMer 5 Ayam Krispy Kari Medan.webp', true, false, false, 8),
('item-pamer-7', 'res-pak-budi', 'PaMer Keluarga', 'PaMer 7 (Paket Rame-Rame 7 Ayam)', 'Pesta ayam untuk 4-6 orang! 7 potong ayam krispy renyah juicy pilihan cocok untuk makan bersama.', 125000, 154000, '/assets/food/PaMer 7.webp', true, false, false, 9),
('item-pamer-7-kari', 'res-pak-budi', 'PaMer Keluarga', 'PaMer 7 Kari Medan Super Komplit', '7 potong ayam krispy berpadu dengan 3 wadah kuah kari Medan legendaris.', 139000, NULL, '/assets/food/PaMer 7 Ayam Krispy Kari Medan.webp', true, false, false, 10),
('item-whole-chicken', 'res-pak-budi', 'Ayam Satuan & Whole Chicken', 'Ayam Krispy Whole Chicken (1 Ekor Utuh)', '1 ekor ayam utuh dipotong 8 bagian dan digoreng dengan tepung bumbu rahasia super crispy.', 135000, NULL, '/assets/food/Ayam Krispy Whole Chicken.webp', true, false, false, 11),
('item-paket-whole-chicken', 'res-pak-budi', 'Ayam Satuan & Whole Chicken', 'Paket Ayam Krispy Whole Chicken + 4 Nasi + 4 Teh', 'Satu ekor ayam utuh krispy lengkap dengan 4 nasi putih dan 4 Tehbotol Sosro Kotak.', 165000, 195000, '/assets/food/Paket Ayam Krispy Whole Chicken.webp', true, true, false, 12),
('item-ayam-satuan-krispy', 'res-pak-budi', 'Ayam Satuan & Whole Chicken', 'Ayam Krispy (Satuan)', '1 potong ayam bagian paha atas / dada / paha bawah renyah gurih.', 21000, NULL, '/assets/food/Ayam Krispy.webp', true, false, false, 13),
('item-ayam-satuan-spicy', 'res-pak-budi', 'Ayam Satuan & Whole Chicken', 'Ayam Spicy Hot (Satuan)', '1 potong ayam berbalur bumbu pedas meresap hingga ke serat daging terdalam.', 21000, NULL, '/assets/food/Ayam Spicy.webp', true, false, true, 14),
('item-hebat-spaghetti-krispy', 'res-pak-budi', 'Paket HeBat Spaghetti', 'Paket HeBat Spaghetti Ayam (Krispy)', 'Spaghetti bolognese dengan saus tomat daging cincang gurih plus 1 potong Ayam Krispy dan minuman.', 34000, NULL, '/assets/food/Paket HeBat Spaghetti Ayam (Krispy).png', true, false, false, 15),
('item-hebat-spaghetti-spicy', 'res-pak-budi', 'Paket HeBat Spaghetti', 'Paket HeBat Spaghetti Ayam (Spicy)', 'Spaghetti bolognese kaya bumbu dipadu dengan 1 potong Ayam Spicy pedas mantap.', 34000, NULL, '/assets/food/Paket HeBat Spaghetti Ayam (Spicy).png', true, false, true, 16);


INSERT INTO menu_items (id, restaurant_id, category, name, description, price, original_price, image, available, is_bestseller, is_spicy, sort_order) VALUES
('item-triple-cheeseburger', 'res-deluxe-burger', 'Double & Triple Stacks', 'Triple Cheeseburger Monster Stack', 'Tiga lapis beef patty juicy dengan triple cheese, selada iceberg renyah, bawang bombay karamel, dan burger bun wijen.', 79000, 88000, '/assets/food/Triple Cheeseburger.webp', true, true, false, 1),
('item-double-big-burger', 'res-deluxe-burger', 'Double & Triple Stacks', 'Double Big Burger Supreme', '2 lapis beef patty juicy dengan double cheese, selada iceberg renyah, bawang bombay karamel, dan burger bun wijen.', 56000, NULL, '/assets/food/Double Big Burger.webp', true, true, false, 2),
('item-beef-burger-deluxe', 'res-deluxe-burger', 'Deluxe Gourmet Burgers', 'Beef Burger Deluxe', 'Patty daging sapi panggang dengan irisan tomat segar, selada hijau, dan saus BBQ racikan chef.', 42000, NULL, '/assets/food/Beef Burger Deluxe.webp', true, false, false, 3),
('item-cheeseburger-deluxe', 'res-deluxe-burger', 'Deluxe Gourmet Burgers', 'Cheeseburger Deluxe', 'Daging sapi berpadu lelehan keju cheddar berkualitas tinggi di dalam roti empuk berlapis mentega.', 45000, NULL, '/assets/food/Cheeseburger Deluxe.webp', true, false, false, 4),
('item-cheeseburger-classic', 'res-deluxe-burger', 'Deluxe Gourmet Burgers', 'Classic Cheeseburger', 'Roti burger panggang dengan beef patty, 1 slice keju leleh, saus tomat dan mustard.', 36000, NULL, '/assets/food/Cheeseburger.webp', true, false, false, 5),
('item-mcspicy', 'res-deluxe-burger', 'Crispy Chicken Burgers', 'McSpicy Crunchy Chicken Burger', 'Fillet paha ayam goreng tepung ekstra pedas dan super krispy dengan selada segar dan saus mayo gurih.', 48000, NULL, '/assets/food/McSpicy.webp', true, true, true, 6),
('item-chicken-burger-deluxe', 'res-deluxe-burger', 'Crispy Chicken Burgers', 'Chicken Burger Deluxe', 'Patty ayam krispy keemasan dengan keju cheddar, daun selada, dan saus tartar lembut.', 43000, NULL, '/assets/food/Chicken Burger Deluxe.webp', true, false, false, 7),
('item-chicken-burger', 'res-deluxe-burger', 'Crispy Chicken Burgers', 'Classic Chicken Burger', 'Burger ayam renyah dengan mayones lezat dan roti bun bertekstur lembut.', 32000, NULL, '/assets/food/Chicken Burger.webp', true, false, false, 8),
('item-matcha-latte', 'res-artisan-coffee', 'Signature Lattes', 'Uji Kyoto Matcha Latte', 'Bubuk matcha murni dari Uji, Kyoto yang diseduh dengan susu segar lembut dan foam creamy.', 32000, 38000, '/assets/food/Matcha Latte.webp', true, true, false, 1),
('item-caramel-latte', 'res-artisan-coffee', 'Signature Lattes', 'Salted Caramel Macchiato Latte', 'Espresso bold arabika berpadu dengan sirup salted caramel harum dan susu gurih.', 34000, NULL, '/assets/food/Caramel Latte.webp', true, true, false, 2),
('item-caffe-latte', 'res-artisan-coffee', 'Signature Lattes', 'Classic Caffe Latte (Double Shot)', 'Double shot espresso racikan arabika Gayo & Mandheling dengan velvety steamed milk.', 29000, NULL, '/assets/food/Caffe Latte.webp', true, false, false, 3),
('item-hazelnut-latte', 'res-artisan-coffee', 'Flavored Brews', 'Roasted Hazelnut Latte', 'Kopi latte dengan cita rasa hazelnut panggang aromatik dan manis pas.', 33000, NULL, '/assets/food/Hazelnut Latte.webp', true, false, false, 4),
('item-vanilla-latte', 'res-artisan-coffee', 'Flavored Brews', 'French Vanilla Cream Latte', 'Kopi susu dengan ekstrak vanila Madagaskar yang lembut dan memikat.', 33000, NULL, '/assets/food/Vanilla Latte.webp', true, false, false, 5),
('item-tehbotol-sosro', 'res-bites-refreshment', 'Teh Asli Indonesia', 'Tehbotol Sosro Botol Kaca Dingin', 'Teh melati asli Indonesia yang disajikan dingin segar melepas dahaga seketika.', 10000, NULL, '/assets/food/Tehbotol Sosro.webp', true, true, false, 1),
('item-tehbotol-kotak', 'res-bites-refreshment', 'Teh Asli Indonesia', 'Tehbotol Sosro Kotak 250ml', 'Kemasan kotak praktis teh melati wangi dan manis menyegarkan.', 8000, NULL, '/assets/food/Tehbotol Sosro Kotak.webp', true, false, false, 2),
('item-tehbotol-tawar', 'res-bites-refreshment', 'Teh Asli Indonesia', 'Tehbotol Sosro Tawar (Zero Calorie)', 'Teh melati murni tanpa gula, sehat, segar, 0 kalori.', 9000, NULL, '/assets/food/Tehbotol Sosro Tawar.webp', true, false, false, 3),
('item-coca-cola', 'res-bites-refreshment', 'Carbonated Drinks & Sodas', 'Coca-Cola Kaleng 330ml Dingin', 'Kenikmatan soda kola klasik dingin menyegarkan di setiap tegukan.', 12000, NULL, '/assets/food/Coca-Cola.png', true, false, false, 4),
('item-coca-cola-zero', 'res-bites-refreshment', 'Carbonated Drinks & Sodas', 'Coca-Cola Zero Sugar 330ml', 'Rasa Coca-Cola otentik tanpa gula dan tanpa kalori.', 13000, NULL, '/assets/food/Coca-Cola Zero Sugar.webp', true, false, false, 5),
('item-fanta', 'res-bites-refreshment', 'Carbonated Drinks & Sodas', 'Fanta Strawberry Can 330ml', 'Minuman berkarbonasi rasa stroberi manis bergelembung ceria.', 12000, NULL, '/assets/food/Fanta.png', true, false, false, 6),
('item-sprite', 'res-bites-refreshment', 'Carbonated Drinks & Sodas', 'Sprite Lemon-Lime Can 330ml', 'Soda lemon-lime kristal jernih yang menyegarkan.', 12000, NULL, '/assets/food/Sprite.png', true, false, false, 7),
('item-fruit-tea-lemon', 'res-bites-refreshment', 'Specialty Chillers', 'Fruit Tea Lemon Refreshing Bottle', 'Teh buah lemon manis asam segar dalam botol dingin.', 9500, NULL, '/assets/food/Fruit Tea Lemon.png', true, true, false, 8),
('item-iced-milo', 'res-bites-refreshment', 'Specialty Chillers', 'Iced Milo Dinosaur Choco', 'Milo dingin pekat dengan taburan bubuk cokelat melimpah di atasnya.', 16000, NULL, '/assets/food/Iced Milo.png', true, false, false, 9),
('item-mineral-water', 'res-bites-refreshment', 'Specialty Chillers', 'Mineral Water Prim-a 600ml', 'Air mineral pegunungan murni dalam kemasan botol 600ml.', 6000, NULL, '/assets/food/Mineral Water Prim-a.png', true, false, false, 10);

-- Modifier groups + options (matching frontend ids)
INSERT INTO modifier_groups (id, menu_item_id, name, required, min_selection, max_selection, sort_order) VALUES
('mod-panas1-ayam', 'item-panas-1', 'Pilihan Varian Ayam', true, 1, 1, 1),
('mod-panas1-pedas', 'item-panas-1', 'Tingkat Kepedasan Sambal', true, 1, 1, 2),
('mod-panas1-extra', 'item-panas-1', 'Tambah Extra Topping', false, 0, 3, 3),
('mod-kari-karbo', 'item-panas-1-kari', 'Pilihan Karbohidrat', true, 1, 1, 1),
('mod-kari-ekstra', 'item-panas-1-kari', 'Ekstra Saus Kari', false, 0, 2, 2),
('mod-tcb-side', 'item-triple-cheeseburger', 'Pilihan Pendamping', true, 1, 1, 1),
('mod-tcb-drink', 'item-triple-cheeseburger', 'Pilihan Minuman', true, 1, 1, 2),
('mod-matcha-temp', 'item-matcha-latte', 'Suhu Penyajian', true, 1, 1, 1),
('mod-matcha-sugar', 'item-matcha-latte', 'Tingkat Kemanisan (Sugar Level)', true, 1, 1, 2),
('mod-matcha-milk', 'item-matcha-latte', 'Pilihan Susu', false, 0, 1, 3);

INSERT INTO modifiers (id, group_id, name, price, is_default, available, sort_order) VALUES
('opt-krispy', 'mod-panas1-ayam', 'Ayam Krispy Original', 0, true, true, 1),
('opt-spicy', 'mod-panas1-ayam', 'Ayam Spicy Pedas Gurih', 0, false, true, 2),
('opt-lvl-0', 'mod-panas1-pedas', 'Level 0 (Tanpa Sambal)', 0, false, true, 1),
('opt-lvl-1', 'mod-panas1-pedas', 'Level 1 (Sedang)', 0, false, true, 2),
('opt-lvl-3', 'mod-panas1-pedas', 'Level 3 (Pedas Nendang)', 0, true, true, 3),
('opt-lvl-5', 'mod-panas1-pedas', 'Level 5 (Gila Pedas)', 2000, false, true, 4),
('opt-extra-sambal', 'mod-panas1-extra', 'Extra Sambal Bawang Korek', 4000, false, true, 1),
('opt-extra-keju', 'mod-panas1-extra', 'Melted Cheddar Sauce', 6000, false, true, 2),
('opt-kerupuk', 'mod-panas1-extra', 'Kerupuk Bawang Renyah', 3000, false, true, 3),
('opt-rice', 'mod-kari-karbo', 'Nasi Hangat Pulen', 0, true, true, 1),
('opt-fries', 'mod-kari-karbo', 'French Fries Kentang Goreng', 5000, false, true, 2),
('opt-kari-bowl', 'mod-kari-ekstra', 'Tambah 1 Mangkuk Kuah Kari', 6000, false, true, 1),
('opt-reg-fries', 'mod-tcb-side', 'Regular Crispy French Fries', 0, true, true, 1),
('opt-waffle-fries', 'mod-tcb-side', 'Waffle Fries with Truffle Mayo', 12000, false, true, 2),
('opt-coke', 'mod-tcb-drink', 'Coca-Cola Dingin', 0, true, true, 1),
('opt-coke-zero', 'mod-tcb-drink', 'Coca-Cola Zero Sugar', 0, false, true, 2),
('opt-sprite', 'mod-tcb-drink', 'Sprite Lemon-Lime', 0, false, true, 3),
('opt-cold', 'mod-matcha-temp', 'Dingin / Iced (with crystal ice)', 0, true, true, 1),
('opt-hot', 'mod-matcha-temp', 'Panas / Hot', 0, false, true, 2),
('opt-sugar-100', 'mod-matcha-sugar', 'Normal (100%)', 0, true, true, 1),
('opt-sugar-50', 'mod-matcha-sugar', 'Less Sugar (50%)', 0, false, true, 2),
('opt-sugar-0', 'mod-matcha-sugar', 'No Sugar (0%)', 0, false, true, 3),
('opt-oatmilk', 'mod-matcha-milk', 'Ganti Oat Milk (Oatside)', 6000, false, true, 1);

INSERT INTO couriers (id, user_id, name, phone, masked_phone, vehicle, plate_number, photo, rating_avg, trips_completed, status, current_lat, current_lng, heading) VALUES
('courier-rio', 'usr-courier-rio', 'Rio Pratama', '+6281299881122', '+62 812-XXXX-1122', 'Motor Honda Vario', 'B 6521 KYZ', '/assets/courier/rio.png', 4.9, 1240, 'AVAILABLE', -6.2250, 106.8400, 45);

INSERT INTO promo_codes (code, title, description, discount_type, discount_value, min_spend, max_discount, valid_until, is_active) VALUES
('BITESHEMAT', 'Diskon 20% Seluruh Menu', 'Potongan 20% s/d Rp 25.000 untuk transaksi pertama di Bites', 'percentage', 20, 40000, 25000, '2027-12-31', true),
('FREESHIP', 'Gratis Ongkir Sepuasnya', 'Gratis ongkir potongan s/d Rp 10.000 untuk pengiriman instan', 'free_delivery', 10000, 30000, NULL, '2027-12-31', true),
('DISKON50', 'Pesta Diskon Rp 50.000', 'Potongan langsung Rp 50.000 untuk pesanan keluarga minimal Rp 120.000', 'flat', 50000, 120000, NULL, '2027-12-31', true),
('MAKANENAK', 'Potongan Rp 15.000', 'Voucher makan siang hemat potongan Rp 15.000', 'flat', 15000, 50000, NULL, '2027-12-31', true);
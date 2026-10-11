// Seed/fallback catalog used when Supabase isn't configured yet,
// so the app renders fully out of the box. Admin edits go to Supabase
// once .env is set. Images are curated Unsplash sports photos —
// replace them with your own product shots in the admin portal.
import { Banner, Category, DeliveryZone, PaymentMethod, Product, SiteSettings } from './types';

const u = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
const img = (id: string) => u(id, 900, 1100);
const hero = (id: string) => u(id, 1600, 900);

export const SEED_CATEGORIES: Category[] = [
  { id: 'c6', slug: 'warriors', name: 'Warriors Fan Jerseys', tagline: 'Zimbabwe national team fan editions — our own designs', image_url: '/products/zw-home.png', sort_order: 0, is_active: true },
  { id: 'c1', slug: 'jerseys', name: 'Shirts / Jerseys', tagline: 'Club & country shirts, all seasons', image_url: img('1523381210434-271e8be1f52b'), sort_order: 1, is_active: true },
  { id: 'c2', slug: 'boots', name: 'Soccer Boots', tagline: 'Cleats for firm ground, turf & indoor', image_url: img('1542291026-7eec264c27ff'), sort_order: 2, is_active: true },
  { id: 'c3', slug: 'tracksuits', name: 'Tracksuits & Training', tagline: 'Training kits, tracksuits, gym wear', image_url: img('1556821840-3a63f95609a7'), sort_order: 3, is_active: true },
  { id: 'c4', slug: 'essentials', name: 'Socks, Boxers & Balls', tagline: 'Match socks, base layers, footballs', image_url: img('1579952363873-27f3bade9f55'), sort_order: 4, is_active: true },
  { id: 'c5', slug: 'custom-kits', name: 'Kits: Design, Supply & Manufacturing', tagline: 'Full team kits — designed & made for you', image_url: img('1522778119026-d647f0596c20'), sort_order: 5, is_active: true },
];

const sizes = ['S', 'M', 'L', 'XL', '2XL'];
const bootSizes = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];

const ZW_DESC =
  'WearSportek-designed fan edition of the Zimbabwe national team jersey — official-style crest & flag, premium breathable fabric. $20 plain · add your name & number printed on the back for $30 total.';

// Zimbabwe national team fan jerseys — WearSportek designs, extracted from the
// collection posters. $20 plain / $30 with name+number (flat custom_fee = 10).
const zw = (id: string, name: string, slug: string, badge?: string): Product => ({
  id, category_slug: 'warriors', name, description: ZW_DESC,
  price: 20, custom_fee: 10,
  images: [`/products/zw-${slug}.png`, `/products/zw-${slug}-back.png`],
  sizes, stock: 60, is_featured: true, is_customizable: true, is_active: true, badge,
});

export const SEED_PRODUCTS: Product[] = [
  // Warriors fan jerseys — own designs
  zw('p25', 'Warriors Home — Yellow', 'home', 'NEW'),
  zw('p26', 'Warriors Away — Green', 'away', 'NEW'),
  zw('p27', 'Warriors Alternate — Flag Blend', 'alt', 'NEW'),
  zw('p28', "Fan's Choice — Blue", 'blue'),
  zw('p29', "Fan's Choice — White", 'white'),
  zw('p30', "Fan's Choice — African Art", 'art', 'FAN PICK'),
  zw('p31', "Fan's Choice — Full Black", 'black'),
  zw('p32', "Fan's Choice — Red", 'red'),
  zw('p33', "Fan's Choice — Pink (Ladies)", 'pink', 'LADIES'),
  // Jerseys — section 1
  { id: 'p1', category_slug: 'jerseys', name: 'Real Madrid Home 25/26', price: 35, compare_at_price: 45, images: [img('1522778119026-d647f0596c20'), img('1523381210434-271e8be1f52b')], sizes, stock: 24, is_featured: true, is_customizable: true, is_active: true, badge: 'HOT' },
  { id: 'p2', category_slug: 'jerseys', name: 'Arsenal Home 25/26', price: 35, images: [img('1517466787929-bc90951d0974')], sizes, stock: 18, is_featured: true, is_customizable: true, is_active: true, badge: 'NEW' },
  { id: 'p3', category_slug: 'jerseys', name: 'Man City Third 25/26', price: 33, images: [img('1560272564-c83b66b1ad12')], sizes, stock: 31, is_featured: false, is_customizable: true, is_active: true },
  { id: 'p4', category_slug: 'jerseys', name: 'Barcelona Away 25/26', price: 34, images: [img('1523381210434-271e8be1f52b')], sizes, stock: 12, is_featured: true, is_customizable: true, is_active: true },
  { id: 'p5', category_slug: 'jerseys', name: 'Liverpool Home 25/26', price: 35, images: [img('1556905055-8f358a7a47b4')], sizes, stock: 20, is_featured: false, is_customizable: true, is_active: true },
  { id: 'p6', category_slug: 'jerseys', name: 'Man Utd Home 25/26', price: 35, images: [img('1521572163474-6864f9cf17ab')], sizes, stock: 26, is_featured: false, is_customizable: true, is_active: true },
  { id: 'p7', category_slug: 'jerseys', name: 'Chelsea Home 25/26', price: 34, images: [img('1620799140408-edc6dcb6d633')], sizes, stock: 15, is_featured: false, is_customizable: true, is_active: true },
  { id: 'p8', category_slug: 'jerseys', name: 'Zimbabwe Warriors Home', price: 30, images: [img('1431324155629-1a6deb1dec8d')], sizes, stock: 40, is_featured: true, is_customizable: true, is_active: true, badge: 'LOCAL' },
  // Boots — flagship section 2
  { id: 'p9', category_slug: 'boots', name: 'Predator Elite FG', price: 85, compare_at_price: 110, images: [img('1542291026-7eec264c27ff')], sizes: bootSizes, stock: 14, is_featured: true, is_customizable: false, is_active: true, badge: 'PRO' },
  { id: 'p10', category_slug: 'boots', name: 'Mercurial Vapor 16 FG', price: 90, images: [img('1543326727-cf6c39e8f84c')], sizes: bootSizes, stock: 9, is_featured: true, is_customizable: false, is_active: true },
  { id: 'p11', category_slug: 'boots', name: 'Phantom GX II Academy TF', price: 55, images: [img('1511886929837-354d827aae26')], sizes: bootSizes, stock: 22, is_featured: false, is_customizable: false, is_active: true },
  { id: 'p12', category_slug: 'boots', name: 'Copa Pure 2 League FG', price: 60, images: [img('1556906781-9a412961c28c')], sizes: bootSizes, stock: 17, is_featured: false, is_customizable: false, is_active: true },
  // Tracksuits & training — section 3
  { id: 'p13', category_slug: 'tracksuits', name: 'Tiro 25 Full Tracksuit', price: 48, images: [img('1534438327276-14e5300c3a48')], sizes, stock: 20, is_featured: true, is_customizable: true, is_active: true },
  { id: 'p14', category_slug: 'tracksuits', name: 'Academy Dri-FIT Training Kit', price: 38, images: [img('1517836357463-d25dfeac3438')], sizes, stock: 28, is_featured: false, is_customizable: true, is_active: true },
  { id: 'p15', category_slug: 'tracksuits', name: 'Tech Fleece Zip Hoodie', price: 42, images: [img('1556821840-3a63f95609a7')], sizes, stock: 16, is_featured: false, is_customizable: false, is_active: true },
  { id: 'p16', category_slug: 'tracksuits', name: 'Pro Slim Joggers', price: 25, images: [img('1476480862126-209bfaa8edc8')], sizes, stock: 33, is_featured: false, is_customizable: false, is_active: true },
  // Essentials — section 4
  { id: 'p17', category_slug: 'essentials', name: 'Grip Match Socks (3-pack)', price: 12, images: [img('1552674605-db6ffd4facb5')], sizes: ['One Size'], stock: 60, is_featured: false, is_customizable: false, is_active: true },
  { id: 'p18', category_slug: 'essentials', name: 'Performance Boxers (2-pack)', price: 10, images: [img('1574680178050-55c6a6a96e0a')], sizes, stock: 45, is_featured: false, is_customizable: false, is_active: true },
  { id: 'p19', category_slug: 'essentials', name: 'FIFA Quality Pro Match Ball', price: 40, images: [img('1579952363873-27f3bade9f55')], sizes: ['Size 5'], stock: 25, is_featured: true, is_customizable: false, is_active: true },
  { id: 'p20', category_slug: 'essentials', name: 'Training Ball + Pump Combo', price: 22, images: [img('1518604666860-9ed391f76460')], sizes: ['Size 5'], stock: 38, is_featured: false, is_customizable: false, is_active: true },
  // Custom kits — section 5
  { id: 'p21', category_slug: 'custom-kits', name: 'Team Kit Package (15 players)', price: 380, images: [img('1522778119026-d647f0596c20')], sizes: ['Custom'], stock: 999, is_featured: true, is_customizable: true, is_active: true, badge: 'BULK' },
  { id: 'p22', category_slug: 'custom-kits', name: 'Custom Kit Design Service', price: 50, images: [img('1561070791-2526d30994b5')], sizes: ['Service'], stock: 999, is_featured: false, is_customizable: true, is_active: true },
  { id: 'p23', category_slug: 'custom-kits', name: 'Kit Manufacturing (per unit, 20+)', price: 18, images: [img('1591047139829-d91aecb6caea')], sizes: ['Custom'], stock: 999, is_featured: false, is_customizable: true, is_active: true },
  { id: 'p24', category_slug: 'custom-kits', name: 'Training Bibs Set (x10)', price: 30, images: [img('1574629810360-7efbbe195018')], sizes: ['One Size'], stock: 50, is_featured: false, is_customizable: true, is_active: true },
];

// Hero slides, themed to match each banner copy
const HERO_IMGS = [
  '1522778119026-d647f0596c20', // players on the pitch
  '1543326727-cf6c39e8f84c',  // football boots
  '1431324155629-1a6deb1dec8d', // stadium crowd
  '1523381210434-271e8be1f52b', // shirts on a rail
  '1556821840-3a63f95609a7',  // hoodie
  '1579952363873-27f3bade9f55', // match ball
  '1521572163474-6864f9cf17ab', // shirt flat-lay
  '1517466787929-bc90951d0974', // match action
  '1526232761682-d26e03ac148e', // stadium night
  '1459865264687-595d652de67e', // pitch & goal
];

export const SEED_BANNERS: Banner[] = Array.from({ length: 10 }, (_, i) => ({
  id: `b${i + 1}`,
  title: [
    'New Season. New Shirt.',
    'Boots Built For Speed',
    'Zimbabwe Warriors Collection',
    'Custom Kits For Your Club',
    'Tracksuit Season Is Here',
    'Matchday Essentials',
    'Warriors Fan Editions',
    'Bulk Orders. Club Prices.',
    'Retro Classics Restocked',
    'Wear It Like A Pro',
  ][i],
  subtitle: [
    'All 25/26 club jerseys in stock — customise yours.',
    'FG, turf & indoor cleats from $55.',
    'Rep the Warriors. Official-style home & away.',
    'Design, supply & manufacturing under one roof.',
    'Premium tracksuits from $48.',
    'Socks, balls & base layers — sorted.',
    'Zimbabwe national team fan jerseys — $20, add your name for $30.',
    '15+ kits at wholesale rates.',
    'Iconic shirts from past seasons.',
    'Gear trusted on the pitch.',
  ][i],
  cta_label: 'Shop now',
  cta_link: [
    '/shop', '/shop', '/category/warriors', '/category/custom-kits', '/shop',
    '/shop', '/category/warriors', '/shop', '/shop', '/shop',
  ][i],
  image_url: hero(HERO_IMGS[i]),
  sort_order: i + 1,
  is_active: true,
}));

export const SEED_ZONES: DeliveryZone[] = [
  { id: 'z1', name: 'Harare CBD & Avenues', fee: 3, eta: 'Same day', is_active: true },
  { id: 'z2', name: 'Harare Suburbs', fee: 5, eta: 'Same / next day', is_active: true },
  { id: 'z3', name: 'Bulawayo', fee: 8, eta: '1–2 days', is_active: true },
  { id: 'z4', name: 'Mutare / Gweru / Masvingo', fee: 10, eta: '1–3 days', is_active: true },
  { id: 'z5', name: 'Other towns & rural', fee: 12, eta: '2–4 days', is_active: true },
  { id: 'z6', name: 'Store pickup — Harare', fee: 0, eta: 'Ready in 2 hrs', is_active: true },
];

export const SEED_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'ecocash', label: 'EcoCash', hint: 'Pay from your EcoCash wallet', is_active: true, sort_order: 1 },
  { id: 'innbucks', label: 'InnBucks', hint: 'Pay with InnBucks wallet', is_active: true, sort_order: 2 },
  { id: 'omari', label: 'Omari', hint: 'Pay with O\'mari wallet', is_active: true, sort_order: 3 },
  { id: 'onemoney', label: 'OneMoney', hint: 'NetOne mobile money', is_active: true, sort_order: 4 },
  { id: 'transfer', label: 'Cash / Electronic Transfer', hint: 'Bank transfer, ZiG or USD transfer', is_active: true, sort_order: 5 },
  { id: 'visa_mc', label: 'Visa / Mastercard', hint: 'Debit or credit card', is_active: true, sort_order: 6 },
];

export const SEED_SETTINGS: SiteSettings = {
  site_name: 'WearSportek',
  tagline: 'Zimbabwe’s home of football gear',
  contact_phone: '+263 77 000 0000',
  contact_whatsapp: '+263 77 000 0000',
  contact_email: 'hello@wearsportek.co.zw',
  address: 'Shop 12, First Street Mall, Harare',
  about_title: 'Built for the beautiful game',
  about_body:
    'WearSportek is Zimbabwe’s specialist football store — authentic jerseys, pro-grade boots, full team kits and in-house customisation. From grassroots clubs to Sunday-league legends, we kit you out properly.',
  footer_text: '© 2026 WearSportek. All rights reserved.',
  socials: [
    { label: 'Instagram', url: 'https://instagram.com/wearsportek' },
    { label: 'Facebook', url: 'https://facebook.com/wearsportek' },
    { label: 'TikTok', url: 'https://tiktok.com/@wearsportek' },
    { label: 'WhatsApp', url: 'https://wa.me/263770000000' },
  ],
  customisation_fee: 5,
  customisation_name_fee: 3,
  customisation_number_fee: 3,
  announcement: 'Warriors fan jerseys just dropped — $20, add your name & number for $30',
  currency: 'USD',
};

export const formatUSD = (n: number) => `$${n.toFixed(2)}`;

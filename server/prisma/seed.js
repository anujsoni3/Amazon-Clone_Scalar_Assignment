const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (order matters due to FK constraints)
  await prisma.wishlist.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ── Default User (id=1) ─────────────────────────────────────────────
  const user = await prisma.user.create({
    data: {
      id: 1,
      name: 'Anuj',
      email: 'anuj@amazon.com',
    },
  });
  console.log(`✅ Default user created: ${user.email}`);

  // ── Categories ───────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Electronics', slug: 'electronics' } }),
    prisma.category.create({ data: { name: 'Books', slug: 'books' } }),
    prisma.category.create({ data: { name: 'Clothing', slug: 'clothing' } }),
    prisma.category.create({ data: { name: 'Home & Kitchen', slug: 'home-kitchen' } }),
    prisma.category.create({ data: { name: 'Sports & Outdoors', slug: 'sports-outdoors' } }),
    prisma.category.create({ data: { name: 'Beauty', slug: 'beauty' } }),
  ]);
  const [electronics, books, clothing, homeKitchen, sports, beauty] = categories;
  console.log(`✅ ${categories.length} categories created`);

  // ── Helper to create product with images ──────────────────────────────
  const createProduct = async ({ name, description, price, stockQty, rating, reviewCount, categoryId, images }) => {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stockQty,
        rating,
        reviewCount,
        categoryId,
        images: {
          create: images.map((imageUrl, idx) => ({
            imageUrl,
            isPrimary: idx === 0,
          })),
        },
      },
    });
    return product;
  };

  // ── Electronics (7 products) ─────────────────────────────────────────
  const electronicsProducts = [
    {
      name: 'Apple iPhone 15 (128GB) - Black',
      description: 'The iPhone 15 features a 6.1-inch Super Retina XDR display, A16 Bionic chip, 48MP main camera with 2x optical zoom, USB-C connector, and all-day battery life. Available in five stunning colors.',
      price: 79999,
      stockQty: 150,
      rating: 4.5,
      reviewCount: 28430,
      categoryId: electronics.id,
      images: [
        'https://images.unsplash.com/photo-1677049650462-24218d673ac3?w=500&q=80',
        'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=500&q=80',
        'https://images.unsplash.com/photo-1695048133142-1a20484bce71?w=500&q=80',
      ],
    },
    {
      name: 'Samsung 43-inch 4K Smart TV Crystal UHD',
      description: 'Experience stunning 4K UHD resolution with over 8 million pixels. Crystal Processor 4K delivers beautifully detailed pictures. With Smart TV capabilities, access all your favorite streaming apps.',
      price: 34999,
      stockQty: 40,
      rating: 4.3,
      reviewCount: 12563,
      categoryId: electronics.id,
      images: [
        'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=500&q=80',
        'https://images.unsplash.com/photo-1601944177325-f8867652837f?w=500&q=80',
        'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=500&q=80',
      ],
    },
    {
      name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
      description: 'Industry-leading noise canceling with two chips and eight microphones. Crystal clear hands-free calling with precise voice pickup. Up to 30-hour battery life with quick charge (3 min = 3 hrs).',
      price: 24990,
      stockQty: 80,
      rating: 4.7,
      reviewCount: 45210,
      categoryId: electronics.id,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&q=80',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80',
      ],
    },
    {
      name: 'Apple MacBook Air 13-inch M2 Chip',
      description: 'MacBook Air with M2 chip: 13.6-inch Liquid Retina display, 8GB Memory, 256GB SSD Storage. Up to 18 hours battery life. Thin, light, and powerful laptop for everyday use.',
      price: 114900,
      stockQty: 30,
      rating: 4.8,
      reviewCount: 19876,
      categoryId: electronics.id,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80',
        'https://images.unsplash.com/photo-1611186871525-5f41d9c8fbad?w=500&q=80',
        'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=500&q=80',
      ],
    },
    {
      name: 'JBL Flip 6 Portable Bluetooth Speaker',
      description: 'JBL Pro Sound. The JBL Flip 6 delivers surprisingly powerful sound with clear highs and deep bass. IP67 waterproof + dustproof. 12 hours of playtime. PartyBoost to pair multiple JBL speakers.',
      price: 8999,
      stockQty: 200,
      rating: 4.4,
      reviewCount: 32100,
      categoryId: electronics.id,
      images: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80',
        'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=500&q=80',
        'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=500&q=80',
      ],
    },
    {
      name: 'Kindle Paperwhite (16 GB) – Glare-Free Display',
      description: 'The thinnest, lightest Kindle Paperwhite yet. 6.8-inch 300 ppi glare-free display, adjustable warm light, 16 GB storage, up to 10 weeks battery. Waterproof so you can read in the bath or by the pool.',
      price: 12999,
      stockQty: 120,
      rating: 4.6,
      reviewCount: 67890,
      categoryId: electronics.id,
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80',
        'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=500&q=80',
        'https://images.unsplash.com/photo-1553818887-643ae39a5568?w=500&q=80',
      ],
    },
    {
      name: 'Apple iPad (10th Gen) Wi-Fi 64GB - Blue',
      description: 'All-new iPad with A14 Bionic chip delivers incredible performance. All-day battery. 10.9-inch Liquid Retina display with True Tone. 12MP Ultra Wide front camera with Center Stage for video calls.',
      price: 44900,
      stockQty: 60,
      rating: 4.5,
      reviewCount: 14320,
      categoryId: electronics.id,
      images: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80',
        'https://images.unsplash.com/photo-1675453009346-10b8d3348f63?w=500&q=80',
        'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=500&q=80',
      ],
    },
  ];

  // ── Books (5 products) ───────────────────────────────────────────────
  const booksProducts = [
    {
      name: 'Atomic Habits by James Clear',
      description: 'No matter your goals, Atomic Habits offers a proven framework for improving every day. Learn how tiny changes in behavior can deliver remarkable results. The #1 New York Times bestseller.',
      price: 499,
      stockQty: 500,
      rating: 4.9,
      reviewCount: 112500,
      categoryId: books.id,
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80',
      ],
    },
    {
      name: 'Rich Dad Poor Dad by Robert T. Kiyosaki',
      description: 'Rich Dad Poor Dad is Robert Kiyosaki\'s best-selling personal finance book that challenges the myth that you need to earn a high income to be rich. Get out of the rat race and invest for your future.',
      price: 399,
      stockQty: 800,
      rating: 4.6,
      reviewCount: 89430,
      categoryId: books.id,
      images: [
        'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=500&q=80',
        'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&q=80',
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&q=80',
      ],
    },
    {
      name: 'The Alchemist by Paulo Coelho',
      description: 'A special 25th anniversary edition of the beloved novel about following your dreams. Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.',
      price: 299,
      stockQty: 600,
      rating: 4.7,
      reviewCount: 156700,
      categoryId: books.id,
      images: [
        'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=500&q=80',
        'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&q=80',
        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&q=80',
      ],
    },
    {
      name: 'Deep Work by Cal Newport',
      description: 'Deep work is the ability to focus without distraction on a cognitively demanding task. Cal Newport argues that this skill is increasingly rare yet increasingly valuable in our economy.',
      price: 449,
      stockQty: 350,
      rating: 4.5,
      reviewCount: 45230,
      categoryId: books.id,
      images: [
        'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80',
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&q=80',
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&q=80',
      ],
    },
    {
      name: 'Clean Code by Robert C. Martin',
      description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. This book is packed full of real-world scenarios, code examples, and advice for every programmer.',
      price: 699,
      stockQty: 200,
      rating: 4.8,
      reviewCount: 34120,
      categoryId: books.id,
      images: [
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80',
        'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500&q=80',
        'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=500&q=80',
      ],
    },
  ];

  // ── Clothing (5 products) ────────────────────────────────────────────
  const clothingProducts = [
    {
      name: 'Nike Dri-FIT Men\'s Training T-Shirt',
      description: 'Nike Dri-FIT technology moves sweat away from your skin for quicker evaporation, helping you remain dry and comfortable. Fabric: 100% recycled polyester. Regular fit for a relaxed, easy feel.',
      price: 999,
      stockQty: 300,
      rating: 4.4,
      reviewCount: 23450,
      categoryId: clothing.id,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&q=80',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&q=80',
      ],
    },
    {
      name: 'Levi\'s 511 Slim Fit Men\'s Jeans',
      description: 'Slim through the thigh and leg opening with a low rise. Made with Flex fabric that gives you a better range of motion. Cotton blend for comfort and durability. Classic 5-pocket styling.',
      price: 2999,
      stockQty: 200,
      rating: 4.3,
      reviewCount: 18760,
      categoryId: clothing.id,
      images: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80',
        'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=500&q=80',
        'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=500&q=80',
      ],
    },
    {
      name: 'Adidas Ultraboost 22 Running Shoes',
      description: 'Run with incredible energy return. The Ultraboost 22 delivers the ultimate running experience with a BOOST midsole and a knit Primeknit+ upper for comfort and breathability over every mile.',
      price: 16999,
      stockQty: 90,
      rating: 4.6,
      reviewCount: 9870,
      categoryId: clothing.id,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80',
        'https://images.unsplash.com/photo-1606890737304-57a1ca8a9c0b?w=500&q=80',
      ],
    },
    {
      name: 'Men\'s Premium Oxford Formal Shirt',
      description: 'A wardrobe essential. This slim-fit formal shirt features a spread collar, button-down placket, and long sleeves with single-button cuffs. 100% cotton for breathability.',
      price: 1299,
      stockQty: 400,
      rating: 4.2,
      reviewCount: 7650,
      categoryId: clothing.id,
      images: [
        'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&q=80',
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&q=80',
        'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500&q=80',
      ],
    },
    {
      name: 'Unisex Premium Cotton Hoodie',
      description: 'The perfect blend of style and comfort. Made from 80% cotton and 20% polyester, this pullover hoodie features a kangaroo pocket, adjustable drawcord hood, and ribbed cuffs.',
      price: 1799,
      stockQty: 250,
      rating: 4.5,
      reviewCount: 31200,
      categoryId: clothing.id,
      images: [
        'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&q=80',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=80',
        'https://images.unsplash.com/photo-1565693413579-8ff3fdc1b03b?w=500&q=80',
      ],
    },
  ];

  // ── Home & Kitchen (5 products) ──────────────────────────────────────
  const homeKitchenProducts = [
    {
      name: 'Philips Air Fryer 4.1L HD9200',
      description: 'Fry, bake, grill, and roast with 90% less fat. Rapid Air Technology ensures hot air circulation for even, crispy results. 4.1L capacity fits a whole chicken. Dishwasher safe parts.',
      price: 8999,
      stockQty: 100,
      rating: 4.5,
      reviewCount: 42300,
      categoryId: homeKitchen.id,
      images: [
        'https://images.unsplash.com/photo-1626789428688-f5c0e29e2a83?w=500&q=80',
        'https://images.unsplash.com/photo-1619067947777-8e2b3f7dbf93?w=500&q=80',
        'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&q=80',
      ],
    },
    {
      name: 'Morphy Richards Optitaste Coffee Maker',
      description: 'Brew barista-quality coffee at home. 10-cup glass carafe, aroma selector system, anti-drip function, programmable timer, and keep-warm plate. 900W brewing power for rich, full-flavored coffee.',
      price: 2499,
      stockQty: 150,
      rating: 4.2,
      reviewCount: 15670,
      categoryId: homeKitchen.id,
      images: [
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80',
        'https://images.unsplash.com/photo-1501527098-c13e0e28f98a?w=500&q=80',
        'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=500&q=80',
      ],
    },
    {
      name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker (5.7L)',
      description: 'Pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer in one. 14 smart programs for one-touch cooking. Stainless steel interior. Up to 70% faster than traditional cooking.',
      price: 6999,
      stockQty: 85,
      rating: 4.7,
      reviewCount: 78920,
      categoryId: homeKitchen.id,
      images: [
        'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=500&q=80',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
        'https://images.unsplash.com/photo-1609501676725-7186f734e9c5?w=500&q=80',
      ],
    },
    {
      name: 'Amazon Basics Microfiber Bed Sheet Set (King) - Grey',
      description: 'Ultra-soft, extra thick microfiber for added coziness. 4-piece set includes 1 flat sheet, 1 fitted sheet with deep pockets, and 2 pillowcases. Machine washable and wrinkle-resistant.',
      price: 1299,
      stockQty: 300,
      rating: 4.3,
      reviewCount: 54200,
      categoryId: homeKitchen.id,
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=80',
        'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=500&q=80',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80',
      ],
    },
    {
      name: 'Prestige Omega Select Plus Non-Stick Fry Pan 24cm',
      description: 'Heavy-gauge aluminium with triple-layer Teflon non-stick coating for effortless cooking and cleaning. Soft-touch handle stays cool. Induction-compatible flat base. PFOA free and safe.',
      price: 799,
      stockQty: 400,
      rating: 4.1,
      reviewCount: 28760,
      categoryId: homeKitchen.id,
      images: [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80',
        'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80',
        'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&q=80',
      ],
    },
  ];

  // ── Sports & Outdoors (5 products) ───────────────────────────────────
  const sportsProducts = [
    {
      name: 'Strauss Anti-Slip Yoga Mat 6mm Thick',
      description: 'Made from NBR foam for extra cushioning and comfort. Non-slip texture for grip during all positions. 6mm thickness protects joints. Includes carry strap. 183cm x 60cm. Suitable for all yoga styles.',
      price: 599,
      stockQty: 500,
      rating: 4.3,
      reviewCount: 38900,
      categoryId: sports.id,
      images: [
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80',
        'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&q=80',
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&q=80',
      ],
    },
    {
      name: 'Boldfit Power Resistance Bands Set of 5',
      description: 'Set of 5 latex resistance bands (10–50 lbs resistance levels). Perfect for workouts at home, gym, or travel. Color-coded for easy identification. Great for muscle toning, stretching, and rehab.',
      price: 699,
      stockQty: 400,
      rating: 4.2,
      reviewCount: 21340,
      categoryId: sports.id,
      images: [
        'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=500&q=80',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80',
      ],
    },
    {
      name: 'Nivia Marathon Running Shoes for Men',
      description: 'Engineered for distance running with EVA midsole for shock absorption. Breathable mesh upper keeps feet cool. Non-marking rubber outsole for superior grip. Padded collar and tongue for comfort.',
      price: 1999,
      stockQty: 200,
      rating: 4.0,
      reviewCount: 9870,
      categoryId: sports.id,
      images: [
        'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&q=80',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
        'https://images.unsplash.com/photo-1465877783223-4eba513e27c6?w=500&q=80',
      ],
    },
    {
      name: 'Vega Helmets Non-Turbo Open Face Helmet',
      description: 'ISI certified open face helmet with ABS outer shell for strength and impact resistance. Comfortable EPS liner. Quick-release buckle system. Aerodynamic design. Available in multiple sizes.',
      price: 1499,
      stockQty: 120,
      rating: 4.1,
      reviewCount: 12430,
      categoryId: sports.id,
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
        'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=500&q=80',
        'https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?w=500&q=80',
      ],
    },
    {
      name: 'Amazon Basics Neoprene Workout Dumbbell (5 kg Pair)',
      description: 'Comfortable and easy-to-grip neoprene coating. Hex shape prevents rolling. 5 kg each, sold as a pair. Color-coded for quick identification. Ideal for home gym workouts and aerobics.',
      price: 1299,
      stockQty: 350,
      rating: 4.4,
      reviewCount: 45670,
      categoryId: sports.id,
      images: [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80',
        'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&q=80',
        'https://images.unsplash.com/photo-1549476464-37392f717541?w=500&q=80',
      ],
    },
  ];

  // ── Beauty (5 products) ──────────────────────────────────────────────
  const beautyProducts = [
    {
      name: 'Neutrogena Hydro Boost Water Gel Face Moisturizer',
      description: 'Clinically proven to continuously keep skin hydrated for 48 hours. Hyaluronic Acid absorbs quickly to deliver moisture with a light, refreshing gel texture. Oil-free and non-comedogenic.',
      price: 849,
      stockQty: 400,
      rating: 4.5,
      reviewCount: 65430,
      categoryId: beauty.id,
      images: [
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&q=80',
        'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=80',
        'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&q=80',
      ],
    },
    {
      name: 'Lotus Herbals Safe Sun UV Screen Matte Gel SPF 50',
      description: 'Broad spectrum UVA+UVB protection. Non-oily matte finish suitable for Indian skin. Sweat-resistant for 80 minutes. Enriched with liquorice for even skin tone. PA+++ rating.',
      price: 365,
      stockQty: 600,
      rating: 4.3,
      reviewCount: 43210,
      categoryId: beauty.id,
      images: [
        'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&q=80',
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=80',
        'https://images.unsplash.com/photo-1585232351009-aa87f6de0b0f?w=500&q=80',
      ],
    },
    {
      name: 'Mamaearth Onion Hair Fall Control Shampoo (250ml)',
      description: 'Enriched with Onion Extract and Plant Keratin. Reduces hair fall, strengthens hair, and promotes hair growth. Free from Sulphates, Parabens, and Silicones. Dermatologically tested and toxin-free.',
      price: 349,
      stockQty: 800,
      rating: 4.2,
      reviewCount: 89760,
      categoryId: beauty.id,
      images: [
        'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=500&q=80',
        'https://images.unsplash.com/photo-1585632318534-64a9d48e0b2c?w=500&q=80',
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=80',
      ],
    },
    {
      name: 'Minimalist Vitamin C 10% Face Serum',
      description: '10% Ethyl Ascorbic Acid (the most stable form of Vitamin C) with 0.5% Acetyl Glucosamine. Brightens skin, reduces dark spots, and fades hyperpigmentation. Lightweight, fast-absorbing water formula.',
      price: 549,
      stockQty: 500,
      rating: 4.6,
      reviewCount: 67890,
      categoryId: beauty.id,
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80',
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&q=80',
        'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=80',
      ],
    },
    {
      name: 'Lakme 9 to 5 Weightless Matte Mousse Lip & Cheek Color',
      description: 'Ultra-light mousse formula that creates a velvety matte finish on lips and cheeks. Long-lasting 16-hour formula. Available in 12 beautiful shades. Enriched with Vitamin E for care and moisture.',
      price: 275,
      stockQty: 700,
      rating: 4.1,
      reviewCount: 34560,
      categoryId: beauty.id,
      images: [
        'https://images.unsplash.com/photo-1586495777744-4e6232bf2b17?w=500&q=80',
        'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500&q=80',
        'https://images.unsplash.com/photo-1631214499038-e9ab43a1a90c?w=500&q=80',
      ],
    },
  ];

  // ── Create all products ──────────────────────────────────────────────
  const allProductData = [
    ...electronicsProducts,
    ...booksProducts,
    ...clothingProducts,
    ...homeKitchenProducts,
    ...sportsProducts,
    ...beautyProducts,
  ];

  let productCount = 0;
  for (const productData of allProductData) {
    await createProduct(productData);
    productCount++;
  }
  console.log(`✅ ${productCount} products created with images`);

  const totalProducts = await prisma.product.count();
  const totalImages = await prisma.productImage.count();
  console.log(`\n📦 Seed complete!`);
  console.log(`   Users: 1`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Products: ${totalProducts}`);
  console.log(`   Product Images: ${totalImages}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

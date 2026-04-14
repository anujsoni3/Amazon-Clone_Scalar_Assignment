// Safe Data Injection Script
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting safe seed...');

  // Fix Broken Images for Amazon Basics and Home Kitchen
  // Using reliable generic placeholders for missing ones or valid nature images
  await prisma.$executeRaw`
    UPDATE "product_images"
    SET "image_url" = 'https://picsum.photos/500/500?random=' || id
    WHERE "image_url" LIKE '%unsplash%';
  `;
  console.log('✅ Fixed volatile Unsplash images.');

  // Fetch Categories
  const categories = await prisma.category.findMany();
  const getCatId = (slug) => categories.find(c => c.slug === slug)?.id;

  const newProducts = [
    {
      name: 'Amazon Basics 100% Cotton Bath Towel Set',
      description: 'Fade-resistant cotten. Lightweight and quick drying.',
      price: 899, stockQty: 500, rating: 4.5, reviewCount: 15400,
      categoryId: getCatId('amazon-basics'),
      images: ['https://m.media-amazon.com/images/I/71Y-142C6uL._AC_SX569_.jpg']
    },
    {
      name: 'Amazon Basics Lightning to USB-A Cable',
      description: 'MFi Certified cable for Apple devices.',
      price: 299, stockQty: 1000, rating: 4.6, reviewCount: 98000,
      categoryId: getCatId('amazon-basics'),
      images: ['https://m.media-amazon.com/images/I/61D84NtVgVL._AC_SX679_.jpg']
    },
    {
      name: 'Sony PlayStation 5 Console',
      description: 'Lightning speed PS5 console with ultra-high speed SSD.',
      price: 49999, stockQty: 45, rating: 4.9, reviewCount: 23100,
      categoryId: getCatId('electronics'),
      images: ['https://m.media-amazon.com/images/I/51051FiD9AQ._SX522_.jpg']
    },
    {
      name: 'Dell XPS 15 Laptop',
      description: 'Stunning 4K OLED display, 32GB RAM, i9 Processor.',
      price: 189900, stockQty: 10, rating: 4.7, reviewCount: 1500,
      categoryId: getCatId('electronics'),
      images: ['https://m.media-amazon.com/images/I/61yB+V8aUcL._AC_SX679_.jpg']
    },
    {
      name: 'Samsung 32-inch Odyssey G7 Monitor',
      description: '240Hz, 1ms curved gaming monitor.',
      price: 54999, stockQty: 30, rating: 4.6, reviewCount: 8900,
      categoryId: getCatId('electronics'),
      images: ['https://m.media-amazon.com/images/I/81xUXXH-E4L._AC_SX679_.jpg']
    },
    {
      name: 'Levi\'s Men\'s Standard T-Shirt',
      description: 'Super comfortable all-day classic fit logo t-shirt.',
      price: 799, stockQty: 150, rating: 4.3, reviewCount: 5000,
      categoryId: getCatId('clothing'),
      images: ['https://m.media-amazon.com/images/I/51A3ZpGq6kL._AC_UX679_.jpg']
    },
    {
      name: 'Adidas Originals Men\'s Stan Smith',
      description: 'Classic tennis sneaker.',
      price: 5999, stockQty: 230, rating: 4.8, reviewCount: 12000,
      categoryId: getCatId('clothing'),
      images: ['https://m.media-amazon.com/images/I/71R2o5-U8-L._AC_UX575_.jpg']
    },
    {
      name: 'Dyson V15 Detect Vacuum',
      description: 'Laser reveals microscopic dust.',
      price: 64999, stockQty: 50, rating: 4.8, reviewCount: 3400,
      categoryId: getCatId('home-kitchen'),
      images: ['https://m.media-amazon.com/images/I/51bA7YnS5gL._AC_SX679_.jpg']
    },
    {
      name: 'Nespresso Vertuo Next Coffee Machine',
      description: 'Brews a wide range of coffees at the touch of a button.',
      price: 15999, stockQty: 75, rating: 4.7, reviewCount: 6700,
      categoryId: getCatId('home-kitchen'),
      images: ['https://m.media-amazon.com/images/I/61Tf-p7dIfL._AC_SX679_.jpg']
    },
    {
      name: 'Optimum Nutrition Gold Standard 100% Whey',
      description: 'Double Rich Chocolate, 2 lbs.',
      price: 2999, stockQty: 120, rating: 4.7, reviewCount: 140000,
      categoryId: getCatId('sports-outdoors'),
      images: ['https://m.media-amazon.com/images/I/716uWc4+BTL._AC_SX679_.jpg']
    },
    {
      name: 'Wilson Evolution Game Basketball',
      description: 'The preferred basketball in high schools across America.',
      price: 4999, stockQty: 80, rating: 4.9, reviewCount: 23000,
      categoryId: getCatId('sports-outdoors'),
      images: ['https://m.media-amazon.com/images/I/81xUsqN4-dL._AC_SX679_.jpg']
    },
    {
      name: 'CeraVe Hydrating Facial Cleanser',
      description: 'Daily Face Wash with Hyaluronic Acid, Ceramides, and Glycerin.',
      price: 1199, stockQty: 400, rating: 4.8, reviewCount: 88000,
      categoryId: getCatId('beauty'),
      images: ['https://m.media-amazon.com/images/I/61lXGzG-n7L._SX522_.jpg']
    },
    {
      name: 'L\'Oreal Paris Makeup Voluminous Original Volume Building Mascara',
      description: 'Uniquely formulated to resist clumping, soften and build lashes up to 5X their natural thickness.',
      price: 399, stockQty: 300, rating: 4.6, reviewCount: 45000,
      categoryId: getCatId('beauty'),
      images: ['https://m.media-amazon.com/images/I/71u9iEZZVZL._SX522_.jpg']
    }
  ];

  let added = 0;
  for (const prod of newProducts) {
    if (!prod.categoryId) continue; // Skip if category missing
    const existing = await prisma.product.findFirst({ where: { name: prod.name }});
    if (!existing) {
      await prisma.product.create({
        data: {
          name: prod.name,
          description: prod.description,
          price: prod.price,
          stockQty: prod.stockQty,
          rating: prod.rating,
          reviewCount: prod.reviewCount,
          categoryId: prod.categoryId,
          images: {
            create: prod.images.map((url, i) => ({ imageUrl: url, isPrimary: i === 0 }))
          }
        }
      });
      added++;
    }
  }

  console.log('✅ Safely added ' + added + ' new products without deleting any data!');
}

main().catch(console.error).finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DUMMYJSON_URL = 'https://dummyjson.com/products?limit=194';
const FREE_ECOMMERCE_URL = 'https://kolzsticks.github.io/Free-Ecommerce-Products-Api/main/products.json';

const slugify = (value) => String(value || '')
  .toLowerCase()
  .trim()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const clampRating = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const clamped = Math.max(0, Math.min(5, number));
  return Number(clamped.toFixed(1));
};

const normalizeDummyProducts = (payload) => {
  const rows = Array.isArray(payload?.products) ? payload.products : [];

  return rows.map((item) => {
    const images = [
      ...(Array.isArray(item.images) ? item.images : []),
      item.thumbnail,
    ].filter(Boolean);

    return {
      sourceKey: `dummyjson:${item.id}`,
      name: item.title || `Dummy Product ${item.id}`,
      description: item.description || 'No description available.',
      price: Number((item.price || 0) * 83),
      stockQty: Math.max(0, parseInt(item.stock || 0, 10)),
      rating: clampRating(item.rating),
      reviewCount: Math.max(0, parseInt(item?.reviews?.length || 0, 10)),
      categoryName: item.category || 'Uncategorized',
      categorySlug: slugify(item.category || 'uncategorized'),
      images,
    };
  });
};

const normalizeFreeProducts = (payload) => {
  const rows = Array.isArray(payload) ? payload : [];

  return rows.map((item) => {
    const categoryName = item.category || 'Uncategorized';
    const ratingObj = item.rating || {};

    return {
      sourceKey: `freeapi:${item.id}`,
      name: item.name || `Free API Product ${item.id}`,
      description: item.description || 'No description available.',
      price: Number((item.priceCents || 0) / 100 * 83),
      stockQty: 100,
      rating: clampRating(ratingObj.stars),
      reviewCount: Math.max(0, parseInt(ratingObj.count || 0, 10)),
      categoryName,
      categorySlug: slugify(categoryName || 'uncategorized'),
      images: [item.image].filter(Boolean),
    };
  });
};

const dedupeProducts = (products) => {
  const seen = new Set();
  const unique = [];

  for (const product of products) {
    const key = `${slugify(product.name)}:${product.categorySlug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(product);
  }

  return unique;
};

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

const isRetryablePrismaError = (error) => {
  return error?.code === 'P1017' || error?.code === 'P1001';
};

const runWithRetry = async (operation, label, attempts = 3) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryablePrismaError(error) || attempt === attempts) {
        throw error;
      }
      console.warn(`${label} failed (attempt ${attempt}/${attempts}), retrying...`);
    }
  }
  throw lastError;
};

async function main() {
  console.log('Seeding from external product APIs...');

  const [dummyPayload, freePayload] = await Promise.all([
    fetchJson(DUMMYJSON_URL),
    fetchJson(FREE_ECOMMERCE_URL),
  ]);

  const normalized = dedupeProducts([
    ...normalizeDummyProducts(dummyPayload),
    ...normalizeFreeProducts(freePayload),
  ]);

  console.log(`Fetched and normalized ${normalized.length} products.`);

  if (normalized.length === 0) {
    throw new Error('No products received from source APIs. Seed aborted.');
  }

  await runWithRetry(() => prisma.wishlist.deleteMany(), 'delete wishlists');
  await runWithRetry(() => prisma.review.deleteMany(), 'delete reviews');
  await runWithRetry(() => prisma.orderItem.deleteMany(), 'delete order items');
  await runWithRetry(() => prisma.order.deleteMany(), 'delete orders');
  await runWithRetry(() => prisma.cartItem.deleteMany(), 'delete cart items');
  await runWithRetry(() => prisma.paymentCard.deleteMany(), 'delete payment cards');
  await runWithRetry(() => prisma.address.deleteMany(), 'delete addresses');
  await runWithRetry(() => prisma.productImage.deleteMany(), 'delete product images');
  await runWithRetry(() => prisma.product.deleteMany(), 'delete products');
  await runWithRetry(() => prisma.category.deleteMany(), 'delete categories');
  await runWithRetry(() => prisma.user.deleteMany(), 'delete users');
  console.log('Catalog cleanup complete.');

  await runWithRetry(() => prisma.user.create({
    data: {
      id: 1,
      name: 'Anuj',
      email: 'anuj@amazon.com',
      phone: '+91-9876543210',
      addresses: {
        create: [
          {
            fullName: 'Anuj Kumar',
            phoneNumber: '+91-9876543210',
            street: 'Plot No. 123, MG Road, Nagpur',
            city: 'Nagpur',
            state: 'Maharashtra',
            postalCode: '440018',
            country: 'India',
            isDefault: true,
          },
          {
            fullName: 'Anuj K.',
            phoneNumber: '+91-8765432109',
            street: 'Connaught Place, New Delhi',
            city: 'Delhi',
            state: 'Delhi',
            postalCode: '110001',
            country: 'India',
            isDefault: false,
          },
        ],
      },
      paymentCards: {
        create: {
          cardholderName: 'ANUJ KUMAR',
          cardNumber: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '2026',
          cvv: '123',
          isDefault: true,
        },
      },
    },
  }), 'create default user with address and card');
  console.log('Default user, address, and payment card created.');

  const categoryMap = new Map();

  for (const product of normalized) {
    if (!categoryMap.has(product.categorySlug)) {
      const category = await runWithRetry(() => prisma.category.create({
        data: {
          name: product.categoryName,
          slug: product.categorySlug || 'uncategorized',
        },
      }), 'create category');
      categoryMap.set(product.categorySlug, category.id);
    }
  }
  console.log(`Created ${categoryMap.size} categories.`);

  const prepared = normalized
    .map((product) => {
      const categoryId = categoryMap.get(product.categorySlug);
      if (!categoryId) return null;

      const imageList = product.images.length > 0
        ? product.images
        : [`https://picsum.photos/seed/${encodeURIComponent(product.sourceKey)}/600/400`];

      return {
        key: `${slugify(product.name)}:${categoryId}`,
        productData: {
          name: product.name,
          description: product.description,
          price: Number(product.price.toFixed(2)),
          stockQty: product.stockQty,
          rating: product.rating,
          reviewCount: product.reviewCount,
          categoryId,
        },
        images: imageList,
      };
    })
    .filter(Boolean);

  await runWithRetry(() => prisma.product.createMany({
    data: prepared.map((item) => item.productData),
  }), 'bulk create products');
  console.log(`Inserted ${prepared.length} products.`);

  const productRows = await runWithRetry(() => prisma.product.findMany({
    select: {
      id: true,
      name: true,
      categoryId: true,
    },
  }), 'fetch inserted products');

  const productIdByKey = new Map(
    productRows.map((row) => [`${slugify(row.name)}:${row.categoryId}`, row.id])
  );

  const imageRows = [];
  for (const item of prepared) {
    const productId = productIdByKey.get(item.key);
    if (!productId) continue;

    item.images.forEach((imageUrl, index) => {
      imageRows.push({
        productId,
        imageUrl,
        isPrimary: index === 0,
      });
    });
  }

  await runWithRetry(() => prisma.productImage.createMany({
    data: imageRows,
  }), 'bulk create product images');

  console.log(`Seed complete: ${prepared.length} products across ${categoryMap.size} categories with ${imageRows.length} images.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

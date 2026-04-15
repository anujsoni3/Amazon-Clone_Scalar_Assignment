export const demoCategories = [
  { id: 1, name: 'Electronics', slug: 'electronics' },
  { id: 2, name: 'Home & Kitchen', slug: 'home-kitchen' },
  { id: 3, name: 'Beauty', slug: 'beauty' },
  { id: 4, name: 'Books', slug: 'books' },
  { id: 5, name: 'Clothing', slug: 'clothing' },
  { id: 6, name: 'Amazon Basics', slug: 'amazon-basics' },
];

export const demoProducts = [
  {
    id: 101,
    name: 'Amazon Basics 100% Cotton Bath Towel Set',
    description: 'Soft, absorbent cotton towels designed for everyday use.',
    price: 899,
    stockQty: 80,
    rating: 4.4,
    reviewCount: 15400,
    category: { id: 2, name: 'Home & Kitchen', slug: 'home-kitchen' },
    images: [{ imageUrl: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=600&q=80', isPrimary: true }],
  },
  {
    id: 102,
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    description: 'Industry-leading noise canceling and long battery life.',
    price: 24990,
    stockQty: 40,
    rating: 4.7,
    reviewCount: 45210,
    category: { id: 1, name: 'Electronics', slug: 'electronics' },
    images: [{ imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', isPrimary: true }],
  },
  {
    id: 103,
    name: 'Adidas Originals Men\'s Stan Smith',
    description: 'Classic sneakers with a clean silhouette.',
    price: 5999,
    stockQty: 60,
    rating: 4.5,
    reviewCount: 12000,
    category: { id: 5, name: 'Clothing', slug: 'clothing' },
    images: [{ imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', isPrimary: true }],
  },
  {
    id: 104,
    name: 'CeraVe Hydrating Facial Cleanser',
    description: 'Gentle cleanser for normal to dry skin.',
    price: 1199,
    stockQty: 120,
    rating: 4.6,
    reviewCount: 8800,
    category: { id: 3, name: 'Beauty', slug: 'beauty' },
    images: [{ imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80', isPrimary: true }],
  },
  {
    id: 105,
    name: 'Wilson Evolution Game Basketball',
    description: 'Premium indoor game ball with exceptional grip.',
    price: 4999,
    stockQty: 35,
    rating: 4.8,
    reviewCount: 23000,
    category: { id: 6, name: 'Amazon Basics', slug: 'amazon-basics' },
    images: [{ imageUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80', isPrimary: true }],
  },
  {
    id: 106,
    name: 'Optimum Nutrition Gold Standard 100% Whey',
    description: 'Protein powder for muscle recovery and nutrition support.',
    price: 2999,
    stockQty: 55,
    rating: 4.7,
    reviewCount: 140000,
    category: { id: 2, name: 'Home & Kitchen', slug: 'home-kitchen' },
    images: [{ imageUrl: 'https://images.unsplash.com/photo-1587798589592-8f5f1ff9e2f9?w=600&q=80', isPrimary: true }],
  },
];

export const demoCartItems = [
  { id: 201, quantity: 1, product: demoProducts[0] },
  { id: 202, quantity: 1, product: demoProducts[1] },
];

export const demoWishlistItems = [
  { id: 301, productId: demoProducts[2].id, product: demoProducts[2] },
  { id: 302, productId: demoProducts[3].id, product: demoProducts[3] },
  { id: 303, productId: demoProducts[4].id, product: demoProducts[4] },
];

export const getDemoProductsByCategory = (slug) => {
  if (!slug) return demoProducts;
  return demoProducts.filter((product) => product.category?.slug === slug);
};
import { connectDB, disconnectDB } from '../config/db.js';
import { Category } from '../modules/categories/category.model.js';
import { Collection } from '../modules/collections/collection.model.js';
import { Product } from '../modules/products/product.model.js';
import { Announcement, HeroBanner, InstagramPost, FAQ } from '../modules/content/content.model.js';
import { Coupon } from '../modules/coupons/coupon.model.js';
import { User } from '../modules/users/user.model.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Connecting to MongoDB to seed Zayna Abaya database...');
  await connectDB();

  // Clear existing collections if desired
  await Category.deleteMany({});
  await Collection.deleteMany({});
  await Product.deleteMany({});
  await Announcement.deleteMany({});
  await HeroBanner.deleteMany({});
  await InstagramPost.deleteMany({});
  await FAQ.deleteMany({});
  await Coupon.deleteMany({});

  console.log('🧹 Cleared existing catalog and content data.');

  // 1. Seed Categories
  const categories = await Category.create([
    {
      name: 'Everyday Essentials',
      slug: 'everyday-essentials',
      image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=800&auto=format&fit=crop',
      description: 'Timeless minimal abayas crafted for daily elegance and breathable comfort.',
      sortOrder: 1,
      active: true
    },
    {
      name: 'Luxury Occasion',
      slug: 'luxury-occasion',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
      description: 'Intricate hand-embroidery, rich silks, and floor-sweeping silhouettes for celebrations.',
      sortOrder: 2,
      active: true
    },
    {
      name: 'Open Front & Kimonos',
      slug: 'open-front-kimonos',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      description: 'Versatile layering pieces featuring modern drape cuts and satin lapels.',
      sortOrder: 3,
      active: true
    },
    {
      name: 'Eid & Festive',
      slug: 'eid-festive',
      image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=800&auto=format&fit=crop',
      description: 'Exclusive celebratory edits featuring champagne gold threadwork and organza accents.',
      sortOrder: 4,
      active: true
    },
    {
      name: 'Silk & Chiffon Hijabs',
      slug: 'silk-chiffon-hijabs',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=800&auto=format&fit=crop',
      description: 'Signature modal, silk, and crinkle chiffon matching sheylas.',
      sortOrder: 5,
      active: true
    }
  ]);
  console.log(`✅ Seeded ${categories.length} categories.`);

  // 2. Seed Collections
  const collections = await Collection.create([
    {
      name: 'Royal Noor Eid Collection',
      slug: 'royal-noor-eid',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
      description: 'Opulent silhouettes adorned with delicate hand-stitched champagne zari and beadwork.',
      sortOrder: 1,
      active: true
    },
    {
      name: 'Desert Sand Essentials',
      slug: 'desert-sand-essentials',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1600&auto=format&fit=crop',
      description: 'Breathable pure Korean Nidha fabrics rendered in soothing earth tones.',
      sortOrder: 2,
      active: true
    }
  ]);
  console.log(`✅ Seeded ${collections.length} collections.`);

  // 3. Seed Products
  const productsData = [
    {
      name: 'Zahara Embroidered Silk Abaya',
      slug: 'zahara-embroidered-silk-abaya',
      description: 'Elevate your festive wardrobe with the Zahara Abaya. Crafted from featherlight Korean Nidha with silk crepe overlays, featuring delicate hand-embroidered floral vine motifs along the cuffs and sweeping hemline. Includes a coordinating chiffon sheyla with matching gold-threaded border.',
      images: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1000&auto=format&fit=crop'
      ],
      sku: 'ZA-ZHR-001',
      price: 649900,
      salePrice: 549900,
      stock: 45,
      category: categories[1]!._id,
      collectionId: collections[0]!._id,
      tags: ['Abaya', 'Embroidered', 'Festive', 'Silk', 'Black'],
      flags: { isBestseller: true, isFeatured: true, isNewArrival: false },
      fabricCare: 'Premium Korean Nidha & Silk Blend. Dry clean recommended or delicate hand wash with mild abaya shampoo. Cool iron inside out.',
      deliveryInfo: 'Dispatched within 24-48 hours. Complimentary express delivery across India in 3-5 business days in our signature luxury gold-embossed keepsake box.',
      variants: [
        { size: '52', color: 'Noir Black', sku: 'ZA-ZHR-001-52-BLK', price: 649900, salePrice: 549900, stock: 10 },
        { size: '54', color: 'Noir Black', sku: 'ZA-ZHR-001-54-BLK', price: 649900, salePrice: 549900, stock: 15 },
        { size: '56', color: 'Noir Black', sku: 'ZA-ZHR-001-56-BLK', price: 649900, salePrice: 549900, stock: 12 },
        { size: '58', color: 'Noir Black', sku: 'ZA-ZHR-001-58-BLK', price: 649900, salePrice: 549900, stock: 8 }
      ]
    },
    {
      name: 'Layla Minimalist Linen Open-Front Abaya',
      slug: 'layla-minimalist-linen-open-front-abaya',
      description: 'The epitome of understated modern modest wear. Cut from soft textured European linen-viscose blend, the Layla kimono abaya drapes with effortless grace. Concealed magnetic front clasps allow wearing it closed as a classic silhouette or layered open over contemporary ensembles.',
      images: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1000&auto=format&fit=crop'
      ],
      sku: 'ZA-LYL-002',
      price: 429900,
      salePrice: 379900,
      stock: 50,
      category: categories[2]!._id,
      collectionId: collections[1]!._id,
      tags: ['Open Front', 'Kimono', 'Linen', 'Minimal', 'Beige'],
      flags: { isBestseller: true, isFeatured: false, isNewArrival: true },
      fabricCare: 'Breathable Natural Linen-Viscose blend. Machine wash gentle cold, hang dry in shade, warm steam iron.',
      deliveryInfo: 'Ready to ship. Delivered in 3-5 business days across India.',
      variants: [
        { size: '52', color: 'Sand Beige', sku: 'ZA-LYL-002-52-BEI', price: 429900, salePrice: 379900, stock: 12 },
        { size: '54', color: 'Sand Beige', sku: 'ZA-LYL-002-54-BEI', price: 429900, salePrice: 379900, stock: 18 },
        { size: '56', color: 'Sand Beige', sku: 'ZA-LYL-002-56-BEI', price: 429900, salePrice: 379900, stock: 12 },
        { size: '58', color: 'Sand Beige', sku: 'ZA-LYL-002-58-BEI', price: 429900, salePrice: 379900, stock: 8 }
      ]
    },
    {
      name: 'Amina Pleated Everyday Black Abaya',
      slug: 'amina-pleated-everyday-black-abaya',
      description: 'Your quintessential daily companion. Crafted with breathable, crease-resistant Firdaus crepe, featuring architectural micro-pleating at the waist and tailored button cuffs. Designed for full opacity, ease of movement, and enduring day-long comfort.',
      images: [
        'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop'
      ],
      sku: 'ZA-AMN-003',
      price: 349900,
      salePrice: 299900,
      stock: 60,
      category: categories[0]!._id,
      tags: ['Everyday', 'Black', 'Pleated', 'Crepe', 'Workwear'],
      flags: { isBestseller: true, isFeatured: true, isNewArrival: false },
      fabricCare: '100% Anti-Crease Firdaus Crepe. Machine wash gentle cycle, low tumble dry or drip dry.',
      deliveryInfo: 'Ships same day when ordered before 2 PM. Free shipping included.',
      variants: [
        { size: '52', color: 'Midnight Noir', sku: 'ZA-AMN-003-52-BLK', price: 349900, salePrice: 299900, stock: 15 },
        { size: '54', color: 'Midnight Noir', sku: 'ZA-AMN-003-54-BLK', price: 349900, salePrice: 299900, stock: 20 },
        { size: '56', color: 'Midnight Noir', sku: 'ZA-AMN-003-56-BLK', price: 349900, salePrice: 299900, stock: 15 },
        { size: '58', color: 'Midnight Noir', sku: 'ZA-AMN-003-58-BLK', price: 349900, salePrice: 299900, stock: 10 }
      ]
    },
    {
      name: 'Noor Champagne Gold Festive Kaftan',
      slug: 'noor-champagne-gold-festive-kaftan',
      description: 'Make a royal entrance at weddings and grand celebrations. The Noor Kaftan is sculpted with liquid satin georgette and detailed with hand-applied metallic gold filigree embroidery across the bodice and sleeves. Features an adjustable interior ribbon for a customized silhouette.',
      images: [
        'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop'
      ],
      sku: 'ZA-NOR-004',
      price: 899900,
      salePrice: 749900,
      stock: 25,
      category: categories[3]!._id,
      collectionId: collections[0]!._id,
      tags: ['Festive', 'Kaftan', 'Gold', 'Wedding', 'Luxury'],
      flags: { isBestseller: false, isFeatured: true, isNewArrival: true },
      fabricCare: 'Pure Satin Georgette with Zari threadwork. Strictly professional dry clean only.',
      deliveryInfo: 'Includes insured priority express shipping and complimentary garment dust bag.',
      variants: [
        { size: '54', color: 'Champagne Gold', sku: 'ZA-NOR-004-54-GLD', price: 899900, salePrice: 749900, stock: 10 },
        { size: '56', color: 'Champagne Gold', sku: 'ZA-NOR-004-56-GLD', price: 899900, salePrice: 749900, stock: 10 },
        { size: '58', color: 'Champagne Gold', sku: 'ZA-NOR-004-58-GLD', price: 899900, salePrice: 749900, stock: 5 }
      ]
    },
    {
      name: 'Safiya Flared Sleeve Satin Abaya',
      slug: 'safiya-flared-sleeve-satin-abaya',
      description: 'Rich jewel tones meet architectural bell sleeves. The Safiya Abaya is tailored in decadent matte crepe-back satin that cascades smoothly. Finished with delicate hand-turned hems and a jewel-neck mandarin collar.',
      images: [
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop'
      ],
      sku: 'ZA-SFY-005',
      price: 579900,
      salePrice: 499900,
      stock: 35,
      category: categories[1]!._id,
      tags: ['Satin', 'Flared', 'Emerald', 'Evening', 'Occasion'],
      flags: { isBestseller: false, isFeatured: true, isNewArrival: true },
      fabricCare: 'Matte Crepe-Back Satin. Hand wash cold or dry clean.',
      deliveryInfo: 'Dispatches within 2 business days.',
      variants: [
        { size: '52', color: 'Emerald Green', sku: 'ZA-SFY-005-52-EMR', price: 579900, salePrice: 499900, stock: 8 },
        { size: '54', color: 'Emerald Green', sku: 'ZA-SFY-005-54-EMR', price: 579900, salePrice: 499900, stock: 12 },
        { size: '56', color: 'Emerald Green', sku: 'ZA-SFY-005-56-EMR', price: 579900, salePrice: 499900, stock: 10 },
        { size: '58', color: 'Emerald Green', sku: 'ZA-SFY-005-58-EMR', price: 579900, salePrice: 499900, stock: 5 }
      ]
    },
    {
      name: 'Luxe Modal Silk Sheyla Hijab',
      slug: 'luxe-modal-silk-sheyla-hijab',
      description: 'Our most coveted headscarf. Woven from 100% Austrian Lenzing modal infused with mulberry silk, offering an airy, cloud-soft drape that stays firmly in place all day without slipping. Generous 200cm x 75cm dimensions for versatile modest styling.',
      images: [
        'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1000&auto=format&fit=crop'
      ],
      sku: 'ZA-HJB-006',
      price: 129900,
      salePrice: 99900,
      stock: 120,
      category: categories[4]!._id,
      tags: ['Hijab', 'Silk', 'Modal', 'Scarf', 'Breathable'],
      flags: { isBestseller: true, isFeatured: false, isNewArrival: false },
      fabricCare: 'Lenzing Modal & Mulberry Silk. Hand wash cold, lay flat to dry.',
      deliveryInfo: 'Ships within 24 hours. Eligible for free shipping with any abaya purchase.',
      variants: [
        { size: 'Standard (200x75cm)', color: 'Caramel Latte', sku: 'ZA-HJB-006-STD-CRM', price: 129900, salePrice: 99900, stock: 40 },
        { size: 'Standard (200x75cm)', color: 'Soft Alabaster', sku: 'ZA-HJB-006-STD-ALB', price: 129900, salePrice: 99900, stock: 40 },
        { size: 'Standard (200x75cm)', color: 'Midnight Noir', sku: 'ZA-HJB-006-STD-BLK', price: 129900, salePrice: 99900, stock: 40 }
      ]
    }
  ];

  for (const item of productsData) {
    await Product.create(item);
  }
  console.log(`✅ Seeded ${productsData.length} products with variants.`);

  // 4. Seed Content (Announcement, Banners, Instagram, FAQs)
  await Announcement.create({
    message: '✨ Complimentary Luxury Keepsake Box & Free Express Shipping on orders above ₹2,999 | Use Code: EIDMUBARAK',
    link: '/shop',
    active: true,
    dismissible: true
  });

  await HeroBanner.create([
    {
      title: 'The Royal Noor Collection',
      subtitle: 'Handcrafted Luxury Modest Silhouettes Tailored for Grand Celebrations',
      imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1800&auto=format&fit=crop',
      mobileImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
      ctaText: 'Explore Collection',
      ctaLink: '/shop?category=luxury-occasion',
      sortOrder: 1,
      active: true
    },
    {
      title: 'Effortless Everyday Modesty',
      subtitle: 'Breathable Pure Korean Nidha Fabric Crafted for Lasting Comfort',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1800&auto=format&fit=crop',
      mobileImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      ctaText: 'Shop Essentials',
      ctaLink: '/shop?category=everyday-essentials',
      sortOrder: 2,
      active: true
    }
  ]);

  await InstagramPost.create([
    {
      imageUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600&auto=format&fit=crop',
      caption: 'Grace in every thread. The Amina Everyday Abaya in Noir. #ZaynaAbaya #ModestLuxury',
      postUrl: 'https://instagram.com',
      sortOrder: 1,
      active: true
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop',
      caption: 'Gold zari filigree details crafted by master artisans. #HauteModesty #EidCollection',
      postUrl: 'https://instagram.com',
      sortOrder: 2,
      active: true
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
      caption: 'Desert earth palettes for effortless summer layering. #LinenKimono',
      postUrl: 'https://instagram.com',
      sortOrder: 3,
      active: true
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop',
      caption: 'Cloud-soft modal silk sheylas in 12 signature shades. #ZaynaHijabs',
      postUrl: 'https://instagram.com',
      sortOrder: 4,
      active: true
    }
  ]);

  await FAQ.create([
    {
      question: 'How do I choose the correct abaya size?',
      answer: 'Abaya sizing is primarily based on total body height from shoulder to floor. Size 52 corresponds to height 5\'0" - 5\'2", Size 54 is 5\'3" - 5\'4", Size 56 is 5\'5" - 5\'6", and Size 58 is 5\'7" - 5\'8". If you prefer wearing heels, we suggest choosing one size up. Check our interactive Size Guide on any product page for exact bust and sleeve measurements.',
      category: 'Sizing',
      sortOrder: 1,
      active: true
    },
    {
      question: 'What premium fabrics do you use?',
      answer: 'We exclusively source genuine Korean Nidha, Japanese Firdaus Crepe, and Austrian Lenzing Modal Silk. All our textiles undergo rigorous opacity and breathability testing to ensure maximum modesty and comfort in all climates.',
      category: 'Fabrics & Quality',
      sortOrder: 2,
      active: true
    },
    {
      question: 'How long does shipping take and is it free?',
      answer: 'We offer complimentary express shipping on all orders over ₹2,999 across India. Orders are dispatched from Bangalore within 24-48 hours and arrive in 3-5 business days. Real-time tracking links are provided via SMS and email upon dispatch.',
      category: 'Shipping',
      sortOrder: 3,
      active: true
    },
    {
      question: 'What is your return and exchange policy?',
      answer: 'We offer hassle-free 7-day exchanges for size and styling adjustments on unworn garments with original tags attached and in original packaging. Our courier partner arranges convenient doorstep pickup.',
      category: 'Returns',
      sortOrder: 4,
      active: true
    }
  ]);

  // 5. Seed Test Coupons
  await Coupon.create([
    {
      code: 'EIDMUBARAK',
      discountType: 'percentage',
      discountValue: 15,
      minOrderAmount: 299900,
      maxDiscountAmount: 150000,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2027-01-01'),
      maxUses: 1000,
      usedCount: 12,
      active: true
    },
    {
      code: 'WELCOME500',
      discountType: 'fixed',
      discountValue: 50000,
      minOrderAmount: 349900,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2027-01-01'),
      maxUses: 500,
      usedCount: 5,
      active: true
    }
  ]);

  // 6. Ensure default Admin user exists
  const existingAdmin = await User.findOne({ email: 'admin@zaynaabaya.com' });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Admin@Zayna2026', salt);
    await User.create({
      name: 'Zayna Master Admin',
      email: 'admin@zaynaabaya.com',
      password: hashedPassword,
      role: 'superadmin',
      isEmailVerified: true
    });
    console.log('✅ Created default admin user: admin@zaynaabaya.com (Password: Admin@Zayna2026)');
  }

  console.log('🎉 Database seeding completed successfully!');
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed script failed:', err);
  process.exit(1);
});

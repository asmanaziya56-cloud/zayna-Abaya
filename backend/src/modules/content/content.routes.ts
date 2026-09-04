import { Router } from 'express';
import { contentController } from './content.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import {
  announcementSchema,
  heroBannerSchema,
  instagramPostSchema,
  faqSchema
} from './content.schema.js';

const router = Router();

// Public routes for customer storefront
router.get('/homepage', contentController.getHomepageContent);
router.get('/banners', contentController.getBanners);
router.get('/instagram', contentController.getInstagramPosts);
router.get('/faqs', contentController.getFAQs);

// Protected admin routes
const adminAuth = [requireAuth, roleGuard(['admin', 'superadmin'])];

router.put('/announcement', ...adminAuth, validate({ body: announcementSchema }), contentController.updateAnnouncement);

router.post('/banners', ...adminAuth, validate({ body: heroBannerSchema }), contentController.createBanner);
router.patch('/banners/:id', ...adminAuth, validate({ body: heroBannerSchema.partial() }), contentController.updateBanner);
router.delete('/banners/:id', ...adminAuth, contentController.deleteBanner);

router.post('/instagram', ...adminAuth, validate({ body: instagramPostSchema }), contentController.createInstagramPost);
router.delete('/instagram/:id', ...adminAuth, contentController.deleteInstagramPost);

router.post('/faqs', ...adminAuth, validate({ body: faqSchema }), contentController.createFAQ);
router.patch('/faqs/:id', ...adminAuth, validate({ body: faqSchema.partial() }), contentController.updateFAQ);
router.delete('/faqs/:id', ...adminAuth, contentController.deleteFAQ);

export const contentRoutes = router;

const express = require('express')
const superAdminController = require('../../../controllers/Admin/superadmin.controller');
const { body } = require('express-validator');
const authenticateAdmin = require('../../../middleware/authenticateAdmin');
const router = express.Router()

// router.post('/register', superAdminController.register);
router.post('/login', superAdminController.login);
router.post('/refreshToken', superAdminController.refreshToken);

router.post(
  '/createCategory',
  authenticateAdmin,
  superAdminController.createCategory
)
router.get(
  '/allCategoriesWithAdmin',
  authenticateAdmin,
  superAdminController.allCategoriesWithAdmin
)
router.get(
  '/getAllCategories',
  authenticateAdmin,
  superAdminController.getAllCategory
)
router.get(
  '/getCategoriesWithSubCategories',
  authenticateAdmin,
  superAdminController.allCategoriesWithSubCategories
)

router.post(
  '/createSubCategory',
  authenticateAdmin,
  superAdminController.createSubCategory
)
router.get(
  '/getAllSubCategories',
  authenticateAdmin,
  superAdminController.getAllSubCategory
)
router.get(
  '/getAllSubCategoryByCategory/:categoryId',
  authenticateAdmin,
  superAdminController.getAllSubCategoryByCategory
)

router.get(
  '/getAllSubCategories',
  authenticateAdmin,
  superAdminController.allSubCategories
)

router.patch(
  '/editCategory/:categoryId',
  authenticateAdmin,
  superAdminController.editCategory
)
router.patch(
  '/editSubCategory/:subcategoryId',
  authenticateAdmin,
  superAdminController.editSubCategory
)
router.get('/validateAdmin', authenticateAdmin, superAdminController.validateAdmin);
router.get('/getCategory/:categoryId', authenticateAdmin, superAdminController.getCategoryById)
router.get("/getPendingVerifyAccounts", authenticateAdmin, superAdminController.getPendingVerifyAccounts);
router.post("/vendorAccountVerification", authenticateAdmin, superAdminController.vendorsAccountVerification);
router.post('/sendMessageToMobile', superAdminController.sendMessageToMobile)

router.get('/allVendor', authenticateAdmin, superAdminController.allVendor)
router.get('/allCustomer', authenticateAdmin, superAdminController.allCustomer)
router.get(
  '/customerById',
  authenticateAdmin,
  superAdminController.customerById
)
router.get('/vendorById', authenticateAdmin, superAdminController.vendorById)
router.get('/remainVendorPayingById', authenticateAdmin, superAdminController.remainVendorPaying)
router.get('/getPaymentDetails/:id', authenticateAdmin, superAdminController.getPaymentDetails)
router.get('/serviceRejectByVendor', authenticateAdmin, superAdminController.serviceRejectByVendor)
router.patch(
  '/vendorPaidByAdmin/:id',
  authenticateAdmin,
  superAdminController.vendorPaidByAdmin
)
router.get(
  '/paidVendorById/:vendorId',
  authenticateAdmin,
  superAdminController.paidVendorById
)

router.post('/allTransactions', authenticateAdmin, superAdminController.allTransactions);
router.post(
  '/allRefunds',
  authenticateAdmin,
  superAdminController.allRefunds
)
router.post('/adminDetail', authenticateAdmin, superAdminController.adminDetail)
router.post(
  '/logout',
  authenticateAdmin,
  superAdminController.logout
)

module.exports = router;
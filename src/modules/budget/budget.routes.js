const express = require('express');
const BudgetController = require('./budget.controller');
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validation.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const {
  createBudgetSchema,
  updateBudgetSchema,
  approveBudgetSchema
} = require('./budget.validation');

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(BudgetController.list));
router.post('/', validate(createBudgetSchema), asyncHandler(BudgetController.create));
router.get('/:id', asyncHandler(BudgetController.getById));
router.put('/:id', validate(updateBudgetSchema), asyncHandler(BudgetController.update));
router.put('/:id/approve', validate(approveBudgetSchema), asyncHandler(BudgetController.approve));
router.delete('/:id', asyncHandler(BudgetController.delete));

module.exports = router;

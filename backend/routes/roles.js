const express = require("express");
const Role = require("../models/Role");
const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Protect all routes
router.use(protect);
// Only admin and superadmin can access role routes
router.use(authorize("admin", "superadmin"));

router
  .route("/")
  .get(advancedResults(Role), async (req, res) => {
    res.status(200).json(res.advancedResults);
  })
  .post(async (req, res) => {
    try {
      const role = await Role.create(req.body);
      res.status(201).json({
        success: true,
        data: role,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  });

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const role = await Role.findById(req.params.id);

      if (!role) {
        return res.status(404).json({
          success: false,
          error: "Role not found",
        });
      }

      res.status(200).json({
        success: true,
        data: role,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  })
  .put(async (req, res) => {
    try {
      const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!role) {
        return res.status(404).json({
          success: false,
          error: "Role not found",
        });
      }

      res.status(200).json({
        success: true,
        data: role,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  })
  .delete(authorize("superadmin"), async (req, res) => {
    try {
      const role = await Role.findByIdAndDelete(req.params.id);

      if (!role) {
        return res.status(404).json({
          success: false,
          error: "Role not found",
        });
      }

      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  });

module.exports = router;

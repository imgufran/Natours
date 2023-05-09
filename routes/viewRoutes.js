const express = require("express");

const viewsController = require("./../controllers/viewsController");
const authController = require("./../controllers/authController");

const router = express.Router();

// This middleware checks if a user is logged in or not and if so, it makes available user data in pug templates.
router.use(authController.isLoggedIn);

router.get("/", viewsController.getOverview);
router.get("/tour/:slug", viewsController.getTour);
router.get("/login", viewsController.getLoginForm);

module.exports = router;  
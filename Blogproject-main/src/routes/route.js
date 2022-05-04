const express = require('express');
const router = express.Router();
const authorController= require("../controller/authorController")
const blogController= require("../controller/blogController")
const autherAuth= require("../middleware/allMiddleware")

// Author routes
router.post("/author",authorController.registerAuthor)
router.post("/login", authorController.loginAuthor)

// Blog routes
router.post("/blogs",autherAuth, blogController.createBlog)
router.get("/blogs",autherAuth, blogController.listBlog)
router.put("/blogs/:blogId",autherAuth, blogController.updatedBlog)
router.delete("/blogs/:blogId",autherAuth, blogController.deleteBlogedById)
router.delete("/blogs", autherAuth, blogController.deleteBlogByParams)


module.exports = router;
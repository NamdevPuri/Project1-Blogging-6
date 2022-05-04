const { default: mongoose } = require("mongoose")
const authorModel = require("../model/authorModel")
const blogModel = require("../model/blogModel")

const isValid = function (value) {
  if (typeof value === 'undefined' || value === null) return false
  if (typeof value === 'string' && value.trim().length === 0) return false
  return true;
}

const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0
}

const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId)
}

const createBlog = async function (req, res) {
  try {

    const requestBody = req.Body;

    if (!isValidRequestBody(requestBody)) {
      res.status(400).send({ status: false, msg: 'Please provide logs details' })
      return
    }

    // Extract params
    const { title, body, authorid, tags, category, subcategory, isPublished } = requestBody;

    // Validation starts

    if (!title) {
      res.status(400).send({ status: false, msg: 'Blog title is missing' })
      return
    }

    if (!body) {
      res.status(400).send({ status: false, msg: 'Blog body is missing' })
      return
    }

    if (!authorid) {
      res.status(400).send({ status: false, msg: 'Author id is missing' })
      return
    }

    if (!isValidObjectId(authorid)) {
      res.status(400).send({ status: false, msg: '${authorid} is not a valid authro id' })
      return
    }

    if (!category) {
      res.status(400).send({ status: false, msg: 'Blog category is missing' })
      return
    }

    // validation ends

    const blogData = {
      title,
      body,
      authorid,
      category,
      isPublished: isPublished ? isPublished : false,
      publishedAt: isPublished ? new Date() : null
    }

    if (tags) {
      if (Array.isArray(tags)) {
        blogData['tags'] = [tags]
      }
      if (Obbject.prototype.toString.call(tags) === "[object String") {
        blogData['tags'] = [tags]
      }
    }
    if (subcategory) {
      if (Array.isArray(subcategory)) {
        blogData['subcategory'] = [...subcategory]
      }
      if (Obbject.prototype.toString.call(subcategory) === "[object String") {
        blogData['subcategory'] = [subcategory]

      }
    }

    const newBlog = await blogModel.create(blogData)
    res.status(201).send({ status: true, msg: 'new blog created successfully', data: newBlog })
  } catch (err) {
    res.status(500).send({ status: false, msg: err.massage })

  }
}

const listBlog = async function (req, res) {
  try {
    const queryParams = req.query
    const filterQuery = { isDeleted: false, deletedAt: null, isPublished: true }

    if (isValidRequestBody(queryParams)) {
      const { authorid, category, tags, subcategory } = queryParams

      if (isValid(authorid) && isValidObjectId(authorid)) {
        filterQuery['authorid'] = authorid
      }
      if (isValid(category)) {
        filterQuery['category'] = category.trim()
      }
      if (isValid(tags)) {
        const tagsArr = tags.trim().split(',').map(tag => tag.trim());
        filterQuery['tags'] = { $all: tagsArr }
      }

      if (isValid(subcategory)) {
        const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
        filterQuery['subcategory'] = { $all: subcatArr }
      }
    }
    const blogs = await blogModel.find(filterQuery)

    if (Array.isArray(blogs) && blogs.length === 0) {
      res.status(404).send({ status: false, msg: 'No blogs found' })
      return
    }
    res.status(200).send({ status: true, msg: 'Blogs list', data: blogs })

  } catch (err) {

    res.status(500).send({ status: false, msg: err.massage })

  }

}

const updatedBlog = async function (req, res) {
  try {
    const requestBody = req.body;
    const params = req.params;
    const blogId = params.blogId;
    const authorIdFromToken = req.authorId

    //  validation starts

    if (!blogId) {
      res.status(400).send({ status: false, msg: `${blogId} is not a valid blog id` })
      return
    }

    if (!isValidObjectId(authorIdFromToken)) {
      res.status(400).send({ status: false, msg: `${authorIdFromToken} is not a valid token id` })
      return
    }

    const blog = await blogModel.findOne({ _id: blogId, isDeleted: false, deletedAt: null })

    if (!blog) {
      res.status(404).send({ status: false, msg: `Blog not found` })
      return
    }

    if (blog.authorId.toString() != authorIdFromToken) {
      res.status(401).send({ status: false, msg: `unauthorized access! owner info doesn't match` });
      return
    }

    if (!isValidRequestBody(requestBody)) {
      res.status(200).send({ status: true, msg: 'No parameter passed.Blog unmodified', data: blog })
      return
    }

    // Extract params
    const { title, body, tags, category, subcategory, isPublished } = requestBody;

    const updatedBlogData = {}

    if (isValid(title)) {
      if (!Object.prototype.hasOwnProperty.call(updatedBlogData, '$set')) updatedBlogData['$set'] = {}
      updatedBlogData['$set']['title'] = title
    }

    if (isValid(body)) {
      if (!Object.prototype.hasOwnProperty.call(updatedBlogData, '$set')) updatedBlogData['$set'] = {}
      updatedBlogData['$set']['body'] = body
    }

    if (isValid(category)) {
      if (!Object.prototype.hasOwnProperty.call(updatedBlogData, '$set')) updatedBlogData['$set'] = {}
      updatedBlogData['$set']['category'] = category
    }

    if (isPublished !== undefined) {
      if (!Object.prototype.hasOwnProperty.call(updatedBlogData, '$set')) updatedBlogData['$set'] = {}
      updatedBlogData['$set']['isPublished'] = isPublished
    }

    if (tags) {
      if (!Object.prototype.hasOwnProperty.call(updatedBlogData, '$addToSet')) updatedBlogData['$addToSet'] = {}
      if (Array.isArray(tags)) {
        updatedBlogData['$addToSet']['tags'] = { $each: [...tags] }
      }
      if (typeof tags === "string") {
        updatedBlogData['$addToSet']['tags'] = tags
      }
    }

    if (subcategory) {
      if (!Object.prototype.hasOwnProperty.call(updatedBlogData, '$addToSet')) updatedBlogData['$addToSet'] = {}
      if (Array.isArray(subcategory)) {
        updatedBlogData['$addToSet']['subcategory'] = { $each: [...subcategory] }
      }
      if (typeof subcategory === "string") {
        updatedBlogData['$addToSet']['subcategory'] = subcategory
      }
    }

    const updatedBlog = await blogModel.findOneAndUpdate({ _id: blogId }, updatedBlogData, { new: true })

    res.status(200).send({ status: true, massage: 'Blog updated successfully', data: updatedBlog });
  } catch (err) {
    res.status(500).send({ status: false, message: err.massage });
  }
}


const deleteBlogedById = async function (req, res) {
  try {
    const params = req.params
    const blogId = params.blogId
    const authorIdFromToken = req.authorId

    if (!isValidObjectId(blogId)) {
      res.status(400).send({ status: false, msg: `${blogId} is not a valid blog id` })
      return
    }

    if (!isValidObjectId(authorIdFromToken)) {
      res.status(400).send({ status: false, msg: `${authorIdFromToken} is not a valid token id` })
      return
    }

    const blog = await blogModel.findOne({ _id: blogId, isDeleted: false, deletedAt: null })

    if (!blog) {
      res.status(404).send({ status: false, message: `Blog not found` })
      return
    }

    if (blog.authorId.toString() !== authorIdFromToken) {
      res.status(401).send({ status: false, msg: `unauthorized acess! owner info doesn't match` })
    }

    await blogModel.findOneAndUpdate({ _id: blogId }, { $set: { isDeleted: true, deletedAt: new Date() } })
    res.status(200).send({ status: true, msg: `blog deteted successfully` })
  } catch (err) {
    res.status(500).send({ status: false, massage: err.massage })
  }
}

const deleteBlogByParams = async function (req, res) {
  try {
    const filterQuery = { isDeleted: false, deletedAt: null }
    const queryParams = req.query
    const authorIdFromToken = req.authorId

    if (!isValidObjectId(authorIdFromToken)) {
      res.status(400).send({ status: false, msg: `${authorIdFromToken} is not a valid token id` })
      return
    }

    if (!isValidRequestBody(queryParams)) {
      res.status(400).send({ status: false, msg: `No query params received. Aborting delete operation` })
      return
    }

    const { authorId, category, tags, subcategory, isPublished } = queryParams

    if (isValid(authorId) && isValidObjectId(authorId)) {
      filterQuery['authorId'] = authorId
    }

    if (isValid(category)) {
      filterQuery['category'] = category.trim()
    }

    if (isValid(isPublished)) {
      filterQuery['isPublished'] = isPublished
    }

    if (isValid(tags)) {
      const tagsArr = tags.trim().split(',').map(tags => tags.trim());
      filterQuery['tags'] = { $all: tagsArr }
    }

    if (isValid(subcategory)) {
      const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
      filterQuery['subcategory'] = { $all: subcatArr }
    }

    const blogs = await blogModel.find(filterQuery);

    if (Array.isArray(blogs) && blogs.length === 0) {
      res.status(404).send({ status: false, msg: 'No matching blogs found' })
      return
    }

    const idsOfBlogsToDelete = blogs.map(blog => {
      if (blog.authorId.toString() === authorIdFromToken)
        return blog._id
    })

    if (idsOfBlogsToDelete.length === 0) {
      res.status(404).send({ status: false, msg: 'no blogs found' })
      return
    }
    await blogModel.updateMany({ _id: { $in: idsOfBlogsToDelete } }, { $set: { isDeleted: true, deletedAt: new Date() } });
    res.status(200).send({ status: true, msg: 'Blog deleted successfully' });
  } catch (err) {
    res.send(500).send({ status: false, msg: err.massage });
  }
}

module.exports={
  createBlog,
  listBlog,
  updatedBlog,
  deleteBlogedById,
  deleteBlogByParams
}

























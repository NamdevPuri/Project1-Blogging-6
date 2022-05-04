const blogModel = require("../model/blogModel");
const jwt = require("jsonwebtoken")

const autherAuth = async  (req, res, next) => {
    try {
        let token = req.headers["x-api-key"];
        if (!token){
            res.status(401).send({ status: false, msg: "token must be present" });
            return;
        }
        let decodedToken = await jwt.verify(token, "functionup-Uranium");

        if (!decodedToken){
             res.status(401).send({ status: false, msg: "Invalid auth token in request" });
             return;
        }

        req.authorId= decodedToken.authorId;

        next()
    }catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}

module.exports= autherAuth

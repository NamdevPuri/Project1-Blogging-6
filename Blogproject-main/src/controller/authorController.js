const authorModel = require("../model/authorModel")
const jwt = require("jsonwebtoken")

const isValid= function(value){
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidTitle= function(title){
    return ["Mr","Mrs", "Miss"].indexOf(title) !==-1
}

const isValidRequestBody= function (requestBody){
    return Object.keys(requestBody).length > 0
}

const registerAuthor = async function (req, res) {
    try {
        const requestBody= req.body;

        if(!isValidRequestBody(requestBody)){
            res.status(400).send({status:false, msg:'invalid request parameters. Please provide author details'})
            return
        }

        // Extact params

        const{ fname, lname, title, email, password}= requestBody; // object destructing

        // Validation Starts

        if(!isValid(fname)){
            res.status(400).send({ status: false, msg: "First name is required"})
            return
        }

        if(!isValid(lname)){
            res.status(400).send({status:false, msg: "Last name is required"})
            return
        }

        if(!isValid(title)){
            res.status(400).send({status:false, msg: 'Title is required'})
            return
        }

        if(!isValid(title)){
            res.status(400).send({status:false, msg: 'Title should be amoung Mr,Mrs and Miss'})
            return
        }

        if(!isValid(email)){
            res.status(400).send({status: false, msg:'Email is required'})
            return
        }

        if(!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({status: false, msg:'Email should be a valid email address'})
            return
        }

        if(!isValid(password)){
            res.status(400).send({status: false, msg:'Password is required'})
            return
        }

        const isEmailAlreadyUsed= await authorModel.findOne({email}); // {email:email} object shorthand property

        if(isEmailAlreadyUsed){
            res.status(400).send({status: false, msg: `${email} Emali address is already registered`})
            return
        }
        // validation ends

        const authorData= {fname,lname,title,email,password}
        const newAuthor= await authorModel.create(authorData);

        res.status(201).send({status: true, msg: 'Author created successfully', data:newAuthor});
    }catch(err){
        res.status(500).send({status: false, msg: err.massage});
    }
}

const loginAuthor = async function (req, res) {
    try {
        const requestBody = req.body;
        if(!isValidRequestBody(requestBody)) {
            res.status(400).send({status: false, msg: 'Invalid request '})
            return
        }

        // Extract params 
        const {email, password}= requestBody;

        // Validation starts

        if(!isValid(email)){
            res.status(400).send({status: false, msg: 'Email is required'})
            return
        }

        if(!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({status: false, msg: 'Email should be a valid email address'})
            return
        }

        if(!isValid(password)) {
            res.status(400).send({status: false, msg: 'Password is required'})
            return
        }
        // Validation ends

        const author = await authorModel.findOne({email, password});

        if(!author) {
            res.status(400).send({status: false, msg:'Invalid login credentials'});
            return
        }

        let token = jwt.sign(
            {
              authorId: author._id.toString(), 
              batch: "Uranium",
              organisation: "FunctionUp",
            }, "functionup-Uranium" );

            res.setHeader("x-api-key",token);
            res.status(200).send({status: true, msg:'Author login successfull', data:{token}});        
    }catch (err) {
        res.status(500).send({status:false, msg:'err.massage'});
    }
}

module.exports ={
    registerAuthor,
    loginAuthor
}


























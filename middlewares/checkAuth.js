const jwt = require('jsonwebtoken');
const User = require('../models/user')

module.exports = (req,res,next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

        User.find({ _id: decoded.userid })
        .exec()
        .then(user => {
            if(user.length===0){
                return res.status(401).json({
                    message: "User not found"
                })
            }
            req.userData = decoded;
            next();
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({
                error: err
            })
        })

    } catch (error) {
        return res.status(401).json({
            message: "Token Expired"
        })
    }
}
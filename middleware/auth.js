const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
    try {
        const token = req.header("x-auth-token")

        if(!token){
            return res.status(401).json({
                message: "No token bye bye"
            })
        }
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET,(err, decode) => {
            if(err){
                return res.status(401).json({ message: "Token is not invalid"})
            } else {
                console.log(decode)
                req.user = decode
                // console.log('token', verifyToken)
                next()
            }
        })

        
    } catch (err) {
        console.log('Somthing Wrong in Middleware')
        res.status(500).json({ message: "Server Error"})
    }
}
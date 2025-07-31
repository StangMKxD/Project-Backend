const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ message: "Token is required" });

  const token = authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Token is required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user; 
    next();
  });
}

function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden: Insufficient rights" });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRole };


// exports.auth = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json({ message: "ไม่มี Token" });
//   }

//   const token = authHeader.split(" ")[1]; // Bearer tokenstring

//   if (!token) {
//     return res.status(401).json({ message: "ไม่มี Token" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decoded.user) {
//       return res.status(401).json({ message: "Token ผิดรูปแบบ" });
//     }

//     req.user = decoded.user;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Token ผิด" });
//   }
// };
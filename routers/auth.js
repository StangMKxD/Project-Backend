const express = require("express")
const routerz = express.Router()

const auth = require("../controllers/auth")
const user = require("../controllers/user")
const admin = require("../controllers/admin")

const { authenticateToken, authorizeRole } = require("../middleware/auth")
const { upload } = require("../middleware/upload")

// Auth login register
routerz.post("/register", auth.register)
routerz.post("/login", auth.login);

// ทุกคนดูรถได้
routerz.get("/cars", admin.getAllCars)
routerz.get("/cars/:id", admin.getCar)

// ต้อง login ก่อนถึงเข้าได้
routerz.use(authenticateToken);

// User Role
routerz.post("/user/comparecar", authenticateToken, user.addCompare)
routerz.get("/user/comparecar/", authenticateToken, user.getCompareUser)
routerz.delete("/user/comparecar/:id", authenticateToken, user.removeCompare)

routerz.get("/user/profile",authenticateToken, user.getProfile)
routerz.put("/user/updateprofile",authenticateToken, user.updateProfile)

routerz.post("/user/bookings",authenticateToken, user.createBooking)
routerz.get("/user/mybookings",authenticateToken, user.getBooking)
routerz.delete("/user/mybookings/:id", authenticateToken, user.removeBooking)

routerz.post("/user/addfavorite-cars",authenticateToken, user.addFavoriteCar)
routerz.get("/user/myfavorite-cars", authenticateToken, user.getFavoriteCar)
routerz.delete("/user/myfavorite-cars/:carId", authenticateToken,(req, res, next) => {
  console.log("ถึง route ลบแล้ว", req.params.carId);
  next();
}, user.removeFavoriteCar)


// Admin Role
routerz.get("/userlist/bookinglist",authenticateToken, authorizeRole("ADMIN"), admin.getAllBookings)
routerz.put("/userlist/bookinglist/:id", authenticateToken, authorizeRole("ADMIN"), admin.updateBookingStatus)

routerz.get("/userlist",authenticateToken, authorizeRole("ADMIN"), admin.userList)
routerz.delete("/userlist/:id",authenticateToken, authorizeRole("ADMIN"), admin.deleteUser)

routerz.post(
  "/cars",
  authenticateToken,
  authorizeRole("ADMIN"),
  upload.array("images", 10),
  admin.createCar
);
routerz.put("/cars/:id",authenticateToken, authorizeRole("ADMIN"), admin.updateCar)
routerz.delete("/cars/:id",authenticateToken, authorizeRole("ADMIN"), admin.deleteCar)

module.exports = routerz;

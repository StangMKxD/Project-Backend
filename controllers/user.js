const prisma = require('../prisma/prisma');
const { updateCar } = require('./admin');

// แก้ไข profile ของตัวเอง (เฉพาะ name, email)
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, surname, email, password, phone } = req.body;

const updateData = {};
if (name) updateData.name = name;
if (surname) updateData.surname = surname;
if (email) updateData.email = email;
if (password) updateData.password = password;
if (phone) updateData.phone = phone;

const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: updateData,
  select: { id: true, name: true, surname: true, email: true, phone: true },
});

res.json(updateCar)
}
// จองรถทดลองขับ
exports.createBooking = async (req, res) => {
  const userId = req.user.id;
  const { carId, date } = req.body;

  try {
    const booking = await prisma.booking.create({
      data: { userId, carId, date: new Date(date) },
    });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "จองไม่สำเร็จ" });
  }
};

// เพิ่มรถโปรด
exports.addFavoriteCar = async (req, res) => {
  const userId = req.user.id;
  const { carId } = req.body;

  if (!carId) {
    return res.status(400).json({ message: "carId จำเป็น" })
  }

  try {
    // เช็คว่ามีรถโปรดนี้แล้วหรือยัง
    const existing = await prisma.favouriteCar.findFirst({
      where: { userId, carId },
    });
    if (existing)
      return res.status(400).json({ message: "เพิ่มในรายการโปรดคุณแล้ว" });

    const favourite = await prisma.favouriteCar.create({
      data: { userId, carId },
    });
    res.json(favourite);
  } catch (error) {
    res.status(500).json({ message: "เพิ่มล้มเหลว" });
  }
};

// ลบ favorite car
exports.removeFavoriteCar = async (req, res) => {
  const userId = req.user.id;
  const carId = parseInt(req.params.carId, 10);

  if (!carId) {
    return res.status(400).json({ message: "carId จำเป็น" });
  }

  try {
    await prisma.favouriteCar.deleteMany({
      where: { userId, carId },
    });
    res.json({ message: "ลบรายการโปรดสำเร็จ" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "ลบรายการโปรดล้มเหลว" });
  }
};

// ดู favoritecar
exports.getFavoriteCar = async (req, res) => {
  const userId = req.user.id
  try {
    const favorites = await prisma.favouriteCar.findMany({
      where: { userId},
      include: {
        car: true
      },
    })
    res.json(favorites.map((fav) => fav.car))
  } catch (error) {
    console.error("Fetch favorite error:", error)
    res.status(500).json({message: "เกิดข้อผิดพลาด"})
  }
}

// เพิ่มเปรียบเทียบรถ
exports.addCompareCar = async (req, res) => {
  const userId = req.user.id;
  const { carAId, carBId } = req.body;

  try {
    const compare = await prisma.compareCar.create({
      data: { userId, carAId, carBId },
    });
    res.json(compare);
  } catch (error) {
    res.status(500).json({ message: "ระบบผิดพลาด" });
  }
};

// ดูโปรไฟล์ตัวเอง
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        surname: true,  
        phone: true,    
        email: true,
        role: true
      }
    })

    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" })
    }

    res.json({
      message: "โหลดข้อมูลโปรไฟล์สำเร็จ",
      user: user,
    })
  } catch (err) {
    console.error("Profile Error:", err)
    res.status(500).json({ message: "เกิดข้อผิดพลาด" })
  }
}




const prisma = require("../prisma/prisma");

exports.list = async (req, res) => {
  try {

    // if (isNaN(Number(userId))) {
    //   return res.status(400).json({ message: 'Invalid user ID' });
    // }

    const user = await prisma.user.findMany({})

    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    res.json(user);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, surname, email, password, phone } = req.body;

    // ตรวจสอบว่าผู้ใช้มีอยู่จริงไหม
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const bcrypt = require("bcrypt");
const hashedPassword = await bcrypt.hash(password, 10);

    // อัปเดตข้อมูล
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        name,
        surname,
        email,
        password: hashedPassword,
        phone,
      },
    });

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

exports.remove = async(req, res) => {
  try {
    // ดึง id ของรถยนต์ที่ต้องการลบจากพารามิเตอร์ใน URL
    const { userId } = req.params
// ตรวจสอบว่า id ที่ได้มาเป็น ตัวเลขหรือไม่
    if (isNaN(Number(userId))) {
    return res.status(400).json({ message: 'Invalid User ID' });
  }
//   เช็คว่ามีรถยนต์ที่มี id ตรงนี้อยู่ในฐานข้อมูลหรือไม่
  const existingUser = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });

  if (!existingUser) {
    return res.status(404).json({ message: 'User not found' });
  }
// ทำการลบรถยนต์ที่มี id ตรงกับพารามิเตอร์
    const remove = await prisma.user.delete({
        where: { id: Number(userId) },
    })
    res.json({ message: "Delete Successfully", remove})
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error " });
  }
};

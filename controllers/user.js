const prisma = require("../prisma/prisma");

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

  res.json(updatedUser);
};
// จองรถทดลองขับ
exports.createBooking = async (req, res) => {
  const { carId, date } = req.body;
  const userId = req.user.id;

  try {
    const newBooking = await prisma.booking.create({
      data: {
        carId,
        date: new Date(date),
        userId,
        status: "PENDING",
      },
    });

    res.json(newBooking);
  } catch (err) {
    console.error("booking error", err);
    res.status(500).json({ message: "จองไม่สำเร็จ" });
  }
};

// ดูรายการจอง
exports.getBooking = async (req, res) => {
  const userId = req.user.id;

  try {
    const bookingList = await prisma.booking.findMany({
      where: { userId },
      include: {
        car: true,
        user: true,
      },
    });

    const result = bookingList.map((booking) => ({
      id: booking.id,
      date: booking.date,
      status: booking.status,
      car: booking.car,
      user: {
        name: booking.user.name,
        surname: booking.user.surname,
      },
    }));

    res.json(result);
  } catch (err) {
    console.error("Fetch Booking error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// ลบรายการจอง
exports.removeBooking = async (req, res) => {
  const userId = req.user.id;
  const bookingId = parseInt(req.params.id);

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.userId !== userId) {
      return res.status(403).json({ message: "ไม่มีสิทธิ์ลบรายการนี้" });
    }

    if (!["PENDING", "REJECTED"].includes(booking.status)) {
      return res
        .status(400)
        .json({ message: "ไม่สามารถลบรายการที่อนุมัติแล้วได้" });
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    });

    res.json({ message: "ลบคำขอจองเรียบร้อยแล้ว" });
  } catch (err) {
    console.error("removebooking", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบ" });
  }
};

// เพิ่มรถโปรด
exports.addFavoriteCar = async (req, res) => {
  const userId = req.user.id;
  const { carId } = req.body;

  if (!carId) {
    return res.status(400).json({ message: "carId จำเป็น" });
  }

  try {
    const existing = await prisma.favouriteCar.findFirst({
      where: { userId, carId },
    });
    if (existing)
      return res.status(400).json({ message: "เพิ่มในรายการโปรดคุณแล้ว" });

    const favourite = await prisma.favouriteCar.create({
      data: { userId, carId },
    });
    res.json(favourite);
  } catch (err) {
    console.error("add favorite car", err)
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ลบรายการโปรดล้มเหลว" });
  }
};

// ดู favoritecar
exports.getFavoriteCar = async (req, res) => {
  const userId = req.user.id;
  try {
    const favorites = await prisma.favouriteCar.findMany({
      where: { userId },
      include: {
        car: true,
      },
    });
    res.json(favorites.map((fav) => fav.car));
  } catch (err) {
    console.error("get favorite error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
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
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    res.json({
      message: "โหลดข้อมูลโปรไฟล์สำเร็จ",
      user: user,
    });
  } catch (err) {
    console.error("profile error", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

exports.getCompare = async (req, res) => {
  const userId = req.user.id;

  const compare = await prisma.compareCar.findUnique({
    where: { userId },
    include: {
      carA: {
        include: {
          images: true,  // เพิ่มตรงนี้
        },
      },
      carB: {
        include: {
          images: true,  // เพิ่มตรงนี้
        },
      },
    },
  });

  res.json(compare || { carA: null, carB: null });
};

// เพิ่มหรือ toggle คันรถ
exports.toggleCompare = async (req, res) => {
  const userId = req.user.id;
  const { carId } = req.body;

  let compare = await prisma.compareCar.findUnique({ where: { userId } });

  if (!compare) {
    compare = await prisma.compareCar.create({
      data: { userId, carAId: carId },
    });
    // ส่งข้อมูลพร้อม images
    const newCompare = await prisma.compareCar.findUnique({
      where: { userId },
      include: {
        carA: { include: { images: true } },
        carB: { include: { images: true } },
      },
    });
    return res.json(newCompare);
  }

  // ถ้ามีอยู่แล้วใน carA หรือ carB
  if (compare.carAId === carId) {
    await prisma.compareCar.update({
      where: { userId },
      data: { carAId: null },
    });
  } else if (compare.carBId === carId) {
    await prisma.compareCar.update({
      where: { userId },
      data: { carBId: null },
    });
  } else if (!compare.carAId) {
    await prisma.compareCar.update({
      where: { userId },
      data: { carAId: carId },
    });
  } else if (!compare.carBId) {
    await prisma.compareCar.update({
      where: { userId },
      data: { carBId: carId },
    });
  } else {
    return res.status(400).json({ message: "สามารถเปรียบเทียบได้สูงสุด 2 คัน" });
  }

  const updated = await prisma.compareCar.findUnique({
    where: { userId },
    include: {
      carA: { include: { images: true } },
      carB: { include: { images: true } },
    },
  });

  res.json(updated);
};

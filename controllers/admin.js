const prisma = require('../prisma/prisma');

// ดูlist user
exports.list = async (req, res) => {
    try {
        const user = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ user })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "โหลดผู้ใช้ไม่สำเร็จ"})
    }
}

// ลบผู้ใช้ 
exports.deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    // ลบข้อมูล favorite cars ของ user นี้
    await prisma.favouriteCar.deleteMany({
      where: { userId },
    });

    // ลบข้อมูล booking ของ user นี้ (ถ้ามี)
    await prisma.booking.deleteMany({
      where: { userId },
    });

    // ลบข้อมูลอื่น ๆ ที่เกี่ยวข้องกับ user

    // ลบ user
    const deleted = await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ deleted });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2003') {
      return res.status(400).json({ message: "ไม่สามารถลบผู้ใช้ได้ เนื่องจากข้อมูลที่เกี่ยวข้องยังมีอยู่" });
    }
    res.status(500).json({ message: "ลบผู้ใช้ล้มเหลว" });
  }
};

// เพิ่มรถ
exports.createCar = async (req, res) => {
  const { brand, model, year, fuel, price, transmission, detail, type } = req.body;
  const files = req.files; // multer upload.array("images", 10)

  // Validate required fields
  if (!brand) return res.status(400).json({ message: "กรุณากรอกยี่ห้อรถ (brand)" });
  if (!year || isNaN(parseInt(year))) return res.status(400).json({ message: "กรุณากรอกปีรถให้ถูกต้อง" });
  if (!price || isNaN(parseInt(price))) return res.status(400).json({ message: "กรุณากรอกราคารถให้ถูกต้อง" });

  try {
    const newCar = await prisma.car.create({
      data: {
        brand,
        model,
        year: parseInt(year),
        fuel,
        price: parseInt(price),
        transmission,
        detail,
        type,
        images: {
          create: files.map((file) => ({
            url: `/uploads/${file.filename}`,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    res.status(201).json({ message: "สร้างรถสำเร็จ", car: newCar });
  } catch (error) {
    console.error("สร้างรถไม่สำเร็จ:", error);
    res.status(500).json({ message: "สร้างรถไม่สำเร็จ" });
  }
};


// แก้ไขรถ
exports.updateCar = async (req, res) => {
  const id = Number(req.params.id);
  const { brand, model, year, fuel, price, transmission, imageUrl, detail, type } =
    req.body;

  try {
    const car = await prisma.car.update({
      where: { id },
      data: { brand, model, year, fuel, price, transmission, imageUrl, detail, type },
    });
    res.json(car);
  } catch (error) {
    res.status(404).json({ message: "ไม่เจอรถที่จะแก้ไข" });
  }
};

// ลบรถ


exports.deleteCar = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const car = await prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      return res.status(404).json({ message: "ไม่เจอรถที่จะลบ" });
    }

    // ลบข้อมูลที่ FK ไปยังรถก่อน เช่น รูปภาพ
    await prisma.image.deleteMany({
      where: { carId: id },
    });

    // ลบ favouriteCars
    await prisma.favouriteCar.deleteMany({
      where: { carId: id },
    });

    // ลบ bookings
    await prisma.booking.deleteMany({
      where: { carId: id },
    });

    // ลบ compareCars ทั้งที่เป็น carA หรือ carB
    await prisma.compareCar.deleteMany({
      where: {
        OR: [{ carAId: id }, { carBId: id }],
      },
    });

    // ลบรถ
    await prisma.car.delete({
      where: { id },
    });

    res.json({ message: "ลบรถสำเร็จ", deleted: car });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดขณะลบรถ", error: error.message });
  }
};

// ดึงรถทั้งหมด (สำหรับ admin กับ user)
exports.getAllCars = async (req, res) => {
  try {
    const cars = await prisma.car.findMany({
      include: {
        images: true
      }
    });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: "Fetch ข้อมูลรถล้มเหลว" });
  }
};
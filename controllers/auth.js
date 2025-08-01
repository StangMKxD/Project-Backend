const prisma = require('../prisma/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron')

exports.register = async (req, res) => {
  try {
    const { name, surname, email, password, phone } = req.body;

    // ตรวจสอบว่าข้อมูลครบ
    if (!name || !surname || !email || !password || !phone) {
      return res.status(400).json({ message: 'กรอกข้อมูลให้ครบ' });
    }

    // ตรวจสอบรูปแบบ email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' });
    }

    // ตรวจสอบความยาวและตัวอักษร password
    if (password.length < 8 || !/[a-zA-Z]/.test(password)) {
      return res.status(400).json({
        message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และมีตัวอักษรอย่างน้อย 1 ตัว',
      });
    }

    // เช็ค email ซ้ำ
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    // เช็ค phone ซ้ำ
    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ message: 'เบอร์นี้ถูกใช้งานแล้ว' });
    }

    // เข้ารหัส password
    const hashedPassword = await bcrypt.hash(password, 10);

   

    // สร้างผู้ใช้ในฐานข้อมูล
    const user = await prisma.user.create({
      data: {
        name,
        surname,
        email,
        password: hashedPassword,
        phone,
      },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    return res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จแล้วเข้าสู่ระบบเลย',
      user,
    });
  } catch (err) {
    console.error('สมัครสมาชิกไม่สำเร็จ', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ server' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ตรวจสอบข้อมูลครบ
    if (!email || !password) {
      return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' });
    }

    // หา user ด้วย email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: 'ไม่พบผู้ใช้นี้' });
    }

    // ตรวจสอบ password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
    }

    // สร้าง payload สำหรับ JWT (ไม่ใส่ password)
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // ตรวจสอบว่ามี secret กำหนดหรือไม่
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET ไม่ได้ตั้งค่าใน environment');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // สร้าง token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: payload,
      token,
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
};

exports.startBookingCleanupJob = () => {
  // รันทุกวันตอนเที่ยงคืน
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Running booking cleanup job...");

    const today = new Date();

    try {
      // ลบ APPROVED ที่วัน <= วันนี้
      const approvedDeleted = await prisma.booking.deleteMany({
        where: {
          status: "APPROVED",
          date: {
            lte: today,
          },
        },
      });

      // ลบ REJECTED ทั้งหมด
      const rejectedDeleted = await prisma.booking.deleteMany({
        where: {
          status: "REJECTED",
        },
      });

      console.log(`✅ Deleted ${approvedDeleted.count} APPROVED bookings`);
      console.log(`🗑️ Deleted ${rejectedDeleted.count} REJECTED bookings`);
    } catch (error) {
      console.error("🔥 Error in cleanup job:", error);
    }
  });
};



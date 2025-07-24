const prisma = require('../prisma/prisma')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
  try {
    const { name, surname, email, password, phone } = req.body;
//  ตรวจสอบว่า field ไม่ว่าง
    if (!name || !surname || !email || !password || !phone) {
      return res.status(400).json({ message: 'กรอกข้อมูลให้ครบ' });
    }
     //  ตรวจสอบว่า email มี @
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' });
    }
    //  ตรวจสอบ password: มากกว่า 8 ตัวและมีตัวอักษร
    if (password.length < 8 || !/[a-zA-Z]/.test(password)) {
      return res.status(400).json({ message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และมีตัวอักษรอย่างน้อย 1 ตัว' });
    }

//  เช็คว่ามี email ซ้ำหรือยัง
    const existingGmail = await prisma.user.findUnique({ where: { email } });
    if (existingGmail) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }
//  เช็คว่ามี phone ซ้ำหรือยัง
    const existingPhone = await prisma.user.findUnique({ where: { phone } })
    if (existingPhone) {
        return res.status(400).json({ message: 'เบอร์นี้ถูกใช้งานแล้ว '})
    }
//  Hash รหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);
//  บันทึกผู้ใช้ลง database
    const user = await prisma.user.create({
      data: {
        name,
        surname,
        email,
        password: hashedPassword,
        phone,
      },
    });

    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', user });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ server' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ตรวจสอบว่ามี email นี้หรือไม่
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(400).json({ message: "ไม่พบผู้ใช้นี้" });
    }

    // ตรวจสอบ password โดยใช้ bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    const payload = {
        user:{
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        }
    }

    const token = jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn: '1d'
    })

    res.json({
        message: "เข้าสู่ระบบสำเร็จ",
        user:payload.user,
        token: token
    })

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
  }
};
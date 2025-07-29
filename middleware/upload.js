
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// สร้างโฟลเดอร์ uploads หากยังไม่มี
const uploadPath = path.join("uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// กำหนด storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

module.exports = { upload };
// ✅ ตรวจสอบ MIME Type
// const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
//   const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type. Only JPG/PNG allowed."));
//   }
// };

// // ✅ สร้าง middleware อัปโหลดพร้อมตั้งขนาดไฟล์
// export const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดไฟล์ 5MB
//   fileFilter,
// });

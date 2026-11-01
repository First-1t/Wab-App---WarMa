# Field

Input พร้อม label และข้อความช่วย/error สำหรับฟอร์มกรอกข้อมูล เช่นหน้า wizard

## การใช้
- ครอบ label + input + ข้อความด้วย `.field`
- error: เพิ่ม `.has-error` บน `.field` และใช้ `.error-msg` แทน `.hint` — ขึ้นต้นข้อความด้วยสัญลักษณ์ (✕) เสมอ ไม่ใช้แค่สีแดงอย่างเดียว
- Focus ใช้ `secondary` เป็นสีขอบ ไม่ใช่ `primary` เพื่อไม่ให้ปนกับสีปุ่ม action

## ยังไม่ทำ (รอบถัดไป)
- select / checkbox / radio
- dropdown สำหรับเลือก 1 ใน 3 สายพันธุ์มันสำปะหลังโดยเฉพาะ

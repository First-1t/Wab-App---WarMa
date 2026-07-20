# ระบบการแยกทำงาน GitHub ↔ VSCode (WarMa Web App)

## ภาพรวม

```
GitHub (ออนไลน์)                 VSCode (ในเครื่อง)
┌─────────────────┐              ┌─────────────────┐
│  main    ← โค้ดจริง │ ◄── Pull Request ── │  develop ← ที่ทำงาน │
│  develop ← สำรอง   │ ◄──── git push ──── │  (แก้ไฟล์ที่นี่)     │
└─────────────────┘              └─────────────────┘
```

| Branch | อยู่ที่ไหน | ใช้ทำอะไร | ใครแก้ได้ |
|--------|-----------|-----------|-----------|
| `main` | GitHub | โค้ดเวอร์ชันจริงที่เสถียร | รวมผ่าน Pull Request เท่านั้น |
| `develop` | VSCode + GitHub | พัฒนา/ทดลองงานประจำวัน | แก้ได้เต็มที่ใน VSCode |

## ขั้นตอนทำงานประจำวัน (ใน VSCode)

1. **ก่อนเริ่มงาน** — ดึงโค้ดล่าสุดจาก GitHub มาก่อน
   ```
   git checkout develop
   git pull origin develop
   ```

2. **แก้โค้ดใน VSCode** ตามปกติ แล้วบันทึกงาน (commit)
   ```
   git add .
   git commit -m "อธิบายว่าแก้อะไร"
   ```
   หรือใช้แท็บ **Source Control** (ไอคอนกิ่งไม้ด้านซ้ายของ VSCode) → พิมพ์ข้อความ → กด ✓ Commit

3. **ส่งขึ้น GitHub** (สำรองงาน)
   ```
   git push origin develop
   ```
   หรือกดปุ่ม **Sync Changes** ใน VSCode

## เมื่องานเสร็จพร้อมใช้จริง → รวมเข้า main

1. เปิด GitHub → จะเห็นปุ่ม **Compare & pull request** (develop → main)
2. กด **Create pull request** → ตรวจโค้ด → กด **Merge pull request**
3. กลับมาที่ VSCode อัปเดต main ในเครื่อง:
   ```
   git checkout main
   git pull origin main
   git checkout develop
   ```

## กฎสำคัญ

- ❌ **ห้าม** แก้โค้ดบน branch `main` ตรงๆ (ทั้งใน VSCode และหน้าเว็บ GitHub)
- ❌ **ห้าม** อัปโหลดไฟล์ผ่านหน้าเว็บ GitHub (Add files via upload) — ให้ push จาก VSCode เท่านั้น ไม่งั้นโค้ดในเครื่องกับบน GitHub จะไม่ตรงกัน
- ✅ ทำงานบน `develop` เสมอ — เช็ค branch ปัจจุบันได้ที่มุมล่างซ้ายของ VSCode
- ✅ push ขึ้น GitHub ทุกครั้งที่เลิกงาน เพื่อสำรองโค้ด

## ถ้าอยากทำฟีเจอร์ใหญ่แยกต่างหาก (ขั้นสูง)

แตก branch ย่อยจาก develop:
```
git checkout develop
git checkout -b feature/ชื่อฟีเจอร์
```
เสร็จแล้วรวมกลับเข้า develop ผ่าน Pull Request เหมือนกัน

// เปิดฐานข้อมูล PostgreSQL สำหรับพัฒนา ผ่าน Docker (docker-compose.yml ที่ root ของโปรเจกต์)
// 1. ถ้า Docker ยังไม่เปิด → เปิด Docker Desktop ให้แล้วรอ
// 2. docker compose up -d  (ข้อมูลเก็บใน volume warma-pgdata ไม่หายตอนปิดเครื่อง)
// 3. รอจน PostgreSQL พร้อมรับการเชื่อมต่อ
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const sleep = (ms) =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const run = (cmd) =>
  spawnSync(cmd, { cwd: ROOT, encoding: 'utf8', shell: true });

const dockerUp = () => run('docker info --format "{{.ServerVersion}}"').status === 0;

function startDockerDesktop() {
  const candidates = [
    path.join(process.env.LOCALAPPDATA ?? '', 'Programs', 'DockerDesktop', 'Docker Desktop.exe'),
    path.join(process.env.ProgramFiles ?? 'C:\\Program Files', 'Docker', 'Docker', 'Docker Desktop.exe'),
  ];
  const exe = candidates.find((p) => fs.existsSync(p));
  if (process.platform === 'darwin') {
    spawn('open', ['-a', 'Docker'], { detached: true, stdio: 'ignore' }).unref();
  } else if (exe) {
    spawn(exe, [], { detached: true, stdio: 'ignore' }).unref();
  } else {
    return false;
  }
  return true;
}

if (!dockerUp()) {
  console.log('[db] Docker ยังไม่เปิด — กำลังเปิด Docker Desktop…');
  if (!startDockerDesktop()) {
    console.error('[db] ไม่พบ Docker Desktop — ติดตั้งจาก https://www.docker.com/products/docker-desktop/');
    process.exit(1);
  }
  let ok = false;
  for (let i = 0; i < 60 && !ok; i++) {
    sleep(3000);
    ok = dockerUp();
  }
  if (!ok) {
    console.error('[db] Docker ยังไม่พร้อม — เปิด Docker Desktop เอง รอจนขึ้นว่า running แล้วรัน npm run dev อีกครั้ง');
    process.exit(1);
  }
}

const up = run('docker compose up -d db');
if (up.status !== 0) {
  console.error('[db] เปิดฐานข้อมูลใน Docker ไม่สำเร็จ:\n' + up.stderr);
  process.exit(1);
}

for (let i = 0; i < 30; i++) {
  if (run('docker compose exec -T db pg_isready -U warma -d warma').status === 0) {
    console.log('[db] เปิดฐานข้อมูลแล้ว (PostgreSQL ใน Docker, localhost:5432)');
    process.exit(0);
  }
  sleep(2000);
}
console.error('[db] PostgreSQL ใน Docker ยังไม่พร้อม — ลองรัน npm run dev อีกครั้ง');
process.exit(1);

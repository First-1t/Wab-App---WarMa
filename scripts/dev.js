import { spawn } from 'child_process';

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('==============================================');
console.log(' Starting WarMa Output Module (Full-Stack Dev) ');
console.log('==============================================');

// Spawn Backend
const backend = spawn(npmCmd, ['--prefix', 'backend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

// Spawn Frontend
const frontend = spawn(npmCmd, ['--prefix', 'frontend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  console.log('\nShutting down dev servers...');
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

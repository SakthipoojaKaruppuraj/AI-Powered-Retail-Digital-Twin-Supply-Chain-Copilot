import { spawn } from 'child_process';

console.log('🚀 Starting WMS Backend Server & Frontend Vite Dev Server...\n');

// 1. Spawn Backend REST API Server on port 3001
const server = spawn('node', ['backend/server.js'], {
  stdio: 'inherit',
  shell: true
});

// 2. Spawn Frontend Vite Dev Server on port 5173
const vite = spawn('npx', ['vite', 'frontend'], {
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  if (server) server.kill();
  if (vite) vite.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

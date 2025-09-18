#!/usr/bin/env node

// Simple script to start the Next.js development server
const { spawn } = require('child_process');
const path = require('path');

const nextBin = path.resolve(__dirname, 'node_modules/.bin/next');
const child = spawn(nextBin, ['dev'], { 
  stdio: 'inherit',
  env: process.env,
  shell: true
});

child.on('error', (err) => {
  console.error('Failed to start Next.js server:', err);
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`Next.js server exited with code ${code}`);
  }
});

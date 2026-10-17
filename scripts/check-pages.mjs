import { spawn } from 'node:child_process'

// Run server and browser checks in the same local environment.
process.env.PAGES_BASE_PATH ||= '/elias-painting-preview/'
process.env.PREVIEW_URL = `http://127.0.0.1:4187${process.env.PAGES_BASE_PATH}`
process.env.REPORT_DIR = 'reports/github-pages'
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--configLoader', 'runner', '--port', '4187'], {
  env: process.env, stdio: 'pipe', windowsHide: true,
})
let failure
server.on('error', error => { failure = error })
server.stderr.on('data', data => process.stderr.write(data))
try {
  let ready = false
  for (let attempt = 0; attempt < 50; attempt++) {
    if (failure) throw failure
    if (server.exitCode !== null) throw new Error('Preview server exited')
    try { ready = (await fetch(process.env.PREVIEW_URL)).ok } catch {}
    if (ready) break
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  if (!ready) throw new Error('Preview server unavailable')
  await import('./check-browser.mjs')
} finally {
  server.kill()
}

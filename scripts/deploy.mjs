import { execSync } from 'child_process'
import { rmSync, cpSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const REPO = '/home/z/my-project/MCToolKit'
const DIST = join(REPO, 'dist')
const TMP  = '/tmp/mctoolkit-ghpages'

function run(cmd) {
  console.log(`> ${cmd}`)
  return execSync(cmd, { cwd: REPO, stdio: 'pipe', timeout: 60000 }).toString().trim()
}

try {
  // Clone gh-pages to temp
  console.log('Cloning gh-pages...')
  rmSync(TMP, { recursive: true, force: true })
  run(`git clone --branch gh-pages --single-branch . ${TMP}`)

  // Remove old deploy files (everything except .git)
  for (const f of readdirSync(TMP)) {
    if (f === '.git') continue
    rmSync(join(TMP, f), { recursive: true, force: true })
  }

  // Copy new build
  console.log('Copying dist...')
  for (const f of readdirSync(DIST)) {
    cpSync(join(DIST, f), join(TMP, f), { recursive: true })
  }

  // Commit and push
  console.log('Pushing...')
  run(`git -C ${TMP} add -A`)
  try { run(`git -C ${TMP} commit -m 'deploy'`) } catch(e) { console.log('No changes to commit') }
  run(`git -C ${TMP} push origin gh-pages`)

  console.log('Deployed!')
} catch (e) {
  console.error('Deploy failed:', e.message)
  process.exit(1)
} finally {
  rmSync(TMP, { recursive: true, force: true })
  // NEVER touch the source repo, only clean temp
}

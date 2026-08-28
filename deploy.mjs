import { execSync } from 'child_process'
import { rmSync, cpSync, mkdirSync } from 'fs'
import { join } from 'path'

const TMP = '/tmp/mcdeploy'
// Get remote URL from git config (preserves token)
const REPO = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim()
const DIST = join(process.cwd(), 'dist')

// Clone gh-pages to temp dir (safe, never touches working tree)
rmSync(TMP, { recursive: true, force: true })
mkdirSync(TMP, { recursive: true })
execSync(`git clone --depth 1 --branch gh-pages ${REPO} ${TMP}`, { stdio: 'inherit' })

// Replace all files in gh-pages with dist
rmSync(join(TMP, '*'), { recursive: true, force: true })
cpSync(DIST, TMP, { recursive: true })

// Commit and push
execSync('git add -A', { cwd: TMP, stdio: 'inherit' })
try {
  execSync('git commit -m "deploy: update site"', { cwd: TMP, stdio: 'inherit' })
  execSync('git push origin gh-pages', { cwd: TMP, stdio: 'inherit' })
  console.log('✅ Deployed to gh-pages')
} catch {
  console.log('ℹ️ No changes to deploy')
}

// Cleanup
rmSync(TMP, { recursive: true, force: true })

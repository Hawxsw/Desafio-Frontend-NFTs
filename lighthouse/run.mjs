import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { chromium } from '@playwright/test'
import * as chromeLauncher from 'chrome-launcher'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'
import { CATEGORIES, METRICS, PAGES, PREVIEW_PORT, PROFILES, RUNS, TARGETS } from './config.mjs'

const root = path.resolve(import.meta.dirname, '..')
const reportsDir = path.join(import.meta.dirname, 'reports')
const baseUrl = `http://localhost:${PREVIEW_PORT}`

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

async function waitForServer(url, attempts = 60) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
  throw new Error(`Servidor de preview não respondeu em ${url}`)
}

function startPreview() {
  return spawn('pnpm', ['preview', '--port', String(PREVIEW_PORT), '--strictPort'], {
    cwd: root,
    shell: true,
    stdio: 'ignore',
  })
}

async function audit(url, profile, chrome) {
  const result = await lighthouse(
    url,
    { port: chrome.port, output: ['html', 'json'], logLevel: 'error', onlyCategories: CATEGORIES },
    profile === 'desktop' ? desktopConfig : undefined,
  )
  return result
}

async function main() {
  await mkdir(reportsDir, { recursive: true })
  const preview = startPreview()
  const rows = []

  try {
    await waitForServer(baseUrl)
    const chromePath = chromium.executablePath()

    for (const page of PAGES) {
      for (const profile of PROFILES) {
        const runs = []
        for (let run = 1; run <= RUNS; run += 1) {
          const chrome = await chromeLauncher.launch({ chromePath, chromeFlags: ['--headless=new', '--no-sandbox'] })
          try {
            const { lhr, report } = await audit(`${baseUrl}${page.path}`, profile, chrome)
            const file = path.join(reportsDir, `${page.name}-${profile}-run${run}`)
            await writeFile(`${file}.report.html`, report[0])
            await writeFile(`${file}.report.json`, report[1])
            runs.push({
              scores: Object.fromEntries(CATEGORIES.map((category) => [category, Math.round(lhr.categories[category].score * 100)])),
              metrics: Object.fromEntries(
                Object.entries(METRICS).map(([label, id]) => [label, lhr.audits[id].numericValue]),
              ),
              chromeVersion: lhr.environment.hostUserAgent,
              lighthouseVersion: lhr.lighthouseVersion,
            })
            console.log(`${page.name} ${profile} #${run}:`, runs.at(-1).scores)
          } finally {
            await chrome.kill()
          }
        }

        rows.push({
          page: page.name,
          path: page.path,
          profile,
          median: Object.fromEntries(CATEGORIES.map((category) => [category, median(runs.map((run) => run.scores[category]))])),
          metrics: Object.fromEntries(
            Object.keys(METRICS).map((label) => [label, median(runs.map((run) => run.metrics[label]))]),
          ),
          runs,
        })
      }
    }
  } finally {
    preview.kill()
  }

  const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
  const summary = {
    generatedAt: new Date().toISOString(),
    environment: {
      lighthouse: rows[0]?.runs[0]?.lighthouseVersion,
      chrome: rows[0]?.runs[0]?.chromeVersion,
      node: process.version,
      os: `${os.type()} ${os.release()} (${os.arch()})`,
      cpu: os.cpus()[0]?.model,
      build: 'vite build + vite preview, VITE_ENABLE_MSW=true, cenário padrão',
      app: `${packageJson.name}@${packageJson.version}`,
    },
    targets: TARGETS,
    results: rows,
  }
  await writeFile(path.join(import.meta.dirname, 'summary.json'), JSON.stringify(summary, null, 2))

  const lines = [
    '| Página | Perfil | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS | TBT (ms) |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...rows.map(
      (row) =>
        `| ${row.page} | ${row.profile} | ${row.median.performance} | ${row.median.accessibility} | ${row.median['best-practices']} | ${row.median.seo} | ${Math.round(row.metrics.LCP)} | ${row.metrics.CLS.toFixed(3)} | ${Math.round(row.metrics.TBT)} |`,
    ),
  ]
  await writeFile(path.join(import.meta.dirname, 'summary.md'), `${lines.join('\n')}\n`)
  console.log(lines.join('\n'))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

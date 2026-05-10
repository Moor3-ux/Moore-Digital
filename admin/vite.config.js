import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

// ── Build identification ───────────────────────────────────────────────────────
// Injected as window.__MDS_BUILD__ — readable in DevTools and the Settings page.
// CODEBUILD_RESOLVED_SOURCE_VERSION is set automatically by Amplify/CodeBuild.
function getCommit() {
  if (process.env.CODEBUILD_RESOLVED_SOURCE_VERSION) {
    return process.env.CODEBUILD_RESOLVED_SOURCE_VERSION.slice(0, 7)
  }
  try {
    return execSync('git rev-parse --short HEAD', { stdio: 'pipe' }).toString().trim()
  } catch {
    return 'local'
  }
}

export default defineConfig(({ mode }) => {
  const commit = getCommit()
  const builtAt = new Date().toISOString()

  return {
    plugins: [react()],

    // CRITICAL: base must be '/admin/' so all asset references are rooted
    // at /admin/ in production. Matches the Amplify subdirectory deployment.
    base: '/admin/',

    define: {
      __MDS_BUILD__: JSON.stringify({
        panel:        'mds-panel',
        version:      '1.0.0',
        commit,
        // frontendHash: commit + short timestamp — unique identifier per build.
        // The actual Vite content hash is appended to asset filenames; this
        // gives a human-readable build fingerprint for the Settings page.
        frontendHash: `${commit}-${Date.now().toString(36)}`,
        builtAt,
        env: mode,
      }),
    },

    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          // Vendor split keeps React cache across panel code changes.
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
      chunkSizeWarningLimit: 500,
    },

    server: {
      port: 5174,
      strictPort: false,
    },
  }
})

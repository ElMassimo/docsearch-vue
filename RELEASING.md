# Releasing

Releases are published to npm by `.github/workflows/release.yml` when a GitHub release is published. Authentication uses npm trusted publishing with GitHub Actions OIDC; no npm token is stored in GitHub.

## One-time bootstrap

npm requires a package to exist before a trusted publisher can be configured. For the first release only:

1. Run the complete verification on `main`:

   ```sh
   pnpm verify
   pnpm audit --prod
   ```

2. Publish from a trusted local machine using an npm one-time password:

   ```sh
   pnpm publish --no-provenance --otp=<current-code>
   ```

3. Open the package settings on npmjs.com and add a **Trusted Publisher → GitHub Actions** with:

   - Organization or user: `ElMassimo`
   - Repository: `docsearch-vue`
   - Workflow filename: `release.yml`
   - Environment: `npm`
   - Allowed action: direct publishing with `npm publish`

4. Ensure the `npm` environment exists in the GitHub repository. No `NPM_TOKEN` secret is required.
5. Protect `main` and require the CI workflow before merge.

Trusted publishing requires npm CLI 11.5.1 or newer and Node.js 22.14.0 or newer. The release workflow pins compatible versions and has `id-token: write` permission.

## Release checklist

1. Update `version` in `package.json`.
2. Add the release notes to `CHANGELOG.md`.
3. Run the complete local verification:

   ```sh
   pnpm verify
   PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm test:e2e
   pnpm audit --prod
   npm pack --dry-run
   ```

4. Merge the release commit to `main` after CI passes.
5. Publish a GitHub release tagged with the package version, for example `v0.2.0`.
6. Confirm the package and provenance on npm:

   ```sh
   npm view @mussi/docsearch-vue version
   npm view @mussi/docsearch-vue dist.integrity
   ```

7. Install the published version in a clean VitePress fixture and smoke-test search, routing, and CSS.

The release workflow rejects tags that do not match `package.json`.

## Rollback

npm releases are immutable. If a release is broken:

1. Deprecate the affected version with a clear message.
2. Revert or fix the change on `main`.
3. Publish a patch release through the normal workflow.
4. Verify the VitePress smoke test against the patch version.

Avoid unpublishing unless the release contains a security issue or sensitive data.

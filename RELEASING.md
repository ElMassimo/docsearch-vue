# Releasing

Releases are published to npm by `.github/workflows/release.yml` when a GitHub release is published.

## One-time setup

1. Create an `npm` environment in the GitHub repository.
2. Add an `NPM_TOKEN` environment secret with publish access to `@mussi/docsearch-vue`.
3. Require approval for the `npm` environment if releases need a manual gate.
4. Protect `main` and require the CI workflow before merge.

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
5. Publish a GitHub release tagged with the package version, for example `v0.1.0`.
6. Approve the `npm` environment deployment when prompted.
7. Confirm the package and provenance on npm:

   ```sh
   npm view @mussi/docsearch-vue version
   npm view @mussi/docsearch-vue dist.integrity
   ```

8. Install the published version in a clean VitePress fixture and smoke-test search, routing, and CSS.

The release workflow rejects tags that do not match `package.json`.

## Rollback

npm releases are immutable. If a release is broken:

1. Deprecate the affected version with a clear message.
2. Revert or fix the change on `main`.
3. Publish a patch release through the normal workflow.
4. Verify the VitePress smoke test against the patch version.

Avoid unpublishing unless the release contains a security issue or sensitive data.

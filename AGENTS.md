# Repository Instructions

- After every code change, run the appropriate build and restart this plugin so
  Stream Deck loads the updated code.
- Prefer `bun x streamdeck restart net.aosankaku.cpu-partyparrot` for the
  restart. If restarting only the plugin is unavailable or fails, restart the
  Stream Deck application instead.
- Before publishing a release, prepare release notes from the commits since the
  previous release. Include an English `## Changes` section describing the
  changes and an English `## Verification` section listing the completed
  checks.
- GitHub Actions must be the sole creator of GitHub Releases so the release
  author is consistently `github-actions[bot]`. Never pre-create a release
  manually or with `gh release create`.
- Publish releases in this order: push the version tag, wait for the
  tag-triggered publishing workflow to create the release and upload the
  `.streamDeckPlugin`, then use `gh release edit` to apply the prepared release
  notes.
- Add those release notes to the GitHub Release body. Do not consider a release
  complete until both the release body and the `.streamDeckPlugin` attachment
  have been verified.
- Obtain explicit user authorization before pushing a release tag, creating or
  editing a GitHub Release, or sending plugin contents to Elgato's validation
  service.

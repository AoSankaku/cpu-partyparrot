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
- Add those release notes to the GitHub Release body. Do not consider a release
  complete until both the release body and the `.streamDeckPlugin` attachment
  have been verified. If the publishing workflow creates an empty body, update
  the existing release after publication.
- Obtain explicit user authorization before pushing a release tag, creating or
  editing a GitHub Release, or sending plugin contents to Elgato's validation
  service.

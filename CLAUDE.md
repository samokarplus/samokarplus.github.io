# samo.karplus.org personal site: instructions for AI coding agents (Claude Code)

(The same rules are in AGENTS.md for other agents.)

Static personal website served by GitHub Pages from `main` (custom domain in `CNAME`). The owner edits it through the `/edit/` page and GitHub Actions buttons (see EDITING.md); keep it working for a non-technical editor.

## Development and CI policy (applies to every session, human or AI agent)

GitHub Actions minutes on private repositories are a limited resource shared across all of the owner's projects (2,000 a month on the free plan). A single careless push can cost more than a normal day's allowance. Follow these rules in every session:

1. **Deliver working, maintainable software first.** Tests exist to protect that goal, not to be the activity.
2. **Run the smallest meaningful set of tests during ordinary development**: the test file for the code you changed, then the type check and lint.
3. **Validate locally before pushing**, not by pushing and waiting for CI. Local runs cost nothing.
4. **Do not repeat full-suite runs without a specific reason** (a shared dependency, build or test-infrastructure change, a release, or a failure you cannot localize).
5. **Do not push small intermediate commits just to see CI.** Batch the work, check it locally, push once. Every push to a pull request branch can start a run.
6. **Preserve essential safeguards**: type checks, lint, security and secret scans, dependency audits, accessibility checks, deployment verification. Do not remove or weaken them to save minutes.
7. **Escalate testing with risk and scope.** A copy edit needs none; a feature needs its own tests; a migration, a shared layout, a dependency upgrade or a release needs the broad suite.
8. **Never bypass required checks, skip hooks, or misreport results.** If a test fails, say so with the output. If you did not run something, say that.
9. **Do not add recurring automation (schedules, new always-on workflows, matrix expansion) without stating its monthly minute cost** and getting approval.
10. **Treat Actions minutes as shared and finite.** Prefer local or manually triggered runs; use path filters, concurrency groups with cancel-in-progress, timeouts and caching in any workflow you write. Never enable paid usage or raise a spending limit.

### How this repository applies the policy
- This is a public repository, so GitHub-hosted runner minutes are not billed, but the same discipline applies: every push to `main` publishes the site and may start workflows, so batch changes and push once.
- Existing workflows are the site's own automation and must keep working: Add Journal Entry, Add Place, Set Section Order, Sync Photo Carousels, Check Data Files (data-file pushes only) and the daily Update Strava Data. They are manual or path-filtered already; do not add schedules or broaden triggers.
- There is no test suite. Validate by running `python3 scripts/check-data.py` after touching a `*-data.js` file, and by opening `index.html` locally for layout changes.
- Do not change `CNAME`, DNS or Pages settings, and never expose the Strava secrets.


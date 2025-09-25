# Branch Protection Setup

To require tests to pass before merging to main, set up branch protection rules:

## Steps:

1. Go to your GitHub repository
2. Click **Settings** → **Branches**
3. Click **Add rule** next to "Branch protection rules"
4. Configure:
   - **Branch name pattern**: `main`
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
   - ✅ **Require branches to be up to date before merging**
   - Select these status checks:
     - `test-frontend`
     - `test-lambda` 
     - `pr-tests`
   - ✅ **Restrict pushes that create files**
   - ✅ **Do not allow bypassing the above settings**

5. Click **Create**

## What This Does:

- **No direct pushes to main** - All changes must go through PRs
- **Tests must pass** - PRs can't be merged if tests fail
- **Up-to-date branches** - Must rebase/merge latest main before merging
- **Status checks** - All CI workflows must succeed

## Workflow:

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit
3. Push: `git push origin feature/my-feature`
4. Create PR to main
5. Tests run automatically
6. If tests pass ✅ → PR can be merged
7. If tests fail ❌ → Fix issues, push again

This ensures main branch always has working, tested code!
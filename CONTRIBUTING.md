# Contributing to n8n Automation Workbench

This project builds a holistic n8n automation platform supporting diverse activities at scale: workflow automation, web scraping, CRUD operations, and build-test-deploy pipelines.

Contributions are welcome. This is a side project with no SLA, but we support each other per our [Code of Conduct](CODE_OF_CONDUCT.md).

## Table of Contents

- [Project Philosophy](#project-philosophy)
- [How to Contribute](#how-to-contribute)
  - [Adding a New Workflow](#adding-a-new-workflow)
  - [Improving Existing Workflows](#improving-existing-workflows)
  - [Documentation](#documentation)
  - [Shared Libraries](#shared-libraries)
- [Development Setup](#development-setup)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Project Philosophy

### Discrete Workflows
Each workflow is self-contained in `workflows/[name]/` with:
- `README.md` - Purpose, prerequisites, value proposition
- `ACTIONS.md` - Step-by-step actions (1-5 actions, 1-5 steps each)
- `config.example.json` - Required configuration template

### Agent-Friendly
Documentation is structured for both humans and AI assistants:
- Sequential file reading (numbered files: 00, 01, 02...)
- Clear action/step breakdowns
- Explicit prerequisites and verification steps

### DRY Principle
Shared code lives in `lib/`:
- `lib/n8n/` - n8n code node helpers
- `lib/python/` - Python utilities
- `lib/prompts/` - LLM prompt templates

## How to Contribute

### Adding a New Workflow

1. **Copy the template:**
   ```bash
   cp -r workflows/_template workflows/your-workflow-name
   ```

2. **Document the workflow:**
   - Edit `README.md` with purpose, value prop, prerequisites
   - Edit `ACTIONS.md` with action/step breakdown
   - Edit `config.example.json` with required settings

3. **Implement and test:**
   - Build the workflow in n8n UI
   - Export to `workflow.json`
   - Add supporting scripts to `workflows/your-workflow-name/scripts/`

4. **Submit PR** with workflow folder and documentation

### Improving Existing Workflows

1. Read the workflow's `README.md` and `ACTIONS.md`
2. Test current implementation
3. Make changes, update documentation
4. Submit PR referencing the workflow name and "Fixes #XXXX" to resolve issue number XXXX.

### Documentation

Documentation improvements are highly valued. We prefer documentation to be as close to the code as possible, rather than in a separate location:
- Fix unclear instructions
- Add troubleshooting tips
- Improve action/step descriptions
- Update for new n8n versions

### Shared Libraries

When adding to `lib/`:
- Keep functions focused and reusable
- Document parameters and return values
- Add usage examples in comments
- Consider which workflows will use it

## Development Setup

See `design/00-install.md` for complete installation.

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject
```

### Types

  - `build`: changes to the build system
  - `chore`: for other changes that don't match previous types
  - `ci`: changes to the CI system
  - `docs`: documentation changes
  - `feat`: new features
  - `fix`: bug fixes
  - `perf`: performance improvements
  - `refactor`: refactor of a particular code section without introducing new features or bug fixes
  - `revert` : revert previous commit
  - `style`: code style improvements
  - `test`: changes to the test suite

### Scopes

| Scope | Description | Example |
|-------|-------------|---------|
| `job-hunter` | Changes to job-hunter workflow | `feat(job-hunter): add salary filter` |
| `lib` | Shared library changes | `fix(lib): handle null in data-transform` |
| `scripts` | Shell script changes | `feat(scripts): add health check to startup` |
| `docs` | Documentation changes | `docs(install): clarify symlink step` |
| *(none)* | Cross-cutting changes | `chore: update n8n to 2.0.2` |

### Examples

```bash
feat(job-hunter): implement action 2 discovery filtering
fix(lib): handle empty API response in data-transform
docs(install): clarify symlink recreation step
chore: update n8n to 2.0.2
```

## Pull Request Process

1. **Search first** - Check for existing issues/PRs covering your change
2. **Create dedicated branch** from latest main
3. **Follow conventions** - Commit format, documentation updates
4. **Reference issues** - Use "Fixes #XX" in PR description
5. **Test thoroughly** - Verify workflow executes correctly
6. **Update CHANGELOG.md** - Add entry under [Unreleased]

### PR Checklist

- [ ] Workflow has README.md and ACTIONS.md
- [ ] config.example.json has no secrets
- [ ] Documentation updated if behavior changed
- [ ] CHANGELOG.md updated
- [ ] Tested with current n8n version

## Questions?

Open an issue for:
- Workflow ideas you'd like to see
- Architecture discussions
- Clarification on contribution process

---

*Thank you for contributing to n8n Automation Workbench!*

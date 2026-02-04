# Contributing to the "violet-carnation" project

:warning: **Note:** This project is for participants of the 2026 Spring Cohort, Violet-Carnation team. :warning:

For others interested in adding to this project, feel free to reach out to one of the [team-leads](#team-leads) and offer ideas or fork the project.

#### Table of Contents

[Prerequisites](#prerequisites)

[Setup](#setup)

[Project Structure](#project-structure)

[Development Workflow](#development-workflow)

- [Branch Naming](#branch-naming)
- [Pull Requests](#pull-requests)

[Code Guidelines](#code-guidelines)

- [Automated Tools](#automated-tools)
- [File Naming Conventions](#file-naming-conventions)
- [Code Style](#code-style)

[Communication](#communication)

[Troubleshooting](#troubleshooting)

## Prerequisites

Before you start, make sure you have the following installed:

- **Node.js** 18.x or higher
  - Check your version: `node --version`
  - Download: https://nodejs.org/

- **Python** 3.11 or higher
  - Check your version (Windows): `python --version` or `Get-Command python`
  - Check your version (Linux/Mac): `python3 --version`
  - Download: https://www.python.org/downloads/

- **Package Managers**
  - npm (comes with Node.js)
  - pip (comes with Python)

- **Code Editor** with ESLint support (VS Code recommended)

- **Git** 2.x or higher
  - Check your version: `git --version`

- **GitHub Account** with access to the repository

## Setup

**[TODO]** [!IMPORTANT] Will come back to this

## Project Structure

- :warning: Structure is being finalized. Current discussion: client/api at root vs api nested in client.
- This section will be updated once decided.

## Development Workflow

You can find the list of current issues for the project at https://github.com/orgs/nhcarrigan-spring-2026-cohort/projects/12/views/1

1. Check GitHub Issues for available tasks
2. Comment in discord (#violet-carnation) and assign yourself the issue to claim it
3. Create a branch following naming covention: 'feature/description'
4. Make your changes/updates following Code Guidelines
5. Commit with clear messages
6. Open a Pull Request

### Branch Naming

Please use descriptive branch names:

- Features: 'feature/volunteer-profile'
- Bugs: 'fix/login-error'
- Docs: 'docs/update-readme'

Keep them lowercase with hyphens.

### Pull Requests

1. **Commit your changes** with clear, descriptive, present-tense messages:

- :white_check_mark: Good: 'feat: add volunteer interest logic'
- :white_check_mark: Good: 'fix: resolve login redirect issue'
- :x: Bad: 'fixed: login'
- :x: Bad: 'update stuff' or 'changes'

2. **Push your branch** to GitHub:

```bash
git add <file>
git commit -m 'your: commit message'
git push origin feature/your-branch-name
```

3. **Open a Pull Request** on GitHub:

- Give it a clear title
- Reference the issue number (e.g., "Closes #42")
- Briefly describe what changed and why

4. **Request review** either in Github or ask in discord

5. **Address feedback** if requested, then merge when approved

6. **Delete branch** when finished

## Code Guidelines

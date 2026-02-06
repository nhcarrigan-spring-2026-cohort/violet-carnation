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
- [Naming Conventions](#naming-conventions)
- [Code Style](#code-style)

[Communication](#communication)

- [Discord](#discord)
- [GitHub](#github)
- [Team Leads](#team-leads)

[Troubleshooting](#troubleshooting)

## Prerequisites

Before you start, make sure you have the following installed:

- **Node.js** 20.x or higher
  - Check your version: `node --version`
  - Download: https://nodejs.org/

- **Python** 3.11 or higher
  - Check your version (Windows): `python --version` or `Get-Command python`
  - Check your version (Linux/Mac): `python --version`
  - Download: https://www.python.org/downloads/

- **Package Managers**
  - npm (comes with Node.js)
  - pip (comes with Python)

- **Code Editor** with ESLint support (VS Code recommended)

- **Git** 2.x or higher
  - Check your version: `git --version`

- **GitHub Account** with access to the repository

## Setup

### Frontend

1. **Clone the repository:**

Choose your preferred method:

**HTTPS (recommended for most users):**

```bash
  git clone https://github.com/nhcarrigan-spring-2026-cohort/violet-carnation.git
  cd violet-carnation
```

**SSH (if you have SSH keys configured):**

```bash
  git clone git@github.com:nhcarrigan-spring-2026-cohort/violet-carnation.git
  cd violet-carnation
```

**GitHub CLI (if you have gh installed):**

```bash
  gh repo clone nhcarrigan-spring-2026-cohort/violet-carnation
  cd violet-carnation
```

2. **Install frontend dependencies:**

```bash
  cd client
  npm install
```

3. **Run the development server:**

```bash
  npm run dev
```

Frontend should now be running at http://localhost:3000

### Known Warnings

You may see this TypeScript warning in your editor:

```
Cannot find type definition file for 'estree'
```

This is harmless and doesn't affect functionality. You can:

- Ignore it (recommended)
- Or install types: `npm install --save-dev @types/estree`

### Backend

> **Note:** The frontend server should still be running. Open a new terminal for the backend.

1. **Create virtual environment:**

```bash
  cd api
  python3 -m venv .venv
```

(assumes you're at project root)

2. **Activate virtual environment:**

   **Linux/Mac:**

```bash
  source .venv/bin/activate
```

**Windows:**

```bash
  .venv\Scripts\activate
```

You _should_ see `(.venv)` appear in your terminal prompt.

3. **Install backend dependencies:**

```bash
  pip install -r requirements.txt
```

4. **Run development server:**

```bash
  uvicorn main:app --reload
```

5. **Verify it's running:**

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

Expected output:

```

  INFO:   Uvicorn running on http://127.0.0.1:8000
  INFO:   Started reloader process
  INFO:   Application startup complete.
```

**Note:** You may see a 404 for `/favicon.ico` - this is normal and can be ignored.

6. **Stop the server:**

Press `CTRL+C`

7. **Deactivate virtual environment:**

```bash
  deactivate
```

You should no longer see `(.venv)` in your terminal prompt.

### Verifying Your Virtual Environment

After activating, you should see `(.venv)` in your terminal prompt:

```bash
(.venv) user@machine:~/project/backend$
```

To verify the venv is active:

```bash
  which python3
```

**Should output:** `/path/to/your/project/backend/.venv/bin/python3`  
**If it shows:** `/usr/bin/python3` → venv is **NOT** active, run activate command again

## Project Structure

- :warning: Structure is being finalized. Current discussion: client/api at root vs api nested in client.
- This section will be updated once decided.

## Development Workflow

You can find the list of current issues for the project at https://github.com/orgs/nhcarrigan-spring-2026-cohort/projects/12/views/1

1. Check GitHub Issues for available tasks
2. Comment in discord (#violet-carnation) and assign yourself the issue to claim it
3. Create a branch following naming convention: 'feature/description'
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

### Automated Tools

**Frontend (Next.js/React):**

- ESLint (ES7) configured - your editor will show warnings
- Prettier: Not configured (optional for team to add)
- Use 2-space indentation

**Backend (FastAPI/Python):**

- Follow PEP 8 conventions
- Ruff recommended for linting with FastAPI (optional): `pip install ruff`
- Use 4-space indentation (Python standard)

### Naming Conventions

**Frontend:**

- Components: `PascalCase` (e.g. `VolunteerCard.tsx`)
- Utilities/helpers: `camelCase` (e.g. `formatDate.ts`)
- Folders: `lowercase-with-hyphens`

**Backend:**

- Python files: `snake_case` (e.g. `matching_service.py`)
- Follow FastAPI conventions for route structure

### Code Style

#### CSS Framework: Tailwind CSS

- Use Tailwind utility classes for styling
- Keep styles close to components
- Avoid inline styles unless necessary
- Use descriptive class names for custom CSS

Example:

```tsx
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
	<h2 className="text-xl font-semibold">Volunteer Profile</h2>
</div>
```

#### Component/Function Naming

**Components:**

- Use descriptive names: `VolunteerProfileForm` not `Form2`
- One component per file

**Functions:**

- Name functions by what they do: `calculateMatchScore()` not `doThing()`

#### Comments

- Write comments for **why**, not **what**
- Complex logic = explain your thinking
- Don't comment obvious code

#### API Endpoints (FastAPI)

Follow RESTful conventions:

- `GET /volunteers` - list
- `GET /volunteers/{id}` - detail
- `POST /volunteers` - create
- `PUT /volunteers/{id}` - update
- `DELETE /volunteers/{id}` - delete

Use clear, plural nouns for resources.

#### Common Patterns

**Fetching data in React:**

```tsx
// Use descriptive names
const { data: volunteers, isLoading, error } = useVolunteers();

// Handle loading and error states
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

**FastAPI route example:**

```python
@router.get("/volunteers/{volunteer_id}")
async def get_volunteer(volunteer_id: int):
    """Retrieve a single volunteer by ID."""
    # Implementation
```

## Communication

### Discord

All main project communication happens in the **#violet-carnation** channel on the freeCodeCamp Discord server.

- Try to update daily
- Ask questions here
- Request PR reviews
- Share updates and blockers

### GitHub

- Assign issues so others know which are taken
- Comment on issues you're working on
- Tag team members in PR reviews: `@username`
- Use PR descriptions to explain changes

### Team Leads

Questions? Contact:

- **Brad** - [@bradtaniguchi](https://github.com/bradtaniguchi)
- **Sky** - [@sylkylacole](https://github.com/sylkylacole)

---

> **Note:** This project is currently limited to 2026 Spring Cohort team members during the cohort duration.

## Troubleshooting

> **Note:** This section will be updated as common issues are discovered during development.

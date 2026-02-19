### Tailwind CSS Error: `Can't resolve 'tw-animate-css'`

**Symptoms:**

```
CssSyntaxError: Can't resolve 'tw-animate-css' in '/client/app'
```

**Cause:** Orphaned `package-lock.json` at project root or stale Next.js cache after merging PRs.

**Solution:**

```bash
# From project root
rm package-lock.json  # If exists at root (shouldn't be there)

# From client/
rm -rf node_modules
rm package-lock.json
rm -rf .next
npm install
npm run dev
```

---

### Backend API Returns 404 from Frontend

**Symptoms:** Fetching `/api/events` returns 404 or CORS errors.

**Cause:** Backend server not running or CORS not configured.

**Solution:**

1. **Verify backend is running:**

```bash
   # In api/ directory
   source .venv/bin/activate
   uvicorn main:app --reload
```

Should see: `Uvicorn running on http://127.0.0.1:8000`

2. **Test backend directly:** Visit `http://localhost:8000/docs`
   - If this works, backend is running
   - If frontend still gets errors, check CORS configuration

---

### Virtual Environment Not Activating

**Symptoms:** After running activate command, still see system Python path.

**Solution:**

**Check activation:**

```bash
# Linux/Mac
which python3
# Should show: /path/to/project/api/.venv/bin/python3

# Windows
Get-Command python
# Should show: C:\path\to\project\api\.venv\Scripts\python.exe
```

**If still showing system Python:**

```bash
# Delete and recreate venv
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

---

### Database Schema Errors

**Symptoms:** Errors about missing columns or tables after pulling new changes.

**Solution:** Drop and re-seed the database:

```bash
# From api/ directory with venv active
python utils/drop_db.py
python utils/populate_db.py
```

---

### Node Modules Accidentally Committed

**Symptoms:** PR shows hundreds of files from `node_modules/`.

**Cause:** `.gitignore` not properly configured or `node_modules` manually added.

**Solution:**

```bash
# Remove from git (keeps files locally)
git rm -r --cached node_modules
git rm -r --cached client/node_modules

# Verify .gitignore includes:
node_modules/

# Commit the fix
git add .gitignore
git commit -m "fix: remove node_modules from tracking"
```

---

### Type Errors After Merging

**Symptoms:** TypeScript errors in previously working files.

**Solution:** Reinstall dependencies to match updated types:

```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

---

### Still Having Issues?

1. Check Discord #violet-carnation for similar problems
2. Search closed GitHub issues
3. Tag `@bradtaniguchi` or `@sylkylacole` in Discord
4. Open a new issue with reproduction steps

# Notes

Install dependencies from `requirements.txt` file:

```bash
## using PIP
pip install -r requirements.txt

```

```bash
## using uv
uv pip install -r requirements.txt
```

To run you need to activate virtual environment:

- `.venv\Scripts\Activate.ps1` on Windows for Powershell
- `source .venv/Scripts/activate` Windows Bash
- `source .venv/bin/activate` Linux, MacOS

Start Server:

```bash
fastapi dev main.py
```

---

## Resources

https://fastapi.tiangolo.com/tutorial/#install-fastapi

https://www.devsheets.io/sheets/fastapi

https://youtu.be/8TMQcRcBnW8

https://www.jetbrains.com/help/pycharm/managing-dependencies.html#add-requirements

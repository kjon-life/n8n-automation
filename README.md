# n8n Automation Workbench

A collection of production-ready n8n workflows for common automation tasks. Each workflow is discrete, documented, and designed for both human operators and AI assistants.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/n8n-automation-workbench.git
cd n8n-automation-workbench

# Install dependencies
npm install

# Create Python environment (for Python code nodes)
uv venv --python 3.11
source .venv/bin/activate

# Create required symlink for task runner
mkdir -p node_modules/@n8n/task-runner-python
ln -sf "$(pwd)/.venv" node_modules/@n8n/task-runner-python/.venv

# Start n8n
./scripts/start-n8n.sh

# Access at http://localhost:5678
```

## Workflows

| Workflow | Description | Status |
|----------|-------------|--------|
| [job-hunter](workflows/job-hunter/) | Automated job discovery and application tracking for X Jobs | 🟡 In Progress |

## Project Structure

```
├── scripts/           # System scripts (start, stop, update n8n)
├── workflows/         # Discrete workflow projects
│   ├── _template/     # Template for creating new workflows
│   └── [workflow]/    # Each workflow is self-contained
│       ├── README.md  # What it does, prerequisites
│       ├── ACTIONS.md # Step-by-step action breakdown
│       └── config.example.json
├── lib/               # Shared code libraries
├── data/              # Runtime data (gitignored)
└── .cursor/rules/     # AI assistant context rules
```

## Creating a New Workflow

```bash
# Copy the template
cp -r workflows/_template workflows/my-new-workflow

# Edit the documentation
# - README.md: Purpose, value prop, prerequisites
# - ACTIONS.md: Define 1-5 actions with 1-5 steps each
# - config.example.json: Required credentials/settings
```

## For AI Assistants

This project is designed to work with AI coding assistants:

- **Claude CLI:** Reads `CLAUDE.md` for bootstrap instructions
- **Cursor IDE:** Reads `.cursor/rules/` automatically
- **Other assistants:** Read rules files in numerical order

Key principle: **Read context files SEQUENTIALLY, not in parallel.** Later files depend on earlier ones.

## Requirements

- Node.js 18+ (managed via [mise](https://mise.jdx.dev/))
- Python 3.11+ (managed via mise)
- [uv](https://github.com/astral-sh/uv) for Python package management
- n8n 2.0+

## Configuration

1. Copy `config.example.json` to `config.json` in each workflow
2. Fill in your API keys and credentials
3. Never commit `config.json` to git

## Contributing

1. Use the workflow template for new workflows
2. Document all actions in ACTIONS.md format
3. Keep workflows discrete and self-contained
4. Shared code goes in `lib/`

## License

MIT


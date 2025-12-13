# Cursor AI Assistant Rules

## CRITICAL: Rules File Reading Protocol

### MANDATORY: Read Rules Files FIRST

Before doing ANY development work, coding, or answering technical questions about this project, you MUST:

1. **Read ALL rule files SEQUENTIALLY** (never in parallel)
2. **Use the `Read` tool** (never batch read multiple rules files)
3. **Read them in numerical order**: 00, 01, 02, 03, etc.
4. **Complete each read** before starting the next one

### Required Reading Order

```
1. Read: .cursor/rules/00-tooling.mdc
2. Read: .cursor/rules/01-project-setup.md
3. Read: .cursor/rules/02-start-stop-update.md
4. Read: .cursor/rules/03-browser-tools-workflows.md
```

### Why This Matters

- Rules files contain **critical project-specific information**
- Information in later files **builds on earlier files**
- Parallel reads cause you to **miss important context**
- Sequential reading ensures you **understand dependencies**

### Enforcement

❌ **NEVER DO THIS:**
```typescript
// DON'T batch read rules files in parallel
Read('.cursor/rules/00-tooling.mdc')
Read('.cursor/rules/01-project-setup.md')
Read('.cursor/rules/02-start-stop-update.md')
// This causes you to miss context and make mistakes
```

✅ **ALWAYS DO THIS:**
```typescript
// Step 1: Read first file
Read('.cursor/rules/00-tooling.mdc')
// Wait for response, understand it

// Step 2: Read second file
Read('.cursor/rules/01-project-setup.md')
// Wait for response, understand it

// Step 3: Read third file
Read('.cursor/rules/02-start-stop-update.md')
// Wait for response, understand it

// Step 4: Read fourth file
Read('.cursor/rules/03-browser-tools-workflows.md')
// Wait for response, understand it

// Step 5: NOW you can start working
```

### Examples of When to Read Rules

Read the rules files BEFORE:
- Installing or updating packages
- Starting or stopping n8n
- Using Python or Node.js tools
- Working with workflows
- Setting up browser tools
- Making configuration changes
- Answering questions about project setup

### Consequences of Not Following This Rule

If you don't read the rules sequentially:
- You'll use **pip instead of uv** (wrong tool)
- You'll forget about the **critical symlink** requirement
- You'll use **wrong Chrome profile** for browser tools
- You'll make **incorrect assumptions** about the setup
- You'll give **wrong advice** to the user
- The user will **lose trust** in you

## Project-Specific Notes

This is an **n8n local installation** with:
- Custom task runner configuration
- Specific Python/Node.js tool requirements
- Browser tools integration for workflow development
- Critical symlinks that must be maintained

**You cannot guess how this project works. You MUST read the rules first.**

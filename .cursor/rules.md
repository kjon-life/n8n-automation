# Cursor AI Assistant Rules

## CRITICAL: Rules File Reading Protocol

### MANDATORY: Read Rules Files FIRST

Before doing ANY development work, coding, or answering technical questions about this project, you MUST:

1. **Read ALL rule files SEQUENTIALLY** (never in parallel)
2. **Use the `Read` tool** (never batch read multiple rules files)
3. **Read them in numerical order**: 00, 01, 02, ... 09
4. **Complete each read** before starting the next one
5. **use only current documentation** release DEC 5, 2025 or later

### Required Reading Order

**Universal Coding Standards (00-05):**
```
1. Read: .cursor/rules/00-coding-style.mdc        # Coding style fundamentals
2. Read: .cursor/rules/01-core-engineering.mdc    # Engineering philosophy
3. Read: .cursor/rules/02-development-standards.mdc # Dev standards
4. Read: .cursor/rules/03-writing-good-interfaces.mdc # Interface design
5. Read: .cursor/rules/04-error-handling.mdc      # Error handling patterns
6. Read: .cursor/rules/05-documentation.mdc       # Documentation rules
```

**Project-Specific n8n Rules (06-09):**
```
7. Read: .cursor/rules/06-tooling.mdc             # uv, npm, mise tooling
8. Read: .cursor/rules/07-project-setup.mdc       # n8n project structure
9. Read: .cursor/rules/08-start-stop-update.mdc   # n8n operations
10. Read: .cursor/rules/09-browser-tools-workflows.mdc # Browser tools & workflows
11. Read .cursor/rules/10-n8n-v2-resources.mdc    # n8n version 2.0.1 ESSENTIAL documentation
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
Read('.cursor/rules/00-coding-style.mdc')
Read('.cursor/rules/01-core-engineering.mdc')
Read('.cursor/rules/02-development-standards.mdc')
// This causes you to miss context and make mistakes
```

✅ **ALWAYS DO THIS:**
```typescript
// Step 1: Read first file
Read('.cursor/rules/00-coding-style.mdc')
// Wait for response, understand it

// Step 2: Read second file
Read('.cursor/rules/01-core-engineering.mdc')
// Wait for response, understand it

// Continue sequentially through all files...
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

## File Organization

| File | Purpose | Always Applied |
|------|---------|----------------|
| 00-coding-style.mdc | Coding style fundamentals | ✅ Yes |
| 01-core-engineering.mdc | Engineering philosophy | ✅ Yes |
| 02-development-standards.mdc | Development standards | ✅ Yes |
| 03-writing-good-interfaces.mdc | Interface design | ❌ On match |
| 04-error-handling.mdc | Error handling | ✅ Yes |
| 05-documentation.mdc | Documentation rules | ✅ Yes |
| 06-tooling.mdc | uv, npm, mise tooling | Project-specific |
| 07-project-setup.mdc | n8n project structure | Project-specific |
| 08-start-stop-update.mdc | n8n operations | Project-specific |
| 09-browser-tools-workflows.mdc | Browser tools | Project-specific |

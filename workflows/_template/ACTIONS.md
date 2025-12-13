# Actions: [WORKFLOW NAME]

## Action Overview

| # | Action Name | Steps | Automation | Dependencies |
|---|-------------|-------|------------|--------------|
| 1 | [Name] | 3 | Full | None |
| 2 | [Name] | 4 | Assisted | Action 1 |
| 3 | [Name] | 2 | Manual | Action 2 |

---

## Action 1: [NAME]

**Purpose:** [What this action accomplishes]  
**Automation:** Full / Assisted / Manual  
**Trigger:** [What starts this action]

### Steps

1. **[Step name]**
   - Input: [what data comes in]
   - Process: [what happens]
   - Output: [what data goes out]

2. **[Step name]**
   - Input: ...
   - Process: ...
   - Output: ...

3. **[Step name]**
   - Input: ...
   - Process: ...
   - Output: ...

### Success Criteria

- [ ] [How do you know this action succeeded?]

### Error Handling

- **If [X] fails:** [Recovery action]

---

## Action 2: [NAME]

**Purpose:** ...  
**Automation:** ...  
**Trigger:** Completion of Action 1

### Steps

1. ...

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| ... | ... | ... |

### Debug Commands

```bash
# Check workflow status
curl http://localhost:5678/rest/workflows

# View recent executions
# n8n UI → Executions tab
```


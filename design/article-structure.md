# Article Structure: AI-Native Automation Series

## Article 1: n8n for AI-Native Automation
**Focus:** Setting up environment for AI-assisted development

### Key Sections
1. **The Problem We're Solving**
   - Old pattern: bolt AI onto existing workflows
   - New pattern: AI builds while observing execution
   - Requires designing environment for assistants

2. **What I Built**
   - Project structure (.cursor/rules, workflows, scripts)
   - 10 numbered rule files (00-09)
   - Action-based workflow organization

3. **The Key Insight**
   - Documentation is the build instruction
   - Rules files provide context before writing code
   - Sequential reading protocol (00-09)

4. **Actions, Not Workflows**
   - Discrete capabilities instead of monolithic workflows
   - Testable in isolation
   - Observable execution
   - Persistent state

5. **Browser Tools Change Everything**
   - MCP integration for browser control
   - Navigate, snapshot, inspect console/network
   - Assistant sees results, doesn't guess

6. **The Build Protocol**
   - Iterative process: Implement → Execute → Snapshot → Verify → Fix
   - Engineering discipline for velocity

7. **Practical Setup Details**
   - Critical symlink for Python task runner
   - State persistence patterns
   - Actionable error messages

8. **What This Enables**
   - 8 capabilities: Read rules → Build → Test → Verify → Commit

9. **Results**
   - Build time: hours not days
   - Debug time: near zero
   - Minimal rework
   - Low technical debt

---

## Article 2: From Assisted to Autonomous
**Focus:** Bridging gap from "you watch" to "agent works alone"

### Key Sections
1. **The Gap Nobody Talks About**
   - Assisted means you're watching, answering questions
   - Autonomous means agent works while you sleep
   - Different problem requiring different solutions

2. **What Breaks When You're Not Watching**
   - Stuck at decision points (no human to ask)
   - No visibility into progress
   - Errors with no recovery path
   - Context loss between sessions
   - No quality measurement beyond "didn't crash"
   - Time black holes (3x expected duration)

3. **The Nine Additions**
   - Autonomous decision framework (authority boundaries)
   - Error recovery playbook (what to do next)
   - Quality gates per step (measurable success)
   - Progress tracking system (PROGRESS.md)
   - Session continuity (.context.json)
   - Time budgets (when to ask for help)
   - Validation scripts (quality without judgment)
   - Integration contracts (data flow schemas)
   - Git commit format (readable progress log)

4. **The Pattern That Emerged**
   - Table: Gap → Question → Solution
   - Core insight: Make implicit human judgment explicit and executable

5. **What This Enables**
   - 9 new capabilities: Authority boundaries → Autonomous decisions → Error recovery → Quality verification → Progress tracking → Learning persistence → Time management → Data validation → Readable history

6. **The Test**
   - Friday 6pm start → Saturday 8am completion
   - Concrete PROGRESS.md output showing autonomous execution

7. **Results**
   - Unattended runtime: 12 hours (47 minutes effective work) #FIXME actual runtime and results are TBD
   - Zero questions asked
   - 2 recovery actions from playbook
   - Zero quality issues
   - 8 learnings preserved

8. **What You Need**
   - Actionable checklist of 9 requirements
   - "These aren't optional"
   - Difference between assistant and agent

---

## Narrative Arc

**Article 1:** Foundation
- Problem: Old patterns don't work for AI-native
- Solution: Design environment for assistants
- Result: Assisted development in hours

**Article 2:** Evolution
- Problem: Assisted ≠ Autonomous
- Solution: Make human judgment explicit
- Result: Unattended execution overnight

**Progression:** Setup → Structure → Protocol → Autonomous Operation


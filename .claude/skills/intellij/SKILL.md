---
name: intellij
description: Execute actions in IntelliJ using MCP tools. Use when the user wants to perform IDE actions like editing, refactoring, searching, or running commands on files open in IntelliJ.
---

# IntelliJ MCP Actions

Execute IDE actions via JetBrains MCP. Do EXACTLY what's requested - no additional fixes or changes.

## Workflow

1. Determine target file:
   - If user specifies a path → use that path
   - Otherwise → call `get_all_open_file_paths` to get active editor
2. Match the action to the appropriate tool (see Tool Selection)
3. Execute the action with minimal scope
4. Report result - do NOT fix any resulting errors unless asked

## Tool Selection

| Action | Tool |
|--------|------|
| Edit/replace text | `replace_text_in_file` |
| Rename symbol | `rename_refactoring` |
| Get symbol info | `get_symbol_info` |
| Check errors | `get_file_problems` |
| Format code | `reformat_file` |
| Search text | `search_in_files_by_text` |
| Search regex | `search_in_files_by_regex` |
| Find file by name | `find_files_by_name_keyword` |
| Find file by glob | `find_files_by_glob` |
| List directory | `list_directory_tree` |
| Build | `build_project` |
| List run configs | `get_run_configurations` |
| Run config | `execute_run_configuration` |
| Terminal | `execute_terminal_command` |
| Open file | `open_file_in_editor` |
| Create file | `create_new_file` |
| Read file | `get_file_text_by_path` |
| Get open files | `get_all_open_file_paths` |
| List dependencies | `get_project_dependencies` |
| List modules | `get_project_modules` |
| List VCS repos | `get_repositories` |

## Critical Rules

- **Minimal changes only**: Apply ONLY the requested edit
- **No auto-fixes**: Do NOT fix compile errors, imports, or other issues unless explicitly asked
- **No extras**: Do NOT add documentation, types, or improvements
- **Report only**: After action, report what was done - nothing more

## Task

$ARGUMENTS

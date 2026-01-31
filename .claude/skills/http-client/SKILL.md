---
name: http-client
description: Manages HTTP requests in the JetBrains HTTP Client test file. Use when the user wants to add, update, or organize HTTP requests for API testing. Triggers on requests to create API tests, add endpoints to test, or modify existing HTTP client requests.
---

# HTTP Request Management

Target file: `aidep-server/test/manual-tests.http`

## Workflow

1. Read the current test file
2. Check if a similar request exists (same endpoint/purpose)
3. If similar exists: propose update with explanation, ask confirmation
4. If new: append to file with `###` separator

## Format

```http
###
# @name requestName
METHOD http://localhost:3000/path
Content-Type: application/json

{"key": "{{variable}}"}
```

## Reference

For advanced syntax (variables, environments, response handlers): https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html

## Task

$ARGUMENTS

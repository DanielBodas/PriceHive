import json

def try_fix_json(v):
    if not isinstance(v, str):
        return v
    if not ((v.startswith('{') and v.endswith('}')) or (v.startswith('[') and v.endswith(']'))):
        return v
    try:
        # First try strict JSON
        return json.loads(v)
    except json.JSONDecodeError:
        try:
            # Try replacing single quotes with double quotes
            # This is naive but common for Python-style string representations
            import ast
            return ast.literal_eval(v)
        except Exception:
            return v

# Testing the logic
test_cases = [
    '{"name": "O\'Reilly"}',
    "{'name': 'O\'Reilly'}",
    '{"key": "value"}',
    "['a', 'b']",
    "{'a': 1, 'b': [2, 3]}"
]

for tc in test_cases:
    print(f"Input: {tc} -> Output: {try_fix_json(tc)}")

import json

with open('frontend/package.json', 'r') as f:
    data = json.load(f)

# The reviewer mentioned these versions don't exist, but npm view showed they do for some.
# However, to be safe and use existing ones found in the registry earlier:
# axios 1.15.0 was reported but let's check what's actually in node_modules if possible
# Or just use the ones I just checked with npm view

data['dependencies']['axios'] = '^1.7.0' # known stable
data['dependencies']['lodash'] = '^4.17.21' # known stable
data['dependencies']['ajv'] = '^8.17.1' # known stable
data['devDependencies']['eslint'] = '^9.20.0' # known stable

with open('frontend/package.json', 'w') as f:
    json.dump(data, f, indent=2)
    f.write('\n')

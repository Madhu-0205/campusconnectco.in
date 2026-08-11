import os
import re
from pathlib import Path

api_dir = Path("/Users/madhu/Desktop/campusconnectco.in-main/src/app/api")
routes = list(api_dir.rglob("route.ts"))

inventory = []

for route in routes:
    content = route.read_text(encoding='utf-8')
    route_path = str(route.relative_to(api_dir).parent)
    if route_path == ".":
        route_path = "/"
    else:
        route_path = f"/{route_path}"
    
    # methods
    methods = re.findall(r'export (?:async )?function (GET|POST|PUT|PATCH|DELETE)\b', content)
    
    # protectApi usage
    protect_api = re.search(r'protectApi\((.*?)\)', content)
    has_protect_api = bool(protect_api)
    roles = protect_api.group(1) if protect_api else ""
    
    # auth lookup
    has_auth_get_user = "supabase.auth.getUser()" in content
    has_auth_get_session = "supabase.auth.getSession()" in content
    has_get_session = "getSession(" in content
    has_get_user = "getUser(" in content and "auth-checks" in content
    has_any_auth = has_auth_get_user or has_auth_get_session or has_get_session or has_get_user or has_protect_api
    
    # prisma calls
    prisma_find = len(re.findall(r'prisma\.[a-zA-Z0-9_]+\.find(Unique|First|Many)', content))
    prisma_update = len(re.findall(r'prisma\.[a-zA-Z0-9_]+\.update', content))
    prisma_delete = len(re.findall(r'prisma\.[a-zA-Z0-9_]+\.delete', content))
    prisma_create = len(re.findall(r'prisma\.[a-zA-Z0-9_]+\.create', content))
    
    # zod
    has_zod = "z." in content
    
    # check if user.id is used in queries
    uses_user_id = "user.id" in content or "userId" in content or "session.user.id" in content
    
    # obvious IDOR check: prisma update but no session.user.id usage
    potential_idor = False
    if (prisma_update > 0 or prisma_delete > 0) and not uses_user_id and not has_protect_api:
        potential_idor = True
        
    inventory.append({
        "route": route_path,
        "methods": methods,
        "protectApi": has_protect_api,
        "roles": roles.strip(),
        "auth": has_any_auth,
        "prisma_find": prisma_find > 0,
        "prisma_update": prisma_update > 0,
        "prisma_delete": prisma_delete > 0,
        "prisma_create": prisma_create > 0,
        "has_zod": has_zod,
        "potential_idor": potential_idor
    })

inventory.sort(key=lambda x: x["route"])

md = ["# PHASE 1B AUTHORIZATION INVENTORY\n"]
md.append("| Route | Methods | Auth | protectApi | Roles | Prisma | Zod | Potential IDOR |")
md.append("|---|---|---|---|---|---|---|---|")

for item in inventory:
    methods = ",".join(item["methods"])
    auth = "✅" if item["auth"] else "❌"
    protect = "✅" if item["protectApi"] else "❌"
    roles = item["roles"]
    
    p = []
    if item["prisma_find"]: p.append("R")
    if item["prisma_update"]: p.append("U")
    if item["prisma_delete"]: p.append("D")
    if item["prisma_create"]: p.append("C")
    prisma_str = ",".join(p)
    
    zod = "✅" if item["has_zod"] else "❌"
    
    if item["potential_idor"]:
        idor = "⚠️ CRITICAL (No userId check on mutations)"
    elif (item["prisma_update"] or item["prisma_delete"]) and not item["protectApi"]:
        idor = "⚠️ HIGH (Mutations without protectApi)"
    elif (item["prisma_update"] or item["prisma_delete"]):
        idor = "⚠️ MEDIUM (Mutations with protectApi, requires manual IDOR review)"
    else:
        idor = "REVIEW"
        
    md.append(f"| {item['route']} | {methods} | {auth} | {protect} | {roles} | {prisma_str} | {zod} | {idor} |")

with open("/Users/madhu/Desktop/campusconnectco.in-main/PHASE_1B_AUTHORIZATION_INVENTORY.md", "w") as f:
    f.write("\n".join(md))
print("Done")

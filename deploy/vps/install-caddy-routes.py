from pathlib import Path

caddyfile = Path("/opt/projects/infra/caddy/Caddyfile")
app_snippet = Path("/srv/dartahara/Caddyfile.app").read_text(encoding="utf-8").strip()
supabase_snippet = Path("/srv/dartahara/Caddyfile.dar-tahara").read_text(encoding="utf-8").strip()

start_marker = "# BEGIN DAR TAHARA MANAGED ROUTES"
end_marker = "# END DAR TAHARA MANAGED ROUTES"
legacy_marker = "# Temporary staging hostname. Replace with supabase.dartahara.com after DNS is set."
legacy_hostname = "supabase-dartahara.85-215-221-142.sslip.io {"

content = caddyfile.read_text(encoding="utf-8")

if start_marker in content and end_marker in content:
    before, remainder = content.split(start_marker, 1)
    _, after = remainder.split(end_marker, 1)
    content = before.rstrip() + "\n" + after.lstrip("\n")

for marker in (legacy_marker, legacy_hostname):
    if marker in content:
        content = content.split(marker, 1)[0].rstrip() + "\n"
        break

managed = f"{start_marker}\n{app_snippet}\n\n{supabase_snippet}\n{end_marker}\n"
caddyfile.write_text(content.rstrip() + "\n\n" + managed, encoding="utf-8")

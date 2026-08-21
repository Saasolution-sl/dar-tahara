#!/usr/bin/env bash
set -euo pipefail

failures=0
warnings=0

pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; failures=$((failures + 1)); }
warn() { printf 'WARN  %s\n' "$1" >&2; warnings=$((warnings + 1)); }

if [[ "$(id -u)" -ne 0 ]]; then
  fail "run as root so host controls can be inspected completely"
fi

if command -v systemctl >/dev/null 2>&1 && systemctl is-active --quiet docker; then
  pass "Docker service is active"
else
  fail "Docker service is not active"
fi

if [[ -S /var/run/docker.sock ]]; then
  socket_mode="$(stat -c '%a' /var/run/docker.sock)"
  if [[ "${socket_mode}" == "660" || "${socket_mode}" == "600" ]]; then
    pass "Docker socket mode is ${socket_mode}"
  else
    fail "Docker socket mode is ${socket_mode}; expected 660 or stricter"
  fi
else
  fail "Docker socket is missing"
fi

if command -v ufw >/dev/null 2>&1; then
  if ufw status | head -n 1 | grep -q 'Status: active'; then
    pass "UFW firewall is active"
  else
    fail "UFW firewall is not active"
  fi
elif command -v nft >/dev/null 2>&1 && nft list ruleset | grep -q 'hook input'; then
  pass "nftables input policy is present"
else
  fail "no active UFW or nftables input ruleset was detected"
fi

sshd_config="$(sshd -T 2>/dev/null || true)"
if grep -q '^permitrootlogin no$' <<<"${sshd_config}"; then
  pass "SSH root login is disabled"
else
  fail "SSH PermitRootLogin is not no"
fi
if grep -q '^passwordauthentication no$' <<<"${sshd_config}"; then
  pass "SSH password authentication is disabled"
else
  fail "SSH PasswordAuthentication is not no"
fi
if grep -q '^pubkeyauthentication yes$' <<<"${sshd_config}"; then
  pass "SSH public-key authentication is enabled"
else
  fail "SSH PubkeyAuthentication is not yes"
fi

if command -v timedatectl >/dev/null 2>&1 && timedatectl show --property=NTPSynchronized --value | grep -qx yes; then
  pass "system clock is NTP synchronized"
else
  fail "system clock is not confirmed NTP synchronized"
fi

if systemctl is-enabled --quiet unattended-upgrades 2>/dev/null || systemctl is-enabled --quiet dnf-automatic.timer 2>/dev/null; then
  pass "automatic security updates are enabled"
else
  fail "automatic security updates are not enabled"
fi

if sysctl -n kernel.randomize_va_space 2>/dev/null | grep -qx 2; then
  pass "full ASLR is enabled"
else
  fail "kernel.randomize_va_space is not 2"
fi

if ss --tcp --udp --listening --numeric --process 2>/dev/null | grep -E '(^|[[:space:]])(0\.0\.0\.0|\[::\]):(5432|8000|3000)([[:space:]]|$)' >/dev/null; then
  fail "database or internal application ports are bound to all interfaces"
else
  pass "PostgreSQL, Kong/API and application ports are not bound publicly"
fi

if docker ps --quiet | while read -r container_id; do
  [[ -z "${container_id}" ]] && continue
  docker inspect --format '{{.Name}} {{.HostConfig.Privileged}} {{json .HostConfig.Binds}}' "${container_id}"
done | grep -E ' true |/var/run/docker.sock' >/dev/null; then
  fail "a running container is privileged or mounts the Docker socket"
else
  pass "no running container is privileged or mounts the Docker socket"
fi

if [[ "${warnings}" -gt 0 ]]; then
  warn "${warnings} warning(s) require review"
fi
if [[ "${failures}" -gt 0 ]]; then
  printf 'host_hardening_result=fail failures=%d warnings=%d\n' "${failures}" "${warnings}" >&2
  exit 1
fi

printf 'host_hardening_result=pass failures=0 warnings=%d checked_at=%s\n' \
  "${warnings}" "$(date -u +%Y-%m-%dT%H:%M:%SZ)"

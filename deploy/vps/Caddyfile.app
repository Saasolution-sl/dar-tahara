# The public site is hosted by Vercel. This VPS route serves only the protected
# staging application, authenticated malware scanner and security-event receiver
# used by both Vercel production and VPS staging.
staging.dartahara.com {
    @malware_scanner path /api/internal/malware-scan
    handle @malware_scanner {
        reverse_proxy dar-tahara-malware-bridge:8080
    }

    @security_events path /api/internal/security-log /api/internal/security-alert
    handle @security_events {
        reverse_proxy dar-tahara-security-receiver:8080
    }

    handle {
        import staging_frontend
        reverse_proxy staging-dar-tahara-web:3000
    }
}

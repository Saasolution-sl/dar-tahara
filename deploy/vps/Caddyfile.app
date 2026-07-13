dartahara.com, www.dartahara.com {
    encode zstd gzip
    reverse_proxy dar-tahara-web:3000

    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
        -Server
    }
}

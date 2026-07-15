<?php

/*
 * Idempotently set the local.php parameters that the Mautic 7.1.3 image does NOT
 * read from environment variables. Run INSIDE the mautic-web container (the host
 * has no PHP), operating on /var/www/html/config/local.php. Values are passed as
 * environment variables by configure-local.sh.
 *
 * See ../configure-local.sh and the README "Known upstream issues" section.
 */

$f = '/var/www/html/config/local.php';
include $f;

if (!isset($parameters) || !is_array($parameters)) {
    fwrite(STDERR, "local.php did not define \$parameters\n");
    exit(1);
}

$parameters['trusted_proxies'] = ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'];

$dsn = getenv('MAUTIC_MAILER_DSN');
if ($dsn !== false && $dsn !== '') {
    $parameters['mailer_dsn'] = $dsn;
}
$fromEmail = getenv('MAUTIC_MAILER_FROM_EMAIL');
if ($fromEmail !== false && $fromEmail !== '') {
    $parameters['mailer_from_email'] = $fromEmail;
}
$fromName = getenv('MAUTIC_MAILER_FROM_NAME');
if ($fromName !== false && $fromName !== '') {
    $parameters['mailer_from_name'] = $fromName;
}

file_put_contents($f, "<?php\n\$parameters = " . var_export($parameters, true) . ";\n");
echo "local.php updated (trusted_proxies + mailer)\n";

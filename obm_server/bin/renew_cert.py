#!/usr/bin/python3

from random import randrange
from time import sleep
from subprocess import run
from datetime import datetime
from os.path import getmtime


MIN_SLEEP_SECONDS = 12 * 60 * 60
MIN_RENEWAL_WAIT_SECONDS = 30 * 24 * 60 * 60
CERT_FILE = '/data/tls/domain_chain.pem'


def info(message):
    now = datetime.now().isoformat()
    print(f"{now} {message}")


def get_new_certificate():
    info('Starting Certificate Renewal ...')
    process = run(
        [
            'python3',
            '/bin/acme_tiny.py',
            '--account-key', '/data/tls/account_secret.pem'
            '--csr', '/data/tls/domain.csr',
            '--acme-dir', '/srv/www/.well-known/acme-challenge/'
        ],
        capture_output=True,
    )
    if process.returncode == 0:
        info('Got new certificate.')
        return process.stdout
    else:
        info('No new certificate.')
        return None


def install_certificate(data):
    with open(CERT_FILE, 'w') as fp:
        fp.write(data)
    info('Wrote new certificate.')


def restart_web_server():
    run(['service', 'nginx', 'restart'])


def try_to_renew_cert():
    cert = get_new_certificate()
    if cert is not None:
        try:
            install_certificate(cert)
            restart_web_server()
        finally:
            pass


while True:
    sleep(MIN_SLEEP_SECONDS + randrange(MIN_SLEEP_SECONDS))
    mtime = getmtime(CERT_FILE)
    now = datetime.now().timestamp()
    if now - mtime >= MIN_RENEWAL_WAIT_SECONDS:
        try_to_renew_cert()

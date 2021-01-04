#!/bin/bash

set -e
umask 077


account_secret_key=/data/tls/account_secret.pem

domain_secret_key=/data/tls/domain_secret.pem
domain_csr=/data/tls/domain.csr
domain_chain=/data/tls/domain_chain.pem
domain_dhparam=/data/tls/domain_dhparam.pem

challenge_dir=/srv/www/.well-known/acme-challenge


function main {
    setup_directories
    service ssh start
    disable_tls
    service nginx start
    if [[ $TLS_DOMAIN != unset ]]
    then
        setup_tls
    fi
    python3 /srv/app/bin/my_little_cron &
    su - app -c 'cd /srv/app && uvicorn obm.app:app'
}

function setup_directories {
    if [[ ! -d /data/tls ]]
    then
        mkdir /data/tls
        chown www-data:www-data /data/tls
        chmod 750 /data/tls
    fi

    if [[ ! -d /data/obm_data ]]
    then
        mkdir /data/obm_data
        chown app /data/obm_data
        chmod 700 /data/obm_data
    fi

    [[ -L /home/app/open_battle_map_data ]] \
        || ln -s /data/obm_data /home/app/open_battle_map_data
}


function setup_tls {
    [[ -f "$account_secret_key" ]] || create_secret_key "$account_secret_key"
    [[ -f "$domain_secret_key" ]] || create_secret_key "$domain_secret_key"
    [[ -f "$domain_csr" ]] || create_csr
    [[ -f "$domain_dhparam" ]] || create_dhparam
    # [[ -f "$domain_chain" ]] || create_certificate
    # [[ -f /etc/nginx/sites-enabled/open_battle_map_ssl.conf ]] || enable_tls

}


function create_secret_key {
    openssl genrsa 4096 > "$1"
}


function create_csr {
    openssl req -new -sha256 \
        -key "$domain_secret_key" \
        -subj "/CN=${TLS_DOMAIN}" \
        -addext "subjectAltName = DNS:${TLS_DOMAIN}" \
        > "$domain_csr"
}


function create_dhparam {
    openssl dhparam -dsaparam -out "$domain_dhparam" 4096
}


function create_certificate {
  python3 /bin/acme_tiny.py \
      --account-key "$account_secret_key" \
      --csr "$domain_csr" \
      --acme-dir "$challenge_dir/" \
      > "$domain_chain"
}


function enable_tls {
    mv /etc/nginx/sites-{available,enabled}/open_battle_map_tls.conf
    service nginx restart
}


function disable_tls {
    if [[ -f /etc/nginx/sites-enabled/open_battle_map_tls.conf ]]
    then
        mv /etc/nginx/sites-{enabled,available}/open_battle_map_tls.conf
    fi
}

main | tee -a /var/log/bootstrap.log

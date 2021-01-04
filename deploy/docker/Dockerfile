FROM python:3.8-slim-buster

VOLUME /data

ENV TLS_DOMAIN unset
ENV LETSENCRYPT_URL 'https://acme-v02.api.letsencrypt.org/directory'

HEALTHCHECK CMD curl -f http://localhost/ || exit 1

RUN apt-get update \
    && apt-get install -y nginx bash openssh-server openssl curl \
    && rm -rf /var/cache/apt \
    && adduser --gecos 'Application User' --home /home/app --disabled-password app \
    && mkdir -p /home/app /srv/www/.well-known/acme-challenge /srv /root/.ssh \
    && rm /etc/nginx/sites-enabled/default

COPY build/srv /srv/

RUN pip3 install -r /srv/app/requirements.txt

COPY build/acme_tiny.py /bin/acme_tiny.py
COPY vhost.conf /etc/nginx/sites-enabled/open_battle_map.conf
COPY vhost_ssl.conf /etc/nginx/sites-available/open_battle_map_tls.conf
COPY bootstrap.sh /bootstrap.sh
COPY build/ssh_key.pub /root/.ssh/authorized_keys

RUN chmod g-rwx,o-rwx /root/.ssh \
    && chown -R app /srv/app /home/app \
    && chmod -R g-rwx,o-rwx /srv/app \
    && chown -R www-data:www-data /srv/www \
    && chmod -R g+rx-w,o-rwx /srv/www

CMD /bin/bash /bootstrap.sh

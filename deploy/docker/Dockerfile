FROM debian:latest

VOLUME /data

RUN apt-get update && apt-get install -y python3 python3-pip nginx bash && rm -rf /var/cache/apt
RUN adduser --gecos 'Application User' --home /home/app --disabled-password app
RUN rm /etc/nginx/sites-enabled/default
RUN mkdir -p /srv

COPY build/srv /srv/
RUN pip3 install -r /srv/app/requirements.txt

COPY vhost.conf /etc/nginx/sites-enabled/open_battle_map.conf
COPY bootstrap.sh /bootstrap.sh

RUN chown -R app /srv/app /home/app
RUN chmod -R g-rwx,o-rwx /srv/app
RUN chgrp -R www-data /srv/www
RUN chmod -R g+rx-w,o-rwx /srv/www

CMD /bin/bash /bootstrap.sh

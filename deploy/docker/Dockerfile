FROM python:3.8-slim-buster

VOLUME /data

RUN apt-get update && apt-get install -y nginx bash openssh-server && rm -rf /var/cache/apt
RUN adduser --gecos 'Application User' --home /home/app --disabled-password app
RUN mkdir -p /home/app/.ssh /var/www/.ssh /srv
RUN rm /etc/nginx/sites-enabled/default

COPY build/srv /srv/
RUN pip3 install -r /srv/app/requirements.txt

COPY vhost.conf /etc/nginx/sites-enabled/open_battle_map.conf
COPY bootstrap.sh /bootstrap.sh
COPY build/ssh_key.pub /home/app/.ssh/authorized_keys
COPY build/ssh_key.pub /var/www/.ssh/authorized_keys

RUN chown -R app /srv/app /home/app
RUN chmod -R g-rwx,o-rwx /srv/app
RUN chown -R www-data:www-data /srv/www /var/www/.ssh
RUN chmod -R g+rx-w,o-rwx /srv/www
RUN chmod g-rwx,o-rwx /var/www/.ssh /home/app/.ssh

CMD /bin/bash /bootstrap.sh

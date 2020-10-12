# smart-ambiente

## Development

npm run build:live

iisexpress-proxy 3000 to 81

## Production

npm run build:production
npm run start

## Raspian

https://technic2radio.fr/tuto-raspberry-pi-liquidsoap-icecast/

sudo apt-get update
sudo apt-get upgrade
sudo apt-get install -y liquidsoap
sudo apt-get install -y liquidsoap-plugin-all
sudo apt-get install -y ladspa-sdk multimedia-audio-plugins
sudo apt-get install icecast2

curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
cd /home/pi/smart-ambiente
rm -r -f node_modules
rm package-lock.json
npm install ToastHawaii/smart-ambiente --production

https://github.com/philippe44/AirConnect

sudo mkdir /var/lib/airconnect
cd /var/lib/airconnect
sudo wget https://raw.githubusercontent.com/philippe44/AirConnect/master/bin/airupnp-arm
sudo chmod +x airupnp-arm

cd /etc/systemd/system
sudo nano airupnp.service

    [Unit]
    Description=AirUPnP bridge
    After=network-online.target
    Wants=network-online.target

    [Service]
    ExecStart=/var/lib/airconnect/airupnp-arm -l 1000:2000 -Z -x /var/lib/airconnect/airupnp.xml
    Restart=on-failure
    RestartSec=30

    [Install]
    WantedBy=multi-user.target

sudo systemctl enable airupnp.service
sudo service airupnp start

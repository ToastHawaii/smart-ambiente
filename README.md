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
npm install ToastHawaii/smart-ambiente --production

cd /etc
sudo nano rc.local

    cd /home/pi/smart-ambiente/node_modules/sonos-http-api
    node server.js >>/dev/null 2>>/dev/null &

    cd /home/pi/smart-ambiente/node_modules/smart-ambiente
    node out/server.js --RELEASE >>/dev/smart-ambiente.log 2>>/dev/smart-ambiente.err &

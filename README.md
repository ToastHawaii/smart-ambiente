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

sudo apt-get install libavahi-compat-libdnssd-dev
npm install @johneas10/airsonos -g

cd /etc
sudo nano rc.local

    su - pi -c "
    airsonos
    " >>/dev/smart-ambiente-airsonos.log 2>>/dev/smart-ambiente-airsonos.err &

    cd /home/pi/smart-ambiente/node_modules/sonos-http-api
    node server.js >>/dev/smart-ambiente-sound.log 2>>/dev/smart-ambiente-sound.err &

    cd /home/pi/smart-ambiente/node_modules/smart-ambiente
    node out/server.js --RELEASE >>/dev/smart-ambiente.log 2>>/dev/smart-ambiente.err &

    su - pi -c "
    cd /home/pi/smart-ambiente/node_modules/smart-ambiente
    liquidsoap out/smart-ambiente.liq
    " >>/dev/smart-ambiente-radio.log 2>>/dev/smart-ambiente-radio.err &

    sleep 5

    su - pi -c "
    cd /home/pi/smart-ambiente/node_modules/smart-ambiente
    liquidsoap out/smart-ambiente.liq -- 1
    " >>/dev/smart-ambiente-radio1.log 2>>/dev/smart-ambiente-radio1.err &

git clone https://github.com/outOfTheFogResearchDev/cresCommunication &
cd cresCommunication &
mkdir config &
echo exports.SECRET = `${Math.random()}`; > config/config.js &
mkdir "server/app/utils/lookupTable/local" &
del binding.gyp &
npm i --prod &
npm run deployment-build &
echo start chrome /max --app=http://localhost:3330 > ../cresCommunication.bat &
echo set TYPE=exe^&^&node ./cresCommunication/server/index.js >> ../cresCommunication.bat
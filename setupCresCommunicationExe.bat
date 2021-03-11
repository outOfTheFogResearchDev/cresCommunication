git clone https://github.com/outOfTheFogResearchDev/cresCommunication &
cd cresCommunication &
mkdir config &
echo exports.SECRET = `${Math.random()}`; > config/config.js &
npm i --prod &
npm run server-build &
echo start chrome /max --app=http://localhost:3330 > ../cresCommunication.bat &
echo start /min node set TYPE=local^&^&./cresCommunication/server/index.js >> ../cresCommunication.bat
git clone https://github.com/outOfTheFogResearchDev/cresCommunication
cd cresCommunication
pip install pymoku
pip install flask
mkdir config
echo exports.SECRET = `${Math.random()}`; > config/config.js
npm run setup
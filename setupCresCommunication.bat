git clone https://github.com/outOfTheFogResearchDev/cresCommunication
cd cresCommunication
pip install --upgrade pymoku
mkdir config
echo exports.SECRET = `${Math.random()}`; > config/config.js
npm run setup
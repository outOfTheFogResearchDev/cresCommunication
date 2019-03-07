from flask import Flask, request
from pymoku import *
from pymoku.instruments import Phasemeter
import sys
app = Flask(__name__)

m = Moku.get_by_name('Moku')
i = Phasemeter()
m.deploy_instrument(i)

@app.route('/gen/', methods=['GET'])
def gen():
    channel = int(request.args.get('channel'))
    power = float(request.args.get('power'))
    frequency = float(request.args.get('frequency'))
    degrees = float(request.args.get('degrees'))

    power -= 0.5
    offset = -0.1 + ((power + 0.5) * 0.035)
    loss = 6 + offset
    v = 10 ** ((power - 10 + loss) / 20)

    freq = frequency * (10 ** 6)

    i.gen_sinewave(channel, v, freq, degrees)
    return 'done'

@app.route('/shutdown/', methods=['GET'])
def shutdown():
    i.gen_off()
    m.close()
    request.environ.get('werkzeug.server.shutdown')()
    return 'done'

if __name__ == '__main__':
    app.run()
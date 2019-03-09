from flask import Flask, request
import pymoku
from pymoku import Moku
from pymoku.instruments import Phasemeter
import sys
app = Flask(__name__)

m = Moku.get_by_name('Moku')

pymoku._set_autocommit(False)

i = Phasemeter()
m.deploy_instrument(i)

@app.route('/gen/', methods=['GET'])
def gen():
    channel = int(request.args.get('channel'))
    frequency = float(request.args.get('frequency'))
    power = float(request.args.get('power'))
    degrees = float(request.args.get('degrees'))

    freq = frequency * (10 ** 6)

    power -= 0.5
    offset = -0.1 + ((power + 0.5) * 0.035)
    loss = 6 + offset
    v = 10 ** ((power - 10 + loss) / 20)

    i.gen_sinewave(channel, v, freq, degrees)
    if channel == 2:
        i.commit()
    return 'done'

@app.route('/shutdown/', methods=['GET'])
def shutdown():
    i.gen_off()
    i.commit()
    m.close()
    request.environ.get('werkzeug.server.shutdown')()
    return 'done'

if __name__ == '__main__':
    app.run()
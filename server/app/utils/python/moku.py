from pymoku import *
from pymoku.instruments import Phasemeter
import sys

m = Moku.get_by_name('Moku')
i = Phasemeter()

m.deploy_instrument(i, use_external=True)

def main(): # ch (int), power (dbm), freq (mHz)
    ch = int(sys.argv[1])

    power = float(sys.argv[2]) - 0.5
    offset = -0.1 + ((power + 0.5) * 0.035)
    loss = 6 + offset
    v = 10 ** ((power - 10 + loss) / 20)

    freq = float(sys.argv[3]) * (10 ** 6)

    data = i.gen_sinewave(ch, v, freq, phase=0.0, phase_locked=False)
    m.close()
    print 'done'

if __name__ == "__main__":
    main()
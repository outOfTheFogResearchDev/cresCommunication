from pymoku import *
from pymoku.instruments import Phasemeter
import sys

def main():
    m = Moku.get_by_name('Moku')
    i = Phasemeter()
    m.deploy_instrument(i)
    ch = int(sys.argv[1])
    power = float(sys.argv[2])
    frequency = float(sys.argv[3])

    power -= 0.5
    offset = -0.1 + ((power + 0.5) * 0.035)
    loss = 6 + offset
    v = 10 ** ((power - 10 + loss) / 20)

    freq = frequency * (10 ** 6)

    i.gen_sinewave(ch, v, freq)
    print 'done'

if __name__ == "__main__":
    main()
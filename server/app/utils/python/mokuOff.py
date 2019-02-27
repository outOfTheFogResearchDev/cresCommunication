from pymoku import *
from pymoku.instruments import Phasemeter
import sys

m = Moku.get_by_name('Moku')
i = Phasemeter()

m.deploy_instrument(i)

def main():
    i.gen_off()
    m.close()
    print 'done'

if __name__ == "__main__":
    main()
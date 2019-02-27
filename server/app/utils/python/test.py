import sys

def main():
    ch = int(sys.argv[1])
    power = float(sys.argv[2])
    offset = 0.1
    if (power > 3 and power < 6):
        offset = 0.175
    if (power >= 6):
        offset = 0.25
    loss = 6 + offset
    v = 10 ** ((power - 10 + loss) / 20)
    freq = float(sys.argv[3]) * (10 ** 6)
    print offset
if __name__ == "__main__":
    main()
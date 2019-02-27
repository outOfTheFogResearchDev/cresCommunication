#include <node.h>
#include "visa.h"

using namespace v8;

void setAnalyzer(const FunctionCallbackInfo<Value> &args)
{
    Isolate *isolate = args.GetIsolate();
    double frequency = args[0].As<Number>()->Value();

    //* C++ starts here

    ViSession defaultRM, viMXA;
    ViStatus viStatus = 0;

    viStatus = viOpenDefaultRM(&defaultRM);
    viStatus = viOpen(defaultRM, "GPIB0::16::INSTR", VI_NULL, VI_NULL, &viMXA);

    if (viStatus)
        return;

    // Turn off sweeping
    viSetAttribute(viMXA, VI_ATTR_TMO_VALUE, 600000);
    viClear(viMXA);
    viPrintf(viMXA, "*CLS\n");
    viPrintf(viMXA, "*RST\n");
    viPrintf(viMXA, "INIT:CONT OFF\n");

    // Set band center and ref level
    viPrintf(viMXA, "FREQ:CENTER %f MHz\n", frequency);
    viPrintf(viMXA, "FREQ:SPAN 2 MHz\n");
    viPrintf(viMXA, "DISP:WIND:TRAC:Y:RLEV 10 dBm\n");

    viClose(viMXA);     // closes session
    viClose(defaultRM); // closes default session

    //* C++ ends here
}

void init(Local<Object> exports, Local<Object> method)
{
    NODE_SET_METHOD(method, "exports", setAnalyzer);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, init);
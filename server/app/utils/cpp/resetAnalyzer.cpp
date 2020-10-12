#include <node.h>
#include "visa.h"

using namespace v8;

void resetAnalyzer(const FunctionCallbackInfo<Value> &args)
{
    Isolate *isolate = args.GetIsolate();

    //* C++ starts here

    ViSession defaultRM, viMXA;
    ViStatus viStatus = 0;

    viStatus = viOpenDefaultRM(&defaultRM);
    viStatus = viOpen(defaultRM, "GPIB2::16::INSTR", VI_NULL, VI_NULL, &viMXA);

    if (viStatus)
        return;

    viPrintf(viMXA, "INIT:CONT ON\n");

    viClose(viMXA);     // closes session
    viClose(defaultRM); // closes default session

    //* C++ ends here
}

void init(Local<Object> exports, Local<Object> method)
{
    NODE_SET_METHOD(method, "exports", resetAnalyzer);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, init);
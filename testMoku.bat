@echo off
goto setup
:setup
    start moku list
    start moku list
    start python .\server\app\utils\python\mokuConnection.py 
    goto channel

:channel
    set /p answer=Which channel are you testing? (1/2/e)
    if /i "%answer:~,1%" EQU "1" goto runfirst
    if /i "%answer:~,1%" EQU "2" goto runsecond
    if /i "%answer:~,1%" EQU "e" goto done
    echo Please type 1 for channel 1 or 2 for channel 2 or e to exit
    goto channel

:runfirst
    curl -X GET "http://localhost:5000/gen/?channel=1&frequency=150&power=0&degrees=90"
    echo.
    echo.
    goto channel

:runsecond
    curl -X GET "http://localhost:5000/gen/?channel=2&frequency=150&power=0&degrees=90"
    echo.
    echo.
    goto channel

:done
    curl -X GET "http://localhost:5000/shutdown/"
    exit /b
if exist %svn_img_work% GOTO :gengxin else GOTO :MK
:MK
@echo �������Ĺ���Ŀ¼�Ƿ���ȷ 
echo & pause GOTO :END
@echo ��������˳�
goto :END
:END
exit 
:gengxin
"%svn_home%"\TortoiseProc.exe/command:update /path:"%svn_img_work%" /notempfile /closeonend:1


"%svn_home%"\TortoiseProc.exe/command:update /path:"../" /notempfile /closeonend:1

mkdir ..\asset\img
xcopy "%svn_img_work%"\output  ..\asset\img /s/y/q

java -Xmx1000m -jar build.jar D:\nirvana\rd\rdTrunk\resources
copy ..\output\release\asset\css\*.css ..\output\debug\dev4ie.css
pause 
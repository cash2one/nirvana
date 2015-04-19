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

java -Xmx1000m -jar build.jar
copy ..\output\release\asset\css\core_*.css ..\output\debug\dev4ie_core.css
copy ..\output\release\asset\css\nirvana_*.css ..\output\debug\dev4ie_nirvana.css
pause 

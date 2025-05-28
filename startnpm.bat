start /B cmd /C "npm start"
timeout /t 5
start chrome --incognito http://localhost:3000
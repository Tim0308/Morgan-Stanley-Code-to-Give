### clone it and run the following

```
cd my-rn-app
npm install
```


Run this in root directory
```
./start-dev.sh 
```

For Tiff: 
start the backend:
```
cd backend
venv\Scripts\activate (create one if unavailable)
(make sure all the requirements are donwloaded in venv)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

start the frontend: 
```
cd my-rn-app
./start-dev.bat
```



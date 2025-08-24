# clone it and run the following

## for MacOS

## 1. go to the frontend
```
cd my-rn-app
npm install
```

## 2. go to the backend
```
cd backend
source venv/bin/activate
pip install -r requirements.txt  
```

## 3. Run this in root directory
```
./start-dev.sh 
```

## 4. install expo go and scan the QR code with camera app to try it out



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



## How to install

`npm install`

### load example data

clear previous data
`mongo cinemapp --eval 'db.users.drop()'`

import data

`mongoimport --db cinemapp --collection users --file example_mongo_data/example_users.json`

verify imported data

`mongo cinemapp --eval 'db.users.find()'`

## How to run

`npm run-script sass:compile`

`npm run-script start`

## run in developer mode

`npm run-script dev`


## test api endpoint (unix /  Mingw64)

`curl -X POST -H 'Content-Type: application/json' -d '{"email":"email@example.com","password":"ABC2@abc"}' http://127.0.0.1:5000/api/login`

```json
{
  "data":
  {
     "email":"email@example.com",
     "register_date":"2019-05-29T10:07:47.896Z",
  },
  "status":"ok",
}
```

```json
{
  "message":"login or password is wrong!",
  "status":"error",
}
```

```json
{
  "message":"login or password was not sent!",
  "status":"error",
}
```

## testing email

check the console output for url:
```
Server started on port 5000
MongoDB Connected
Message sent successfully!
 Preview URL: _URL_
```

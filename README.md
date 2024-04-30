# User Management System - Code Challenge - Back-end

## Dev

### Install dependencies with Yarn

```bash
yarn install
```

### Boot PostgreSQL and Adminer using docker

```bash
docker-compose up
```

### Check Adminer (optional)

Go to: http://localhost:8080/?pgsql=pgsql

Use the following values to login.

System=PostgreSQL
Server=pgsql
Username=pguser
Password=pgpassword
Database=nestjs

### Start the NestJS application

Make sure it's using the 3000 port. The User table should be created automatically.

```bash
yarn run start:dev
```

### Necessary workaround

The only way to create an admin user is using another admin. If this is the first time running the database, there will be no admins.

As a workaround, comment src/users/users.controller.ts?plain=1#L15 and src/users/users.controller.ts?plain=1#L20 and send the corresponding POST request to create the first admin. Don't forget to undo this after creation.

## Test the application

Some requests can be used to test the application:

### Create the first admin

Remember to comment lines 15 and 20 from the User Controller

```http
POST http://localhost:3000/users HTTP/1.1
content-type: application/json

{
    "name": "Francisco",
    "lastName": "Arcos",
    "email": "fepaf@gmail.com",
    "password": "123456",
    "passwordConfirmation": "123456"
}
```

### Log in with the new account

```http
POST http://localhost:3000/auth/signin HTTP/1.1
content-type: application/json

{
    "email": "fepaf@gmail.com",
    "password": "123456"
}
```

Should return an object with a token. This token will be used in other requests.

### Get self data

```http
GET http://localhost:3000/auth/me HTTP/1.1
Authorization: Bearer {{token}}
```

### Create users

Create some more users using the example below

```http
POST http://localhost:3000/auth/signup HTTP/1.1
content-type: application/json

{
    "name": "Maria",
    "lastName": "Clara",
    "email": "maria.clara@gmail.com",
    "password": "123456",
    "passwordConfirmation": "123456"
}
```

### List users

You can also sort and use filters in the query string

```http
GET http://localhost:3000/users HTTP/1.1
Authorization: Bearer {{token}}
```

Copy the ID of any user for the requests below

### Update user data

```http
PATCH http://localhost:3000/users/{{user_id}} HTTP/1.1
Authorization: Bearer {{token}}
content-type: application/json

{
    "lastName": "Filho"
}
```

### Get user data

```http
GET http://localhost:3000/users/{{user_id}} HTTP/1.1
Authorization: Bearer {{token}}
```

### Remove user

Careful to not delete the admin.

```http
DELETE http://localhost:3000/users/{{user_id}} HTTP/1.1
Authorization: Bearer {{token}}
```

List users or check Adminer to double check any of the requests above.
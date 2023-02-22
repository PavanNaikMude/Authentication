const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "userData.db");
const bcrypt = require("bcrypt");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000);
    console.log("Server running at 3000");
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
initializeDBAndServer();

// API 1

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const lengthOfPassWord = password.length;
  const isAlreadyExist = `SELECT * FROM user WHERE username LIKE '${username}'`;

  let dbResponse;
  dbResponse = await db.get(isAlreadyExist);
  //console.log(dbResponse);
  if (dbResponse !== undefined) {
    response.send("User already exists");
    response.status(400);
  } else if (lengthOfPassWord < 5) {
    response.send("Password is too short");
    response.status(400);
  } else {
    const encryptedPassword = bcrypt.hash(password);
    console.log(encryptedPassword);
    const createQuery = `INSERT INTO user(username,name,password,gender,location) VALUES('${username}','${name}','${encryptedPassword}','${gender}','${location}')`;
    dbResponse = await db.run(createQuery);
    response.send("User created successfully");
    response.status(200);
  }
});

//API 2

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const loginQuery = `SELECT * FROM user WHERE username LIKE '${username}'`;
  const dbResponse = await db.get(loginQuery);
  console.log(dbResponse);

  if (dbResponse === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else if (dbResponse !== undefined) {
    const isPasswordMatched = bcrypt.compare(password, dbResponse.password);
    if (isPasswordMatched) {
      response.send("Login success!");
      response.status(200);
    } else {
      response.send("Invalid password");
    }
  }
});

// API 3

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const currentPasswordCheckQuery = `SELECT * FROM user WHERE username LIKE '${username}'`;

  const dbResponse = await db.get(currentPasswordCheckQuery);
  // console.log(dbResponse);
  const dbPassword = dbResponse.password;
  // console.log(dbPassword);
  const isPasswordMatched = bcrypt.compare(oldPassword, dbPassword);
  if (isPasswordMatched === false) {
    response.send("Invalid current password");
    response.status(400);
  } else if (newPassword.length < 5) {
    response.send("Password is too short");
    response.status(400);
  } else {
    const updateQuery = `UPDATE user set password = '${newPassword}' WHERE username LIKE '${username}'`;
    let dbResponse = db.run(updateQuery);
    response.send("Password updated");
    response.status(200);
  }
});
module.exports = app;

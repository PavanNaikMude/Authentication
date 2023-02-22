const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "userData.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000);
    console.log("Server running at 3000");
  } catch (e) {
    console.log(e.message);
  }
};
initializeDBAndServer();

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const alreadyExistedOrNot = `SELECT username FROM user WHERE username LIKE '${username}'`;
  let dbResponse;
  const lengthOfPassWord = password.length;
  // console.log(lengthOfPassWord);

  dbResponse = await db.get(alreadyExistedOrNot);
  if (dbResponse.username !== undefined) {
    response.send("User already exists");
    response.status(400);
  } else if (lengthOfPassWord < 5) {
    response.send("Password is too short");
    response.status(400);
  } else {
    const createQuery = `INSERT INTO user(username,name,password,gender,location) VALUES('${pavanS}','${name}','${password}','${gender}','${location}')`;
    dbResponse = await db.run(createQuery);
    console.log(dbResponse);
    response.send("User created successfully");
    response.status(200);
  }
});

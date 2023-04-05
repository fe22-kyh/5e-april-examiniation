import * as env from 'dotenv';
env.config(); // denna sätter alla variabler i env filen till globala variabler i process.env

if(process.env.JWT_SIGN_KEY == undefined) {
  console.log("[WARN] - no jwt key found, perhaps you are missing the env file?");
}

/* normal flow */
import express from "express";
import jwt from 'jsonwebtoken';

const app = express();

app.use(express.json());

const userDb = [
  {
    username: "Yves",
    password: "123",
    role: "USER"
  },
  {
    username: "Gertrude",
    password: "123",
    role: "ADMIN"
  }
];

app.post("/auth/register", (request, response) => {
  let user = {
    username: request.body.username,
    password: request.body.password,
    role: "USER"
  }

  userDb.push(user);
});

// login ger en access token (giltig jwt)
// Ingen jwt krävs för detta steg
// En jwt token returneras efter en lyckad inloggning
app.post("/auth/login", (request, response) => {
  const username = request.body.username;
  const password = request.body.password;

  let user = userDb.find(user => (user.username == username && user.password == password)); // ger tillbaka en user om username och password kombinationen hittas i databasen

  if(user == undefined) {
    response.status(401);
    response.send("Invalid authentication");
  } else {
    const payload = {
      username: user.username,
      role: user.role
    }
    const payloadOptions = {
      expiresIn: "20m"
    }

    const token = jwt.sign(payload, process.env.JWT_SIGN_KEY, payloadOptions);
    response.status(200);
    response.send(token);
  }
});

app.get("/brew/coffe", (request, response) => {
  const authHeader = request.headers["authorization"];
  if(authHeader == undefined) {
    response.status(417);
    response.send("Sign in before brewing coffe");
  } else {
    const token = authHeader.replace("Bearer ", "");

    try {
      jwt.verify(token, process.env.JWT_SIGN_KEY); // Om det inte gick så kastas ett fel till "catch" och koden i try avslutas

      // Start brewing coffe
    } catch(err) {
      // Tell user to sign in before brewing coffe
    }
  }
});


app.listen(3030, () => console.log("Server is running on port 3030"));
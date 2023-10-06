const express = require("express");
const app = express();
const port = 3000;
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const fs = require("fs");
const path = require("path");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const dataFilePath = "./companies.json";

if (!fs.existsSync(dataFilePath)) {
  e;
  const initialData = [];

  fs.writeFileSync(dataFilePath, JSON.stringify(initialData), (err) => {
    if (err) {
      console.error("Error creating JSON file:", err);
    } else {
      console.log("JSON file created successfully.");
    }
  });
}

const generateRandomToken = (length) => {
  return crypto.randomBytes(length).toString("hex");
};

const accessToken = generateRandomToken(32);
console.log("Generated Access Token:", accessToken);

const generateRandomClientId = () => {
  return uuidv4();
};

const generateRandomClientSecret = () => {
  return uuidv4();
};

const clientId = generateRandomClientId();
const clientSecret = generateRandomClientSecret();

console.log("Generated Client ID:", clientId);
console.log("Generated Client Secret:", clientSecret);

//Register

app.post("/train/register", (req, res) => {
  console.log("Received a POST request to /train/register");
  try {
    const { companyName, ownerName, rollNo, ownerEmail, accessCode } = req.body;
    if (!companyName || !ownerName || !rollNo || !ownerEmail || !accessCode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let companiesData;
    try {
      companiesData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
    } catch (err) {
      return res.status(500).json({ error: "Error reading data file" });
    }

    const existingCompany = companiesData.find(
      (company) => company.rollNo === rollNo
    );

    if (existingCompany) {
      return res.status(400).json({ error: "Company already registered" });
    }

    const clientId = generateRandomClientId();
    const clientSecret = generateRandomClientSecret();

    const newCompany = {
      companyName,
      ownerName,
      rollNo,
      ownerEmail,
      accessCode,
      clientId,
      clientSecret,
    };

    companiesData.push(newCompany);
    fs.writeFile(
      dataFilePath,
      JSON.stringify(companiesData, null, 2),
      (err) => {
        if (err) {
          console.error("Error writing to data file:", err);
          return res.status(500).json({ error: "Error writing to data file" });
        }

        console.log("Data written to file");
        res.status(200).json({
          companyName,
          clientId,
          clientSecret,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

//auth

app.post("/train/auth", (req, res) => {
  try {
    const {
      companyName,
      clientId,
      ownerName,
      ownerEmail,
      rollNo,
      clientSecret,
    } = req.body;

    const accessToken = generateRandomToken(32);
    res.status(200).json({
      token_type: "Bearer",
      access_token: accessToken,
      expires_in: 1682629264,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

//train handling
//push data from trindata json to array
const util = require("util");

const readFileAsync = util.promisify(fs.readFile);
let trainData = [];
async function loadTrainDetails() {
  try {
    const dataFilePath = "./trainData.json";

    const jsonData = await readFileAsync(dataFilePath, "utf8");

    trainData = JSON.parse(jsonData);

    return trainData;
  } catch (error) {
    throw new Error("Error loading train details: " + error.message);
  }
}
loadTrainDetails();

// mock data for server
const trainDetailsServer = [
  {
    trainName: "Chennai Exp",
    trainNumber: "2344",
    departureTime: {
      hours: 21,
      minutes: 35,
      seconds: 0,
    },
    seatsAvailable: {
      sleeper: 3,
      Ac: 1,
    },
    price: {
      sleeper: 2,
      Ac: 5,
    },
    delayedBy: 15,
  },
  {
    trainName: "Mumbai Rajdhani",
    trainNumber: "1201",
    departureTime: {
      hours: 18,
      minutes: 45,
      seconds: 0,
    },
    seatsAvailable: {
      sleeper: 5,
      Ac: 3,
    },
    price: {
      sleeper: 3,
      Ac: 6,
    },
    delayedBy: 10,
  },
  {
    trainName: "Kolkata Express",
    trainNumber: "9876",
    departureTime: {
      hours: 22,
      minutes: 15,
      seconds: 0,
    },
    seatsAvailable: {
      sleeper: 2,
      Ac: 0,
    },
    price: {
      sleeper: 2,
      Ac: 4,
    },
    delayedBy: 5,
  },
];
//get trains

const authToken = "FKDLg";

function checkAuthToken(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader || authHeader !== `Bearer ${authToken}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

//Custom sort
function customSort(a, b) {
  // asc ord price
  const priceA = a.price.sleeper + a.price.Ac;
  const priceB = b.price.sleeper + b.price.Ac;
  if (priceA < priceB) return -1;
  if (priceA > priceB) return 1;

  // desc tkt
  const totalSeatsA = a.seatsAvailable.sleeper + a.seatsAvailable.Ac;
  const totalSeatsB = b.seatsAvailable.sleeper + b.seatsAvailable.Ac;
  if (totalSeatsA > totalSeatsB) return -1;
  if (totalSeatsA < totalSeatsB) return 1;

  //desc departure time
  const departureTimeA =
    a.departureTime.hours * 60 + a.departureTime.minutes + a.delayedBy;
  const departureTimeB =
    b.departureTime.hours * 60 + b.departureTime.minutes + b.delayedBy;
  if (departureTimeA > departureTimeB) return -1;
  if (departureTimeA < departureTimeB) return 1;

  //og order
  return 0;
}

app.get("/train/trains", checkAuthToken, (req, res) => {
  trainDetailsServer.sort(customSort);
  console.log(trainDetailsServer);
  res.json(trainDetailsServer);
});

//Auth train fetch Number

app.get("/train/trains/:trainNumber", checkAuthToken, (req, res) => {
  const { trainNumber } = req.params;
  trainDetailsServer.sort(customSort);

  const train = trainDetailsServer.find(
    (train) => train.trainNumber === trainNumber
  );

  if (!train) {
    return res.status(404).json({ error: "Train not found" });
  }

  res.json(train);
});

//Evolve train data , new trains

app.post("/train/add", (req, res) => {
  try {
    const newTrain = req.body;
    console.log("Received new train data:", req.body);

    const dataFilePath = "./trainData.json";
    const existingData = fs.readFileSync(dataFilePath, "utf8");
    const trainDetails = JSON.parse(existingData);

    trainDetails.push(newTrain);

    fs.writeFileSync(dataFilePath, JSON.stringify(trainDetails, null, 2));

    trainDetailsServer.push(trainDetails); //must sustain server state to work

    res.status(201).json({ message: "Train added successfully" });
  } catch (error) {
    console.error("Error adding train:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

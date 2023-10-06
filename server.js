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

//get trains

const authToken = "FKDLg";

const trainDetails = [
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
];

function checkAuthToken(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader || authHeader !== `Bearer ${authToken}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

app.get("/train/trains", checkAuthToken, (req, res) => {
  res.json(trainDetails);
});

//Auth train fetch Number

app.get("/train/trains/:trainNumber", checkAuthToken, (req, res) => {
  const { trainNumber } = req.params;
  const train = trainDetails.find((train) => train.trainNumber === trainNumber);

  if (!train) {
    return res.status(404).json({ error: "Train not found" });
  }

  res.json(train);
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

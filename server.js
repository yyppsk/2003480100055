const express = require("express");
const app = express();
const port = 3000;
const { v4: uuidv4 } = require("uuid");

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

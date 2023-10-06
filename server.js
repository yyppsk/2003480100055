const express = require("express");
const app = express();
const port = 3000;
const { v4: uuidv4 } = require("uuid");

app.use(express.json());

const authToken = "12345";

const fs = require("fs");

// Path to the JSON data file
const dataFilePath = "./companies.json";

app.post("/train/register", (req, res) => {
  try {
    const { companyName, ownerName, rollNo, ownerEmail, accessCode } = req.body;

    // Load existing data from the JSON file
    const companiesData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));

    // Check if the company with the same rollNo already exists
    const existingCompany = companiesData.find(
      (company) => company.rollNo === rollNo
    );

    if (existingCompany) {
      return res.status(400).json({ error: "Company already registered" });
    }

    // Assuming you have a function to generate random client ID and client secret
    const clientId = generateRandomClientId();
    const clientSecret = generateRandomClientSecret();

    // Create a new company object
    const newCompany = {
      companyName,
      ownerName,
      rollNo,
      ownerEmail,
      accessCode,
      clientId,
      clientSecret,
    };

    // Add the new company to the data array
    companiesData.push(newCompany);

    // Write the updated data back to the JSON file
    fs.writeFileSync(dataFilePath, JSON.stringify(companiesData, null, 2));

    res.status(200).json({
      companyName,
      clientId,
      clientSecret,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

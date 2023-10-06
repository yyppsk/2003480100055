const express = require("express");
const app = express();
const port = 3000;
const { v4: uuidv4 } = require("uuid");

app.use(express.json());

const authToken = "12345";

const fs = require("fs");

const dataFilePath = "./companies.json";

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
  try {
    const { companyName, ownerName, rollNo, ownerEmail, accessCode } = req.body;

    const companiesData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));

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

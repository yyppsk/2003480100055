const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

const authToken = "12345";

const mockTrainData = [];

const fetchTrainData = () => {
  return mockTrainData;
};

const authenticate = (req, res, next) => {
  const userAuthToken = req.headers.authorization;

  if (!userAuthToken || userAuthToken !== authToken) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  next();
};

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

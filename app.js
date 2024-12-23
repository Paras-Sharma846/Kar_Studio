const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mainRoute = require("./routes/index");
const http = require("http");

require("dotenv").config();
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

// Routes
app.use("/api", mainRoute);

// Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require("express");
const connectDB = require("./config/db");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");
app.use(cors());
//Connect database
connectDB();
//init middlware
app.use(express.json({ extended: false }));
app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/users", require("./routes/api/users"));
app.use("/api/profiles", require("./routes/api/profiles"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/list", require("./routes/api/list"));

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});

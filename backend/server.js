
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();

// const authRoutes = require("./routes/auth");

// const transactionRoutes = require("./routes/transactions");
// app.use("/api/transactions", transactionRoutes);


// const app = express();

// app.use(express.json());
// app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// // ✅ Test route
// app.get("/api/test", (req, res) => {
//   res.json({ message: "Backend is working!" });
// });

// // Auth routes
// app.use("/api/auth", authRoutes);

// // Protected example route
// app.get("/api/protected", require("./middleware/auth"), (req, res) => {
//   res.json({ message: "You accessed a protected route!", user: req.user });
// });

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("✅ MongoDB connected");
//     app.listen(5000, () => console.log("✅ Server running on port 5000"));
//   })
//   .catch(err => console.error("MongoDB error:", err));


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");

const app = express(); // <-- initialize app first

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// ✅ Test route
app.get("/api/test", (req, res) => {
  // res.json({ message: "Backend is working!" });
  console.log("Backend is working!");
});

// Auth routes
app.use("/api/auth", authRoutes);

// Transaction routes
app.use("/api/transactions", transactionRoutes);

// Protected example route
app.get("/api/protected", require("./middleware/auth"), (req, res) => {
  res.json({ message: "You accessed a protected route!", user: req.user });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(5000, () => console.log("✅ Server running on port 5000"));
  })
  .catch(err => console.error("MongoDB error:", err));

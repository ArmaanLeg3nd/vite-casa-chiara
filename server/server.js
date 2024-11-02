import dotenv from "dotenv";
import express from "express";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import sqlite3 from "sqlite3";
import cookieParser from "cookie-parser";
import compression from "compression";
import sirv from "sirv";
import {
  createStatisticsTableIfNotExists,
  incrementRouteReads,
  ensureDailyEntryExists,
  getStatisticsForLast30Days,
  removeOldStatistics,
} from "./statistics.js";

// Initialize dotenv
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const frontendOrigin = process.env.FRONTEND_ORIGIN;
const base = process.env.BASE || "/";

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile("./dist/client/index.html", "utf-8")
  : "";
const ssrManifest = isProduction
  ? await fs.readFile("./dist/client/.vite/ssr-manifest.json", "utf-8")
  : undefined;

const app = express();
const port = 8000;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const db = new sqlite3.Database("./server/database.db");
const messagesDb = new sqlite3.Database("./server/messages.db");

const trackedReadRoutes = [
  "/api/ustats/home",
  "/api/ustats/vacation-rental",
  "/api/ustats/services",
];
const statisticsData = {
  views: 0,
  uniqueViewers: 0,
  homePageReads: 0,
  vacationRentalReads: 0,
  servicesReads: 0,
  reads: 0,
};

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://1xjm1bp1-8000.inc1.devtunnels.ms");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// Add Vite or respective production middlewares
let vite;
if (!isProduction) {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    base,
  });
  app.use(vite.middlewares);
} else {
  app.use(compression());
  app.use(base, sirv("./dist/client", { extensions: [] }));
}

app.get("/api/bookings", (req, res) => {
  db.all("SELECT * FROM booked_dates", [], (err, rows) => {
    if (err) {
      console.error("Error fetching booked dates:", err);
      res.status(500).json({ error: "An error occurred while fetching data." });
      return;
    }
    res.json({ bookedDates: rows });
  });
});

app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).end();
      return;
    }

    // Fetch user's hashed password from the database
    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (err, row) => {
        if (err) {
          console.error("Error fetching user data from database:", err);
          res
            .status(500)
            .send({
              error: true,
              message: "An error occurred while fetching user data.",
            });
          return;
        }

        if (!row) {
          res.status(400).json({ msg: "Invalid username Or Password" });
          return;
        }

        const isMatch = await argon2.verify(row.password, password); // Verify the plain password
        if (!isMatch) {
          res.status(400).json({ msg: "Invalid username Or Password" });
          return;
        }

        const token = jwt.sign(
          {
            id: row.id,
            username: row.username,
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        res.clearCookie("token");

        const cookieOptions = {
          httpOnly: true,
          sameSite: app.get("env") === "development" ? true : "none",
          secure: app.get("env") === "development" ? false : true,
          expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Expiration time (1 day)
        };
        res.cookie("token", token, cookieOptions);
        res.send({ token });
      }
    );
  } catch (err) {
    console.log("POST auth/login, Something Went Wrong: ", err);
    res.status(400).send({ error: true, message: err.message });
  }
});

app.get("/auth/me", async (req, res) => {
  const defaultReturnObject = { authenticated: false, user: null };
  try {
    const token = String(req?.headers?.cookie?.split("=")[1]);
    const decoded = jwt.verify(token, JWT_SECRET);

    db.get(
      "SELECT id, username FROM users WHERE username = ?",
      [decoded.username],
      (err, row) => {
        if (err) {
          console.error("Error fetching user data from database:", err);
          res
            .status(500)
            .send({
              error: true,
              message: "An error occurred while fetching user data.",
            });
          return;
        }

        if (!row) {
          res.status(400).json(defaultReturnObject);
          return;
        }

        const { id, username } = row;
        res.status(200).json({ authenticated: true, user: { id, username } });
      }
    );
  } catch (err) {
    console.log("GET auth/me, Something Went Wrong", err);
    res.status(400).json(defaultReturnObject);
  }
});

app.delete("/auth/logout", async (req, res) => {
  try {
    res.clearCookie("token");
    res.send({ msg: "Logged Out" });
  } catch (err) {
    console.log("GET auth/logout, Something Went Wrong", err);
    res.status(400).send({ error: true, message: err.message });
  }
});

app.options("/auth/logout", (req, res) => {
  // Set the necessary CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // Replace with your frontend origin
  res.header("Access-Control-Allow-Methods", "GET, DELETE, HEAD, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, contenttype"
  );
  res.status(200).send(); // Respond with HTTP OK status
});

app.post("/api/bookings", (req, res) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    res.status(400).json({ error: "Both startDate and endDate are required." });
    return;
  }

  db.run(
    "INSERT INTO booked_dates (startDate, endDate) VALUES (?, ?)",
    [startDate, endDate],
    function (err) {
      if (err) {
        console.error("Error creating booked date:", err);
        res
          .status(500)
          .json({ error: "An error occurred while creating the booking." });
        return;
      }

      // Return the ID of the created booking
      res.json({ id: this.lastID, startDate, endDate });
    }
  );
});

app.delete("/api/bookings/:id", (req, res) => {
  // Set CORS headers specifically for this route
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  const bookingId = req.params.id;

  db.run("DELETE FROM booked_dates WHERE id = ?", [bookingId], (err) => {
    if (err) {
      console.error("Error deleting booked date:", err);
      res
        .status(500)
        .json({ error: "An error occurred while deleting the booking." });
      return;
    }

    res.json({ message: "Booking deleted successfully." });
  });
});

app.use(express.urlencoded({ extended: true }));

app.post("/api/submit-message", (req, res) => {
  const { name, email, subject, message } = req.body;
  const dtSent = new Date().toLocaleString(); // Get the current date and time
  const read = false; // Set read status to false by default

  messagesDb.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    fromAddress TEXT,
    subject TEXT,
    dtSent TEXT,
    read BOOLEAN,
    body TEXT
  )
`);

  // Insert the message data into the database
  messagesDb.run(
    "INSERT INTO messages (name, fromAddress, subject, dtSent, read, body) VALUES (?, ?, ?, ?, ?, ?)",
    [name, email, subject, dtSent, read, message],
    (err) => {
      if (err) {
        console.error("Error inserting message:", err);
        res
          .status(500)
          .json({ error: "An error occurred while submitting the message." });
        return;
      }

      res.json({ message: "Message submitted successfully!" });
    }
  );
});

// Fetch messages
app.get("/api/messages", (req, res) => {
  messagesDb.all("SELECT * FROM messages", (err, rows) => {
    if (err) {
      console.error("Error fetching messages:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching messages." });
      return;
    }
    res.json({ messages: rows });
  });
});

// Delete a message by ID
app.delete("/api/messages/:id", (req, res) => {
  const messageId = req.params.id;
  messagesDb.run("DELETE FROM messages WHERE id = ?", [messageId], (err) => {
    if (err) {
      console.error("Error deleting message:", err);
      res
        .status(500)
        .json({ error: "An error occurred while deleting the message." });
      return;
    }
    res.json({ message: "Message deleted successfully." });
  });
});

// Endpoint to mark a message as read
app.post("/api/mark-message-read/:id", (req, res) => {
  const messageId = req.params.id;
  messagesDb.run(
    "UPDATE messages SET read = 1 WHERE id = ?",
    [messageId],
    (err) => {
      if (err) {
        console.error("Error marking message as read:", err);
        res
          .status(500)
          .json({
            error: "An error occurred while marking the message as read.",
          });
        return;
      }
      res.json({ message: "Message marked as read successfully." });
    }
  );
});

app.get("/api/statistics", async (req, res) => {
  try {
    const createTable = await createStatisticsTableIfNotExists();
    const statistics = await getStatisticsForLast30Days();
    res.json(statistics);
  } catch (err) {
    console.error("Error fetching statistics:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching statistics." });
  }
});

// Route for statistics data
app.get("/api/ustats/:routeName", async (req, res) => {
  try {
    await createStatisticsTableIfNotExists();
    const route = req.params.routeName;

    if (trackedReadRoutes.includes(`/api/ustats/${route}`)) {
      await ensureDailyEntryExists();
      await incrementRouteReads(route);
      const statistics = await getStatisticsForLast30Days();
      res.json(statistics);
    } else {
      res.status(404).json({ error: "Not Found" });
    }
  } catch (err) {
    console.error("Error fetching statistics data:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching statistics data." });
  }
});

// Middleware to serve the React app
app.use("*", async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, "");

    let template;
    let render;
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile("./index.html", "utf-8");
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule("./src/entry-server.jsx")).render;
    } else {
      template = templateHtml;
      render = (await import("../dist/server/entry-server.js")).render;
    }

    const rendered = await render(url, ssrManifest);

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? "")
      .replace(`<!--app-html-->`, rendered.html ?? "");

    res.status(200).set({ "Content-Type": "text/html" }).send(html);
  } catch (e) {
    vite?.ssrFixStacktrace(e);
    console.log(e.stack);
    res.status(500).end(e.stack);
  }
});

const cleanUpOldStatistics = () => {
  removeOldStatistics()
    .then((message) => {
      console.log(message);
    })
    .catch((err) => {
      console.error("Error removing old statistics:", err);
    });
};

cleanUpOldStatistics();

setInterval(() => {
  cleanUpOldStatistics();
}, 86400000);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

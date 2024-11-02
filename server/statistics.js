import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./server/database.db");

export const createStatisticsTableIfNotExists = () => {
  return new Promise((resolve, reject) => {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE,
        views INTEGER,
        homePageReads INTEGER,
        vacationRentalReads INTEGER,
        servicesReads INTEGER
      );
    `;

    db.run(createTableQuery, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve("Table created or already exists");
      }
    });
  });
};

export const getStatisticsForLast30Days = () => {
  return new Promise((resolve, reject) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const query = `
      SELECT
        date,
        SUM(views) AS views,
        SUM(homePageReads) AS homePageReads,
        SUM(vacationRentalReads) AS vacationRentalReads,
        SUM(servicesReads) AS servicesReads
      FROM
        statistics
      WHERE
        date >= ?
      GROUP BY
        date
      ORDER BY
        date ASC;
    `;

    db.all(query, [thirtyDaysAgo.toISOString()], (err, rows) => {
      if (err) {
        console.log("Error fulfilling the promise");
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const incrementRouteReads = (route) => {
  return new Promise((resolve, reject) => {
    let routeColumn;

    switch (route) {
      case "home":
        routeColumn = "homePageReads";
        break;
      case "vacation-rental":
        routeColumn = "vacationRentalReads";
        break;
      case "services":
        routeColumn = "servicesReads";
        break;
      default:
        return reject(new Error(`Route ${route} is not tracked`));
    }

    const updateQuery = `
      UPDATE statistics
      SET ${routeColumn} = ${routeColumn} + 1, views = views + 1
      WHERE date = DATE('now');
    `;

    db.run(updateQuery, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(`Incremented reads for ${route}`);
      }
    });
  });
};

export const ensureDailyEntryExists = () => {
  return new Promise((resolve, reject) => {
    const insertQuery = `
      INSERT INTO statistics (date, views, homePageReads, vacationRentalReads, servicesReads)
      SELECT DATE('now'), 0, 0, 0, 0
      WHERE NOT EXISTS (SELECT 1 FROM statistics WHERE date = DATE('now'));
    `;

    db.run(insertQuery, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve("Ensured daily entry exists");
      }
    });
  });
};

export const removeOldStatistics = () => {
  return new Promise((resolve, reject) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deleteQuery = `
      DELETE FROM statistics
      WHERE date < ?;
    `;

    db.run(deleteQuery, [thirtyDaysAgo.toISOString()], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve("Old statistics removed successfully");
      }
    });
  });
};

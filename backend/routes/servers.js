const express = require("express");
const router = express.Router();
const pool = require("../db/config");

router.get("/getdata", async (req, res) => {
  try {
    // Get search parameters, pagination settings, and column search from the query
    const { search, columnSearch, page = 1, limit = 12 } = req.query;

    let query = `SELECT * FROM ztbl_Servers`;
    let countQuery = `SELECT COUNT(*) as totalCount FROM ztbl_Servers`;
    let conditions = [];
    const params = [];
    const countParams = []; // To match the conditions in the count query

    // overall search functionality
    if (search) {
      const searchCondition = `
        Application LIKE ? OR 
        Server LIKE ? OR 
        NetBios LIKE ? OR 
        IPAddress LIKE ? OR 
        DataCenter LIKE ? OR 
        Domain LIKE ? OR
        Country LIKE ? OR
        Role LIKE ? OR
        OS LIKE ? OR
        Platform LIKE ? OR
        Environment LIKE ? OR
        OSName LIKE ? OR
        CPUs LIKE ? OR
        MemoryMB LIKE ? OR
        Version LIKE ? OR
        Edition LIKE ? OR
        ServicePack LIKE ? OR
        PatchLevel LIKE ? OR
        LastPatched LIKE ? OR
        IsDecommissioned LIKE ? OR
        IsBehindFirewall LIKE ? OR
        MonitoredBy LIKE ? OR
        AddedBy LIKE ? OR
        TagList LIKE ? OR
        ServerDescription LIKE ?`;
      conditions.push(`(${searchCondition})`);
      const searchValue = `%${search}%`;
      for (let i = 0; i < 25; i++) {
        params.push(searchValue);
        countParams.push(searchValue);
      }
    }

    //  column-specific search
    if (columnSearch) {
      const parsedColumns = JSON.parse(columnSearch); // Expecting { columnName: searchValue }
      for (const column in parsedColumns) {
        if (parsedColumns[column]) {
          conditions.push(`${column} LIKE ?`);
          params.push(`%${parsedColumns[column]}%`);
          countParams.push(`%${parsedColumns[column]}%`);
        }
      }
    }

    // Combine conditions with AND
    if (conditions.length > 0) {
      const whereClause = ` WHERE ` + conditions.join(" AND ");
      query += whereClause;
      countQuery += whereClause;
    }

    //  LIMIT and OFFSET for pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // Execute both queries
    const [results] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, countParams);

    // Total count for pagination
    const totalCount = countResult[0]?.totalCount || 0;

    // Return the results, total count, and current page info
    res.status(200).json({
      data: results,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      perPage: parseInt(limit),
    });
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).json({ error: "Error retrieving data" });
  }
});

module.exports = router;

"use strict";

const NodeCache = require("node-cache");

// Shared cache instance — TTL: 1 hour, check period: 5 minutes
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });

module.exports = cache;

import { config } from "dotenv";
config()

export const VERSION = process.env.NDOE_VERSION || "v1"
export const PORT = process.env.NDOE_PORT || 3000
export const ENV = process.env.NODE_ENV || "development"

// Auth Login
export const LOGIN_EXP = new Date(new Date().getTime() + 2627999999.97164)


// Paginations
export const PAGE       = process.env.PAGE || 1
export const LIMIT      = process.env.PAGE || 20
export const SEARCH     = { column: [], value: null, condition: "or", withWere: true }
export const SORT       = { column: [], value: "asc" }
export const COLUMNS    = []
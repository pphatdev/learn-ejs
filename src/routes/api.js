import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'

import { Router } from 'express'

// import { ROUTE as AUTH } from './auth.js'

const ROUTE = Router()

/**
 * Define Body Parser
*/
ROUTE.use(bodyParser.urlencoded({ extended: true }))
ROUTE.use(bodyParser.json())


// Create routes from folder views as pages
const views = path.join(process.cwd(), 'src/views')
const files = fs.readdirSync(views)

files.forEach(file => {
        const name = file.split('.')[0]
            ROUTE.get(`/${name}`, (req, res) => { return res.render(name, { hello: 'Hello World!' });}
        )
    }
)


// ROUTE.use(`${API}/auth` , AUTH)

export default ROUTE
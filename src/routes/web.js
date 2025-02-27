import bodyParser from 'body-parser'
import path from 'path'
import fs from 'fs'
import { Router } from 'express'

const ROUTE = Router()

// Define Body Parser
ROUTE.use(bodyParser.urlencoded({ extended: true }))
ROUTE.use(bodyParser.json())

// Helper function to create route path
const createRoutePath = (folders) => {
    const lastFolder = folders[folders.length - 1]
    const route = (lastFolder === 'index' || lastFolder === 'home')
        ? '/' + folders.slice(0, -1).join('/')
        : '/' + folders.join('/')
    
    return route.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
}

// Helper function to create route handler
const createRouteHandler = (viewPath) => {

    ROUTE.get(createRoutePath(viewPath.split('/')), (_, res) => {
        return res.render(viewPath, { hello: 'Hello World!' })
    })
}

// Recursive function to process directories
const processDirectory = (currentPath, baseDir = '') => {
    try {
        const files = fs.readdirSync(currentPath)
        
        files.forEach(file => {
            const fullPath = path.join(currentPath, file)
            const relativePath = path.join(baseDir, file)
            const stats = fs.statSync(fullPath)

            if (stats.isDirectory()) {
                processDirectory(fullPath, relativePath)
            } else if (file.endsWith('.ejs')) {
                const viewPath = relativePath.split('.')[0]

                if (viewPath.endsWith('index')) {
                    const route = viewPath.replace('\\index', '')
                    const cleanRoute = route.replace(/\/|\\+/g, '/').replace(/\/$/, '') || '/'
                    return createRouteHandler(cleanRoute)
                }
                else
                {
                    const route = viewPath.replace('\\', '/')
                    const cleanRoute = route.replace(/\/|\\+/g, '/').replace(/\/$/, '') || '/'
                    return createRouteHandler(cleanRoute)
                }
            }

        })
    } catch (error) {
        console.error(`Error processing directory ${currentPath}:`, error)
    }
}



// Create routes from folder views as pages
const views = path.join(process.cwd(), 'src/views')

// Verify views directory exists
if (!fs.existsSync(views)) {
    console.error(`Views directory not found: ${views}`)
} else {
    processDirectory(views)
}

export default ROUTE
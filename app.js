import express from 'express';
import path from 'path';
import ip from 'ip'
import ROUTE from './src/routes/web.js';

import { fileURLToPath } from 'url';
import { Response } from './src/lib/utils/response.js';
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';
const VERSION = process.env.VERSION || 'v1';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'src/public')));

app.use(ROUTE);

// Defualt End point
app.get('/', (req, res) => {
    res.send(Response.success(req.query))
})

// Test route for 500 error
app.get('/test-error', (req, res, next) => {
    throw new Error('Test error');
});

/**
 * API Not Found Handler
 * Catches all unmatched API routes
 */
app.all('/api/*', (req, res) => {
    const currentPath = `http://${ip.address()}:${PORT}${req.path}`
    const currentURL = currentPath + (req._parsedUrl.search ? req._parsedUrl.search : '')
    
    res.status(404).send(
        new Response().notFound({
            title: `API ${VERSION.toUpperCase()} - Not Found`,
            method: req.method,
            current: currentURL,
            message: `Endpoint not found: [${req.method}] ${currentURL}`,
            timestamp: new Date().toISOString()
        })
    )
})

/**
 * Global 404 Handler
 * Catches all other unmatched routes
 */
app.use((req, res) => {
    const currentPath = `http://${ip.address()}:${PORT}${req.path}`
    const currentURL = currentPath + (req._parsedUrl.search ? req._parsedUrl.search : '')
    
    if (req.accepts('html')) {
        res.status(404).render('404', {
            title: 'Page Not Found',
            url: currentURL
        })
    } else {
        res.status(404).send(
            new Response().notFound({
                title: 'Not Found',
                method: req.method,
                current: currentURL,
                message: `Resource not found: [${req.method}] ${currentURL}`,
                timestamp: new Date().toISOString()
            })
        )
    }
})

/**
 * Global Error Handler
 * Handles all uncaught errors
 */
app.use((err, req, res, next) => {
    const currentPath = `http://${ip.address()}:${PORT}${req.path}`
    const currentURL = currentPath + (req._parsedUrl.search ? req._parsedUrl.search : '')
    
    console.error('Error:', err.stack);

    if (req.path.startsWith('/api/')) {
        res.status(500).send(
            new Response().error({
                title: 'Internal Server Error',
                method: req.method,
                current: currentURL,
                message: ENV === 'development' ? err.message : 'Something went wrong',
                stack: ENV === 'development' ? err.stack : undefined,
                timestamp: new Date().toISOString()
            })
        )
    } else if (req.accepts('html')) {
        res.status(500).render('500', {
            title: 'Internal Server Error',
            message: ENV === 'development' ? err.message : 'Something went wrong',
            stack: ENV === 'development' ? err.stack : undefined
        })
    } else {
        res.status(500).send(
            new Response().error({
                title: 'Internal Server Error',
                method: req.method,
                current: currentURL,
                message: ENV === 'development' ? err.message : 'Something went wrong',
                timestamp: new Date().toISOString()
            })
        )
    }
})

app.listen(PORT, () => {
    console.log(`\n♻️  Starting with: [\x1b[35m${ENV}\x1b[0m\] Mode!`)
    console.log(`\n🌞  Web development:`)
    console.log(`🚀 \x1b[30mLocalhost:\x1b[32m http://localhost:${PORT}\x1b[0m`)
    console.log(`🚀 \x1b[30mLocal Service:\x1b[32m http://127.0.0.1:${PORT}\x1b[0m`)
    console.log(`🚀 \x1b[30mHost Service:\x1b[32m http://${ip.address()}:${PORT}\x1b[0m`)
})

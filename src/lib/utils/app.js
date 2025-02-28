import express from 'express';
import path from 'path';
import ipaddr from 'ipaddr.js'
import ROUTE from '../../routes/web.js';
import { fileURLToPath } from 'url';
import { Response } from './response.js';

const getNetworkAddress = () => {
    try {
        // CIDR notation
        const addr = ipaddr.parseCIDR('172.26.17.136/24');
        return addr[0].toString(); // Returns the network address part
    } catch (error) {
        console.error('Error getting network address:', error);
        return '0.0.0.0';
    }
};

const IPAddress = getNetworkAddress();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';
const VERSION = process.env.VERSION || 'v1';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Set views directory and view engine
app.set('views', path.join(__dirname, '..', '..', 'views'));

app.set('view engine', 'ejs');

// Static css and js files
app.use(express.static(path.join(process.cwd(), 'build')));
// app.use(express.static(path.join(process.cwd(), 'build/css')));
// app.use(express.static(path.join(process.cwd(), 'build/js')));
app.use(express.static(path.join(process.cwd(), 'public')));


// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(ROUTE);


/**
 * API Not Found Handler
 * Catches all unmatched API routes
 */
app.all('/api/*', (req, res) => {
    const currentPath = `http://${IPAddress}:${PORT}${req.path}`
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
    const currentPath = `http://${IPAddress}:${PORT}${req.path}`
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
    const currentPath = `http://${IPAddress}:${PORT}${req.path}`
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


// Start server
app.listen(PORT, () => {
    console.log(`\n♻️  Starting with: [\x1b[35m${ENV}\x1b[0m\] Mode!`)
    console.log(`\n🌞  Web development:`)
    console.log(`🚀 \x1b[30mLocalhost:\x1b[32m http://localhost:${PORT}\x1b[0m`)
    console.log(`🚀 \x1b[30mLocal Service:\x1b[32m http://127.0.0.1:${PORT}\x1b[0m`)
    console.log(`🚀 \x1b[30mHost Service:\x1b[32m http://${IPAddress}:${PORT}\x1b[0m`)
})
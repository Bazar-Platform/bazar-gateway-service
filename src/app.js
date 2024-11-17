const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Get catalog and order service URLs from environment variables
const CATALOG_SERVICES = process.env.CATALOG_SERVICES.split(',');
const ORDER_SERVICES = process.env.ORDER_SERVICES.split(',');

const CACHE_SIZE = parseInt(process.env.CACHE_SIZE);

const PORT = process.env.PORT || 5000;

// Round-robin indices for load balancing
let catalogIndex = 0;
let orderIndex = 0;

// Cache storage
const cache = new Map();

// Helper: Cache Management with LSU
function getFromCache(key) {
    if (cache.has(key)) {
        const value = cache.get(key);
        // Move the key to the end (make it least recently used)
        cache.delete(key);
        cache.set(key, value);
        return value;
    }
    return null;
}

function addToCache(key, value) {
    if (cache.size >= CACHE_SIZE) {
        const leastUsedKey = cache.keys().next().value;
        cache.delete(leastUsedKey);
    }
    cache.set(key, value);
}

// Helper: Get next service using round-robin
function getNextService(services, currentIndex) {
    const service = services[currentIndex];
    currentIndex = (currentIndex + 1) % services.length;
    return {service, currentIndex};
}

// Endpoint to invalidate cache entry
app.post('/cache/invalidate', (req, res) => {
    const {key} = req.body;
    if (cache.has(key)) {
        cache.delete(key);
        console.log(`Cache invalidated for key: ${key}`);
        res.status(200).json({message: `Cache invalidated for key: ${key}`});
    } else {
        res.status(404).json({error: 'Key not found in cache'});
    }
});

// Search for books by topic
app.get('/search/:topic', async (req, res) => {
    const topic = req.params.topic;
    const cacheKey = `search:${topic}`;
    const cachedResult = getFromCache(cacheKey);

    if (cachedResult) {
        console.log(`Cache hit for search with topic: ${topic}`);
        return res.json(cachedResult);
    }

    try {
        const {service, currentIndex} = getNextService(CATALOG_SERVICES, catalogIndex);
        catalogIndex = currentIndex;
        console.log(`Searching for books with topic: ${topic} on ${service}`);
        const response = await axios.get(`${service}/search/${topic}`);
        addToCache(cacheKey, response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error searching for books:', error.message);
        res.status(error.response?.status || 500).json({error: 'Failed to search books'});
    }
});

// Get details of a specific book
app.get('/info/:item_number', async (req, res) => {
    const itemNumber = req.params.item_number;
    const cacheKey = `info:${itemNumber}`;
    const cachedResult = getFromCache(cacheKey);

    if (cachedResult) {
        console.log(`Cache hit for book ID: ${itemNumber}`);
        return res.json(cachedResult);
    }

    try {
        const {service, currentIndex} = getNextService(CATALOG_SERVICES, catalogIndex);
        catalogIndex = currentIndex;
        console.log(`Fetching info for book ID: ${itemNumber} from ${service}`);
        const response = await axios.get(`${service}/info/${itemNumber}`);
        addToCache(cacheKey, response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching book info:', error.message);
        res.status(error.response?.status || 500).json({error: 'Failed to fetch book info'});
    }
});

// Purchase a book
app.post('/purchase/:item_number', async (req, res) => {
    const itemNumber = req.params.item_number;
    try {
        const {service, currentIndex} = getNextService(ORDER_SERVICES, orderIndex);
        orderIndex = currentIndex;
        console.log(`Purchasing book ID: ${itemNumber} via ${service}`);
        const response = await axios.post(`${service}/purchase/${itemNumber}`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error processing purchase:', error.message);
        res.status(error.response?.status || 500).json({error: 'Failed to process purchase'});
    }
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({error: 'Internal server error'});
});

// Start the server
app.listen(PORT, () => {
    console.log(`Gateway Service running on port ${PORT}`);
    console.log('Configured Catalog Services:', CATALOG_SERVICES);
    console.log('Configured Order Services:', ORDER_SERVICES);
});

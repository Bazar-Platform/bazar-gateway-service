const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Get catalog and order service URLs from environment variables
const CATALOG_SERVICES = process.env.CATALOG_SERVICES.split(',');
const ORDER_SERVICES = process.env.ORDER_SERVICES.split(',');

const PORT = process.env.PORT || 5000;

// Round-robin indices for load balancing
let catalogIndex = 0;
let orderIndex = 0;

function getNextService(services, currentIndex) {
    const service = services[currentIndex];
    currentIndex = (currentIndex + 1) % services.length;
    return { service, currentIndex };
}

// Search for books by topic
app.get('/search/:topic', async (req, res) => {
    const topic = req.params.topic;
    try {
        const { service, currentIndex } = getNextService(CATALOG_SERVICES, catalogIndex);
        catalogIndex = currentIndex;
        console.log(`Searching for books with topic: ${topic} on ${service}`);
        const response = await axios.get(`${service}/search/${topic}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error searching for books:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to search books' });
    }
});

// Get details of a specific book
app.get('/info/:item_number', async (req, res) => {
    const itemNumber = req.params.item_number;
    try {
        const { service, currentIndex } = getNextService(CATALOG_SERVICES, catalogIndex);
        catalogIndex = currentIndex;
        console.log(`Fetching info for book ID: ${itemNumber} from ${service}`);
        const response = await axios.get(`${service}/info/${itemNumber}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching book info:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch book info' });
    }
});

// Purchase a book
app.post('/purchase/:item_number', async (req, res) => {
    const itemNumber = req.params.item_number;
    try {
        const { service, currentIndex } = getNextService(ORDER_SERVICES, orderIndex);
        orderIndex = currentIndex;
        console.log(`Purchasing book ID: ${itemNumber} via ${service}`);
        const response = await axios.post(`${service}/purchase/${itemNumber}`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error processing purchase:', error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to process purchase' });
    }
});

// Health Check Endpoint (optional, for testing if gateway itself is up)
app.get('/healthcheck', (req, res) => {
    res.status(200).json({ message: 'Gateway is healthy' });
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Gateway Service running on port ${PORT}`);
    console.log('Configured Catalog Services:', CATALOG_SERVICES);
    console.log('Configured Order Services:', ORDER_SERVICES);
});

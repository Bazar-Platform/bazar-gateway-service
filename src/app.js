const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const CATALOG_SERVICE_URL = process.env.CATALOG_URL;
const ORDER_SERVICE_URL = process.env.ORDER_URL;
const PORT = process.env.PORT;

// Search for books by topic
app.get('/search/:topic', async (req, res) => {
    const topic = req.params.topic;
    try {
        console.log(`Searching for books with topic: ${topic}`);
        const response = await axios.get(`${CATALOG_SERVICE_URL}/search/${topic}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error searching for books:', error.message);
        res.status(error.response?.status || 500).json({error: 'Failed to search books'});
    }
});

// Get details of a specific book
app.get('/info/:item_number', async (req, res) => {
    const itemNumber = req.params.item_number;
    try {
        console.log(`Fetching info for book ID: ${itemNumber}`);
        const response = await axios.get(`${CATALOG_SERVICE_URL}/info/${itemNumber}`);
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
        console.log(`Purchasing book ID: ${itemNumber}`);
        const response = await axios.post(`${ORDER_SERVICE_URL}/purchase/${itemNumber}`, req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error processing purchase:', error.message);
        res.status(error.response?.status || 500).json({error: 'Failed to process purchase'});
    }
});

app.listen(PORT, () => {
    console.log(`Gateway Service running on port ${PORT}`);
});

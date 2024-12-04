import axios from 'axios';
import cors from 'cors';
import { Router } from 'express';

const ProxyRouter = Router();
ProxyRouter.use(cors());

const PORT = 3400; // Ensure PORT is defined

// Function to rewrite URLs in the response
function rewriteUrls(data) {
    if (Array.isArray(data.results)) {
        data.results.forEach((book) => {
            if (book.formats) {
                const rewrittenFormats = {};
                for (const [key, value] of Object.entries(book.formats)) {
                    rewrittenFormats[key] = `http://localhost:${PORT}/api/proxy?url=${encodeURIComponent(value)}`;
                }
                book.formats = rewrittenFormats;
            }
        });
    }
    return data;
}

// Endpoint to fetch books from gutendex and rewrite URLs
ProxyRouter.get('/api/books', async (req, res) => {
    try {
        const baseUrl = 'https://gutendex.com/books/';
        const params = new URLSearchParams(req.query).toString();
        const url = `${baseUrl}?${params}`;

        const response = await axios.get(url);
        const rewrittenData = rewriteUrls(response.data);

        res.json(rewrittenData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to proxy requests to external URLs
ProxyRouter.get('/api/proxy', async (req, res) => {
    try {
        const resourceUrl = req.query.url;
        if (!resourceUrl) {
            return res.status(400).json({ error: 'Resource URL is required' });
        }

        const response = await axios.get(resourceUrl, { responseType: 'arraybuffer' });
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch the resource' });
    }
});

// New endpoint to fetch images from a specific Gutenberg URL
ProxyRouter.get('/api/gutenberg/images', async (req, res) => {
    try {
        const url = 'https://www.gutenberg.org/files/8800/8800-h/images'; // Updated URL to proxy

        const response = await axios.get(url, { responseType: 'arraybuffer' });
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch the images from Gutenberg' });
    }
});

// New endpoint to fetch quotes from ZenQuotes (CORS fix)
ProxyRouter.get('/api/zenquotes', async (req, res) => {
    try {
        const zenQuotesUrl = 'https://zenquotes.io/api/quotes';

        // Forward the request to the ZenQuotes API
        const response = await axios.get(zenQuotesUrl);

        // Return the response data from ZenQuotes to the client
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch quotes from ZenQuotes' });
    }
});

export default ProxyRouter;

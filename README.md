# Bazar Gateway Service

The Bazar Gateway Service is a Node.js microservice that acts as the entry point for clients to interact with the Bazar
online bookstore. It connects with the `bazar-catalog-service` to retrieve book details and with the
`bazar-order-service` to process book purchases.

## Project Structure

```
bazar-gateway-service/
├── src/
│ ├── app.js # The main Node.js application
│ └── package.json # List of dependencies
└── Dockerfile # Dockerfile for the gateway service
```

## Environment Variables

- **PORT**: The port on which the gateway service will run (default: 5000).
- **CATALOG_URL**: URL for the catalog service to fetch book details.
- **ORDER_URL**: URL for the order service to process book purchases.

## Endpoints

### Search for Books by Topic

- **GET** `/search/:topic`

  Searches for books in the catalog by topic.

    - **Response**:
        - Success: Returns a JSON array of books that match the topic.
        - Failure: ```{ "error": "Failed to search books" }```

### Get Book Details

- **GET** `/info/:item_number`

  Retrieves details for a specific book by `item_number`.

    - **Response**:
        - Success: Returns a JSON object with the book’s details.
        - Failure: ```{ "error": "Failed to fetch book info" }```

### Purchase a Book

- **POST** `/purchase/:item_number`

  Initiates a purchase request for a book by `item_number`.

    - **Request Body**: ```{ "qty": 1 }```

    - **Response**:
        - Success: ```{ "message": "Purchased <quantity> book(s): <book title>" }```
        - Failure: ```{ "error": "Failed to process purchase" }```

## Running with Docker Compose

The gateway service is part of a multi-service Docker Compose setup that includes the `catalog-service` and
`order-service`.

### Step 1: Start the Services

To build and run the gateway, catalog, and order services together, navigate to the project directory containing the
`docker-compose.yml` file and run:

```bash
docker-compose up --build
```

This command will:

- Build fresh images for `bazar-gateway-service`, `bazar-catalog-service`, and `bazar-order-service`.
- Start each service in its own container and connect them over a shared network.
- Expose the gateway service on port `5000`, the catalog service on port `5001`, and the order service on port `5002`.

### Step 2: Access the Gateway Service

Once the services are running, you can access the gateway at `http://localhost:5000`.

### Example Requests

1. **Search for Books by Topic**:
   ```
   GET http://localhost:5000/search/distributed%20systems
   ```

2. **Get Book Details**:
   ```
   GET http://localhost:5000/info/1
   ```

3. **Purchase a Book**:
   ```
   POST http://localhost:5000/purchase/1
   Content-Type: application/json

   {
   "qty": 2
   }
   ```

# Bazar Gateway Service

The Bazar Gateway Service is a Node.js microservice that acts as the entry point for clients to interact with the Bazar
online bookstore. It connects with the `bazar-catalog-service` to retrieve book details and with the
`bazar-order-service` to process book purchases.

## Features

- **Book Search**: Allows clients to search books by topic via the Catalog Service.
- **Book Details**: Provides detailed information about specific books.
- **Purchase Processing**: Facilitates purchase requests via the Order Service.
- **Load Balancing**: Distributes requests across multiple Order & Catalog Service instances.
- **Cache Optimization**: Implements a small in-memory cache for frequently accessed data to reduce response times.

## Architecture

The Gateway Service is designed to interact with a distributed system comprising multiple services. The key components
and their roles in the architecture are:

1. **Gateway Service**:
    - Acts as the central access point for all client requests.
    - Balances the load between multiple Service instances.
    - Maintains a small in-memory cache to reduce redundant requests to downstream services.

2. **Catalog Service**:
    - Exposes two instances:
        - **Primary Instance**: Handles queries and all of updates.
        - **Backup Instance**: Synchronizes with the primary and serves as a query replica.
    - Updates triggered by the Gateway Service ensure cache invalidation via the `CACHE_INVALIDATE_URL`.

3. **Order Service**:
    - Processes purchase requests.
    - Multiple instances allow for load balancing and fault tolerance.

## Environment Variables

The following environment variables configure the Gateway Service:

- **General Settings**:
    - `PORT` (default: `5000`): The port on which the gateway service runs.

- **Catalog Service Configuration**:
    - `CATALOG_SERVICES`: A comma-separated list of URLs for catalog services (e.g.,
      `http://bazar-catalog-primary:5001,http://bazar-catalog-backup:5001`).
    - `CACHE_SIZE` (default: `3`): The maximum number of items to store in the in-memory cache for catalog data.

- **Order Service Configuration**:
    - `ORDER_SERVICES`: A comma-separated list of URLs for order services (e.g.,
      `http://bazar-order-service-1:5002,http://bazar-order-service-2:5002`).

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

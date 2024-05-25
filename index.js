const { Client } = require("elasticsearch");

const client = new Client({
  // The Elasticsearch endpoint to use.
  node: "http://localhost:9200",
  // Max number of retries for each request.
  maxRetries: 5,
  // Max request timeout in milliseconds for each request.
  requestTimeout: 60000
});

const run = async () => {
  try {
    // Create index
    let response = await client.indices.create({
      index: "products"
    });
    console.log('Index created:', response);

    // Index a single document
    response = await client.index({
      id: 1,
      index: "products",
      body: {
        id: 1,
        name: "iPhone 12",
        price: 699,
        description: "Blast past fast"
      }
    });
    console.log('Document indexed:', response);

    // Index multiple documents using `bulk`
    const dataset = [
      {
        id: 2,
        name: "iPhone 12 mini",
        description: "Blast past fast.",
        price: 599
      },
      {
        id: 3,
        name: "iPhone 12 Pro",
        description: "It's a leap year.",
        price: 999
      },
      {
        id: 4,
        name: "iPhone 12 Pro max",
        description: "It's a leap year.",
        price: 1199
      }
    ];

    const body = dataset.flatMap((doc) => [
      { index: { _index: "products" } },
      doc
    ]);
    console.log(body);
    const bulkResponse = await client.bulk({ refresh: true, body });

    if (bulkResponse.errors) {
      const erroredDocuments = [];
      bulkResponse.items.forEach((action, i) => {
        const operation = Object.keys(action)[0];
        if (action[operation].error) {
          erroredDocuments.push({
            status: action[operation].status,
            error: action[operation].error,
            operation: body[i * 2],
            document: body[i * 2 + 1]
          });
        }
      });
      console.log('Errored documents:', erroredDocuments);
    }

    // Update document
    response = await client.update({
      index: "products",
      id: 1,
      body: {
        script: {
          source: "ctx._source.price += params.price_diff",
          params: {
            price_diff: 99
          }
        }
      }
    });
    console.log('Document updated:', response);

    // Delete an indexed document
    response = await client.delete({
      index: "products",
      id: 1
    });
    console.log('Document deleted:', response);

    // Perform search
    const searchResponse = await client.search({
        index: "products",
        body: {
          query: {
            match_all: {} // Match all documents
          }
        }
      });

    let data =searchResponse.hits.hits
    let product = new Set();
    data.map((item)=>{
            product.add(item._source);
      })
   console.log('Search results:', product);

  } catch (error) {
    console.log("Oops! Something went wrong. Let's see...\n");
    console.log(error);
  }
};

// Run the main function
run();

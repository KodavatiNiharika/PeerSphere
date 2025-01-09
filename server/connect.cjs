const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "./config.env" });

async function main() {
  const Db = process.env.ATLAS_URI; // Ensure ATLAS_URI is correctly set in .env
  const client = new MongoClient(Db);

  try {
    // Connect to the database
    await client.connect();
    console.log("Connected to MongoDB!");

    // Retrieve the list of collections from the 'PeerSphere' database
    const collections = await client.db("PeerSphere").collections();

    // Iterate over collections and print their namespaces
    collections.forEach((collection) => {
      console.log("Collection namespace:", collection.namespace);
    });
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    // Close the database connection
    await client.close();
    console.log("Connection closed.");
  }
}

main();

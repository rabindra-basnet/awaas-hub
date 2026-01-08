import { MongoClient } from "mongodb"

async function initializeDatabase() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/realestate"
  const client = new MongoClient(mongoUri)

  try {
    await client.connect()
    const db = client.db("realestate")

    // Create collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    if (!collectionNames.includes("user")) {
      await db.createCollection("user")
      await db.collection("user").createIndex({ email: 1 }, { unique: true })
      console.log("✓ Created user collection")
    }

    if (!collectionNames.includes("session")) {
      await db.createCollection("session")
      await db.collection("session").createIndex({ userId: 1 })
      console.log("✓ Created session collection")
    }

    if (!collectionNames.includes("account")) {
      await db.createCollection("account")
      await db.collection("account").createIndex({ userId: 1 })
      console.log("✓ Created account collection")
    }

    if (!collectionNames.includes("properties")) {
      await db.createCollection("properties")
      await db.collection("properties").createIndex({ sellerId: 1 })
      await db.collection("properties").createIndex({ status: 1 })
      console.log("✓ Created properties collection")
    }

    if (!collectionNames.includes("favorites")) {
      await db.createCollection("favorites")
      await db.collection("favorites").createIndex({ userId: 1, propertyId: 1 }, { unique: true })
      console.log("✓ Created favorites collection")
    }

    if (!collectionNames.includes("appointments")) {
      await db.createCollection("appointments")
      await db.collection("appointments").createIndex({ propertyId: 1 })
      await db.collection("appointments").createIndex({ buyerId: 1 })
      console.log("✓ Created appointments collection")
    }

    console.log("✓ Database initialization complete!")
  } catch (error) {
    console.error("Database initialization failed:", error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

initializeDatabase()

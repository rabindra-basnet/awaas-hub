import { MongoClient } from "mongodb"

async function initializeDatabase() {
  const mongoUri = process.env.MONGODB_URI!
  const client = new MongoClient(mongoUri)

  try {
    await client.connect()
    const db = client.db("realestate")

    // Create collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    if (!collectionNames.includes("users")) {
      await db.createCollection("users")
      await db.collection("users").createIndex({ email: 1 }, { unique: true })
      console.log("✓ Created user collection")
    }

    if (!collectionNames.includes("sessions")) {
      await db.createCollection("sessions")
      await db.collection("sessions").createIndex({ userId: 1 })
      console.log("✓ Created session collection")
    }

    if (!collectionNames.includes("accounts")) {
      await db.createCollection("accounts")
      await db.collection("accounts").createIndex({ userId: 1 })
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

import { MongoClient, Db } from "mongodb";
 
const uri = process.env.MONGODB_URI!;
 
if (!uri) {
  throw new Error("Please add MONGODB_URI to your .env file");
}
 
let clientPromise: Promise<MongoClient>;
 
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}
 
if (!global._mongoClientPromise) {
  const client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;
 
export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db("bill-analyzer");
}
 
import { type NextRequest } from 'next/server'
import { type NextResponse } from 'next/server'
import { MongoClient, ServerApiVersion } from 'mongodb'

const isPro = process.env.NEXT_PUBLIC_ISPRO && process.env.NEXT_PUBLIC_ISPRO.toString() === "1"

type ResponseData = {
    message: string
}

export async function POST(
    req: NextRequest,
    res: NextResponse<ResponseData>
) {
    const client = new MongoClient(process.env.MONGO_URI!, {
        serverApi: {
            version: ServerApiVersion.v1,
            deprecationErrors: true,
            strict: true,
        }
    });

    try {
        const { payload, operation, collection }: { payload: any, operation: string, collection: string } = await req.json();

        await client.connect();

        const db = await client.db("Brainwave");

        await db.command({ ping: 1 });

        const dbCollection = db.collection(collection);

        if (operation === 'fetch') {
            const data = await dbCollection.find({}).toArray();
            return new Response(JSON.stringify(data), { status: 200 });
        }

        if (!isPro) {
            return new Response("Unauthorized", { status: 401 });
        }

        if (operation === 'insert') {
            const insertResult = await dbCollection.insertOne(payload);
            console.info('Inserted documents =>', insertResult);
        }

        if (operation === 'delete') {
            const deleteResult = await dbCollection.deleteOne({ id: payload.id });
            console.info('Deleted documents =>', deleteResult);
        }

        if (operation === 'update') {
            const updateResult = await dbCollection.updateOne({ id: payload.id }, { $set: payload });
            console.info('Updated documents =>', updateResult);
        }

        return new Response("Success", { status: 200 });
    } catch (e) {
        return new Response("Error connecting to MongoDB: " + e, { status: 500 });
    }
    finally {
        await client.close();
    }
}
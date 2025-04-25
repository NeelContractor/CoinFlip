import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

const secretKeyString = process.env.PRIVATE_KEY!;
const secretKeyArray = JSON.parse(secretKeyString) as number[];
const keyPair = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));
const connection = new Connection("https://api.devnet.solana.com");

export async function POST(req: NextRequest) {
    const wonCoin = Math.random() < 0.5;
    const { searchParams } = new URL(req.url);
    const publicKey = searchParams.get('publicKey') as unknown as string;
    const betAmount = searchParams.get('betAmount') as unknown as string;
    // const txn = searchParams.get('txn') as unknown as string;
    // console.log("txn on be :", txn)
    // TODO: Parse the amoubt from the txn signature

    if (wonCoin) {
        // send them 2x of the amount they bet
        const winTransaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: keyPair.publicKey,
                toPubkey: new PublicKey(publicKey),
                lamports: Math.floor(Number(betAmount) * 2)
            })
        );

        await connection.sendTransaction(winTransaction, [keyPair]);

        return NextResponse.json({
            result: "won"
        })
    } else {
        return NextResponse.json({
            result: "lose"
        })
    }
}
"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react";
import { Coins as Coin, PinOff as CoinOff } from 'lucide-react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import axios from "axios";
import { toast } from "sonner"

const PLATFORM_FEE = 0.03; // 3%
const PLATFORM_WALLET = new PublicKey("NeeF4wurno255WqxWwgTsXK6EWkwNkZiRkxHZE919AD");
const BACKEND_URL = "http://localhost:3000/api/flip";

export default function Hero() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [selectedSide, setSelectedSide] = useState<'heads' | 'tails' | null>(null)
    const [amount, setAmount] = useState<number>(0.1);
    const [isFlipping, setIsFlipping] = useState(false);

    const amounts = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];

    const handleBet = async () => {
        if (!publicKey || !selectedSide) return;

        try {
            setIsFlipping(true);

            // Calculate amount in lamports
            const betAmount = amount * LAMPORTS_PER_SOL;
            // Create Transaction
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: PLATFORM_WALLET,
                    lamports: Math.floor(betAmount)
                })
            );

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'confirmed');

            // const result = Math.random() >= 0.5 ? 'heads' : 'tails';

            const response = await axios.post(`${BACKEND_URL}?publicKey=${publicKey}&betAmount=${betAmount}`);

            const won = response.data.result;
            if (won) {
            toast("Result", {
                description: "Congratulations! You won!",
                })
            } else {
                toast("Result", {
                    description: "Better luck next time!",
                })
            }
        } catch (error) {
            console.error('Error: ', error);
            toast.error("Transaction failed!");
        } finally {
            setIsFlipping(false);
        }
    }

    return <div className="max-w-md mx-auto bg-gray-800 rounded-xl p-8 shadow-lg">
        {!publicKey ? (
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Choose Your Wallet</h2>
                <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
            </div> 
            ) : (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Choose Your Side</h2>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setSelectedSide('heads')}
                            className={`p-4 rounded-lg ${
                                selectedSide === 'heads' ? 'bg-blue-600' : 'bg-gray-500 hover:bg-gray-400'
                            }`}
                        >
                            <Coin className="w-12 h-12" />
                            <span className="block mt-2">Heads</span>
                        </button>
                        <button
                            onClick={() => setSelectedSide('tails')}
                            className={`p-4 rounded-lg ${
                                selectedSide === 'tails' ? 'bg-blue-600' : 'bg-gray-500 hover:bg-gray-400'}`}
                        >
                            <CoinOff className="w-12 h-12" />
                            <span className="block mt-2">Tails</span>
                        </button>
                    </div>
                </div>
                <div className="spac-y-4">
                    <h3 className="text-xl font-semibold text-center">Select Amount</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {amounts.map((val) => (
                            <button
                                key={val}
                                onClick={() => setAmount(val)}
                                className={`py-4 rounded ${
                                    amount === val ? 'bg-blue-600' : 'bg-gray-500 hover:bg-gray-400'
                                }`}
                            >{val} SOL</button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleBet}
                    disabled={!selectedSide || isFlipping}
                    className={`w-full py-3 px-6 rounded-lg text-lg font-semibold ${
                        !selectedSide || isFlipping ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >{isFlipping ? 'Flipping...' : 'Place Bet'}</button>

                <p className="text-sm text-gray-500 text-center">
                    Platform fee: {PLATFORM_FEE * 100}%
                </p>
                <p className="text-sm text-gray-500 text-center">
                    Currently on Devnet
                </p>
            </div>
        )}
    </div>
}


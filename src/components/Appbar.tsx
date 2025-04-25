"use client"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";


export default function Appbar() {
    return <div className="flex justify-between p-5">
        <h1 className="font-bold text-white text-4xl font-mono">CoinFlip</h1>
        <WalletMultiButton />
    </div>
}
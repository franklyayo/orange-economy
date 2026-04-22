import { useAccount, useWriteContract } from "wagmi";
import { parseAbi } from "viem";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { supabase } from "../lib/supabase";

const CONTRACT_ADDRESS = "0xbBd713a3EdeA46343887aC1CDCfBa2e8F74FECc8" as const;

const abi = parseAbi([
  "function mintTo(address recipient, string memory uri) public returns (uint256)",
]);

interface MintNFTProps {
  onMintSuccess?: () => void;
}

export default function MintNFT({ onMintSuccess }: MintNFTProps) {
  const { address } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [justMinted, setJustMinted] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string>("");

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
    setDuplicateWarning("");
  };

  const handleUploadAndMint = async () => {
    if (!file || !address) return;
    setUploading(true);
    setDuplicateWarning("");

    try {
      const jwt = import.meta.env.VITE_PINATA_JWT;
      if (!jwt) throw new Error("VITE_PINATA_JWT not found in .env");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
        body: formData,
      });

      const result = await response.json();
      if (!result.IpfsHash) throw new Error("Upload failed");

      const ipfsUri = `ipfs://${result.IpfsHash}`;

      // Duplicate Protection Check
      const { data: existing } = await supabase
        .from("listings")
        .select("id, title, creator")
        .eq("ipfs_uri", ipfsUri)
        .limit(1);

      if (existing && existing.length > 0) {
        const original = existing[0];
        setDuplicateWarning(`⚠️ This file was already minted by ${original.creator.slice(0, 8)}... as "${original.title}". You can still mint your own version.`);
      }

      // Mint the NFT
      writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "mintTo",
        args: [address, ipfsUri],
        maxPriorityFeePerGas: 30000000000n,
        maxFeePerGas: 60000000000n,
      }, {
        onSuccess: async () => {
          await supabase.from("listings").insert({
            title: file.name || "Untitled Asset",
            creator: address,
            creator_avatar: `https://picsum.photos/seed/${address}/100/100`,
            category: "digital",
            price: "₦50,000",
            license_type: "Royalty-Free",
            image: preview,
            ipfs_uri: ipfsUri,
            description: duplicateWarning ? "Duplicate Copy" : "Minted via Orange Exchange",
            rating: 5.0,
            reviews: 1,
          });

          setJustMinted(true);
          onMintSuccess?.();
        },
      });
    } catch (err: any) {
      console.error("Upload/Mint error:", err);
      alert("Upload failed: " + (err.message || "Please check console for details"));
    } finally {
      setUploading(false);
    }
  };

  if (!address) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-border rounded-[20px]">
        <p className="text-lg font-medium mb-6">Connect your wallet to mint an Orange Economy NFT</p>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Drag & Drop Area */}
      <div
        onDrop={(e) => {
          e.preventDefault();
          const droppedFile = e.dataTransfer.files[0];
          if (droppedFile) handleFileSelect(droppedFile);
        }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById("file-input")?.click()}
        className="border-2 border-dashed border-border rounded-[20px] p-12 text-center cursor-pointer hover:border-primary transition-colors"
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
        />
        {preview ? (
          <img src={preview} alt="preview" className="mx-auto max-h-64 rounded-xl" />
        ) : (
          <div>
            <p className="text-lg font-medium">Drop your file here</p>
            <p className="text-sm text-muted-foreground mt-2">Image, audio, video, PDF…</p>
          </div>
        )}
      </div>

      {duplicateWarning && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-[12px] text-sm">
          {duplicateWarning}
        </div>
      )}

      {file && (
        <div className="flex items-center justify-between bg-card p-4 rounded-[16px]">
          <p className="text-sm font-medium text-green-600 truncate">✓ {file.name}</p>
          <Button
            onClick={handleUploadAndMint}
            disabled={uploading || isPending}
            size="lg"
            className="bg-orange-600 hover:bg-orange-700"
          >
            {uploading || isPending ? "Uploading & Minting…" : "Upload to IPFS & Mint NFT"}
          </Button>
        </div>
      )}

      {justMinted && <p className="text-green-600 text-center font-medium">✅ Minted & added to marketplace!</p>}
    </div>
  );
}

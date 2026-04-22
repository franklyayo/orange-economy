import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseAbi, parseEther } from "viem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Play, Image as ImageIcon, FileText, Star, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { ORANGE_NFT_ADDRESS, MARKETPLACE_ADDRESS, marketplaceAbi } from "../lib/contracts";

const nftAbi = parseAbi(["function ownerOf(uint256 tokenId) external view returns (address)"]);

interface MarketplaceCardProps {
  item: any;
}

export default function MarketplaceCard({ item }: MarketplaceCardProps) {
  const { address } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  // Check if current user owns this NFT
  const isOwner = address && address.toLowerCase() === item.creator?.toLowerCase();

  const handleListForSale = async () => {
    // First approve the marketplace (one-time per NFT)
    writeContract({
      address: ORANGE_NFT_ADDRESS,
      abi: parseAbi(["function approve(address to, uint256 tokenId) external"]),
      functionName: "approve",
      args: [MARKETPLACE_ADDRESS, BigInt(item.token_id || 0)], // you can add token_id to your Supabase row if needed
    }, {
      onSuccess: () => {
        // Then list
        writeContract({
          address: MARKETPLACE_ADDRESS,
          abi: marketplaceAbi,
          functionName: "listForSale",
          args: [ORANGE_NFT_ADDRESS, BigInt(item.token_id || 0), parseEther("0.01")], // example 0.01 POL price
        });
      },
    });
  };

  const handleBuyNow = () => {
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: marketplaceAbi,
      functionName: "buy",
      args: [ORANGE_NFT_ADDRESS, BigInt(item.token_id || 0)],
      value: parseEther("0.01"), // match the listed price
    });
  };

  return (
    <motion.div
      className="col-span-1 md:col-span-6 lg:col-span-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="h-full group overflow-hidden border-border bg-card rounded-[20px] flex flex-col">
        {/* Your original beautiful card UI */}
        <div className="relative aspect-video overflow-hidden border-b border-border">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
          <Badge className="absolute top-3 left-3">{item.category}</Badge>
          <Badge variant="secondary" className="absolute bottom-3 right-3">{item.price}</Badge>
        </div>

        <CardContent className="p-5 flex-1">
          <h3 className="font-bold text-lg">{item.title}</h3>
          <div className="flex items-center gap-2 my-3">
            <Avatar className="w-6 h-6">
              <AvatarImage src={item.creator_avatar} />
              <AvatarFallback>{item.creator?.slice(0,2)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{item.creator}</span>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0 mt-auto flex gap-2">
          {isOwner ? (
            <Button onClick={handleListForSale} disabled={isPending} className="flex-1 rounded-[10px]">
              List for Sale
            </Button>
          ) : (
            <Button onClick={handleBuyNow} disabled={isPending} className="flex-1 rounded-[10px] bg-green-600 hover:bg-green-700">
              Buy Now
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

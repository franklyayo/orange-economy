import { http, createConfig } from "wagmi";
import { polygon } from "wagmi/chains";        
import { injected, metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [polygon],
  transports: {
    // Uses your dedicated Alchemy node for fast, reliable reads/writes
    [polygon.id]: http(import.meta.env.VITE_POLYGON_MAINNET_RPC), 
  },
  connectors: [injected(), metaMask()],
});

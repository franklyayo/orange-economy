import { http, createConfig } from "wagmi";
import { polygonAmoy } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [polygonAmoy],
  transports: {
    [polygonAmoy.id]: http("https://rpc-amoy.polygon.technology"),
  },
  connectors: [injected(), metaMask()],
});

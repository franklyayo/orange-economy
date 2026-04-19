import hre from "hardhat";

console.log("Hardhat version:", hre.version);
console.log("Loaded plugins:", Object.keys(hre.config.plugins || {}));
console.log("hre.ethers type:", typeof hre.ethers);
console.log("hre.viem type:", typeof hre.viem);
console.log("Network config:", hre.config.networks.polygonAmoy);

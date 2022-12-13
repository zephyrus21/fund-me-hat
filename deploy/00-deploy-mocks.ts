import { network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat-config";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (developmentChains.includes(network.name)) {
    log("Local network detected, Deployment of mocks...");
    await deploy("MockV3Aggregator", {
      from: deployer,
      args: [8, 20000000000],
      log: true,
    });
    log("Mockls deployed!");
  }
};

export default func;

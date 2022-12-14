import { network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat-config";

module.exports = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

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

module.exports.tags = ["all", "mocks"];
// export const tags = ["all", "mocks"];

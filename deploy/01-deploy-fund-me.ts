import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { network } from "hardhat";
import { networkConfig } from "../helper-hardhat-config";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (chainId != undefined) {
    const ethUsdPriceFeedAddress =
      networkConfig[chainId as keyof typeof networkConfig]["ethUsdPriceFeed"];
  }

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [], // put priceFeed address here
    log: true,
  });
};

export default func;

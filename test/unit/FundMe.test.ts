import { assert, expect } from "chai";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { MockV3Aggregator } from "../../typechain-types";

describe("FundMe", async () => {
  let fundMe: any, deployer: any, mockV3Aggregator: MockV3Aggregator;
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("constructor", async () => {
    it("sets the aggregator address", async () => {
      const response = await fundMe.priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  describe("fund", async () => {
    it("Fails if you don't send enough ETH", async () => {
      await expect(fundMe.fund()).to.be.revertedWith(
        "You need to spend more ETH!"
      );
    });

    it("Updates the amount funded from the data structure", async () => {
      await fundMe.fund({
        value: ethers.utils.parseEther("1"),
      });
      const response = await fundMe.addressToAmountFunded(deployer);
      assert.equal(
        response.toString(),
        ethers.utils.parseEther("1").toString()
      );
    });

    it("Adds funder's address to the funders array", async () => {
      await fundMe.fund({
        value: ethers.utils.parseEther("1"),
      });
      const response = await fundMe.funders(0);
      assert.equal(response, deployer);
    });
  });
});

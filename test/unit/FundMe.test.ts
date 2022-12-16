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

  describe("withdraw", async () => {
    beforeEach(async () => {
      await fundMe.fund({
        value: ethers.utils.parseEther("1"),
      });
    });
    it("Withdraw ETH from a single funder", async () => {
      const startingFundMeBalance = await ethers.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);
      const endingFundMeBalance = await ethers.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await ethers.provider.getBalance(deployer);

      assert.equal(endingFundMeBalance.toString(), "0");
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
    });

    it("Withdraw ETH from multiple funders", async () => {
      const accounts = await ethers.getSigners();
      for (let i = 1; i < 6; i++) {
        // 0 is the deployer
        const fundMeConnectedAccounts = await fundMe.connect(accounts[i]);
        await fundMeConnectedAccounts.fund({
          value: ethers.utils.parseEther("1"),
        });
      }
      const startingFundMeBalance = await ethers.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);
      const endingFundMeBalance = await ethers.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await ethers.provider.getBalance(deployer);

      assert.equal(endingFundMeBalance.toString(), "0");
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );

      await expect(fundMe.funders(0)).to.be.reverted;
      for (let i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.addressToAmountFunded(accounts[i].address),
          0
        );
      }
    });

    it("Only allows the owner to withdraw", async () => {
      const accounts: any = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedContract = await fundMe.connect(attacker);
      await expect(attackerConnectedContract.withdraw()).to.be.reverted;
    });
  });
});

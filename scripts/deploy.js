// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const path = require("path");

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
      "gets automatically created and destroyed every time. Use the Hardhat" +
      " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Deployer721 = await ethers.getContractFactory("Deployer721");
  const deployer721 = await Deployer721.deploy();
  await deployer721.deployed();

  console.log("Deployer721 address:", deployer721.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveArtifacts(deployer721);
}

function saveArtifacts(deployer721) {
  const fs = require("fs");

  // Frontend

  let contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Deployer721: deployer721.address }, undefined, 2)
  );

  const Deployer721Artifact = artifacts.readArtifactSync("Deployer721");

  fs.writeFileSync(
    path.join(contractsDir, "Deployer721.json"),
    JSON.stringify(Deployer721Artifact, null, 2)
  );

  // Backend

  contractsDir = path.join(__dirname, "..", "backend", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Deployer721: deployer721.address }, undefined, 2)
  );

  fs.writeFileSync(
    path.join(contractsDir, "Deployer721.json"),
    JSON.stringify(Deployer721Artifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

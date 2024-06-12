const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const VerifierModule = buildModule("VerifierModule", (m) => {
  // To use a library, you first deploy it with `m.library`
  const library = m.library("BN256G2");

  // We then pass it as an option to `m.contract`
  const verifier = m.contract("Verifier", [], {
    libraries: { BN256G2: library },
  });

  return {
    verifier,
  };
});

module.exports = VerifierModule;
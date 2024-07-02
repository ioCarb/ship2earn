const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const VerifierModule = buildModule("verifier_distanceModule", (m) => {
  // To use a library, you first deploy it with `m.library`
  const library = m.library("BN256G2");

  // We then pass it as an option to `m.contract`
  const verifier_distance = m.contract("verifier_distance", [], {
    libraries: { BN256G2: library },
  });

  return {
    verifier_distance,
  };
});

module.exports = verifier_distanceModule;
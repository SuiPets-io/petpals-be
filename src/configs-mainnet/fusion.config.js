const eggConfig = require('./egg.config');

const fusionConfig = module.exports;

fusionConfig.ACTIVE_FUSION_PRICE = 5; //5

fusionConfig.FEE_RATE = 0.05;

fusionConfig.LEVEL_TO_FUSION = 2;

fusionConfig.TIME_TO_FUSION_IN_HOUR = {
  1: 0, // 0h
  2: 4,
  3: 4,
  4: 8,
  5: 8,
  6: 16,
  7: 16,
  8: 32,
  9: 32,
  10: 100,
};

fusionConfig.FUSION_RARITY_INDEX = {
  [eggConfig.RARITY.COMMON]: 0,
  [eggConfig.RARITY.RARE]: 1,
  [eggConfig.RARITY.EPIC]: 2,
  [eggConfig.RARITY.LEGENDARY]: 3,
};

fusionConfig.COMMON_RATE = [
  [{ from: 0, to: 1, rarity: eggConfig.RARITY.COMMON }],
  [
    { from: 0, to: 0.1, rarity: eggConfig.RARITY.RARE },
    { from: 0.1, to: 1, rarity: eggConfig.RARITY.COMMON },
  ],
  [
    { from: 0, to: 0.1, rarity: eggConfig.RARITY.EPIC },
    { from: 0.1, to: 0.3, rarity: eggConfig.RARITY.RARE },
    { from: 0.3, to: 1, rarity: eggConfig.RARITY.COMMON },
  ],
  [
    { from: 0, to: 0.05, rarity: eggConfig.RARITY.LEGENDARY },
    { from: 0.05, to: 0.25, rarity: eggConfig.RARITY.EPIC },
    { from: 0.25, to: 0.55, rarity: eggConfig.RARITY.RARE },
    { from: 0.55, to: 1, rarity: eggConfig.RARITY.COMMON },
  ],
];

fusionConfig.RARE_RATE = [
  [
    { from: 0, to: 0.1, rarity: eggConfig.RARITY.RARE },
    { from: 0.1, to: 1, rarity: eggConfig.RARITY.COMMON },
  ],
  [
    { from: 0, to: 0.28, rarity: eggConfig.RARITY.RARE },
    { from: 0.28, to: 1, rarity: eggConfig.RARITY.COMMON },
  ],
  [
    { from: 0, to: 0.2, rarity: eggConfig.RARITY.EPIC },
    { from: 0.2, to: 0.51, rarity: eggConfig.RARITY.RARE },
    { from: 0.51, to: 1, rarity: eggConfig.RARITY.COMMON },
  ],
  [
    { from: 0, to: 0.075, rarity: eggConfig.RARITY.LEGENDARY },
    { from: 0.075, to: 0.375, rarity: eggConfig.RARITY.EPIC },
    { from: 0.375, to: 0.735, rarity: eggConfig.RARITY.RARE },
    { from: 0.735, to: 1, rarity: eggConfig.RARITY.COMMON },
  ],
];

fusionConfig.EPIC_RATE = [
  [
    { from: 0, to: 0.1, rarity: eggConfig.RARITY.EPIC },
    { from: 0.1, to: 0.3, rarity: eggConfig.RARITY.RARE },
    { from: 0.3, to: 1, rarity: eggConfig.RARITY.COMMON },
  ],
  [
    { from: 0, to: 0.2, rarity: eggConfig.RARITY.EPIC },
    { from: 0.2, to: 0.51, rarity: eggConfig.RARITY.RARE },
    { from: 0.51, to: 1, rarity: eggConfig.RARITY.COMMON },
  ],
  [
    { from: 0, to: 0.4, rarity: eggConfig.RARITY.EPIC },
    { from: 0.4, to: 0.82, rarity: eggConfig.RARITY.RARE },
    { from: 0.82, to: 1, rarity: eggConfig.RARITY.COMMON },
  ],
  [
    { from: 0, to: 0.135, rarity: eggConfig.RARITY.LEGENDARY },
    { from: 0.135, to: 0.61, rarity: eggConfig.RARITY.EPIC },
    { from: 0.61, to: 0.885, rarity: eggConfig.RARITY.RARE },
    { from: 0.885, to: 1, rarity: eggConfig.RARITY.COMMON },
  ],
];

fusionConfig.LEGENDARY_RATE = [
  [
    { from: 0, to: 0.05, rarity: eggConfig.RARITY.LEGENDARY },
    { from: 0.05, to: 0.25, rarity: eggConfig.RARITY.EPIC },
    { from: 0.25, to: 0.55, rarity: eggConfig.RARITY.RARE },
    { from: 0.55, to: 1, rarity: eggConfig.RARITY.COMMON },
  ],
  [
    { from: 0, to: 0.075, rarity: eggConfig.RARITY.LEGENDARY },
    { from: 0.075, to: 0.375, rarity: eggConfig.RARITY.EPIC },
    { from: 0.375, to: 0.735, rarity: eggConfig.RARITY.RARE },
    { from: 0.735, to: 1, rarity: eggConfig.RARITY.COMMON },
  ],
  [
    { from: 0, to: 0.135, rarity: eggConfig.RARITY.LEGENDARY },
    { from: 0.135, to: 0.61, rarity: eggConfig.RARITY.EPIC },
    { from: 0.61, to: 0.885, rarity: eggConfig.RARITY.RARE },
    { from: 0.885, to: 1, rarity: eggConfig.RARITY.COMMON },
  ],
  [
    { from: 0, to: 0.25, rarity: eggConfig.RARITY.LEGENDARY },
    { from: 0.25, to: 0.785, rarity: eggConfig.RARITY.EPIC },
    { from: 0.785, to: 1, rarity: eggConfig.RARITY.RARE },
  ],
];

fusionConfig.FUSION_RATE = [
  this.COMMON_RATE,
  this.RARE_RATE,
  this.EPIC_RATE,
  this.LEGENDARY_RATE,
];

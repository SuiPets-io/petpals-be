const eggConfig = module.exports;

eggConfig.BUY_FEE_RATE = 0.05;

eggConfig.HANDLE_STATUS = {
  ADMIN: 'admin',
  USER: 'user',
};

eggConfig.ORIGIN = {
  GENESIS: 'genesis',
  NORMAL: 'normal',
};

eggConfig.RARITY = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
};

eggConfig.EGG_STATUS = {
  DIE: 'die',
  ACTIVE: 'active',
  ONSALE: 'onsale',
  FARMING: 'farming',
};

eggConfig.RARITY_BUFF = {
  [this.ORIGIN.NORMAL]: {
    [this.RARITY.COMMON]: 1,
    [this.RARITY.RARE]: 2,
    [this.RARITY.EPIC]: 9,
    [this.RARITY.LEGENDARY]: 15,
  },
  [this.ORIGIN.GENESIS]: {
    [this.RARITY.COMMON]: 1.5,
    [this.RARITY.RARE]: 3,
    [this.RARITY.EPIC]: 12,
    [this.RARITY.LEGENDARY]: 20,
  },
};

eggConfig.MAX_FREE_EGG = 1000;

eggConfig.FREE_EGG_CONFIG = {
  [this.RARITY.COMMON]: {
    fromRate: 0,
    toRate: 0.7,
    number: 700,
  },
  [this.RARITY.RARE]: {
    fromRate: 0.7,
    toRate: 0.9,
    number: 200,
  },
  [this.RARITY.EPIC]: {
    fromRate: 0.9,
    toRate: 0.98,
    number: 80,
  },
  [this.RARITY.LEGENDARY]: {
    fromRate: 0.98,
    toRate: 1,
    number: 20,
  },
};

eggConfig.RATE_AND_PRICE_CONFIG = [
  {
    fromEgg: 0,
    toEgg: 1000,
    price: 0.1, // sui
    rate: {
      [this.RARITY.COMMON]: {
        fromRate: 0,
        toRate: 0.8,
        number: 800,
      },
      [this.RARITY.RARE]: {
        fromRate: 0.8,
        toRate: 0.93,
        number: 130,
      },
      [this.RARITY.EPIC]: {
        fromRate: 0.93,
        toRate: 0.98,
        number: 50,
      },
      [this.RARITY.LEGENDARY]: {
        fromRate: 0.98,
        toRate: 1,
        number: 20,
      },
    },
  },
  {
    fromEgg: 1001,
    toEgg: 4000,
    price: 0.2, // sui
    rate: {
      [this.RARITY.COMMON]: {
        fromRate: 0,
        toRate: 0.92,
        number: 2760,
      },
      [this.RARITY.RARE]: {
        fromRate: 0.92,
        toRate: 0.97,
        number: 150,
      },
      [this.RARITY.EPIC]: {
        fromRate: 0.97,
        toRate: 0.99,
        number: 60,
      },
      [this.RARITY.LEGENDARY]: {
        fromRate: 0.99,
        toRate: 1,
        number: 30,
      },
    },
  },
  {
    fromEgg: 4001,
    toEgg: 9000,
    price: 0.3, // sui
    rate: {
      [this.RARITY.COMMON]: {
        fromRate: 0,
        toRate: 0.92,
        number: 4600,
      },
      [this.RARITY.RARE]: {
        fromRate: 0.92,
        toRate: 0.97,
        number: 250,
      },
      [this.RARITY.EPIC]: {
        fromRate: 0.97,
        toRate: 0.99,
        number: 100,
      },
      [this.RARITY.LEGENDARY]: {
        fromRate: 0.99,
        toRate: 1,
        number: 50,
      },
    },
  },
];

eggConfig.ON_SALE_STATUS = {
  LISTING: 'listing',
  PREPARING: 'preparing',
  BUYING: 'buying',
};

eggConfig.RECENT_SOLD_STATUS = {
  WAITING_TO_CHECK: 'waiting-to-check',
  SUCCESS: 'success',
  FAIL: 'fail',
};

eggConfig.CHECK_TX_TYPE = {
  BUY_OFFERING: 'buy-offering',
  BUY_ITEM: 'buy-item',
  BUY_EGG: 'buy-egg',
  ACTIVE_FUSION: 'active-fusion',
  ACTIVE_AUTO: 'active-auto',
  FUSION: 'fusion',
  BUY_PET_SLOT: 'buy-pet-slot',
  CLAIM_PPS: 'claim-pps',
  RESET_PET: 'reset-pet',
};

eggConfig.BUY_OFFERING_STATUS = {
  WAITING_TO_CHECK: 'waiting-to-check',
  SUCCESS: 'success',
  FAIL: 'fail',
};

eggConfig.BUY_EGG_STATUS = {
  WAITING_TO_CHECK: 'waiting-to-check',
  SUCCESS: 'success',
  FAIL: 'fail',
};

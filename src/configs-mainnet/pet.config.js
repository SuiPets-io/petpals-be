const petConfig = module.exports;

petConfig.BONUS_GROWTH_EGG = [
  { fromRate: 0, toRate: 0.991, value: 0 },
  { fromRate: 0.991, toRate: 0.996, value: 1 },
  { fromRate: 0.996, toRate: 0.9985, value: 2 },
  { fromRate: 0.9985, toRate: 0.9995, value: 5 },
  { fromRate: 0.9995, toRate: 1, value: 10 },
];

petConfig.BUY_ITEM_FEE_IN_SUI = 0.01;

petConfig.LEVEL_TO_CLAIM_FREE_ITEM = 3;

petConfig.FREE_ITEM_FOOD_AMOUNT = 6;

petConfig.FREE_ITEM_TOILET_AMOUNT = 4;

petConfig.FREE_ITEM_ENTERTAINMENT_AMOUNT = 2;

petConfig.RESET_PET_PRICE = 1;

petConfig.RESET_PET_DIE_PRICE = 0.02;

petConfig.GROWTH_TIME_IN_HOUR = 0.02; // 0.5

petConfig.PET_POSITION = [0, 1, 2, 3];

petConfig.PET_SLOT_PRICE = {
  1: 20, // 20
  2: 50, // 50
  3: 100, //100
};

petConfig.AUTO_ACTION_PRICE = 5; // 10

petConfig.NUMBER_DAY_TO_DIE = 2; // 2 day

petConfig.AMOUNT_TYPE = {
  POINT: 'point',
  PPS: 'pps',
  NUMB: 'numb',
};

petConfig.PET_STATUS = {
  NEED_TO_BUY: 'need-to-buy',
  AVAILABLE: 'available',
  EGG: 'egg',
  PET: 'pet',
  DIE: 'die',
};

petConfig.PET_STAGE = {
  EAT: 'eat',
  TOILET: 'toilet',
  ENTERTAINMENT: 'entertainment',
};

petConfig.ACTIVITY = {
  HARVEST: 'harvest',
  EAT: 'eat',
  TOILET: 'toilet',
  ENTERTAINMENT: 'entertainment',
};

petConfig.ACTIVITY_STATUS = {
  SUCCESS: 'success',
  PENDING: 'pending',
  SENDING: 'sending',
  FAIL: 'fail',
};

petConfig.STAGE_WEIGHT = {
  [this.PET_STAGE.EAT]: 1,
  [this.PET_STAGE.TOILET]: 2,
  [this.PET_STAGE.ENTERTAINMENT]: 3,
};

petConfig.PET_STAGE_PROCESS = [
  { stage: this.PET_STAGE.EAT },
  { stage: this.PET_STAGE.TOILET },
  { stage: this.PET_STAGE.ENTERTAINMENT },
  { stage: this.PET_STAGE.EAT },
  { stage: this.PET_STAGE.TOILET },
  { stage: this.PET_STAGE.EAT },
];

petConfig.PET_TYPE = {
  CHICKEN: 'chicken',
  CAT: 'cat',
  PIG: 'pig',
  DOG: 'dog',
};

petConfig.PET_ACTIVITY_TIME_IN_HOUR = 2; // 2h

petConfig.PET_LEVEL = {
  ZERO: 0,
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  SIX: 6,
  SEVEN: 7,
  EIGHT: 8,
  NINE: 9,
};

petConfig.PET_EARN_PPS_PER_DAY = {
  [this.PET_LEVEL.ZERO]: 10000, // pps
  [this.PET_LEVEL.ONE]: 20000,
  [this.PET_LEVEL.TWO]: 30000,
  [this.PET_LEVEL.THREE]: 80000,
  [this.PET_LEVEL.FOUR]: 120000,
  [this.PET_LEVEL.FIVE]: 170000,
  [this.PET_LEVEL.SIX]: 230000,
  [this.PET_LEVEL.SEVEN]: 300000,
  [this.PET_LEVEL.EIGHT]: 380000,
  [this.PET_LEVEL.NINE]: 470000,
};

petConfig.PET_LEVEL_POINT = {
  [this.PET_LEVEL.ZERO]: 50, // point
  [this.PET_LEVEL.ONE]: 100,
  [this.PET_LEVEL.TWO]: 200,
  [this.PET_LEVEL.THREE]: 400,
  [this.PET_LEVEL.FOUR]: 700,
  [this.PET_LEVEL.FIVE]: 1100,
  [this.PET_LEVEL.SIX]: 1300,
  [this.PET_LEVEL.SEVEN]: 1600,
  [this.PET_LEVEL.EIGHT]: 2000,
  [this.PET_LEVEL.NINE]: 2500,
};

petConfig.ITEM_TYPE = {
  FOOD: 'food',
  TOILET: 'toilet',
  ENTERTAINMENT: 'entertainment',
};

petConfig.FOOD_NAME = {
  CARROT: 'carrot',
  APPLE: 'apple',
  FLAN: 'flan',
  GRASS: 'grass',
  CHICKEN: 'chicken',
  NUT: 'nut',
  SHRIMP: 'shrimp',
  FISH: 'fish',
  MEAT: 'meat',
};

petConfig.FOOD_CONFIG = {
  [this.FOOD_NAME.CARROT]: {
    price: 30, // NUMB
    point: 1, // level point
  },
  [this.FOOD_NAME.APPLE]: {
    price: 100, // NUMB
    point: 2, // level point
  },
  [this.FOOD_NAME.FLAN]: {
    price: 300, // NUMB
    point: 3, // level point
  },
  [this.FOOD_NAME.GRASS]: {
    price: 600, // NUMB
    point: 4, // level point
  },
  [this.FOOD_NAME.CHICKEN]: {
    price: 700, // NUMB
    point: 5, // level point
  },
  [this.FOOD_NAME.NUT]: {
    price: 800, // NUMB
    point: 6, // level point
  },
  [this.FOOD_NAME.SHRIMP]: {
    price: 900, // NUMB
    point: 7, // level point
  },
  [this.FOOD_NAME.FISH]: {
    price: 1000, // NUMB
    point: 8, // level point
  },
  [this.FOOD_NAME.MEAT]: {
    price: 1100, // NUMB
    point: 9, // level point
  },
};

petConfig.FOOD_CONFIG_CLIENT = [
  {
    name: this.FOOD_NAME.CARROT,
    type: this.ITEM_TYPE.FOOD,
    price: this.FOOD_CONFIG[this.FOOD_NAME.CARROT].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243232/Petpals/Food%20Items/carrot_p0uffh.png',
  },
  {
    name: this.FOOD_NAME.APPLE,
    type: this.ITEM_TYPE.FOOD,
    price: this.FOOD_CONFIG[this.FOOD_NAME.APPLE].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243231/Petpals/Food%20Items/apple_vixxki.png',
  },
  {
    name: this.FOOD_NAME.FLAN,
    type: this.ITEM_TYPE.FOOD,
    price: this.FOOD_CONFIG[this.FOOD_NAME.FLAN].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243231/Petpals/Food%20Items/flan_frwjzv.png',
  },
  {
    name: this.FOOD_NAME.GRASS,
    type: this.ITEM_TYPE.FOOD,
    price: this.FOOD_CONFIG[this.FOOD_NAME.GRASS].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243232/Petpals/Food%20Items/grass_xa8uo0.png',
  },
  {
    name: this.FOOD_NAME.CHICKEN,
    type: this.ITEM_TYPE.FOOD,
    price: this.FOOD_CONFIG[this.FOOD_NAME.CHICKEN].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243231/Petpals/Food%20Items/chicken_n1dvga.png',
  },
  {
    name: this.FOOD_NAME.NUT,
    type: this.ITEM_TYPE.FOOD,
    price: this.FOOD_CONFIG[this.FOOD_NAME.NUT].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243231/Petpals/Food%20Items/nut_zvkn1p.png',
  },
  {
    name: this.FOOD_NAME.SHRIMP,
    type: this.ITEM_TYPE.FOOD,
    price: this.FOOD_CONFIG[this.FOOD_NAME.SHRIMP].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243231/Petpals/Food%20Items/shrimp_gm0rlj.png',
  },
  {
    name: this.FOOD_NAME.FISH,
    type: this.ITEM_TYPE.FOOD,
    price: this.FOOD_CONFIG[this.FOOD_NAME.FISH].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243232/Petpals/Food%20Items/fish_gz8ljr.png',
  },
  {
    name: this.FOOD_NAME.MEAT,
    type: this.ITEM_TYPE.FOOD,
    price: this.FOOD_CONFIG[this.FOOD_NAME.MEAT].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243231/Petpals/Food%20Items/meat_am7k85.png',
  },
];

petConfig.TOILET_NAME = {
  RAINBOW: 'rainbow',
  BATHBOMB: 'bathbomb',
  SHOWER_GEL: 'shower-gel',
  SOAP: 'soap',
  HAND_WASH: 'hand-wash',
  BIDET_SHOWER: 'bidet-shower',
  WET_WIPES: 'wet-wipes',
  TISSUE: 'tissue',
  TOILET_ROLL: 'toilet-roll',
};

petConfig.TOILET_CONFIG = {
  [this.TOILET_NAME.RAINBOW]: {
    price: 40, // NUMB
    point: 1, // level point
  },
  [this.TOILET_NAME.BATHBOMB]: {
    price: 150, // NUMB
    point: 2, // level point
  },
  [this.TOILET_NAME.SHOWER_GEL]: {
    price: 400, // NUMB
    point: 3, // level point
  },
  [this.TOILET_NAME.SOAP]: {
    price: 650, // NUMB
    point: 4, // level point
  },
  [this.TOILET_NAME.HAND_WASH]: {
    price: 750, // NUMB
    point: 5, // level point
  },
  [this.TOILET_NAME.BIDET_SHOWER]: {
    price: 850, // NUMB
    point: 6, // level point
  },
  [this.TOILET_NAME.WET_WIPES]: {
    price: 950, // NUMB
    point: 7, // level point
  },
  [this.TOILET_NAME.TISSUE]: {
    price: 1100, // NUMB
    point: 8, // level point
  },
  [this.TOILET_NAME.TOILET_ROLL]: {
    price: 1200, // NUMB
    point: 9, // level point
  },
};

petConfig.TOILET_CONFIG_CLIENT = [
  {
    name: this.TOILET_NAME.RAINBOW,
    type: this.ITEM_TYPE.TOILET,
    price: this.TOILET_CONFIG[this.TOILET_NAME.RAINBOW].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243490/Petpals/Bathroom%20Items/rainbow_gtqpky.png',
  },
  {
    name: this.TOILET_NAME.BATHBOMB,
    type: this.ITEM_TYPE.TOILET,
    price: this.TOILET_CONFIG[this.TOILET_NAME.BATHBOMB].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243489/Petpals/Bathroom%20Items/bath-bomb_n1zirp.png',
  },
  {
    name: this.TOILET_NAME.SHOWER_GEL,
    type: this.ITEM_TYPE.TOILET,
    price: this.TOILET_CONFIG[this.TOILET_NAME.SHOWER_GEL].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243488/Petpals/Bathroom%20Items/shower-gel_slab1y.png',
  },
  {
    name: this.TOILET_NAME.SOAP,
    type: this.ITEM_TYPE.TOILET,
    price: this.TOILET_CONFIG[this.TOILET_NAME.SOAP].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243488/Petpals/Bathroom%20Items/soap_hzsvom.png',
  },
  {
    name: this.TOILET_NAME.HAND_WASH,
    type: this.ITEM_TYPE.TOILET,
    price: this.TOILET_CONFIG[this.TOILET_NAME.HAND_WASH].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243488/Petpals/Bathroom%20Items/hand-wash_ew7l3b.png',
  },
  {
    name: this.TOILET_NAME.BIDET_SHOWER,
    type: this.ITEM_TYPE.TOILET,
    price: this.TOILET_CONFIG[this.TOILET_NAME.BIDET_SHOWER].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243489/Petpals/Bathroom%20Items/bidet-shower_o2ihj3.png',
  },
  {
    name: this.TOILET_NAME.WET_WIPES,
    type: this.ITEM_TYPE.TOILET,
    price: this.TOILET_CONFIG[this.TOILET_NAME.WET_WIPES].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243487/Petpals/Bathroom%20Items/wet-wipe_ilhpfa.png',
  },
  {
    name: this.TOILET_NAME.TISSUE,
    type: this.ITEM_TYPE.TOILET,
    price: this.TOILET_CONFIG[this.TOILET_NAME.TISSUE].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243487/Petpals/Bathroom%20Items/tissue_hspjrr.png',
  },
  {
    name: this.TOILET_NAME.TOILET_ROLL,
    type: this.ITEM_TYPE.TOILET,
    price: this.TOILET_CONFIG[this.TOILET_NAME.TOILET_ROLL].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719243487/Petpals/Bathroom%20Items/toilet-roll_wfcli2.png',
  },
];

petConfig.ENTERTAINMENT_NAME = {
  SLEEP: 'sleep',
  FISHING: 'fishing',
  SPORT: 'sport',
  MOVIE: 'movie',
  MUSIC: 'music',
  GAMES: 'games',
  SPA: 'spa',
  COFFEE: 'coffee',
  TRAVEL: 'travel',
};

petConfig.ENTERTAINMENT_CONFIG = {
  [this.ENTERTAINMENT_NAME.SLEEP]: {
    price: 50, // NUMB
    point: 1, // level point
  },
  [this.ENTERTAINMENT_NAME.FISHING]: {
    price: 200, // NUMB
    point: 2, // level point
  },
  [this.ENTERTAINMENT_NAME.SPORT]: {
    price: 700, // NUMB
    point: 3, // level point
  },
  [this.ENTERTAINMENT_NAME.MOVIE]: {
    price: 1100, // NUMB
    point: 4, // level point
  },
  [this.ENTERTAINMENT_NAME.MUSIC]: {
    price: 1300, // NUMB
    point: 5, // level point
  },
  [this.ENTERTAINMENT_NAME.GAMES]: {
    price: 1500, // NUMB
    point: 6, // level point
  },
  [this.ENTERTAINMENT_NAME.SPA]: {
    price: 1700, // NUMB
    point: 7, // level point
  },
  [this.ENTERTAINMENT_NAME.COFFEE]: {
    price: 1900, // NUMB
    point: 8, // level point
  },
  [this.ENTERTAINMENT_NAME.TRAVEL]: {
    price: 2100, // NUMB
    point: 9, // level point
  },
};

petConfig.ENTERTAINMENT_CONFIG_CLIENT = [
  {
    name: this.ENTERTAINMENT_NAME.SLEEP,
    type: this.ITEM_TYPE.ENTERTAINMENT,
    price: this.ENTERTAINMENT_CONFIG[this.ENTERTAINMENT_NAME.SLEEP].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719247609/Petpals/Entertainment%20Items/sleep_gazzo6.png',
  },
  {
    name: this.ENTERTAINMENT_NAME.FISHING,
    type: this.ITEM_TYPE.ENTERTAINMENT,
    price: this.ENTERTAINMENT_CONFIG[this.ENTERTAINMENT_NAME.FISHING].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719247608/Petpals/Entertainment%20Items/fishing_q0p8mj.png',
  },
  {
    name: this.ENTERTAINMENT_NAME.SPORT,
    type: this.ITEM_TYPE.ENTERTAINMENT,
    price: this.ENTERTAINMENT_CONFIG[this.ENTERTAINMENT_NAME.SPORT].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719247608/Petpals/Entertainment%20Items/sport_ghzdra.png',
  },
  {
    name: this.ENTERTAINMENT_NAME.MOVIE,
    type: this.ITEM_TYPE.ENTERTAINMENT,
    price: this.ENTERTAINMENT_CONFIG[this.ENTERTAINMENT_NAME.MOVIE].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719247608/Petpals/Entertainment%20Items/movie_ouhnu5.png',
  },
  {
    name: this.ENTERTAINMENT_NAME.MUSIC,
    type: this.ITEM_TYPE.ENTERTAINMENT,
    price: this.ENTERTAINMENT_CONFIG[this.ENTERTAINMENT_NAME.MUSIC].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719247608/Petpals/Entertainment%20Items/music_cpjgtu.png',
  },
  {
    name: this.ENTERTAINMENT_NAME.GAMES,
    type: this.ITEM_TYPE.ENTERTAINMENT,
    price: this.ENTERTAINMENT_CONFIG[this.ENTERTAINMENT_NAME.GAMES].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719247607/Petpals/Entertainment%20Items/game_qoml2t.png',
  },
  {
    name: this.ENTERTAINMENT_NAME.SPA,
    type: this.ITEM_TYPE.ENTERTAINMENT,
    price: this.ENTERTAINMENT_CONFIG[this.ENTERTAINMENT_NAME.SPA].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719247607/Petpals/Entertainment%20Items/spa_ffwsef.png',
  },
  {
    name: this.ENTERTAINMENT_NAME.COFFEE,
    type: this.ITEM_TYPE.ENTERTAINMENT,
    price: this.ENTERTAINMENT_CONFIG[this.ENTERTAINMENT_NAME.COFFEE].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719247608/Petpals/Entertainment%20Items/coffee_mfhscg.png',
  },
  {
    name: this.ENTERTAINMENT_NAME.TRAVEL,
    type: this.ITEM_TYPE.ENTERTAINMENT,
    price: this.ENTERTAINMENT_CONFIG[this.ENTERTAINMENT_NAME.TRAVEL].price,
    image:
      'https://res.cloudinary.com/dinhtq98/image/upload/v1719247607/Petpals/Entertainment%20Items/travel_iefpwj.png',
  },
];

petConfig.LEVEL_MAP_ITEM = {
  [this.PET_LEVEL.ZERO]: [
    ...Object.values(this.FOOD_NAME),
    ...Object.values(this.TOILET_NAME),
    ...Object.values(this.ENTERTAINMENT_NAME),
  ],
  [this.PET_LEVEL.ONE]: [
    ...Object.values(this.FOOD_NAME),
    ...Object.values(this.TOILET_NAME),
    ...Object.values(this.ENTERTAINMENT_NAME),
  ],
  [this.PET_LEVEL.TWO]: [
    ...Object.values(this.FOOD_NAME),
    ...Object.values(this.TOILET_NAME),
    ...Object.values(this.ENTERTAINMENT_NAME),
  ],
  [this.PET_LEVEL.THREE]: [
    ...Object.values(this.FOOD_NAME).slice(1),
    ...Object.values(this.TOILET_NAME).slice(1),
    ...Object.values(this.ENTERTAINMENT_NAME).slice(1),
  ],
  [this.PET_LEVEL.FOUR]: [
    ...Object.values(this.FOOD_NAME).slice(2),
    ...Object.values(this.TOILET_NAME).slice(2),
    ...Object.values(this.ENTERTAINMENT_NAME).slice(2),
  ],
  [this.PET_LEVEL.FIVE]: [
    ...Object.values(this.FOOD_NAME).slice(3),
    ...Object.values(this.TOILET_NAME).slice(3),
    ...Object.values(this.ENTERTAINMENT_NAME).slice(3),
  ],
  [this.PET_LEVEL.SIX]: [
    ...Object.values(this.FOOD_NAME).slice(4),
    ...Object.values(this.TOILET_NAME).slice(4),
    ...Object.values(this.ENTERTAINMENT_NAME).slice(4),
  ],
  [this.PET_LEVEL.SEVEN]: [
    ...Object.values(this.FOOD_NAME).slice(5),
    ...Object.values(this.TOILET_NAME).slice(5),
    ...Object.values(this.ENTERTAINMENT_NAME).slice(5),
  ],
  [this.PET_LEVEL.EIGHT]: [
    ...Object.values(this.FOOD_NAME).slice(6),
    ...Object.values(this.TOILET_NAME).slice(6),
    ...Object.values(this.ENTERTAINMENT_NAME).slice(6),
  ],
  [this.PET_LEVEL.NINE]: [
    ...Object.values(this.FOOD_NAME).slice(7),
    ...Object.values(this.TOILET_NAME).slice(7),
    ...Object.values(this.ENTERTAINMENT_NAME).slice(7),
  ],
};

petConfig.PET_SEASON_TYPE = {
  WEEK: 'week',
  MONTH: 'month',
};

petConfig.RESET_PET_STATUS = {
  WAITING_TO_CHECK: 'waiting-to-check',
  SUCCESS: 'success',
  FAIL: 'fail',
};

petConfig.AUTO_STATUS = {
  WAITING_TO_CHECK: 'waiting-to-check',
  SUCCESS: 'success',
  FAIL: 'fail',
};

petConfig.FUSION_STATUS = {
  WAITING_TO_CHECK: 'waiting-to-check',
  SUCCESS: 'success',
  FAIL: 'fail',
};

petConfig.ACTIVE_FUSION_MODE_STATUS = {
  WAITING_TO_CHECK: 'waiting-to-check',
  SUCCESS: 'success',
  FAIL: 'fail',
};

petConfig.BUY_PET_SLOT_STATUS = {
  WAITING_TO_CHECK: 'waiting-to-check',
  SUCCESS: 'success',
  FAIL: 'fail',
};

petConfig.BUY_ITEM_STATUS = {
  WAITING_TO_CHECK: 'waiting-to-check',
  SUCCESS: 'success',
  FAIL: 'fail',
};

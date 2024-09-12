const eggConfig = require('../../configs/egg.config');
const eggSettingDb = require('../../models/egg/eggSettingDb');

const eggHelper = module.exports;

eggHelper.randomOfferingRarity = (eggSettingData) => {
  const numberEgg = eggSettingData?.numberEgg || 0;
  const rate = eggConfig.RATE_AND_PRICE_CONFIG.find(
    (item) => item.fromEgg <= numberEgg && numberEgg <= item.toEgg
  )?.rate;

  if (!rate) eggConfig.RARITY.COMMON;

  let numberCommon = eggSettingData[eggConfig.RARITY.COMMON];
  let numberRare = eggSettingData[eggConfig.RARITY.RARE];
  let numberEpic = eggSettingData[eggConfig.RARITY.EPIC];
  let numberLegendary = eggSettingData[eggConfig.RARITY.LEGENDARY];
  for (const data of eggConfig.RATE_AND_PRICE_CONFIG) {
    if (numberEgg > data.toEgg) {
      numberCommon = numberCommon - data.rate[eggConfig.RARITY.COMMON].number;
      numberRare = numberRare - data.rate[eggConfig.RARITY.RARE].number;
      numberEpic = numberEpic - data.rate[eggConfig.RARITY.EPIC].number;
      numberLegendary =
        numberLegendary - data.rate[eggConfig.RARITY.LEGENDARY].number;
    }
  }

  const random = Math.random();
  // common
  if (
    random >= rate[eggConfig.RARITY.COMMON].fromRate &&
    random <= rate[eggConfig.RARITY.COMMON].toRate
  ) {
    if (numberCommon < rate[eggConfig.RARITY.COMMON].number) {
      return eggConfig.RARITY.COMMON;
    }
    if (numberRare < rate[eggConfig.RARITY.RARE].number) {
      return eggConfig.RARITY.RARE;
    }
    if (numberEpic < rate[eggConfig.RARITY.EPIC].number) {
      return eggConfig.RARITY.EPIC;
    }
    if (numberLegendary < rate[eggConfig.RARITY.LEGENDARY].number) {
      return eggConfig.RARITY.LEGENDARY;
    }
  }
  // rare
  if (
    random >= rate[eggConfig.RARITY.RARE].fromRate &&
    random <= rate[eggConfig.RARITY.RARE].toRate
  ) {
    if (numberRare < rate[eggConfig.RARITY.RARE].number) {
      return eggConfig.RARITY.RARE;
    }
    if (numberCommon < rate[eggConfig.RARITY.COMMON].number) {
      return eggConfig.RARITY.COMMON;
    }
    if (numberEpic < rate[eggConfig.RARITY.EPIC].number) {
      return eggConfig.RARITY.EPIC;
    }
    if (numberLegendary < rate[eggConfig.RARITY.LEGENDARY].number) {
      return eggConfig.RARITY.LEGENDARY;
    }
  }

  // epic
  if (
    random >= rate[eggConfig.RARITY.EPIC].fromRate &&
    random <= rate[eggConfig.RARITY.EPIC].toRate
  ) {
    if (numberEpic < rate[eggConfig.RARITY.EPIC].number) {
      return eggConfig.RARITY.EPIC;
    }
    if (numberRare < rate[eggConfig.RARITY.RARE].number) {
      return eggConfig.RARITY.RARE;
    }
    if (numberCommon < rate[eggConfig.RARITY.COMMON].number) {
      return eggConfig.RARITY.COMMON;
    }
    if (numberLegendary < rate[eggConfig.RARITY.LEGENDARY].number) {
      return eggConfig.RARITY.LEGENDARY;
    }
  }
  // legendary
  if (
    random >= rate[eggConfig.RARITY.LEGENDARY].fromRate &&
    random <= rate[eggConfig.RARITY.LEGENDARY].toRate
  ) {
    if (numberLegendary < rate[eggConfig.RARITY.LEGENDARY].number) {
      return eggConfig.RARITY.LEGENDARY;
    }
    if (numberEpic < rate[eggConfig.RARITY.EPIC].number) {
      return eggConfig.RARITY.EPIC;
    }
    if (numberRare < rate[eggConfig.RARITY.RARE].number) {
      return eggConfig.RARITY.RARE;
    }
    if (numberCommon < rate[eggConfig.RARITY.COMMON].number) {
      return eggConfig.RARITY.COMMON;
    }
  }

  return eggConfig.RARITY.COMMON;
};

eggHelper.getOfferingPrice = async () => {
  let eggSetting = await eggSettingDb.findOne({});
  if (!eggSetting) eggSetting = { numberEgg: 0 };

  const setting = eggConfig.RATE_AND_PRICE_CONFIG.find(
    (item) =>
      eggSetting.numberEgg >= item.fromEgg && eggSetting.numberEgg <= item.toEgg
  );

  return setting?.price || -1;
};

eggHelper.eggRandomFreeEggRarity = (
  eggCommon,
  eggRare,
  eggEpic,
  eggLegendary
) => {
  const random = Math.random();

  if (
    random >= eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.COMMON].fromRate &&
    random <= eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.COMMON].toRate
  ) {
    if (eggCommon < eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.COMMON].number) {
      return eggConfig.RARITY.COMMON;
    }
    if (eggRare < eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.RARE].number) {
      return eggConfig.RARITY.RARE;
    }
    if (eggEpic < eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.EPIC].number) {
      return eggConfig.RARITY.EPIC;
    }
    if (
      eggLegendary <
      eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.LEGENDARY].number
    ) {
      return eggConfig.RARITY.LEGENDARY;
    }
  }

  if (
    random >= eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.RARE].fromRate &&
    random <= eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.RARE].toRate
  ) {
    if (eggRare < eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.RARE].number) {
      return eggConfig.RARITY.RARE;
    }
    if (eggCommon < eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.COMMON].number) {
      return eggConfig.RARITY.COMMON;
    }
    if (eggEpic < eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.EPIC].number) {
      return eggConfig.RARITY.EPIC;
    }
    if (
      eggLegendary <
      eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.LEGENDARY].number
    ) {
      return eggConfig.RARITY.LEGENDARY;
    }
  }

  if (
    random >= eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.EPIC].fromRate &&
    random <= eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.EPIC].toRate
  ) {
    if (eggEpic < eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.EPIC].number) {
      return eggConfig.RARITY.EPIC;
    }
    if (eggRare < eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.RARE].number) {
      return eggConfig.RARITY.RARE;
    }
    if (eggCommon < eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.COMMON].number) {
      return eggConfig.RARITY.COMMON;
    }
    if (
      eggLegendary <
      eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.LEGENDARY].number
    ) {
      return eggConfig.RARITY.LEGENDARY;
    }
  }

  if (
    random >= eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.LEGENDARY].fromRate &&
    random <= eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.LEGENDARY].toRate
  ) {
    if (
      eggLegendary <
      eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.LEGENDARY].number
    ) {
      return eggConfig.RARITY.LEGENDARY;
    }
    if (eggEpic < eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.EPIC].number) {
      return eggConfig.RARITY.EPIC;
    }
    if (eggRare < eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.RARE].number) {
      return eggConfig.RARITY.RARE;
    }
    if (eggCommon < eggConfig.FREE_EGG_CONFIG[eggConfig.RARITY.COMMON].number) {
      return eggConfig.RARITY.COMMON;
    }
  }

  return eggConfig.RARITY.COMMON;
};

// console.log(eggHelper.eggRandomFreeEggRarity(0, 0, 0, 0));

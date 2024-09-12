const userConfig = module.exports;

userConfig.REFERRAL_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
};

userConfig.REWARD_PPS_NEW_USER = 5000;

userConfig.REFFERAL_PPS_REWARD = 20000;

userConfig.REFERRAL_MESSAGE = `Receive ${this.REFFERAL_PPS_REWARD} PPS for each referral`;

userConfig.CLAIM_PPS_FEE = 0.01; // sui

userConfig.CLAIM_PPS_STATUS = {
  WAITING_TO_CHECK: 'waiting-to-check',
  SUCCESS: 'success',
  FAIL: 'fail',
};

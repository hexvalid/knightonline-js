const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: { type: Number, index: true },
  name: { type: String },
  kind: { type: Number },
  slot: { type: Number },
  race: { type: Number },
  klass: { type: Number },
  damage: { type: Number },
  delay: { type: Number },
  range: { type: Number },
  weight: { type: Number },
  duration: { type: Number },
  buyPrice: { type: Number },
  sellPrice: { type: Number },
  defenceAbility: { type: Number },
  countable: { type: Boolean },
  isUnique: { type: Boolean },
  effect1: { type: Number },
  effect2: { type: Number },
  reqLevel: { type: Number },
  reqLevelMax: { type: Number },
  reqRank: { type: Number },
  reqTitle: { type: Number },
  reqStr: { type: Number },
  reqHp: { type: Number },
  reqDex: { type: Number },
  reqInt: { type: Number },
  reqMp: { type: Number },
  sellingGroup: { type: Number },
  itemType: { type: Number },
  hitRate: { type: Number },
  evaRate: { type: Number },
  daggerDefenceAbility: { type: Number },
  swordDefenceAbility: { type: Number },
  maceDefenceAbility: { type: Number },
  axeDefenceAbility: { type: Number },
  spearDefenceAbility: { type: Number },
  bowDefenceAbility: { type: Number },
  jamadarDefenceAbility: { type: Number },
  fireDamage: { type: Number },
  iceDamage: { type: Number },
  lightningDamage: { type: Number },
  poisonDamage: { type: Number },
  hpDrain: { type: Number },
  mpDamage: { type: Number },
  mpDrain: { type: Number },
  mirrorDamage: { type: Number },
  dropRate: { type: Number },
  strB: { type: Number },
  hpB: { type: Number },
  dexB: { type: Number },
  intB: { type: Number },
  mpB: { type: Number },
  maxhpB: { type: Number },
  maxmpB: { type: Number },
  fireR: { type: Number },
  coldR: { type: Number },
  lighingR: { type: Number },
  magicR: { type: Number },
  poisonR: { type: Number },
  curseR: { type: Number },
  itemClass: { type: Number },
  itemExt: { type: Number },
  iconID: { type: Number },
  extension: { type: Number },
  upgradeNotice: { type: Boolean },
  npBuyPrice: { type: Number },
  bound: { type: Boolean }
}, {
    timestamps: false
  });

module.exports = db => db.model('Item', schema, 'items');
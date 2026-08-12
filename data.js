// ============================================================
// Coalition Tiers — tunable data
// Edit this file to change point values, gamemodes, or titles.
// Nothing else in app.js needs to change when you tweak these.
// ============================================================

// Tier definitions, best -> worst. `group` controls the color
// (3 = diamond, 4 = gold, 5 = iron). `high` = High tier vs Low tier.
const TIERS = [
  { key: 'HT3', points: 30, group: 3, high: true },
  { key: 'LT3', points: 20, group: 3, high: false },
  { key: 'HT4', points: 15, group: 4, high: true },
  { key: 'LT4', points: 10, group: 4, high: false },
  { key: 'HT5', points: 5,  group: 5, high: true },
  { key: 'LT5', points: 1,  group: 5, high: false },
];

// Gamemodes shown as tabs, in order.
const GAMEMODES = [
  { key: 'sword',  label: 'Sword' },
  { key: 'smp',    label: 'SMP' },
  { key: 'mace',   label: 'Mace' },
  { key: 'diasmp', label: 'DiaSMP' },
  { key: 'diapot', label: 'DiaPot' },
  { key: 'uhc',    label: 'UHC' },
  { key: 'axe',    label: 'Axe' },
];

// Point-based titles shown under a player's name on the Overall tab.
// Ordered highest -> lowest. The first entry whose `min` the player's
// total points meet or exceed wins. Max possible total right now is
// 30 pts * 7 gamemodes = 210, so thresholds are scaled to that.
const TITLES = [
  { min: 180, label: 'Combat Legend',      color: 'legend' },
  { min: 130, label: 'Combat Grandmaster', color: 'gold' },
  { min: 90,  label: 'Combat Master',      color: 'diamond' },
  { min: 50,  label: 'Combat Ace',         color: 'emerald' },
  { min: 20,  label: 'Combat Specialist',  color: 'iron' },
  { min: 1,   label: 'Combat Novice',      color: 'faint' },
  { min: 0,   label: 'Rookie',             color: 'faint' },
];

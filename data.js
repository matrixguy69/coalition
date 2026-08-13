// ============================================================
// Coalition Tiers — tunable data
// Edit this file to change point values, gamemodes, titles, or
// the rules shown in the "Info" panel. Nothing else needs to
// change when you tweak these.
// ============================================================

// Tier definitions, best -> worst. `group` controls the color
// (3 = diamond, 4 = gold, 5 = iron). `high` = High tier vs Low tier.
// `grade` is the S/A/B/C/D/F label shown in the Info panel.
const TIERS = [
  { key: 'HT3', points: 30, group: 3, high: true,  grade: 'S' },
  { key: 'LT3', points: 20, group: 3, high: false, grade: 'A' },
  { key: 'HT4', points: 15, group: 4, high: true,  grade: 'B' },
  { key: 'LT4', points: 10, group: 4, high: false, grade: 'C' },
  { key: 'HT5', points: 5,  group: 5, high: true,  grade: 'D' },
  { key: 'LT5', points: 1,  group: 5, high: false, grade: 'F' },
];

// Gamemodes shown as tabs, in order. `key` must be a short lowercase
// slug with no spaces — it's used as the storage key and icon id.
const GAMEMODES = [
  { key: 'sword',   label: 'Sword' },
  { key: 'smp',     label: 'SMP' },
  { key: 'mace',    label: 'Mace' },
  { key: 'diasmp',  label: 'DiaSMP' },
  { key: 'diapot',  label: 'DiaPot' },
  { key: 'nethpot', label: 'NethPot' },
  { key: 'uhc',     label: 'UHC' },
  { key: 'axe',     label: 'Axe' },
  { key: 'crystal', label: 'Crystal' },
  { key: 'cart',    label: 'Cart' },
];

// Point-based titles shown under a player's name on the Overall tab
// and on their profile card. Ordered highest -> lowest. The first
// entry whose `min` the player's total points meet or exceed wins.
// Max possible total right now is 30 pts * 10 gamemodes = 300.
const TITLES = [
  { min: 260, label: 'Combat Legend',      color: 'legend' },
  { min: 185, label: 'Combat Grandmaster', color: 'gold' },
  { min: 130, label: 'Combat Master',      color: 'diamond' },
  { min: 70,  label: 'Combat Ace',         color: 'emerald' },
  { min: 30,  label: 'Combat Specialist',  color: 'iron' },
  { min: 1,   label: 'Combat Novice',      color: 'faint' },
  { min: 0,   label: 'Rookie',             color: 'faint' },
];

// Shown in the "Info" panel (header button). Purely informational —
// edit freely, it doesn't drive any app logic.
const TESTING_INFO = {
  ht3Requirement: "To obtain HT3, you must defeat all testers in that gamemode. If there aren't enough testers available, you must instead defeat three LT3 players.",
  // FT ("fight threshold" / required test wins) per gamemode, shown
  // next to that gamemode's icon in the Info panel.
  ftRequirements: [
    { gm: 'sword',   ft: 'FT6' },
    { gm: 'axe',     ft: 'FT6' },
    { gm: 'smp',     ft: 'FT2' },
    { gm: 'uhc',     ft: 'FT5' },
    { gm: 'mace',    ft: 'FT3' },
    { gm: 'diasmp',  ft: 'FT2' },
    { gm: 'diapot',  ft: 'FT6' },
    { gm: 'crystal', ft: 'FT4' },
    { gm: 'cart',    ft: 'FT2' },
    { gm: 'nethpot', ft: 'FT2' },
  ],
};

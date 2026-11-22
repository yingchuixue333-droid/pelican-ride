// Additional seasonal offers. Existing crop prices and level thresholds are unchanged.
const offers = [
 ['snowpea', '甜脆荷兰豆', 16, 12, 20, 36, 18, 5, '短作', 'pod', '#83af59'],
 ['romanesco', '宝塔花椰菜', 18, 180, 50, 78, 103, 2, '高经验', 'rosette', '#a8bb69'],
 ['dragonfruit', '红心火龙果', 21, 720, 240, 940, 74, 3, '隔夜', 'cactus', '#cf6483'],
 ['okra', '星角秋葵', 24, 105, 85, 100, 31, 5, '再生', 'okra', '#8ea661', 3, 105],
 ['ginger', '蜜芽姜', 27, 300, 110, 195, 126, 4, '高经验', 'rhizome', '#d6ae73'],
 ['glasscorn', '琉璃玉米', 30, 600, 200, 810, 92, 4, '隔夜', 'ear', '#b67c9b'],
];

export const NEXT_CROPS = offers.map(([id, name, level, minutes, cost, coins, xp, units, group, shape, color, harvests = 1, regrow = 0]) => ({
 id, name, short: name, level, minutes, seconds: minutes * 60, cost, coins, xp, units,
 group, shape, color, harvests, regrowSeconds: regrow * 60,
}));
export const TRIAL_SEED = 'snowpea';

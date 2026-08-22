export function testCombatCalculator(): boolean {
  const attacker = { baseAtk: 50, critChance: 0.2, critMult: 2.0 };
  const defender = { armor: 20, hp: 100 };

  const rawDamage = attacker.baseAtk;
  const armorMitigation = defender.armor * 0.5;
  const finalDamage = Math.max(1, rawDamage - armorMitigation);

  defender.hp -= finalDamage;

  return defender.hp === 60 && finalDamage === 40;
}

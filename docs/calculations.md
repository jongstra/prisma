# How PRISMA calculates

PRISMA combines two things: **visibility** from your DeTT&CT file, and **MaGMa scores** for your detection use cases. Visibility, scores and risk are percentages from 0% to 100%. For the method behind it, see the MaGMa 2.0 documentation in this folder.

## 1. Visibility

*Used on the DeTT&CT and Insights pages.*

**Per data component.** Your DeTT&CT file gives each data source a *device completeness* score from 0 to 5. (DeTT&CT's data sources are ATT&CK's data components.) PRISMA turns that score into a percentage: score ÷ 5. A data component that isn't in your file counts as 0%.

**Per technique.** The average over the technique's data components: the ones ATT&CK lists, plus for some techniques a data source that DeTT&CT adds (DHCP, Email, Internal DNS or Web). A technique with sub-techniques takes the average over itself and its sub-techniques, counting only those that have data components.

Example:

| | Data components (completeness) | Visibility |
|---|---|---|
| Technique | Process Creation (5) and Command Execution (2) | (100% + 40%) ÷ 2 = **70%** |
| Sub-technique A | Command Execution (2) | **40%** |
| Sub-technique B | none | not counted |
| Technique, including its sub-techniques | | (70% + 40%) ÷ 2 = **55%** |

**Not detectable.** Some techniques have no data components at all, such as most Enterprise reconnaissance techniques, which happen outside your network. PRISMA shows them striped and leaves them out of every average. So 100% means: every data component of the techniques is fully available.

**Per tactic and per platform.** The average over their detectable techniques.

**How often a technique is used.** The catalog counts the threat groups and the software that use each technique; use of a sub-technique counts for its parent technique. The *Minimum Total Occurrence* filter ranks the techniques by this count: *Medium*, *High* and *Very High* show roughly the most-used 75%, 50% and 25% of techniques.

## 2. MaGMa scores

*Used on the MaGMa page. The [Excel template](../templates/) calculates the L1, L2 and L3 scores and the risk in the same way.*

**L3: a detection rule.** It has three scores: visibility (V), implementation (I) and effectiveness (E).

- **Weight** = V × I × E
- **Potential** = 100% − weight: how much the rule can still improve
- **Visibility** of a rule with an ATT&CK technique comes from DeTT&CT: the visibility of that technique (0% until a DeTT&CT file is loaded), unless *Override* is switched on for the rule.

Example: V 80%, I 90% and E 50% give a weight of 36% and a potential of 64%.

**L2 and L1.** Each score is the **average of the level below**: an L2 averages its L3s, and an L1 averages its L2s. That applies to V, I, E and the weight: the weight is averaged too, not calculated again from the averaged V, I and E. Potential is again 100% − weight. Without anything below it, the weight is 0%.

Example: an L2 with the rule above (weight 36%) and a rule with weight 54% gets a weight of 45% and a potential of 55%.

*IN* and *THR* are two fixed L1s. They collect the use cases that detect an attack early (IN) or while it spreads (THROUGH), before its goal is clear.

**Risk, per business risk.** For a business risk such as DDoS, you set which part of an attack falls in each phase: the IN, THR and OUT impact, together 100%. Then:

> **Risk** = 100% − (IN weight × IN impact + THR weight × THR impact + own weight × OUT impact)

The risk never goes below 0%. The two examples from the MaGMa documentation (§3.1.2), with an IN weight of 40% and a THR weight of 35%:

| Business risk | Own weight | IN / THR / OUT impact | Risk |
|---|---|---|---|
| DDoS | 85% | 5% / 0% / 95% | 100% − (2% + 0% + 80.75%) = **17.25%** |
| Ransomware | 65% | 25% / 45% / 30% | 100% − (10% + 15.75% + 19.5%) = **54.75%** |

To lower the DDoS risk, better DDoS-specific rules help most (OUT impact 95%). For ransomware, better detection in the THROUGH phase helps most (the largest impact, 45%, with a low weight).

**Heatmap.** Per technique: the selected scores (V, I and/or E) are multiplied per L3 rule, and averaged over the technique's rules, including rules on its sub-techniques. With V, I and E selected, that is the average weight: with the two example rules above, the technique shows 45%.

**Summary tab.** The averages of V, I, E, weight and potential over all L1s, including IN and THR.

## 3. Current choices

These choices may change later:

- A missing score counts as 0%.
- From a DeTT&CT file, PRISMA uses only the device completeness, and only the first entry per data source.
- IN and THR count in the Summary averages.

## 4. Where to find it in the code

| Part | Code | Tests |
|---|---|---|
| Reading DeTT&CT files | [`dettect.ts`](../frontend/src/domain/attack/dettect.ts) | [`dettect.test.ts`](../frontend/src/domain/attack/__tests__/dettect.test.ts) |
| Visibility | [`visibility.ts`](../frontend/src/domain/attack/visibility.ts) | [`visibility.test.ts`](../frontend/src/domain/attack/__tests__/visibility.test.ts) |
| How often a technique is used | [`build_attack_catalog.ipynb`](../tools/build_attack_catalog.ipynb) | its check cell |
| MaGMa scores and risk | [`calculations.ts`](../frontend/src/domain/magma/calculations.ts) | [`calculations.test.ts`](../frontend/src/domain/magma/__tests__/calculations.test.ts) |
| Heatmap | [`heatmap.ts`](../frontend/src/domain/magma/heatmap.ts) | [`heatmap.test.ts`](../frontend/src/domain/magma/__tests__/heatmap.test.ts) |

export class ExecutiveDashboardHelper {

    static getEconomicImpact(findings: any[]): number {

        return findings.reduce((total, finding) => {
            switch (finding.rule?.code) {
                case "RULE_001":
                    return total + Math.abs(
                        Number(finding.metadata?.inventoryTotalCost ?? 0) -
                        Number(finding.metadata?.kardexTotalCost ?? 0)
                    );
                case "RULE_002":
                    return total + Math.abs(
                        Number(finding.metadata?.difference?.totalCost ?? 0)
                    );
                case "RULE_003":
                    return total + Math.abs(
                        Number(finding.metadata?.difference?.totalCost ?? 0)
                    );
                case "RULE_012":
                    return total + Math.abs(
                        Number(finding.metadata?.difference ?? 0)
                    );
                case "RULE_013":
                    return total + Math.abs(
                        Number(finding.metadata?.difference?.totalCost ?? 0)
                    );
                case "RULE_014":
                    return total + Math.abs(
                        Number(finding.metadata?.difference?.totalCost ?? 0)
                    );
                default:
                    return total;
            }
        }, 0);

    }

}
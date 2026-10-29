class DrinksCalculationResult {
  final double feePrice;                  // User input revenue
  final double earnedIncome;              // Revenue * 1.2
  final double tva;                       // 20% of revenue
  final double feeAmountPerTrimester;     // 6% or 10% per trimester
  final double finalResult;               // Total for all selected trimesters
  final List<Map<String, dynamic>> breakdown; // Per trimester breakdown

  DrinksCalculationResult({
    required this.feePrice,
    required this.earnedIncome,
    required this.tva,
    required this.feeAmountPerTrimester,
    required this.finalResult,
    required this.breakdown,
  });
}

class DrinksCalculator {
  // Tax rates per trimester based on beverage type
  static const Map<String, double> taxRates = {
    'non-alcoholic': 0.06,  // 6% per trimester for non-alcoholic beverages
    'alcoholic': 0.10,      // 10% per trimester for alcoholic beverages
  };

  static DrinksCalculationResult calculate({
    required double revenue,
    required String beverageType, // 'non-alcoholic' or 'alcoholic'
    required Map<String, List<bool>> selectedTrimesters, // {'2023': [T1, T2, T3, T4], ...}
  }) {
    // Get tax rate
    double taxRate = taxRates[beverageType] ?? 0.06;

    // Step 1: Earned Income = Revenue × 1.2
    double earnedIncome = revenue * 1.2;

    // Step 2: TVA = 20% of revenue (earnedIncome - revenue)
    double tva = earnedIncome - revenue;

    // Step 3: Fee Amount per trimester = Revenue × tax rate
    double feePerTrimester = revenue * taxRate;

    // Step 4: Count selected trimesters and calculate total
    int trimesterCount = 0;
    List<Map<String, dynamic>> breakdown = [];

    // Iterate through years and trimesters to build breakdown
    final years = ['2023', '2024', '2025', '2026'];
    for (String year in years) {
      final trimesters = selectedTrimesters[year] ?? [false, false, false, false];
      for (int i = 0; i < trimesters.length; i++) {
        if (trimesters[i]) {
          trimesterCount++;
          breakdown.add({
            'year': int.parse(year),
            'trimester': 'T${i + 1}',
            'amount': feePerTrimester,
          });
        }
      }
    }

    // Step 5: Final Result = Fee per trimester × number of selected trimesters
    double finalResult = feePerTrimester * trimesterCount;

    return DrinksCalculationResult(
      feePrice: revenue,
      earnedIncome: earnedIncome,
      tva: tva,
      feeAmountPerTrimester: feePerTrimester,
      finalResult: finalResult,
      breakdown: breakdown,
    );
  }
}
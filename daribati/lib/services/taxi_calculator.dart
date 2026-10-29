import '../models/calculation_result.dart';

class TaxiCalculator {
  // Base tax amounts
  static const double CAT1_TRANSPORT = 150.0;
  static const double CAT1_STATIONEMENT = 100.0;
  static const double CAT2_TRANSPORT = 150.0;
  static const double CAT2_STATIONEMENT = 70.0;

  // Majoration percentages table
  static const Map<String, Map<String, double>> majorationTable = {
    '2023': {'T1': 31.0, 'T2': 29.4, 'T3': 28.0, 'T4': 26.5},
    '2024': {'T1': 25.0, 'T2': 23.5, 'T3': 22.0, 'T4': 20.5},
    '2025': {'T1': 19.0, 'T2': 17.5, 'T3': 16.0, 'T4': 0.0},
    '2026': {'T1': 0.0, 'T2': 0.0, 'T3': 0.0, 'T4': 0.0},
  };

  static CalculationResult calculate(String category, Map<String, List<bool>> selected) {
    double total = 0.0;
    List<Map<String, dynamic>> breakdown = [];
    
    final isCategory1 = category == '1';
    final transportTax = isCategory1 ? CAT1_TRANSPORT : CAT2_TRANSPORT;
    final stationementTax = isCategory1 ? CAT1_STATIONEMENT : CAT2_STATIONEMENT;

    selected.forEach((year, trimesters) {
      for (int i = 0; i < trimesters.length; i++) {
        if (trimesters[i]) {
          final trimester = 'T${i + 1}';
          final majoration = majorationTable[year]?[trimester] ?? 0.0;
          // IMPORTANT: Majoration applies ONLY to Transport Tax (150 DH)
          final majorationAmount = transportTax * (majoration / 100);
          final trimesterTotal = stationementTax + transportTax + majorationAmount;
          total += trimesterTotal;
          
          breakdown.add({
            'year': year,
            'trimester': trimester,
            'majoration': majoration,
            'amount': trimesterTotal,
          });
          
          print('$year $trimester: $stationementTax + $transportTax + ($transportTax × $majoration%) = $stationementTax + $transportTax + $majorationAmount = $trimesterTotal');
        }
      }
    });

    print('Final total: $total');
    return CalculationResult(total: total, breakdown: breakdown);
  }
}
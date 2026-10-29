import 'package:flutter/material.dart';
import '../utils/app_strings.dart';
import '../services/taxi_calculator.dart';
import '../widgets/tax_info_button.dart';
import '../widgets/tax_info_card.dart';

class TaxiTaxScreen extends StatefulWidget {
  final String language;
  final bool isDarkMode;

  const TaxiTaxScreen({
    Key? key,
    this.language = 'fr',
    this.isDarkMode = false,
  }) : super(key: key);

  @override
  State<TaxiTaxScreen> createState() => _TaxiTaxScreenState();
}

class _TaxiTaxScreenState extends State<TaxiTaxScreen> {
  String _selectedCategory = '1';
  Map<String, List<bool>> _selectedTrimesters = {
    '2023': [false, false, false, false],
    '2024': [false, false, false, false],
    '2025': [false, false, false, false],
    '2026': [false, false, false, false],
  };
  double _totalAmount = 0.0;
  List<Map<String, dynamic>> _breakdown = [];
  
  bool _showInfoCard = false;

  void _calculateTotal() {
    final result = TaxiCalculator.calculate(_selectedCategory, _selectedTrimesters);
    setState(() {
      _totalAmount = result.total;
      _breakdown = result.breakdown;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isArabic = widget.language == 'ar';
    final cardColor = widget.isDarkMode ? const Color(0xFF2A2A2A) : Colors.white;
    final textColor = widget.isDarkMode ? Colors.white : Colors.black;
    final subtitleColor = widget.isDarkMode ? Colors.grey[400] : Colors.black87;

    return Directionality(
      textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 20),
            
            // Hero Card with Info Button
            Stack(
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFF0052CC), Color(0xFF0000FF)],
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        AppStrings.get('taxi', widget.language),
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        AppStrings.get('taxi_desc', widget.language),
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
                // INFO BUTTON
                Positioned(
                  bottom: 10,
                  right: isArabic ? null : 10,
                  left: isArabic ? 10 : null,
                  child: TaxInfoButton(
                    isDarkMode: widget.isDarkMode,
                    onTap: () {
                      setState(() {
                        _showInfoCard = !_showInfoCard;
                      });
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 25),

            // INFO CARD
            if (_showInfoCard)
              TaxInfoCard(
                title: AppStrings.get('taxi', widget.language),
                description: widget.language == 'ar'
                    ? '''
ضريبة النقل العام:

التعريف:
تنطبق ضريبة النقل العام على شركات النقل الحضري.

معادلة الحساب:
• الدخل المحقق = رقم الأعمال × 1.2
• التكاليف = الدخل المحقق - رقم الأعمال (20%)
• مبلغ الرسم = رقم الأعمال × 6% لكل ربع سنة
• الإجمالي = مبلغ الرسم × عدد الأرباع المختارة

مثال:
إذا كان رقم الأعمال = 12,000 درهم:
- الدخل المحقق = 14,400 درهم
- التكاليف = 2,400 درهم
- مبلغ الرسم للربع = 720 درهم
- لـ 4 أرباع = 2,880 درهم

الفئات:
• الفئة الأولى: معدل ضريبة عادي
• الفئة الثانية: معدل ضريبة عادي
                    '''
                    : '''
Taxe sur le transport public:

Définition:
La taxe sur le transport public s'applique aux entreprises 
de transport urbain.

Formule de calcul:
• Revenu réalisé = Chiffre d'affaires × 1.2
• Charges = Revenu réalisé - Chiffre d'affaires (20%)
• Montant du droit = Chiffre d'affaires × 6% par trimestre
• Total = Montant du droit × nombre de trimestres sélectionnés

Exemple:
Si chiffre d'affaires = 12,000 DH:
- Revenu réalisé = 14,400 DH
- Charges = 2,400 DH
- Droit par trimestre = 720 DH
- Pour 4 trimestres = 2,880 DH

Catégories:
• 1ère catégorie: taux d'imposition normal
• 2ème catégorie: taux d'imposition normal
                    ''',
                isDarkMode: widget.isDarkMode,
                onClose: () {
                  setState(() {
                    _showInfoCard = false;
                  });
                },
              ),
            
            // Form Section
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(widget.isDarkMode ? 0.3 : 0.08),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  )
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Type of Establishment
                  Text(
                    widget.language == 'ar' ? 'نوع المؤسسة' : 'Type d\'établissement',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: widget.isDarkMode ? Colors.grey[700]! : const Color(0xFFE0E0E0),
                      ),
                      borderRadius: BorderRadius.circular(8),
                      color: widget.isDarkMode ? const Color(0xFF1E1E1E) : Colors.white,
                    ),
                    child: DropdownButton<String>(
                      value: _selectedCategory,
                      isExpanded: true,
                      underline: const SizedBox(),
                      dropdownColor: cardColor,
                      items: [
                        DropdownMenuItem(
                          value: '1',
                          child: Text(
                            AppStrings.get('categorie1', widget.language),
                            style: TextStyle(color: textColor),
                          ),
                        ),
                        DropdownMenuItem(
                          value: '2',
                          child: Text(
                            AppStrings.get('categorie2', widget.language),
                            style: TextStyle(color: textColor),
                          ),
                        ),
                      ],
                      onChanged: (value) {
                        setState(() {
                          _selectedCategory = value ?? _selectedCategory;
                        });
                      },
                    ),
                  ),
                  const SizedBox(height: 25),
                  
                  // Trimesters Selection
                  Text(
                    AppStrings.get('trimestres', widget.language),
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 15),
                  
                  Column(
                    children: _selectedTrimesters.entries.map((entry) {
                      String year = entry.key;
                      List<bool> trimesters = entry.value;
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: Text(
                              year,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: subtitleColor,
                              ),
                            ),
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: List.generate(4, (index) {
                              return GestureDetector(
                                onTap: () {
                                  setState(() {
                                    trimesters[index] = !trimesters[index];
                                  });
                                },
                                child: Container(
                                  width: 60,
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  decoration: BoxDecoration(
                                    color: trimesters[index]
                                        ? const Color(0xFF0000FF)
                                        : (widget.isDarkMode ? const Color(0xFF1E1E1E) : const Color(0xFFF5F5F5)),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: trimesters[index]
                                          ? const Color(0xFF0000FF)
                                          : (widget.isDarkMode ? Colors.grey[700]! : const Color(0xFFE0E0E0)),
                                    ),
                                  ),
                                  child: Center(
                                    child: Text(
                                      'T${index + 1}',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: trimesters[index] ? Colors.white : textColor,
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }),
                          ),
                          const SizedBox(height: 15),
                        ],
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 25),

                  // Calculate Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0000FF),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      onPressed: _calculateTotal,
                      child: Text(
                        AppStrings.get('calculer', widget.language),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Results Card
            if (_totalAmount > 0)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: cardColor,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(widget.isDarkMode ? 0.3 : 0.08),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    )
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppStrings.get('resultats', widget.language),
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: textColor,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Year Breakdown
                    if (_breakdown.isNotEmpty)
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            AppStrings.get('details', widget.language),
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: textColor,
                            ),
                          ),
                          const SizedBox(height: 10),
                          ..._breakdown.map((item) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    '${item['year']} ${item['trimester']}',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: textColor,
                                    ),
                                  ),
                                  Text(
                                    '${item['amount'].toStringAsFixed(2)} DH',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: textColor,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                          const SizedBox(height: 12),
                          Divider(
                            color: widget.isDarkMode ? Colors.grey[700] : Colors.grey[300],
                          ),
                        ],
                      ),

                    // Total Amount
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          AppStrings.get('total', widget.language),
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: textColor,
                          ),
                        ),
                        Text(
                          '${_totalAmount.toStringAsFixed(2)} DH',
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0000FF),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}
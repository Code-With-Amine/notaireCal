import 'package:flutter/material.dart';
import '../utils/app_strings.dart';
import '../services/drinks_calculator.dart';
import '../widgets/tax_info_button.dart';
import '../widgets/tax_info_card.dart';

class DrinksTaxScreen extends StatefulWidget {
  final String language;
  final bool isDarkMode;

  const DrinksTaxScreen({
    Key? key,
    this.language = 'fr',
    this.isDarkMode = false,
  }) : super(key: key);

  @override
  State<DrinksTaxScreen> createState() => _DrinksTaxScreenState();
}

class _DrinksTaxScreenState extends State<DrinksTaxScreen> {
  final TextEditingController _revenueController = TextEditingController();
  String _selectedBeverageType = 'non-alcoholic';
  
  Map<String, List<bool>> _selectedTrimesters = {
    '2023': [false, false, false, false],
    '2024': [false, false, false, false],
    '2025': [false, false, false, false],
    '2026': [false, false, false, false],
  };
  
  DrinksCalculationResult? _calculationResult;
  bool _showInfoCard = false;

  void _calculateTotal() {
    if (_revenueController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            widget.language == 'ar' 
              ? 'يرجى إدخال الإيرادات' 
              : 'Veuillez entrer les chiffres d\'affaires',
          ),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    try {
      final revenue = double.parse(_revenueController.text);
      
      if (revenue <= 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.language == 'ar' 
                ? 'يجب أن تكون الإيرادات أكبر من 0' 
                : 'Le chiffre d\'affaires doit être supérieur à 0',
            ),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      final result = DrinksCalculator.calculate(
        revenue: revenue,
        beverageType: _selectedBeverageType,
        selectedTrimesters: _selectedTrimesters,
      );

      setState(() {
        _calculationResult = result;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            widget.language == 'ar' 
              ? 'خطأ في الحساب' 
              : 'Erreur de calcul',
          ),
          backgroundColor: Colors.red,
        ),
      );
    }
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
                        AppStrings.get('boissons', widget.language),
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        AppStrings.get('boissons_desc', widget.language),
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
                title: AppStrings.get('boissons', widget.language),
                description: widget.language == 'ar'
                    ? '''
ضريبة المشروبات:

التعريف:
تنطبق ضريبة المشروبات على المؤسسات التي تبيع 
المشروبات (محلات القهوة والحانات والمطاعم).

معادلة الحساب:
• الدخل المحقق = الإيرادات × 1.2
• ضريبة القيمة المضافة = الدخل المحقق - الإيرادات (20%)
• مبلغ الرسم = الإيرادات × 6% (مشروب غير كحولي)
              أو الإيرادات × 10% (مشروب كحولي)
• الإجمالي = مبلغ الرسم × عدد الأرباع المختارة

مثال:
إذا كانت الإيرادات = 12,000 درهم (غير كحولي):
- الدخل المحقق = 14,400 درهم
- ضريبة القيمة المضافة = 2,400 درهم
- مبلغ الرسم للربع = 720 درهم
- لـ 4 أرباع = 2,880 درهم

الأنواع:
• مشروب غير كحولي: 6% لكل ربع سنة
• مشروب كحولي: 10% لكل ربع سنة
                    '''
                    : '''
Taxe sur les boissons:

Définition:
La taxe sur les boissons s'applique aux établissements 
qui vendent des boissons (cafés, bars, restaurants).

Formule de calcul:
• Revenu réalisé = Chiffre d'affaires × 1.2
• TVA = Revenu réalisé - Chiffre d'affaires (20%)
• Montant du droit = Chiffre d'affaires × 6% (non-alcoolique)
                     ou Chiffre d'affaires × 10% (alcoolique)
• Total = Montant du droit × nombre de trimestres sélectionnés

Exemple:
Si chiffre d'affaires = 12,000 DH (non-alcoolique):
- Revenu réalisé = 14,400 DH
- TVA = 2,400 DH
- Droit par trimestre = 720 DH
- Pour 4 trimestres = 2,880 DH

Types:
• Boisson non-alcoolique: 6% par trimestre
• Boisson alcoolique: 10% par trimestre
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
                  // Beverage Type
                  Text(
                    isArabic ? 'نوع المشروب' : 'Type de boisson',
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
                      value: _selectedBeverageType,
                      isExpanded: true,
                      underline: const SizedBox(),
                      dropdownColor: cardColor,
                      items: [
                        DropdownMenuItem(
                          value: 'non-alcoholic',
                          child: Text(
                            isArabic ? 'مشروب غير كحولي' : 'Boisson non-alcoolique',
                            style: TextStyle(color: textColor),
                          ),
                        ),
                        DropdownMenuItem(
                          value: 'alcoholic',
                          child: Text(
                            isArabic ? 'مشروب كحولي' : 'Boisson alcoolique',
                            style: TextStyle(color: textColor),
                          ),
                        ),
                      ],
                      onChanged: (value) {
                        setState(() {
                          _selectedBeverageType = value ?? _selectedBeverageType;
                          _calculationResult = null;
                        });
                      },
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Revenue Field
                  Text(
                    isArabic ? 'الإيرادات السنوية (DH)' : 'Chiffre d\'affaires annuel (DH)',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _revenueController,
                    keyboardType: TextInputType.number,
                    style: TextStyle(color: textColor),
                    onChanged: (_) {
                      setState(() {
                        _calculationResult = null;
                      });
                    },
                    decoration: InputDecoration(
                      hintText: isArabic ? 'أدخل الإيرادات' : 'Entrez le chiffre d\'affaires',
                      hintStyle: TextStyle(color: subtitleColor),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(
                          color: widget.isDarkMode ? Colors.grey[700]! : const Color(0xFFE0E0E0),
                        ),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(
                          color: widget.isDarkMode ? Colors.grey[700]! : const Color(0xFFE0E0E0),
                        ),
                      ),
                      filled: true,
                      fillColor: widget.isDarkMode ? const Color(0xFF1E1E1E) : Colors.white,
                      prefixIcon: Icon(Icons.attach_money, color: textColor),
                    ),
                  ),
                  const SizedBox(height: 25),

                  // Trimesters Selection
                  Text(
                    isArabic ? 'الأرباع' : 'Trimestres',
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
                                    _calculationResult = null;
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
            if (_calculationResult != null)
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
                    const SizedBox(height: 20),

                    // Results Table
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Container(
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: widget.isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Table(
                          border: TableBorder(
                            verticalInside: BorderSide(
                              color: widget.isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                            ),
                            horizontalInside: BorderSide(
                              color: widget.isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                            ),
                          ),
                          columnWidths: {
                            0: const FixedColumnWidth(120),
                            1: const FixedColumnWidth(120),
                            2: const FixedColumnWidth(120),
                            3: const FixedColumnWidth(120),
                          },
                          children: [
                            // Header Row
                            TableRow(
                              decoration: BoxDecoration(
                                color: widget.isDarkMode ? const Color(0xFF1E1E1E) : const Color(0xFFF5F5F5),
                              ),
                              children: [
                                _buildTableCell(
                                  isArabic ? 'الإيرادات' : 'Chiffres d\'affaires',
                                  textColor,
                                  isHeader: true,
                                ),
                                _buildTableCell(
                                  isArabic ? 'الدخل المحقق' : 'Revenu réalisé',
                                  textColor,
                                  isHeader: true,
                                ),
                                _buildTableCell(
                                  'TVA',
                                  textColor,
                                  isHeader: true,
                                ),
                                _buildTableCell(
                                  isArabic ? 'مبلغ الرسم' : 'Montant du droit',
                                  textColor,
                                  isHeader: true,
                                ),
                              ],
                            ),
                            // Data Row
                            TableRow(
                              children: [
                                _buildTableCell(
                                  '${_calculationResult!.feePrice.toStringAsFixed(2)} DH',
                                  textColor,
                                ),
                                _buildTableCell(
                                  '${_calculationResult!.earnedIncome.toStringAsFixed(2)} DH',
                                  textColor,
                                ),
                                _buildTableCell(
                                  '${_calculationResult!.tva.toStringAsFixed(2)} DH',
                                  textColor,
                                ),
                                _buildTableCell(
                                  '${_calculationResult!.feeAmountPerTrimester.toStringAsFixed(2)} DH',
                                  textColor,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Trimester Breakdown
                    if (_calculationResult!.breakdown.isNotEmpty)
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
                          ..._calculationResult!.breakdown.map((item) {
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
                          '${_calculationResult!.finalResult.toStringAsFixed(2)} DH',
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

  Widget _buildTableCell(String text, Color textColor, {bool isHeader = false}) {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: TextStyle(
          fontSize: isHeader ? 12 : 11,
          fontWeight: isHeader ? FontWeight.w600 : FontWeight.w500,
          color: textColor,
        ),
      ),
    );
  }
}
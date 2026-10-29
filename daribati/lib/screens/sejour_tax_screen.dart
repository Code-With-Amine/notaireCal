import 'package:flutter/material.dart';
import '../utils/app_strings.dart';
import '../widgets/tax_info_button.dart';
import '../widgets/tax_info_card.dart';

class SejourTaxScreen extends StatefulWidget {
  final String language;
  final bool isDarkMode;

  const SejourTaxScreen({
    Key? key,
    this.language = 'fr',
    this.isDarkMode = false,
  }) : super(key: key);

  @override
  State<SejourTaxScreen> createState() => _SejourTaxScreenState();
}

class _SejourTaxScreenState extends State<SejourTaxScreen> {
  final TextEditingController _roomsController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  String _selectedCategory = 'category1';
  
  Map<String, List<bool>> _selectedTrimesters = {
    '2023': [false, false, false, false],
    '2024': [false, false, false, false],
    '2025': [false, false, false, false],
    '2026': [false, false, false, false],
  };

  bool _showInfoCard = false;

  final Map<String, String> hotelCategories = {
    'category1': '1 étoile',
    'category2': '2 étoiles',
    'category3': '3 étoiles',
    'category4': '4 étoiles',
    'category5': '5 étoiles',
  };

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
                      colors: [Color(0xFF8B4513), Color(0xFFD2691E)],
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        AppStrings.get('sejour', widget.language),
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        AppStrings.get('sejour_desc', widget.language),
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
                title: AppStrings.get('sejour', widget.language),
                description: widget.language == 'ar'
                    ? '''
ضريبة الإقامة للفنادق:

التعريف:
تفرض ضريبة الإقامة على النزلاء في الفنادق والمنشآت 
السياحية حسب فئة الفندق وعدد الليالي.

معادلة الحساب:
• تحسب بناءً على:
  - عدد الغرف
  - متوسط السعر لكل ليلة
  - فئة الفندق (نجمة واحدة إلى خمس نجوم)
  - الأرباع المختارة
• مبلغ الضريبة = عدد الغرف × السعر × معدل الضريبة

مثال:
إذا كان:
- عدد الغرف = 50
- السعر لكل ليلة = 200 درهم
- فئة الفندق = 3 نجوم
- الأرباع المختارة = T1، T2
- معدل الضريبة = 2%
النتيجة = 50 × 200 × 0.02 × عدد أيام الربع

الفئات:
• 1 نجمة: معدل ضريبة منخفض
• 2 نجمة: معدل ضريبة معتدل
• 3 نجوم: معدل ضريبة معتدل
• 4 نجوم: معدل ضريبة أعلى
• 5 نجوم: معدل ضريبة أعلى
                    '''
                    : '''
Taxe de séjour pour hôtels:

Définition:
La taxe de séjour est imposée aux clients des hôtels et 
établissements touristiques selon la catégorie de l'hôtel 
et le nombre de nuits.

Formule de calcul:
• Calculée en fonction de:
  - Nombre de chambres
  - Prix moyen par nuit
  - Catégorie de l'hôtel (1 à 5 étoiles)
  - Trimestres sélectionnés
• Montant de la taxe = Nombre de chambres × Prix × Taux

Exemple:
Si:
- Nombre de chambres = 50
- Prix par nuit = 200 DH
- Catégorie = 3 étoiles
- Trimestres sélectionnés = T1, T2
- Taux de taxe = 2%
Résultat = 50 × 200 × 0,02 × nombre de jours du trimestre

Catégories:
• 1 étoile: taux de taxe bas
• 2 étoiles: taux de taxe modéré
• 3 étoiles: taux de taxe modéré
• 4 étoiles: taux de taxe plus élevé
• 5 étoiles: taux de taxe plus élevé
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
                  // Hotel Category
                  Text(
                    isArabic ? 'فئة الفندق' : 'Catégorie de l\'hôtel',
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
                      items: hotelCategories.entries
                          .map((entry) => DropdownMenuItem(
                            value: entry.key,
                            child: Text(
                              isArabic
                                  ? _getArabicCategory(entry.key)
                                  : entry.value,
                              style: TextStyle(color: textColor),
                            ),
                          ))
                          .toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedCategory = value ?? _selectedCategory;
                        });
                      },
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Number of Rooms
                  Text(
                    isArabic ? 'عدد الغرف' : 'Nombre de chambres',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _roomsController,
                    keyboardType: TextInputType.number,
                    style: TextStyle(color: textColor),
                    decoration: InputDecoration(
                      hintText: isArabic ? 'أدخل عدد الغرف' : 'Entrez le nombre de chambres',
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
                      prefixIcon: Icon(Icons.hotel, color: textColor),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Average Price per Night
                  Text(
                    isArabic ? 'متوسط السعر لكل ليلة (DH)' : 'Prix moyen par nuit (DH)',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _priceController,
                    keyboardType: TextInputType.number,
                    style: TextStyle(color: textColor),
                    decoration: InputDecoration(
                      hintText: isArabic ? 'أدخل السعر' : 'Entrez le prix par nuit',
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

                  // Trimester Grid
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
                                        ? const Color(0xFFD2691E)
                                        : (widget.isDarkMode ? const Color(0xFF1E1E1E) : const Color(0xFFF5F5F5)),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: trimesters[index]
                                          ? const Color(0xFFD2691E)
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
                        backgroundColor: const Color(0xFFD2691E),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(AppStrings.get('calculer', widget.language)),
                            backgroundColor: const Color(0xFFD2691E),
                          ),
                        );
                      },
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

            // Results Placeholder Card
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
                  Center(
                    child: Text(
                      widget.language == 'ar'
                          ? 'اضغط على احسب لرؤية النتائج'
                          : 'Cliquez sur Calculer pour voir les résultats',
                      style: TextStyle(
                        fontSize: 14,
                        color: subtitleColor,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
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
                        '0.00 DH',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFD2691E),
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

  String _getArabicCategory(String category) {
    const arabicMap = {
      'category1': 'نجمة واحدة',
      'category2': 'نجمتان',
      'category3': 'ثلاث نجوم',
      'category4': 'أربع نجوم',
      'category5': 'خمس نجوم',
    };
    return arabicMap[category] ?? category;
  }
}
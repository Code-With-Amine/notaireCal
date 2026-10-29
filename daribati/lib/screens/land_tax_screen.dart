import 'package:flutter/material.dart';
import '../utils/app_strings.dart';
import '../widgets/tax_info_button.dart';
import '../widgets/tax_info_card.dart';

class LandTaxScreen extends StatefulWidget {
  final String language;
  final bool isDarkMode;

  const LandTaxScreen({
    Key? key,
    this.language = 'fr',
    this.isDarkMode = false,
  }) : super(key: key);

  @override
  State<LandTaxScreen> createState() => _LandTaxScreenState();
}

class _LandTaxScreenState extends State<LandTaxScreen> {
  final TextEditingController _areaController = TextEditingController();
  String _selectedZone = 'R ≤ 3 (Zone villa ou maison)';
  Set<int> _selectedYears = {2023, 2024, 2025, 2026};
  
  bool _showInfoCard = false;

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
                        AppStrings.get('terrains', widget.language),
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        AppStrings.get('terrains_desc', widget.language),
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
                title: AppStrings.get('terrains', widget.language),
                description: widget.language == 'ar'
                    ? '''
ضريبة الأراضي غير المبنية:

التعريف:
تفرض هذه الضريبة على الأراضي الحضرية غير المبنية.

معادلة الحساب:
• تحسب بناءً على مساحة الأرض بالمتر المربع
• تختلف حسب المنطقة (R ≤ 3 أو R ≤ 5 أو R ≤ 7)
• تطبق على سنوات متعددة (2023-2026)

مثال:
إذا كانت مساحة الأرض = 1000 م²:
- المنطقة: R ≤ 3
- السنوات المختارة: 2023، 2024
- الإجمالي = المبلغ للسنة × عدد السنوات

المناطق:
• R ≤ 3: منطقة الفلل أو المنازل
• R ≤ 5: منطقة تجارية
• R ≤ 7: منطقة صناعية
                    '''
                    : '''
Taxe sur les terrains non bâtis:

Définition:
Cette taxe s'applique aux terrains urbains qui 
ne sont pas construits.

Formule de calcul:
• Calculée en fonction de la superficie en m²
• Varie selon la zone (R ≤ 3 ou R ≤ 5 ou R ≤ 7)
• S'applique sur plusieurs années (2023-2026)

Exemple:
Si superficie du terrain = 1000 m²:
- Zone: R ≤ 3
- Années sélectionnées: 2023, 2024
- Total = Montant par an × nombre d'années

Zones:
• R ≤ 3: Zone villas ou maisons
• R ≤ 5: Zone commerciale
• R ≤ 7: Zone industrielle
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
                  Text(
                    AppStrings.get('taille_terrain', widget.language),
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _areaController,
                    keyboardType: TextInputType.number,
                    style: TextStyle(color: textColor),
                    decoration: InputDecoration(
                      hintText: AppStrings.get('taille_hint', widget.language),
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
                    ),
                  ),
                  const SizedBox(height: 20),

                  Text(
                    AppStrings.get('zone', widget.language),
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
                      value: _selectedZone,
                      isExpanded: true,
                      underline: const SizedBox(),
                      dropdownColor: cardColor,
                      items: [
                        'R ≤ 3 (Zone villa ou maison)',
                        'R ≤ 5 (Zone commerciale)',
                        'R ≤ 7 (Zone industrielle)',
                      ]
                          .map((zone) => DropdownMenuItem(
                            value: zone,
                            child: Text(
                              zone,
                              style: TextStyle(color: textColor),
                            ),
                          ))
                          .toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedZone = value ?? _selectedZone;
                        });
                      },
                    ),
                  ),
                  const SizedBox(height: 20),

                  Text(
                    AppStrings.get('annees', widget.language),
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [2023, 2024, 2025, 2026].map((year) {
                      bool isSelected = _selectedYears.contains(year);
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            if (isSelected) {
                              _selectedYears.remove(year);
                            } else {
                              _selectedYears.add(year);
                            }
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? const Color(0xFF0000FF)
                                : (widget.isDarkMode ? const Color(0xFF1E1E1E) : const Color(0xFFF0F0F0)),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                '$year',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: isSelected ? Colors.white : textColor,
                                ),
                              ),
                              if (isSelected) ...[
                                const SizedBox(width: 4),
                                GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      _selectedYears.remove(year);
                                    });
                                  },
                                  child: const Icon(
                                    Icons.close,
                                    size: 14,
                                    color: Colors.white,
                                  ),
                                ),
                              ]
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 25),

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
                      onPressed: () {},
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

                  Text(
                    '2023: 1213.00 DH\n2024: 1180.40 DH\n2025: 1148.00 DH\n2026: 1121.00 DH',
                    style: TextStyle(
                      fontSize: 14,
                      color: textColor,
                      height: 1.8,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Divider(
                    color: widget.isDarkMode ? Colors.grey[700] : Colors.grey[300],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        AppStrings.get('total', widget.language),
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: textColor,
                        ),
                      ),
                      const Text(
                        '4662.40 DH',
                        style: TextStyle(
                          fontSize: 20,
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
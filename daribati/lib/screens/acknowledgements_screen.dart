import 'package:flutter/material.dart';
import '../utils/app_strings.dart';

class AcknowledgementsScreen extends StatelessWidget {
  final String language;
  final bool isDarkMode;

  const AcknowledgementsScreen({
    Key? key,
    this.language = 'fr',
    this.isDarkMode = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isArabic = language == 'ar';
    final cardColor = isDarkMode ? const Color(0xFF2A2A2A) : Colors.white;
    final textColor = isDarkMode ? Colors.white : Colors.black;
    final subtitleColor = isDarkMode ? Colors.grey[400] : Colors.grey[600];

    return Directionality(
      textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Intro Text
            Padding(
              padding: const EdgeInsets.only(bottom: 24.0),
              child: Text(
                language == 'ar'
                    ? 'ستجد هنا جميع الإقرارات الضريبية، اختر الإقرار وأكمل المعلومات.'
                    : 'Vous trouverez ici toutes les déclarations fiscales, choisissez la déclaration et remplissez les informations.',
                style: TextStyle(
                  fontSize: 16,
                  color: textColor,
                  height: 1.6,
                ),
              ),
            ),

            // Sejour Tax Card
            _buildTaxCard(
              context: context,
              cardColor: cardColor,
              textColor: textColor,
              subtitleColor: subtitleColor,
              taxName: language == 'ar' ? 'ضريبة الإقامة' : 'Taxe de Séjour',
              imageBgColor: const Color(0xFF8B4513),
              isDarkMode: isDarkMode,
              isArabic: isArabic,
            ),
            const SizedBox(height: 16),

            // Drinks Tax Card
            _buildTaxCard(
              context: context,
              cardColor: cardColor,
              textColor: textColor,
              subtitleColor: subtitleColor,
              taxName: language == 'ar' ? 'ضريبة المشروبات' : 'Taxe sur les Boissons',
              imageBgColor: const Color(0xFF0052CC),
              isDarkMode: isDarkMode,
              isArabic: isArabic,
            ),
            const SizedBox(height: 16),

            // Taxi Tax Card
            _buildTaxCard(
              context: context,
              cardColor: cardColor,
              textColor: textColor,
              subtitleColor: subtitleColor,
              taxName: language == 'ar' ? 'ضريبة النقل' : 'Taxe sur le Transport',
              imageBgColor: const Color(0xFF0000FF),
              isDarkMode: isDarkMode,
              isArabic: isArabic,
            ),
            const SizedBox(height: 16),

            // Land Tax Card
            _buildTaxCard(
              context: context,
              cardColor: cardColor,
              textColor: textColor,
              subtitleColor: subtitleColor,
              taxName: language == 'ar' ? 'ضريبة الأراضي' : 'Taxe sur les Terrains',
              imageBgColor: const Color(0xFF0052CC),
              isDarkMode: isDarkMode,
              isArabic: isArabic,
            ),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildTaxCard({
    required BuildContext context,
    required Color cardColor,
    required Color textColor,
    required Color? subtitleColor,
    required String taxName,
    required Color imageBgColor,
    required bool isDarkMode,
    required bool isArabic,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDarkMode ? 0.3 : 0.08),
            blurRadius: 10,
            offset: const Offset(0, 2),
          )
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Placeholder Image (Left side - like in the UI)
          if (!isArabic)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: _buildPlaceholderImage(imageBgColor),
            ),

          // Tax Name Text
          Expanded(
            child: Text(
              taxName,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: textColor,
              ),
            ),
          ),

          // Placeholder Image (Right side for Arabic - RTL)
          if (isArabic)
            Padding(
              padding: const EdgeInsets.only(left: 16),
              child: _buildPlaceholderImage(imageBgColor),
            ),
        ],
      ),
    );
  }

  Widget _buildPlaceholderImage(Color bgColor) {
    return Container(
      width: 80,
      height: 100,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            bgColor,
            bgColor.withOpacity(0.7),
          ],
        ),
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 6,
            offset: const Offset(0, 2),
          )
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Background pattern effect
          Positioned(
            top: -10,
            right: -10,
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            bottom: -5,
            left: -5,
            child: Container(
              width: 30,
              height: 30,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
            ),
          ),
          // Document/Form Icon
          Icon(
            Icons.description,
            color: Colors.white,
            size: 40,
          ),
        ],
      ),
    );
  }
}
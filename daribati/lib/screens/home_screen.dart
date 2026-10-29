import 'package:flutter/material.dart';
import '../widgets/tax_card.dart';
import '../utils/app_strings.dart';
import 'land_tax_screen.dart';
import 'taxi_tax_screen.dart';
import 'drinks_tax_screen.dart';
import 'sejour_tax_screen.dart';

class HomeScreen extends StatelessWidget {
  final String language;
  final bool isDarkMode;
  final Function(Widget, int)? onTaxCardTap;

  const HomeScreen({
    Key? key,
    this.language = 'fr',
    this.isDarkMode = false,
    this.onTaxCardTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isArabic = language == 'ar';
    final textColor = isDarkMode ? Colors.white : Colors.black;
    final subtitleColor = isDarkMode 
        ? Colors.grey[400] 
        : Colors.black87;

    return Directionality(
      textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 10),
            
            RichText(
              text: TextSpan(
                style: TextStyle(
                  fontSize: 16,
                  color: textColor,
                  height: 1.5,
                ),
                children: [
                  TextSpan(text: AppStrings.get('bonjour', language)),
                  TextSpan(
                    text: ' Adnane',
                    style: const TextStyle(
                      color: Color(0xFF0000FF),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              AppStrings.get('description', language),
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                height: 1.3,
                color: textColor,
              ),
            ),
            
            const SizedBox(height: 40),
            
            Text(
              AppStrings.get('choisir_taxe', language),
              style: TextStyle(
                fontSize: 16,
                color: subtitleColor,
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Tax Cards Grid
            Row(
              children: [
                Expanded(
                  child: TaxCard(
                    title: AppStrings.get('terrains', language),
                    subtitle: AppStrings.get('terrains_desc', language),
                    iconPath: 'assets/icons/land.png',
                    backgroundImagePath: 'assets/images/terrain_bg.png',
                    isGradient: true,
                    textColor: Colors.white,
                    isDarkMode: isDarkMode,
                    onTap: () {
                      if (onTaxCardTap != null) {
                        onTaxCardTap!(
                          LandTaxScreen(
                            language: language,
                            isDarkMode: isDarkMode,
                          ),
                          0,
                        );
                      }
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: TaxCard(
                    title: AppStrings.get('taxi', language),
                    subtitle: AppStrings.get('taxi_desc', language),
                    iconPath: 'assets/icons/taxi.png',
                    backgroundImagePath: 'assets/images/taxi_bg.png',
                    isGradient: false,
                    textColor: Colors.black,
                    isDarkMode: isDarkMode,
                    onTap: () {
                      if (onTaxCardTap != null) {
                        onTaxCardTap!(
                          TaxiTaxScreen(
                            language: language,
                            isDarkMode: isDarkMode,
                          ),
                          0,
                        );
                      }
                    },
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            Row(
              children: [
                Expanded(
                  child: TaxCard(
                    title: AppStrings.get('boissons', language),
                    subtitle: AppStrings.get('boissons_desc', language),
                    iconPath: 'assets/icons/lemonade.png',
                    backgroundImagePath: 'assets/images/boisson_bg.png',
                    isGradient: false,
                    textColor: Colors.black,
                    isDarkMode: isDarkMode,
                    onTap: () {
                      if (onTaxCardTap != null) {
                        onTaxCardTap!(
                          DrinksTaxScreen(
                            language: language,
                            isDarkMode: isDarkMode,
                          ),
                          0,
                        );
                      }
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: TaxCard(
                    title: AppStrings.get('sejour', language),
                    subtitle: AppStrings.get('sejour_desc', language),
                    iconPath: 'assets/icons/hotel.png',
                    backgroundImagePath: 'assets/images/sejour_bg.png',
                    isGradient: false,
                    textColor: Colors.black,
                    isDarkMode: isDarkMode,
                    onTap: () {
                      if (onTaxCardTap != null) {
                        onTaxCardTap!(
                          SejourTaxScreen(
                            language: language,
                            isDarkMode: isDarkMode,
                          ),
                          0,
                        );
                      }
                    },
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
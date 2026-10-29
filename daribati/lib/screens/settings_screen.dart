import 'package:flutter/material.dart';
import '../utils/app_strings.dart';

class SettingsScreen extends StatelessWidget {
  final String language;
  final bool isDarkMode;
  final Function(String) onLanguageChange;
  final Function() onThemeToggle;

  const SettingsScreen({
    Key? key,
    required this.language,
    required this.isDarkMode,
    required this.onLanguageChange,
    required this.onThemeToggle,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    
    return Scaffold(
      backgroundColor: isDarkMode ? const Color(0xFF1E1E1E) : const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: Text(AppStrings.get('settings', language)),
        backgroundColor: isDarkMode ? const Color(0xFF2A2A2A) : Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Language Section
            Text(
              AppStrings.get('language', language),
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDarkMode ? Colors.white : Colors.black,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              decoration: BoxDecoration(
                color: isDarkMode ? const Color(0xFF2A2A2A) : Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(isDarkMode ? 0.3 : 0.08),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  )
                ],
              ),
              child: Column(
                children: [
                  _LanguageTile(
                    title: 'Français',
                    isSelected: language == 'fr',
                    onTap: () => onLanguageChange('fr'),
                    isDarkMode: isDarkMode,
                  ),
                  Divider(
                    height: 1,
                    color: isDarkMode ? Colors.grey[700] : Colors.grey[300],
                  ),
                  _LanguageTile(
                    title: 'العربية',
                    isSelected: language == 'ar',
                    onTap: () => onLanguageChange('ar'),
                    isDarkMode: isDarkMode,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            
            // Theme Section
            Text(
              AppStrings.get('appearance', language),
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDarkMode ? Colors.white : Colors.black,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              decoration: BoxDecoration(
                color: isDarkMode ? const Color(0xFF2A2A2A) : Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(isDarkMode ? 0.3 : 0.08),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  )
                ],
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isDarkMode
                              ? AppStrings.get('dark_mode', language)
                              : AppStrings.get('light_mode', language),
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: isDarkMode ? Colors.white : Colors.black,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          isDarkMode ? '🌙' : '☀️',
                          style: const TextStyle(fontSize: 20),
                        ),
                      ],
                    ),
                    Switch(
                      value: isDarkMode,
                      onChanged: (_) => onThemeToggle(),
                      activeColor: const Color(0xFF0000FF),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LanguageTile extends StatelessWidget {
  final String title;
  final bool isSelected;
  final VoidCallback onTap;
  final bool isDarkMode;

  const _LanguageTile({
    required this.title,
    required this.isSelected,
    required this.onTap,
    required this.isDarkMode,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                color: isDarkMode ? Colors.white : Colors.black,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle,
                color: Color(0xFF0000FF),
                size: 24,
              ),
          ],
        ),
      ),
    );
  }
}
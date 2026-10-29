import 'package:flutter/material.dart';
import 'screens/splash_screen.dart';
import 'screens/main_layout.dart';
import 'screens/home_screen.dart';
import 'screens/land_tax_screen.dart';
import 'screens/taxi_tax_screen.dart';
import 'screens/drinks_tax_screen.dart';
import 'screens/sejour_tax_screen.dart';
import 'screens/acknowledgements_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool _showSplash = true;
  String _language = 'fr'; // Default: French
  bool _isDarkMode = false; // Default: Light mode

  @override
  void initState() {
    super.initState();
    // Hide splash after 3 seconds
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _showSplash = false;
        });
      }
    });
  }

  void _changeLanguage(String language) {
    setState(() {
      _language = language;
    });
  }

  void _toggleTheme() {
    setState(() {
      _isDarkMode = !_isDarkMode;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: _isDarkMode
          ? ThemeData.dark(useMaterial3: true).copyWith(
              scaffoldBackgroundColor: const Color(0xFF1E1E1E),
              appBarTheme: const AppBarTheme(
                backgroundColor: Color(0xFF2A2A2A),
              ),
            )
          : ThemeData(
              primaryColor: const Color(0xFF0000FF),
              scaffoldBackgroundColor: const Color(0xFFF5F5F5),
              fontFamily: 'Arial',
              useMaterial3: true,
            ),
      home: _showSplash
          ? const SplashScreen()
          : MainLayoutRoot(
              language: _language,
              isDarkMode: _isDarkMode,
              onLanguageChange: _changeLanguage,
              onThemeToggle: _toggleTheme,
            ),
    );
  }
}

// =====================================================
// PERSISTENT MAIN LAYOUT WITH NAVIGATION STATE
// =====================================================
class MainLayoutRoot extends StatefulWidget {
  final String language;
  final bool isDarkMode;
  final Function(String) onLanguageChange;
  final Function() onThemeToggle;

  const MainLayoutRoot({
    Key? key,
    required this.language,
    required this.isDarkMode,
    required this.onLanguageChange,
    required this.onThemeToggle,
  }) : super(key: key);

  @override
  State<MainLayoutRoot> createState() => _MainLayoutRootState();
}

class _MainLayoutRootState extends State<MainLayoutRoot> {
  int _currentIndex = 0;
  late Widget _currentScreen;

  @override
  void initState() {
    super.initState();
    _currentScreen = HomeScreen(
      language: widget.language,
      isDarkMode: widget.isDarkMode,
      onTaxCardTap: _navigateToScreen,
    );
  }

  void _onNavTap(int index) {
    setState(() {
      _currentIndex = index;
      switch (index) {
        case 0:
          _currentScreen = HomeScreen(
            language: widget.language,
            isDarkMode: widget.isDarkMode,
            onTaxCardTap: _navigateToScreen,
          );
          break;
        case 1:
          _currentScreen = AcknowledgementsScreen(
            language: widget.language,
            isDarkMode: widget.isDarkMode,
          );
          break;
        case 2:
          break;
        case 3:
          break;
      }
    });
  }

  void _navigateToScreen(Widget screen, int navIndex) {
    setState(() {
      _currentIndex = navIndex;
      _currentScreen = screen;
    });
  }

  @override
  Widget build(BuildContext context) {
    // Ensure HomeScreen has proper parameters
    Widget screenToShow = _currentScreen;

    if (screenToShow is HomeScreen) {
      screenToShow = HomeScreen(
        language: widget.language,
        isDarkMode: widget.isDarkMode,
        onTaxCardTap: _navigateToScreen,
      );
    } else if (screenToShow is AcknowledgementsScreen) {
      screenToShow = AcknowledgementsScreen(
        language: widget.language,
        isDarkMode: widget.isDarkMode,
      );
    } else if (screenToShow is LandTaxScreen) {
      screenToShow = LandTaxScreen(
        language: widget.language,
        isDarkMode: widget.isDarkMode,
      );
    } else if (screenToShow is TaxiTaxScreen) {
      screenToShow = TaxiTaxScreen(
        language: widget.language,
        isDarkMode: widget.isDarkMode,
      );
    } else if (screenToShow is DrinksTaxScreen) {
      screenToShow = DrinksTaxScreen(
        language: widget.language,
        isDarkMode: widget.isDarkMode,
      );
    } else if (screenToShow is SejourTaxScreen) {
      screenToShow = SejourTaxScreen(
        language: widget.language,
        isDarkMode: widget.isDarkMode,
      );
    }

    return MainLayout(
      language: widget.language,
      isDarkMode: widget.isDarkMode,
      onLanguageChange: widget.onLanguageChange,
      onThemeToggle: widget.onThemeToggle,
      currentIndex: _currentIndex,
      onNavTap: _onNavTap,
      navigateToScreen: _navigateToScreen,
      child: screenToShow,
    );
  }
}
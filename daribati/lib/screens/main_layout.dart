import 'package:flutter/material.dart';
import '../widgets/bottom_nav_item.dart';
import 'settings_screen.dart';

class MainLayout extends StatefulWidget {
  final Widget child;
  final String language;
  final bool isDarkMode;
  final Function(String) onLanguageChange;
  final Function() onThemeToggle;
  final int? currentIndex;
  final Function(int)? onNavTap;
  final Function(Widget, int)? navigateToScreen;

  const MainLayout({
    Key? key,
    required this.child,
    required this.language,
    required this.isDarkMode,
    required this.onLanguageChange,
    required this.onThemeToggle,
    this.currentIndex,
    this.onNavTap,
    this.navigateToScreen,
  }) : super(key: key);

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  late Function(int) _onNavTap;

  @override
  void initState() {
    super.initState();
    _onNavTap = widget.onNavTap ?? _defaultNavTap;
  }

  void _defaultNavTap(int index) {
    // Do nothing - parent handles state
  }

  @override
  Widget build(BuildContext context) {
    final backgroundColor =
        widget.isDarkMode ? const Color(0xFF1E1E1E) : const Color(0xFFF5F5F5);
    final headerColor =
        widget.isDarkMode ? const Color(0xFF2A2A2A) : const Color(0xFFF5F5F5);
    final iconColor = widget.isDarkMode ? Colors.white : Colors.black;
    
    // Use widget.currentIndex directly instead of local state
    final currentIndex = widget.currentIndex ?? 0;

    return Scaffold(
      backgroundColor: backgroundColor,
      body: Stack(
        children: [
          // Main content - scrollable with padding for header and footer
          Positioned(
            top: 100,
            left: 0,
            right: 0,
            bottom: 70,
            child: SingleChildScrollView(
              child: widget.child,
            ),
          ),

          // FIXED TOP HEADER - stays in place
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              color: headerColor,
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: Icon(Icons.menu, size: 28, color: iconColor),
                    onPressed: () {},
                    constraints: const BoxConstraints(),
                    padding: EdgeInsets.zero,
                  ),
                  Image.asset(
                    'assets/images/logo2.png',
                    height: 60,
                    fit: BoxFit.contain,
                  ),
                  IconButton(
                    icon: Image.asset(
                      'assets/icons/setting.png',
                      width: 24,
                      height: 24,
                      color: iconColor,
                      errorBuilder: (context, error, stackTrace) {
                        return Icon(Icons.tune, size: 24, color: iconColor);
                      },
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => SettingsScreen(
                            language: widget.language,
                            isDarkMode: widget.isDarkMode,
                            onLanguageChange: widget.onLanguageChange,
                            onThemeToggle: widget.onThemeToggle,
                          ),
                        ),
                      );
                    },
                    constraints: const BoxConstraints(),
                    padding: EdgeInsets.zero,
                  ),
                ],
              ),
            ),
          ),

          // FIXED BOTTOM NAVIGATION - stays in place
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              decoration: BoxDecoration(
                color: headerColor,
                border: Border(
                  top: BorderSide(
                    color: widget.isDarkMode
                        ? Colors.grey[700]!
                        : const Color(0xFFE0E0E0),
                    width: 1,
                  ),
                ),
              ),
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  BottomNavItem(
                    icon: Icons.home,
                    iconPath: 'assets/icons/home.png',
                    isActive: currentIndex == 0,
                    onTap: () => _onNavTap(0),
                    isDarkMode: widget.isDarkMode,
                  ),
                  BottomNavItem(
                    icon: Icons.payments,
                    iconPath: 'assets/icons/document.png',
                    isActive: currentIndex == 1,
                    onTap: () => _onNavTap(1),
                    isDarkMode: widget.isDarkMode,
                  ),
                  BottomNavItem(
                    icon: Icons.history,
                    iconPath: 'assets/icons/history.png',
                    isActive: currentIndex == 2,
                    onTap: () => _onNavTap(2),
                    isDarkMode: widget.isDarkMode,
                  ),
                  BottomNavItem(
                    icon: Icons.person,
                    iconPath: 'assets/icons/user.png',
                    isActive: currentIndex == 3,
                    onTap: () => _onNavTap(3),
                    isDarkMode: widget.isDarkMode,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
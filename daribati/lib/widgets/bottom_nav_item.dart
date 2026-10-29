import 'package:flutter/material.dart';

class BottomNavItem extends StatelessWidget {
  final IconData icon;
  final String iconPath;
  final bool isActive;
  final VoidCallback onTap;
  final bool isDarkMode;

  const BottomNavItem({
    Key? key,
    required this.icon,
    required this.iconPath,
    required this.isActive,
    required this.onTap,
    this.isDarkMode = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final iconColor = isActive 
        ? Colors.white 
        : (isDarkMode ? Colors.grey[400] : Colors.black);
    
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isActive ? const Color(0xFF0000FF) : Colors.transparent,
              shape: BoxShape.circle,
            ),
            child: Image.asset(
              iconPath,
              width: 28,
              height: 28,
              color: iconColor,
              errorBuilder: (context, error, stackTrace) {
                return Icon(
                  icon,
                  size: 28,
                  color: iconColor,
                );
              },
            ),
          ),
          if (isActive)
            Container(
              margin: const EdgeInsets.only(top: 4),
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                color: Color(0xFF0000FF),
                shape: BoxShape.circle,
              ),
            ),
        ],
      ),
    );
  }
}
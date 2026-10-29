import 'package:flutter/material.dart';

class TaxInfoButton extends StatelessWidget {
  final VoidCallback onTap;
  final bool isDarkMode;

  const TaxInfoButton({
    Key? key,
    required this.onTap,
    required this.isDarkMode,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 50,
        height: 50,
        decoration: BoxDecoration(
          color: const Color(0xFF0000FF),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 8,
              offset: const Offset(0, 2),
            )
          ],
        ),
        child: const Center(
          child: Text(
            '!',
            style: TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}
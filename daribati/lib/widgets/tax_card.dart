import 'package:flutter/material.dart';

class TaxCard extends StatefulWidget {
  final String title;
  final String subtitle;
  final String iconPath;
  final bool isGradient;
  final Color textColor;
  final VoidCallback onTap;
  final String? backgroundImagePath;
  final bool isDarkMode;

  const TaxCard({
    Key? key,
    required this.title,
    required this.subtitle,
    required this.iconPath,
    required this.isGradient,
    required this.textColor,
    required this.onTap,
    this.backgroundImagePath,
    this.isDarkMode = false,
  }) : super(key: key);

  @override
  State<TaxCard> createState() => _TaxCardState();
}

class _TaxCardState extends State<TaxCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final defaultColor = widget.isDarkMode ? const Color(0xFF2A2A2A) : const Color(0xFFE8E8E8);
    
    return GestureDetector(
      onTapDown: (_) {
        setState(() {
          _isPressed = true;
        });
      },
      onTapUp: (_) {
        setState(() {
          _isPressed = false;
        });
        widget.onTap();
      },
      onTapCancel: () {
        setState(() {
          _isPressed = false;
        });
      },
      child: Container(
        height: 240,
        decoration: BoxDecoration(
          gradient: _isPressed
              ? const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF0000FF),
                    Color(0xFF0033CC),
                  ],
                )
              : null,
          color: _isPressed ? null : defaultColor,
          borderRadius: BorderRadius.circular(24),
          image: !_isPressed && widget.backgroundImagePath != null
              ? DecorationImage(
                  image: AssetImage(widget.backgroundImagePath!),
                  fit: BoxFit.cover,
                )
              : null,
        ),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: !_isPressed && widget.backgroundImagePath != null
                ? LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomLeft,
                    colors: [
                      Colors.black.withOpacity(0.0),
                      Color.fromARGB(255, 12, 0, 180),
                    ],
                  )
                : null,
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Image.asset(
                widget.iconPath,
                width: 48,
                height: 48,
                color: _isPressed || widget.backgroundImagePath != null ? Colors.white : Colors.black,
                errorBuilder: (context, error, stackTrace) {
                  return Icon(
                    Icons.error_outline,
                    size: 48,
                    color: _isPressed || widget.backgroundImagePath != null ? Colors.white : Colors.black,
                  );
                },
              ),
              const SizedBox(height: 16),
              Text(
                widget.title,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: _isPressed || widget.backgroundImagePath != null ? Colors.white : Colors.black,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 8),
              Expanded(
                child: Text(
                  widget.subtitle,
                  style: TextStyle(
                    fontSize: 13,
                    color: _isPressed || widget.backgroundImagePath != null 
                        ? Colors.white.withOpacity(0.9) 
                        : Colors.black.withOpacity(0.9),
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
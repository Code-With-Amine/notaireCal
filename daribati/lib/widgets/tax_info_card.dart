import 'package:flutter/material.dart';

class TaxInfoCard extends StatelessWidget {
  final String title;
  final String description;
  final bool isDarkMode;
  final VoidCallback onClose;

  const TaxInfoCard({
    Key? key,
    required this.title,
    required this.description,
    required this.isDarkMode,
    required this.onClose,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final cardColor = isDarkMode ? const Color(0xFF2A2A2A) : Colors.white;
    final textColor = isDarkMode ? Colors.white : Colors.black;
    final borderColor = isDarkMode ? Colors.grey[700]! : Colors.grey[300]!;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: cardColor,
        border: Border.all(color: const Color(0xFF0000FF), width: 2),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with close button
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: const BoxDecoration(
                          color: Color(0xFF0000FF),
                          shape: BoxShape.circle,
                        ),
                        child: const Center(
                          child: Text(
                            '!',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          title,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: textColor,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: onClose,
                  child: Icon(
                    Icons.close,
                    color: textColor,
                    size: 24,
                  ),
                ),
              ],
            ),
          ),
          
          // Divider
          Container(
            height: 1,
            color: borderColor,
          ),
          
          // Description
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              description,
              style: TextStyle(
                fontSize: 13,
                color: isDarkMode ? Colors.grey[300] : Colors.grey[700],
                height: 1.6,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
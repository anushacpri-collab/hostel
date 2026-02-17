import 'package:flutter/material.dart';

class AppState extends ChangeNotifier {
  String languageCode = 'en';

  void setLanguage(String code) {
    languageCode = code;
    notifyListeners();
  }
}

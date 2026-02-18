import 'package:flutter/material.dart';
import 'api_client.dart';

class AppState extends ChangeNotifier {
  String languageCode = 'en';
  String baseUrl = 'http://localhost:5000';

  String? studentToken;
  String? parentToken;
  String? authorityToken;
  String? watchmanToken;

  ApiClient get api => ApiClient(baseUrl: baseUrl);

  void setLanguage(String code) {
    languageCode = code;
    notifyListeners();
  }

  void setBaseUrl(String value) {
    baseUrl = value;
    notifyListeners();
  }

  void setToken(String role, String token) {
    switch (role) {
      case 'STUDENT':
        studentToken = token;
        break;
      case 'PARENT':
        parentToken = token;
        break;
      case 'DEPUTY_WARDEN':
      case 'PRINCIPAL':
        authorityToken = token;
        break;
      case 'WATCHMAN':
        watchmanToken = token;
        break;
      default:
        break;
    }
    notifyListeners();
  }
}

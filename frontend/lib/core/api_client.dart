import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiClient {
  ApiClient({required this.baseUrl});
  final String baseUrl;

  Future<dynamic> get(String path, {String? token}) async {
    final response = await http.get(
      Uri.parse('$baseUrl$path'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
      },
    );

    return _parseResponse(response);
  }

  Future<dynamic> post(String path, Map<String, dynamic> body, {String? token}) async {
    final response = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );

    return _parseResponse(response);
  }

  dynamic _parseResponse(http.Response response) {
    final text = response.body.isEmpty ? '{}' : response.body;
    final decoded = jsonDecode(text);

    if (response.statusCode >= 200 && response.statusCode < 300) return decoded;

    final message = decoded is Map<String, dynamic> ? decoded['message']?.toString() : 'Request failed';
    throw Exception('HTTP ${response.statusCode}: ${message ?? 'Request failed'}');
  }
}

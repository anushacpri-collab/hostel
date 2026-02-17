import 'package:flutter/material.dart';

class ParentLoginScreen extends StatelessWidget {
  const ParentLoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Parent OTP Login')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          TextField(decoration: InputDecoration(labelText: 'Registered Phone')),
          SizedBox(height: 8),
          TextField(decoration: InputDecoration(labelText: 'OTP')),
          SizedBox(height: 8),
          Text('Login only with linked phone number.'),
        ],
      ),
    );
  }
}

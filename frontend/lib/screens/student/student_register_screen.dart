import 'package:flutter/material.dart';

class StudentRegisterScreen extends StatelessWidget {
  const StudentRegisterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Student Registration')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          TextField(decoration: InputDecoration(labelText: 'College ID')),
          TextField(decoration: InputDecoration(labelText: 'Name')),
          TextField(decoration: InputDecoration(labelText: 'Department')),
          TextField(decoration: InputDecoration(labelText: 'Parent Phone Number')),
          TextField(decoration: InputDecoration(labelText: 'Password'), obscureText: true),
          SizedBox(height: 16),
          Text('Account will stay locked until parent verifies OTP.'),
        ],
      ),
    );
  }
}

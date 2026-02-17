import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

class StudentQrScreen extends StatelessWidget {
  const StudentQrScreen({super.key, required this.qrToken});
  final String qrToken;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Approved Leave QR Pass')),
      body: Center(child: QrImageView(data: qrToken, size: 260)),
    );
  }
}

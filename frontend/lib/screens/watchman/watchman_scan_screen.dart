import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class WatchmanScanScreen extends StatelessWidget {
  const WatchmanScanScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Watchman QR Scan')),
      body: MobileScanner(
        onDetect: (capture) {
          final code = capture.barcodes.first.rawValue;
          if (code != null) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Scanned: $code')));
          }
        },
      ),
    );
  }
}

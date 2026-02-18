import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import '../../core/app_state.dart';

class WatchmanScanScreen extends StatefulWidget {
  const WatchmanScanScreen({super.key});

  @override
  State<WatchmanScanScreen> createState() => _WatchmanScanScreenState();
}

class _WatchmanScanScreenState extends State<WatchmanScanScreen> {
  final _password = TextEditingController(text: 'Password@123');
  final _manualToken = TextEditingController();
  String action = 'EXIT';
  String message = 'Scan QR or enter token manually';
  bool isSubmitting = false;

  Future<void> _scanSend(AppState app, String token) async {
    if (isSubmitting || app.watchmanToken == null) return;

    setState(() => isSubmitting = true);
    try {
      final resp = await app.api.post('/api/watchman/scan', {'qrToken': token, 'action': action}, token: app.watchmanToken);
      setState(() => message = 'Result: ${resp['result']} | ${resp['reason'] ?? 'OK'}');
    } catch (e) {
      setState(() => message = e.toString());
    } finally {
      setState(() => isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();

    return Scaffold(
      appBar: AppBar(title: const Text('Watchman QR Scan')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Watchman Login', style: TextStyle(fontWeight: FontWeight.bold)),
          TextField(controller: _password, decoration: const InputDecoration(labelText: 'Password')),
          ElevatedButton(
            onPressed: () async {
              try {
                final resp = await app.api.post('/api/auth/staff/login', {'role': 'WATCHMAN', 'password': _password.text});
                app.setToken('WATCHMAN', resp['token'].toString());
                setState(() => message = 'Watchman logged in');
              } catch (e) {
                setState(() => message = e.toString());
              }
            },
            child: const Text('Login'),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              const Text('Action: '),
              DropdownButton<String>(
                value: action,
                items: const [
                  DropdownMenuItem(value: 'EXIT', child: Text('EXIT')),
                  DropdownMenuItem(value: 'ENTRY', child: Text('ENTRY')),
                ],
                onChanged: (v) => setState(() => action = v ?? 'EXIT'),
              ),
            ],
          ),
          SizedBox(
            height: 300,
            child: MobileScanner(
              onDetect: (capture) {
                final code = capture.barcodes.first.rawValue;
                if (code != null) _scanSend(app, code);
              },
            ),
          ),
          TextField(controller: _manualToken, decoration: const InputDecoration(labelText: 'Manual QR Token / JSON payload')),
          ElevatedButton(
            onPressed: app.watchmanToken == null ? null : () => _scanSend(app, _manualToken.text.trim()),
            child: const Text('Submit Manual Scan'),
          ),
          const SizedBox(height: 8),
          Text(message, style: const TextStyle(color: Colors.blue)),
        ],
      ),
    );
  }
}

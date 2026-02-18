import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/app_state.dart';

class ParentLoginScreen extends StatefulWidget {
  const ParentLoginScreen({super.key});

  @override
  State<ParentLoginScreen> createState() => _ParentLoginScreenState();
}

class _ParentLoginScreenState extends State<ParentLoginScreen> {
  final _phone = TextEditingController();
  final _otp = TextEditingController();
  final _leaveId = TextEditingController();
  String message = '';
  List<dynamic> students = [];

  Future<void> _run(Future<void> Function() fn) async {
    try {
      await fn();
    } catch (e) {
      setState(() => message = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();

    return Scaffold(
      appBar: AppBar(title: const Text('Parent OTP Login')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(controller: _phone, decoration: const InputDecoration(labelText: 'Registered Phone')),
          ElevatedButton(
            onPressed: () => _run(() async {
              final resp = await app.api.post('/api/auth/parent/login-phone', {'phone': _phone.text.trim()});
              setState(() => message = resp['message'].toString());
            }),
            child: const Text('Send OTP'),
          ),
          TextField(controller: _otp, decoration: const InputDecoration(labelText: 'OTP')),
          ElevatedButton(
            onPressed: () => _run(() async {
              final resp = await app.api.post('/api/auth/parent/verify-otp', {
                'phone': _phone.text.trim(),
                'otp': _otp.text.trim(),
              });
              app.setToken('PARENT', resp['token'].toString());
              setState(() => message = resp['message'].toString());
            }),
            child: const Text('Verify OTP'),
          ),
          const Divider(),
          ElevatedButton(
            onPressed: app.parentToken == null
                ? null
                : () => _run(() async {
                    final resp = await app.api.get('/api/parent/students', token: app.parentToken) as List<dynamic>;
                    setState(() => students = resp);
                  }),
            child: const Text('View Linked Students'),
          ),
          TextField(controller: _leaveId, decoration: const InputDecoration(labelText: 'Leave Request ID for Emergency Extension')),
          ElevatedButton(
            onPressed: app.parentToken == null
                ? null
                : () => _run(() async {
                    final resp = await app.api.post('/api/parent/emergency-extension', {
                      'leaveRequestId': int.parse(_leaveId.text),
                    }, token: app.parentToken);
                    setState(() => message = resp['message'].toString());
                  }),
            child: const Text('Request Emergency Extension'),
          ),
          if (message.isNotEmpty) Padding(padding: const EdgeInsets.symmetric(vertical: 8), child: Text(message, style: const TextStyle(color: Colors.blue))),
          for (final student in students)
            Card(
              child: ListTile(
                title: Text('${student['name']} (${student['college_id']})'),
                subtitle: Text('Dept: ${student['department']} | Profile completed: ${student['profile_completed']}'),
              ),
            ),
        ],
      ),
    );
  }
}

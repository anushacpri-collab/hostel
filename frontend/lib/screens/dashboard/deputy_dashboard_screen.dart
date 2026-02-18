import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/app_state.dart';

class DeputyDashboardScreen extends StatefulWidget {
  const DeputyDashboardScreen({super.key});

  @override
  State<DeputyDashboardScreen> createState() => _DeputyDashboardScreenState();
}

class _DeputyDashboardScreenState extends State<DeputyDashboardScreen> {
  final _password = TextEditingController(text: 'Password@123');
  final _leaveId = TextEditingController();
  final _note = TextEditingController();
  String selectedRole = 'DEPUTY_WARDEN';
  String selectedAction = 'APPROVE';
  String message = '';
  List<dynamic> leaves = [];
  List<dynamic> logs = [];

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
      appBar: AppBar(title: const Text('Authority Dashboard')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Authority Login', style: TextStyle(fontWeight: FontWeight.bold)),
          DropdownButton<String>(
            value: selectedRole,
            items: const [
              DropdownMenuItem(value: 'DEPUTY_WARDEN', child: Text('Deputy Warden')),
              DropdownMenuItem(value: 'PRINCIPAL', child: Text('Principal')),
            ],
            onChanged: (v) => setState(() => selectedRole = v ?? 'DEPUTY_WARDEN'),
          ),
          TextField(controller: _password, decoration: const InputDecoration(labelText: 'Password')),
          ElevatedButton(
            onPressed: () => _run(() async {
              final resp = await app.api.post('/api/auth/staff/login', {
                'role': selectedRole,
                'password': _password.text,
              });
              app.setToken(selectedRole, resp['token'].toString());
              setState(() => message = '${resp['role']} login successful');
            }),
            child: const Text('Login'),
          ),
          const Divider(height: 24),
          ElevatedButton(
            onPressed: app.authorityToken == null
                ? null
                : () => _run(() async {
                    final resp = await app.api.get('/api/authority/leaves', token: app.authorityToken) as List<dynamic>;
                    setState(() => leaves = resp);
                  }),
            child: const Text('Fetch Leave Requests'),
          ),
          Row(
            children: [
              Expanded(child: TextField(controller: _leaveId, decoration: const InputDecoration(labelText: 'Leave Request ID'))),
              const SizedBox(width: 8),
              DropdownButton<String>(
                value: selectedAction,
                items: const [
                  DropdownMenuItem(value: 'APPROVE', child: Text('Approve')),
                  DropdownMenuItem(value: 'REJECT', child: Text('Reject')),
                ],
                onChanged: (v) => setState(() => selectedAction = v ?? 'APPROVE'),
              ),
            ],
          ),
          TextField(controller: _note, decoration: const InputDecoration(labelText: 'Note')),
          ElevatedButton(
            onPressed: app.authorityToken == null
                ? null
                : () => _run(() async {
                    final path = selectedRole == 'PRINCIPAL' ? '/api/authority/principal/decision' : '/api/authority/deputy/decision';
                    final resp = await app.api.post(path, {
                      'leaveRequestId': int.parse(_leaveId.text),
                      'action': selectedAction,
                      'note': _note.text,
                    }, token: app.authorityToken);
                    setState(() => message = resp['message'].toString());
                  }),
            child: const Text('Submit Decision'),
          ),
          ElevatedButton(
            onPressed: app.authorityToken == null
                ? null
                : () => _run(() async {
                    final resp = await app.api.get('/api/authority/gate-logs', token: app.authorityToken) as List<dynamic>;
                    setState(() => logs = resp);
                  }),
            child: const Text('Fetch Gate Logs'),
          ),
          if (message.isNotEmpty) Padding(padding: const EdgeInsets.symmetric(vertical: 8), child: Text(message, style: const TextStyle(color: Colors.blue))),
          const SizedBox(height: 8),
          const Text('Leave Requests', style: TextStyle(fontWeight: FontWeight.bold)),
          for (final row in leaves)
            Card(
              child: ListTile(
                title: Text('#${row['id']} ${row['name']} (${row['college_id']})'),
                subtitle: Text('${row['from_date']} to ${row['to_date']}\n${row['status']}\n${row['reason']}'),
              ),
            ),
          const SizedBox(height: 8),
          const Text('Recent Gate Logs', style: TextStyle(fontWeight: FontWeight.bold)),
          for (final log in logs.take(10))
            ListTile(
              dense: true,
              title: Text('${log['action']} - ${log['result']}'),
              subtitle: Text('${log['reason'] ?? ''} (${log['created_at']})'),
            ),
        ],
      ),
    );
  }
}

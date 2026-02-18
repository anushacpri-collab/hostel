import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/app_state.dart';
import 'student_qr_screen.dart';

class StudentRegisterScreen extends StatefulWidget {
  const StudentRegisterScreen({super.key});

  @override
  State<StudentRegisterScreen> createState() => _StudentRegisterScreenState();
}

class _StudentRegisterScreenState extends State<StudentRegisterScreen> {
  final _collegeId = TextEditingController();
  final _name = TextEditingController();
  final _dept = TextEditingController();
  final _parentPhone = TextEditingController();
  final _password = TextEditingController();
  final _reason = TextEditingController();
  final _from = TextEditingController();
  final _to = TextEditingController();

  String message = '';
  List<dynamic> leaves = [];
  String? qrToken;

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
      appBar: AppBar(title: const Text('Student Portal')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('1) Register (Account stays locked until parent OTP verification)', style: TextStyle(fontWeight: FontWeight.bold)),
          TextField(controller: _collegeId, decoration: const InputDecoration(labelText: 'College ID')),
          TextField(controller: _name, decoration: const InputDecoration(labelText: 'Name')),
          TextField(controller: _dept, decoration: const InputDecoration(labelText: 'Department')),
          TextField(controller: _parentPhone, decoration: const InputDecoration(labelText: 'Parent Phone Number')),
          TextField(controller: _password, decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
          const SizedBox(height: 8),
          ElevatedButton(
            onPressed: () => _run(() async {
              final resp = await app.api.post('/api/auth/student/register', {
                'collegeId': _collegeId.text.trim(),
                'name': _name.text.trim(),
                'department': _dept.text.trim(),
                'parentPhone': _parentPhone.text.trim(),
                'password': _password.text,
              });
              setState(() => message = resp['message'].toString());
            }),
            child: const Text('Register Student'),
          ),
          const Divider(height: 28),
          const Text('2) Login after parent verification', style: TextStyle(fontWeight: FontWeight.bold)),
          ElevatedButton(
            onPressed: () => _run(() async {
              final resp = await app.api.post('/api/auth/student/login', {
                'collegeId': _collegeId.text.trim(),
                'password': _password.text,
              });
              app.setToken('STUDENT', resp['token'].toString());
              setState(() => message = 'Student login successful');
            }),
            child: const Text('Student Login'),
          ),
          const Divider(height: 28),
          const Text('3) Complete profile & apply leave', style: TextStyle(fontWeight: FontWeight.bold)),
          ElevatedButton(
            onPressed: app.studentToken == null
                ? null
                : () => _run(() async {
                    final resp = await app.api.post('/api/student/profile/complete', {}, token: app.studentToken);
                    setState(() => message = resp['message'].toString());
                  }),
            child: const Text('Complete Profile'),
          ),
          TextField(controller: _from, decoration: const InputDecoration(labelText: 'From Date (YYYY-MM-DD)')),
          TextField(controller: _to, decoration: const InputDecoration(labelText: 'To Date (YYYY-MM-DD)')),
          TextField(controller: _reason, decoration: const InputDecoration(labelText: 'Reason')),
          ElevatedButton(
            onPressed: app.studentToken == null
                ? null
                : () => _run(() async {
                    final resp = await app.api.post('/api/student/leave/apply', {
                      'fromDate': _from.text,
                      'toDate': _to.text,
                      'reason': _reason.text,
                    }, token: app.studentToken);
                    setState(() => message = 'Leave submitted: #${resp['id']} ${resp['status']}');
                  }),
            child: const Text('Apply Leave'),
          ),
          ElevatedButton(
            onPressed: app.studentToken == null
                ? null
                : () => _run(() async {
                    final resp = await app.api.get('/api/student/leave', token: app.studentToken) as List<dynamic>;
                    setState(() => leaves = resp);
                  }),
            child: const Text('View My Leave Status'),
          ),
          ElevatedButton(
            onPressed: app.studentToken == null
                ? null
                : () => _run(() async {
                    final resp = await app.api.get('/api/student/qr', token: app.studentToken);
                    final token = resp['qr_token'].toString();
                    setState(() => qrToken = token);
                    if (!context.mounted) return;
                    Navigator.push(context, MaterialPageRoute(builder: (_) => StudentQrScreen(qrToken: token)));
                  }),
            child: const Text('View QR Pass'),
          ),
          if (message.isNotEmpty) Padding(padding: const EdgeInsets.symmetric(vertical: 8), child: Text(message, style: const TextStyle(color: Colors.blue))),
          for (final leave in leaves)
            Card(
              child: ListTile(
                title: Text('Leave #${leave['id']} - ${leave['status']}'),
                subtitle: Text('${leave['from_date']} to ${leave['to_date']}\n${leave['reason']}'),
              ),
            ),
          if (qrToken != null) Text('Latest token: $qrToken'),
        ],
      ),
    );
  }
}

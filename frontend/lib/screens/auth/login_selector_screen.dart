import 'package:flutter/material.dart';
import '../student/student_register_screen.dart';
import '../parent/parent_login_screen.dart';
import '../watchman/watchman_scan_screen.dart';
import '../dashboard/deputy_dashboard_screen.dart';

class LoginSelectorScreen extends StatelessWidget {
  const LoginSelectorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hostel Entry Authorization')),
      body: Center(
        child: Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            ElevatedButton(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const StudentRegisterScreen())),
              child: const Text('Student'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ParentLoginScreen())),
              child: const Text('Parent'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DeputyDashboardScreen())),
              child: const Text('Deputy Warden/Principal'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WatchmanScanScreen())),
              child: const Text('Watchman Scanner'),
            ),
          ],
        ),
      ),
    );
  }
}

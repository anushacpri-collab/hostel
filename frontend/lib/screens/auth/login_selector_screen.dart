import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/app_state.dart';
import '../../l10n/strings.dart';
import '../student/student_register_screen.dart';
import '../parent/parent_login_screen.dart';
import '../watchman/watchman_scan_screen.dart';
import '../dashboard/deputy_dashboard_screen.dart';

class LoginSelectorScreen extends StatelessWidget {
  const LoginSelectorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final lang = app.languageCode;

    return Scaffold(
      appBar: AppBar(title: Text(L10n.t(lang, 'title'))),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 720),
          child: ListView(
            shrinkWrap: true,
            padding: const EdgeInsets.all(16),
            children: [
              TextField(
                decoration: const InputDecoration(labelText: 'Backend Base URL', hintText: 'http://localhost:5000'),
                controller: TextEditingController(text: app.baseUrl),
                onSubmitted: app.setBaseUrl,
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Text('${L10n.t(lang, 'language')}: '),
                  ChoiceChip(label: const Text('English'), selected: lang == 'en', onSelected: (_) => app.setLanguage('en')),
                  const SizedBox(width: 8),
                  ChoiceChip(label: const Text('தமிழ்'), selected: lang == 'ta', onSelected: (_) => app.setLanguage('ta')),
                ],
              ),
              const SizedBox(height: 20),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  ElevatedButton(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const StudentRegisterScreen())),
                    child: Text(L10n.t(lang, 'student')),
                  ),
                  ElevatedButton(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ParentLoginScreen())),
                    child: Text(L10n.t(lang, 'parent')),
                  ),
                  ElevatedButton(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DeputyDashboardScreen())),
                    child: Text(L10n.t(lang, 'authority')),
                  ),
                  ElevatedButton(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WatchmanScanScreen())),
                    child: Text(L10n.t(lang, 'watchman')),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

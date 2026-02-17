import 'package:flutter/material.dart';

class DeputyDashboardScreen extends StatelessWidget {
  const DeputyDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Authority Dashboard (Web + Mobile)')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: DataTable(columns: const [
          DataColumn(label: Text('Req ID')),
          DataColumn(label: Text('Student')),
          DataColumn(label: Text('Dates')),
          DataColumn(label: Text('Status')),
        ], rows: const [
          DataRow(cells: [
            DataCell(Text('#101')),
            DataCell(Text('Aarthi')),
            DataCell(Text('2026-10-01 to 2026-10-04')),
            DataCell(Text('PENDING_DW')),
          ])
        ]),
      ),
    );
  }
}

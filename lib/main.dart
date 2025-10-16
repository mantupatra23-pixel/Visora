// main.dart
// Visora — Single-file Flutter frontend (DartPad compatible for web).
// Paste into https://dartpad.dev (Flutter) and Run.
// Change API_BASE if needed.

import 'dart:async';
import 'dart:convert';
import 'dart:html' as html; // for web fetch in DartPad
import 'package:flutter/material.dart';

void main() {
runApp(VisoraApp());
}

// --------- Config ----------
const String API_BASE = 'https://visora.onrender.com'; // change if needed
const int DEFAULT_POLL_MS = 3000;

// --------- Utility fetch (using dart:html HttpRequest to keep DartPad-friendly) ----------
Future<_FetchResult> fetchJson(String url,
{String method = 'GET', Map<String, dynamic>? jsonBody}) async {
try {
final String payload = jsonBody == null ? '' : jsonEncode(jsonBody);
final request = await html.HttpRequest.request(
url,
method: method,
requestHeaders: {
'Content-Type': 'application/json',
},
sendData: payload.isEmpty ? null : payload,
);
final status = request.status ?? 0;
final text = request.responseText ?? '';
if (status >= 200 && status < 300) {
if (text.isEmpty) return _FetchResult(success: true, text: '');
return _FetchResult(success: true, text: text, json: jsonDecode(text));
} else {
return _FetchResult(success: false, text: text, error: 'HTTP $status');
}
} catch (e) {
return _FetchResult(success: false, text: '', error: e.toString());
}
}

class _FetchResult {
final bool success;
final String text;
final dynamic json;
final String? error;
_FetchResult({required this.success, this.text = '', this.json, this.error});
}

// --------- App ----------
class VisoraApp extends StatelessWidget {
@override
Widget build(BuildContext context) {
return MaterialApp(
title: 'Visora — Create Video',
theme: ThemeData.dark().copyWith(
scaffoldBackgroundColor: Color(0xFF0F1115),
primaryColor: Colors.blueAccent,
accentColor: Colors.blueAccent,
),
home: MainShell(),
debugShowCheckedModeBanner: false,
);
}
}

// --------- Main Shell with Bottom Navigation ----------
class MainShell extends StatefulWidget {
@override
_MainShellState createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
int _idx = 1;
String apiBase = API_BASE;
int pollMs = DEFAULT_POLL_MS;

// Shared app state
String statusLine = 'idle';
Timer? pollTimer;

// init
@override
void initState() {
super.initState();
}

void navigateTo(int i) {
setState(() => _idx = i);
}

@override
Widget build(BuildContext context) {
final pages = [
DashboardPage(setStatus: _setStatus),
CreatePage(setStatus: _setStatus, apiBaseGetter: () => apiBase, pollMsGetter: () => pollMs),
GalleryPage(setStatus: _setStatus, apiBaseGetter: () => apiBase),
TemplatesPage(setStatus: _setStatus, apiBaseGetter: () => apiBase),
ProfilePage(setStatus: setStatus, apiBaseGetter: () => apiBase, onProfileSaved: () => _setStatus('Profile saved')),
];
return Scaffold(
appBar: AppBar(
title: Text('Visora AI — Create Video'),
centerTitle: true,
elevation: 2,
),
body: pages[_idx],
bottomNavigationBar: BottomNavigationBar(
currentIndex: _idx,
onTap: navigateTo,
selectedItemColor: Colors.blueAccent,
items: [
BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Dashboard'),
BottomNavigationBarItem(icon: Icon(Icons.create), label: 'Create'),
BottomNavigationBarItem(icon: Icon(Icons.video_library), label: 'Gallery'),
BottomNavigationBarItem(icon: Icon(Icons.palette), label: 'Templates'),
BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
],
),
);
}

void _setStatus(String s) {
setState(() {
statusLine = s;
});
// Small Snackbar
ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(s)));
}
}

// --------- Dashboard Page ----------
class DashboardPage extends StatefulWidget {
final void Function(String) setStatus;
DashboardPage({required this.setStatus});
@override
_DashboardPageState createState() => _DashboardPageState();
}
class _DashboardPageState extends State<DashboardPage> {
String info = 'Fetching status...';
@override
void initState() {
super.initState();
_fetchStatus();
}
Future<void> _fetchStatus() async {
widget.setStatus('Checking backend...');
final res = await fetchJson('$API_BASE/health');
if (!res.success) {
setState(() => info = 'Backend not reachable: ${res.error}');
widget.setStatus('Backend unreachable');
return;
}
setState(() => info = jsonEncode(res.json));
widget.setStatus('Backend OK');
}
@override
Widget build(BuildContext context) {
return Padding(
padding: EdgeInsets.all(16),
child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
Text('Dashboard', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
SizedBox(height: 12),
Card(child: Padding(padding: EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
Text('Backend status', style: TextStyle(fontWeight: FontWeight.bold)),
SizedBox(height: 8),
Text(info),
SizedBox(height: 8),
ElevatedButton.icon(onPressed: _fetchStatus, icon: Icon(Icons.refresh), label: Text('Refresh'))
]))),
]),
);
}
}

// --------- Create Page ----------
class CreatePage extends StatefulWidget {
final void Function(String) setStatus;
final String Function() apiBaseGetter;
final int Function() pollMsGetter;
CreatePage({required this.setStatus, required this.apiBaseGetter, required this.pollMsGetter});
@override
_CreatePageState createState() => _CreatePageState();
}
class _CreatePageState extends State<CreatePage> {
final TextEditingController _scriptCtl = TextEditingController();
String _voice = 'Female Voice 1';
String _template = 'Modern';
String _music = 'Soft';
bool _isGenerating = false;
bool _isCreating = false;
String _status = 'idle';
Timer? _pollTimer;

@override
void initState() {
super.initState();
}

Future<void> _generateScript() async {
final topic = _scriptCtl.text.trim();
if (topic.isEmpty) {
_setStatus('Please enter prompt/topic first');
return;
}
setState(() {
_isGenerating = true;
_status = 'Generating script...';
});
widget.setStatus(_status);
// Try /generate first, fallback to /assistant
final base = widget.apiBaseGetter();
final endpoints = ['$base/generate', '$base/assistant'];
dynamic finalJson;
for (final ep in endpoints) {
final res = await fetchJson(ep, method: 'POST', jsonBody: {'query': topic, 'tone': 'helpful'});
if (res.success) {
finalJson = res.json;
break;
}
}
if (finalJson == null) {
_setStatus('Network error while generating script');
setState(() => _isGenerating = false);
return;
}
// Heuristic: look for reply fields
String scriptText = '';
if (finalJson is Map && finalJson.containsKey('reply')) scriptText = finalJson['reply'];
else if (finalJson is Map && finalJson.containsKey('script')) scriptText = finalJson['script'];
else if (finalJson is String) scriptText = finalJson;
else scriptText = jsonEncode(finalJson);

_scriptCtl.text = scriptText;  
_setStatus('Script generated');  
setState(() => _isGenerating = false);

}

Future<void> _createVideo() async {
final script = _scriptCtl.text.trim();
if (script.isEmpty) {
_setStatus('Please provide script first');
return;
}
setState(() {
_isCreating = true;
_status = 'Creating video...';
});
widget.setStatus(_status);
final base = widget.apiBaseGetter();
final payload = {
'title': 'Video ${DateTime.now().toIso8601String()}',
'script': script,
'template': _template,
'quality': 'HD',
'length_type': 'short',
'lang': 'hi',
'background_music': _music,
// For simplicity we don't upload images here — backend should handle default template.
};
final res = await fetchJson('$base/generate_video', method: 'POST', jsonBody: payload);
if (!res.success) {
_setStatus('Create video failed: ${res.error ?? res.text}');
setState(() => _isCreating = false);
return;
}
final body = res.json ?? {};
final jobId = body['job_id'] ?? body['jobId'] ?? body['jobId'];
if (jobId == null) {
_setStatus('Create video: no job_id returned');
setState(() => _isCreating = false);
return;
}
_setStatus('Enqueued job: $jobId — polling status...');
// Poll job status
await _pollJob(jobId.toString());
setState(() => _isCreating = false);
}

Future<void> _pollJob(String jobId) async {
final base = widget.apiBaseGetter();
int failCount = 0;
int waitMs = widget.pollMsGetter();
while (true) {
final res = await fetchJson('$base/job_status?job_id=$jobId');
if (!res.success) {
failCount++;
if (failCount > 6) {
_setStatus('Polling failed: ${res.error ?? 'no response'}');
return;
}
await Future.delayed(Duration(milliseconds: waitMs));
continue;
}
final j = res.json ?? {};
final status = j['status'] ?? 'unknown';
if (status == 'processing' || status == 'queued') {
_setStatus('Job $jobId status: $status');
await Future.delayed(Duration(milliseconds: waitMs));
continue;
} else if (status == 'done') {
final out = j['output_file'] ?? j['file'] ?? j['file_path'] ?? j['output'];
if (out != null) {
final url = _makeUploadedUrl(out.toString());
_setStatus('Job done. Download: $url');
// show download dialog
_showResultDialog(url);
return;
} else {
_setStatus('Job done but no file info.');
return;
}
} else {
final err = j['error'] ?? 'status=$status';
_setStatus('Job failed: $err');
return;
}
}
}

String _makeUploadedUrl(String relPath) {
// If backend returns a relative path like "outputs/my.mp4" or "audio/x.mp3"
if (relPath.startsWith('http')) return relPath;
// typical route: /outputs/<filename>
final fname = relPath.split('/').last;
return '${widget.apiBaseGetter()}/outputs/$fname';
}

void _showResultDialog(String url) {
showDialog(context: context, builder: (c) {
return AlertDialog(
title: Text('Video Ready'),
content: SelectableText(url),
actions: [
ElevatedButton(onPressed: () {
html.window.open(url, '_blank');
}, child: Text('Open')),
TextButton(onPressed: () { Navigator.pop(c); }, child: Text('Close')),
],
);
});
}

void _setStatus(String s) {
setState(() {
_status = s;
});
widget.setStatus(s);
}

@override
Widget build(BuildContext context) {
return SingleChildScrollView(
padding: EdgeInsets.all(14),
child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
Text('Script / Prompt', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
SizedBox(height: 8),
TextField(
controller: _scriptCtl,
maxLines: 8,
decoration: InputDecoration(
filled: true, fillColor: Color(0xFF111217),
border: OutlineInputBorder(),
hintText: 'Type prompt or script here...',
),
),
SizedBox(height: 12),
Row(children: [
Expanded(child: _buildDropdown('Voice', _voice, ['Female Voice 1','Male Voice 1','Child','Narrator'], (v) => setState(()=> _voice=v))),
SizedBox(width: 8),
Expanded(child: _buildDropdown('Template', _template, ['Modern','Promo','Explainer','Cinematic'], (v)=> setState(()=> _template=v))),
]),
SizedBox(height: 8),
_buildDropdown('Background Music', _music, ['Soft','Energetic','None'], (v)=> setState(()=> _music = v)),
SizedBox(height: 12),
Row(children: [
ElevatedButton.icon(
icon: _isGenerating ? SizedBox(width:16,height:16,child:CircularProgressIndicator(strokeWidth:2)) : Icon(Icons.auto_awesome),
label: Text('✨ Generate Script (AI)'),
onPressed: _isGenerating ? null : _generateScript,
style: ElevatedButton.styleFrom(primary: Colors.green),
),
SizedBox(width: 12),
ElevatedButton.icon(
icon: _isCreating ? SizedBox(width:16,height:16,child:CircularProgressIndicator(strokeWidth:2)) : Icon(Icons.rocket_launch),
label: Text('🚀 Create Video'),
onPressed: _isCreating ? null : _createVideo,
style: ElevatedButton.styleFrom(primary: Colors.blue),
),
]),
SizedBox(height: 12),
Text('Status: $_status', style: TextStyle(color: Colors.white70)),
SizedBox(height: 8),
Card(child: Padding(padding: EdgeInsets.all(10), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
Text('Tips', style: TextStyle(fontWeight: FontWeight.bold)),
SizedBox(height: 6),
Text('• If network error appears, check backend is up and CORS allows this origin.'),
Text('• For file download, check /outputs route on backend.'),
])))
]),
);
}

Widget _buildDropdown(String label, String value, List<String> options, ValueChanged<String> onChanged) {
return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
Text(label, style: TextStyle(fontWeight: FontWeight.bold)),
SizedBox(height: 6),
DropdownButtonFormField<String>(
value: value,
items: options.map((o) => DropdownMenuItem(child: Text(o), value: o)).toList(),
onChanged: (v) { if (v!=null) onChanged(v); },
decoration: InputDecoration(filled:true, fillColor: Color(0xFF0E1113), border: OutlineInputBorder()),
)
]);
}
}

// --------- Gallery Page ----------
class GalleryPage extends StatefulWidget {
final void Function(String) setStatus;
final String Function() apiBaseGetter;
GalleryPage({required this.setStatus, required this.apiBaseGetter});
@override
_GalleryPageState createState() => _GalleryPageState();
}
class _GalleryPageState extends State<GalleryPage> {
List<dynamic> items = [];
bool loading = true;
@override
void initState() {
super.initState();
_load();
}
Future<void> _load() async {
setState(()=> loading = true);
widget.setStatus('Loading gallery...');
final res = await fetchJson('${widget.apiBaseGetter()}/gallery');
if (!res.success) {
widget.setStatus('Gallery load failed: ${res.error}');
setState(()=> loading=false);
return;
}
setState(()=> items = (res.json ?? []), loading=false);
widget.setStatus('Gallery loaded');
}
@override
Widget build(BuildContext context) {
if (loading) return Center(child: CircularProgressIndicator());
if (items.isEmpty) return Center(child: Text('No videos yet'));
return ListView.builder(
padding: EdgeInsets.all(12),
itemCount: items.length,
itemBuilder: (c, i) {
final v = items[i];
final title = v['title'] ?? 'Video ${v['id'] ?? i}';
final status = v['status'] ?? 'unknown';
final file = v['file'] ?? v['file_path'] ?? v['output'] ?? '';
return Card(
child: ListTile(
title: Text(title),
subtitle: Text('Status: $status'),
trailing: file != '' ? IconButton(icon: Icon(Icons.open_in_new), onPressed: () {
final url = file.startsWith('http') ? file : '${widget.apiBaseGetter()}/outputs/${file.split('/').last}';
html.window.open(url, '_blank');
}) : null,
),
);
},
);
}
}

// --------- Templates Page ----------
class TemplatesPage extends StatefulWidget {
final void Function(String) setStatus;
final String Function() apiBaseGetter;
TemplatesPage({required this.setStatus, required this.apiBaseGetter});
@override
_TemplatesPageState createState() => _TemplatesPageState();
}
class _TemplatesPageState extends State<TemplatesPage> {
List<dynamic> templates = [];
bool loading = true;
@override
void initState() {
super.initState();
_load();
}
Future<void> _load() async {
widget.setStatus('Loading templates...');
final res = await fetchJson('${widget.apiBaseGetter()}/templates');
if (!res.success) {
widget.setStatus('Templates load failed');
setState(()=> loading=false);
return;
}
setState(()=> templates = (res.json ?? []), loading=false);
widget.setStatus('Templates loaded');
}
@override
Widget build(BuildContext context) {
if (loading) return Center(child: CircularProgressIndicator());
return ListView.builder(
padding: EdgeInsets.all(12),
itemCount: templates.length,
itemBuilder: (c, i) {
final t = templates[i];
return Card(child: ListTile(title: Text(t['name'] ?? 'Template'), subtitle: Text(t['category'] ?? ''),));
},
);
}
}

// --------- Profile Page ----------
class ProfilePage extends StatefulWidget {
final void Function(String) setStatus;
final String Function() apiBaseGetter;
final void Function(Map<String,dynamic>) onProfileSaved;
ProfilePage({required this.setStatus, required this.apiBaseGetter, required this.onProfileSaved});
@override
_ProfilePageState createState() => _ProfilePageState();
}
class _ProfilePageState extends State<ProfilePage> {
final TextEditingController _email = TextEditingController(text: 'demo@visora.com');
final TextEditingController _name = TextEditingController();
final TextEditingController _country = TextEditingController();

bool saving = false;

Future<void> _save() async {
final e = _email.text.trim();
if (e.isEmpty) { widget.setStatus('Email required'); return; }
setState(()=> saving=true);
final payload = {'email': e, 'name': _name.text.trim(), 'country': _country.text.trim()};
final res = await fetchJson('${widget.apiBaseGetter()}/profile', method: 'POST', jsonBody: payload);
if (!res.success) {
widget.setStatus('Profile save failed: ${res.error ?? res.text}');
setState(()=> saving=false);
return;
}
widget.setStatus('Profile saved');
widget.onProfileSaved(payload);
setState(()=> saving=false);
}

@override
Widget build(BuildContext context) {
return Padding(padding: EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
Text('Profile', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
SizedBox(height: 10),
TextField(controller: _email, decoration: InputDecoration(labelText:'Email', border: OutlineInputBorder())),
SizedBox(height: 8),
TextField(controller: _name, decoration: InputDecoration(labelText:'Name', border: OutlineInputBorder())),
SizedBox(height: 8),
TextField(controller: _country, decoration: InputDecoration(labelText:'Country', border: OutlineInputBorder())),
SizedBox(height: 10),
ElevatedButton.icon(onPressed: saving?null:_save, icon: Icon(Icons.save), label: Text('Save Profile')),
]));
}
}


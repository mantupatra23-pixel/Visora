import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'package:path/path.dart' as p;

void main() {
  runApp(VisoraApp());
}

const String BASE_URL = "https://visora-backend.onrender.com"; // backend ka URL

class VisoraApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Visora',
      theme: ThemeData.dark().copyWith(
        primaryColor: Colors.amber,
        colorScheme: ColorScheme.dark(
          primary: Colors.amber,
          secondary: Colors.amber,
        ),
        scaffoldBackgroundColor: Color(0xFF14151B),
      ),
      home: MainShell(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class MainShell extends StatefulWidget {
  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _index = 0;
  final _pages = [
    DashboardPage(),
    CreateVideoPage(),
    GalleryPage(),
    ProfilePage(),
    AssistantPage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Visora')),
      body: _pages[_index],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        selectedItemColor: Colors.amber,
        unselectedItemColor: Colors.grey[400],
        onTap: (i) => setState(() => _index = i),
        items: [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Dashboard"),
          BottomNavigationBarItem(icon: Icon(Icons.add), label: "Create"),
          BottomNavigationBarItem(icon: Icon(Icons.video_library), label: "Gallery"),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: "Profile"),
          BottomNavigationBarItem(icon: Icon(Icons.help), label: "Assistant"),
        ],
      ),
    );
  }
}

/* ---------------- Dashboard ---------------- */
class DashboardPage extends StatefulWidget {
  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  List videos = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    fetchGallery();
  }

  Future<void> fetchGallery() async {
    try {
      final res = await http.get(Uri.parse('$BASE_URL/gallery?user_email=demo@visora.com'));
      if (res.statusCode == 200) {
        setState(() {
          videos = json.decode(res.body);
          loading = false;
        });
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return loading
        ? Center(child: CircularProgressIndicator())
        : ListView(
            padding: EdgeInsets.all(14),
            children: [
              Text("Recent Videos", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ...videos.map((v) => ListTile(
                    title: Text(v['title'] ?? 'Untitled'),
                    subtitle: Text(v['status'] ?? 'ready'),
                  ))
            ],
          );
  }
}

/* ---------------- Create Video ---------------- */
class CreateVideoPage extends StatefulWidget {
  @override
  State<CreateVideoPage> createState() => _CreateVideoPageState();
}

class _CreateVideoPageState extends State<CreateVideoPage> {
  final _titleCtrl = TextEditingController();
  final _scriptCtrl = TextEditingController();
  List<XFile> images = [];
  File? voice;
  File? bgMusic;
  bool rendering = false;
  final picker = ImagePicker();

  Future pickImages() async {
    final picked = await picker.pickMultiImage(imageQuality: 85);
    if (picked != null) setState(() => images = picked);
  }

  Future pickVoice() async {
    var res = await FilePicker.platform.pickFiles(type: FileType.audio);
    if (res != null && res.files.single.path != null) {
      setState(() => voice = File(res.files.single.path!));
    }
  }

  Future pickBgMusic() async {
    var res = await FilePicker.platform.pickFiles(type: FileType.audio);
    if (res != null && res.files.single.path != null) {
      setState(() => bgMusic = File(res.files.single.path!));
    }
  }

  Future<void> submitRender() async {
    if (rendering) return;
    setState(() => rendering = true);
    try {
      var uri = Uri.parse('$BASE_URL/generate_video');
      var req = http.MultipartRequest('POST', uri);
      req.fields['user_email'] = 'demo@visora.com';
      req.fields['title'] = _titleCtrl.text;
      req.fields['script'] = _scriptCtrl.text;
      for (var f in images) {
        var bytes = await f.readAsBytes();
        req.files.add(http.MultipartFile.fromBytes('characters', bytes, filename: p.basename(f.path)));
      }
      if (voice != null) req.files.add(await http.MultipartFile.fromPath('character_voice_files', voice!.path));
      if (bgMusic != null) req.files.add(await http.MultipartFile.fromPath('bg_music_file', bgMusic!.path));
      final streamed = await req.send();
      final resp = await http.Response.fromStream(streamed);
      if (resp.statusCode == 200) {
        final data = json.decode(resp.body);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Video Ready: ${data['download_url']}")));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Render Failed")));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
    } finally {
      setState(() => rendering = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(14),
      child: Column(children: [
        TextField(controller: _titleCtrl, decoration: InputDecoration(labelText: 'Title')),
        TextField(controller: _scriptCtrl, maxLines: 5, decoration: InputDecoration(labelText: 'Script')),
        ElevatedButton(onPressed: pickImages, child: Text("Upload Characters")),
        ElevatedButton(onPressed: pickVoice, child: Text("Upload Voice")),
        ElevatedButton(onPressed: pickBgMusic, child: Text("Upload BG Music")),
        SizedBox(height: 14),
        ElevatedButton(
          onPressed: rendering ? null : submitRender,
          child: Text(rendering ? "Rendering..." : "Render"),
        )
      ]),
    );
  }
}

/* ---------------- Gallery ---------------- */
class GalleryPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(child: Text("Gallery Page"));
  }
}

/* ---------------- Profile ---------------- */
class ProfilePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(child: Text("Profile Page"));
  }
}

/* ---------------- Assistant ---------------- */
class AssistantPage extends StatefulWidget {
  @override
  State<AssistantPage> createState() => _AssistantPageState();
}

class _AssistantPageState extends State<AssistantPage> {
  final _qCtrl = TextEditingController();
  String reply = "";

  Future askAssistant() async {
    try {
      var res = await http.post(Uri.parse('$BASE_URL/assistant'),
          headers: {"Content-Type": "application/json"},
          body: json.encode({"query": _qCtrl.text, "tone": "friendly"}));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        setState(() => reply = data['reply']);
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(14),
      child: Column(children: [
        TextField(controller: _qCtrl, decoration: InputDecoration(labelText: "Ask Assistant")),
        SizedBox(height: 10),
        ElevatedButton(onPressed: askAssistant, child: Text("Ask")),
        SizedBox(height: 20),
        Text(reply, style: TextStyle(fontSize: 16))
      ]),
    );
  }
}

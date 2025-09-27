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

const String BASE_URL = "https://aivideoapp-kzp6.onrender.com"; // अपने backend URL डालो

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
    AssetsPage(),
    ProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Visora'),
        actions: [
          IconButton(
            icon: Icon(Icons.help_outline),
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AssistantPage())),
          ),
        ],
      ),
      drawer: AppDrawer(),
      body: _pages[_index],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        selectedItemColor: Colors.amber,
        unselectedItemColor: Colors.grey[400],
        onTap: (i) => setState(() => _index = i),
        items: [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Home"),
          BottomNavigationBarItem(icon: Icon(Icons.movie_creation), label: "Create"),
          BottomNavigationBarItem(icon: Icon(Icons.video_library), label: "Gallery"),
          BottomNavigationBarItem(icon: Icon(Icons.collections), label: "Assets"),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: "Profile"),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        label: Text("Create"),
        icon: Icon(Icons.add),
        backgroundColor: Colors.amber,
        onPressed: () => setState(() => _index = 1),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }
}

/* ---------------- Drawer ---------------- */
class AppDrawer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Container(
        color: Color(0xFF18191F),
        child: ListView(
          children: [
            DrawerHeader(
              decoration: BoxDecoration(color: Color(0xFF1F2026)),
              child: Row(
                children: [
                  CircleAvatar(radius: 28, backgroundColor: Colors.grey[800], child: Icon(Icons.person)),
                  SizedBox(width: 12),
                  Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
                    Text('Demo User', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    Text('demo@visora.com', style: TextStyle(fontSize: 12, color: Colors.grey[400])),
                  ])
                ],
              ),
            ),
            ListTile(leading: Icon(Icons.dashboard), title: Text('Dashboard'), onTap: () => Navigator.pop(context)),
            ListTile(leading: Icon(Icons.settings), title: Text('Settings'), onTap: () {}),
            ListTile(leading: Icon(Icons.logout), title: Text('Sign out'), onTap: () {}),
          ],
        ),
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
    setState(() => loading = true);
    try {
      final res = await http.get(Uri.parse('$BASE_URL/gallery?user_email=demo@visora.com'));
      if (res.statusCode == 200) {
        setState(() { videos = json.decode(res.body); loading = false; });
      } else {
        setState(() { videos = []; loading = false; });
      }
    } catch (e) {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.all(14),
      children: [
        Container(
          padding: EdgeInsets.all(12),
          decoration: BoxDecoration(color: Color(0xFF21222A), borderRadius: BorderRadius.circular(8)),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Credits', style: TextStyle(color: Colors.grey[400])),
              SizedBox(height: 6),
              Text('5', style: TextStyle(color: Colors.greenAccent, fontSize: 20, fontWeight: FontWeight.bold)),
            ]),
            ElevatedButton(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => PaymentsPage())),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.amber),
              child: Text('Upgrade'),
            )
          ]),
        ),
        SizedBox(height: 16),
        Text('Quick Actions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(child: QuickCard(icon: Icons.image, label: 'Image Gen', onTap: () {})),
            SizedBox(width: 10),
            Expanded(child: QuickCard(icon: Icons.movie, label: 'Video Gen', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CreateVideoPage())))),
          ],
        ),
        SizedBox(height: 18),
        Text('Recent Videos', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        SizedBox(height: 8),
        loading ? Center(child: CircularProgressIndicator()) :
        videos.isEmpty ? Center(child: Text('No videos yet', style: TextStyle(color: Colors.grey))) :
        Column(children: videos.map((v) =>
          ListTile(
            title: Text(v['title'] ?? 'Untitled'),
            subtitle: Text(v['status'] ?? 'ready'),
            trailing: ElevatedButton(
              child: Text('Edit'),
              onPressed: () => Navigator.push(context, MaterialPageRoute(
                builder: (_) => EditVideoPage(videoId: v['id'], title: v['title'] ?? 'Untitled')
              )),
            ),
          )
        ).toList())
      ],
    );
  }
}

class QuickCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const QuickCard({required this.icon, required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 110,
        decoration: BoxDecoration(color: Color(0xFF222227), borderRadius: BorderRadius.circular(10)),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(icon, size: 34, color: Colors.amber),
          SizedBox(height: 8),
          Text(label, style: TextStyle(fontWeight: FontWeight.bold))
        ]),
      ),
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
  String _template = 'Motivation';
  String _quality = 'HD';
  String _lang = 'hi';
  String _lengthType = 'short';
  List<XFile> images = [];
  List<PlatformFile> voiceFiles = [];
  File? bgMusic;
  bool rendering = false;
  final picker = ImagePicker();

  Future pickImages() async {
    final picked = await picker.pickMultiImage(imageQuality: 85);
    if (picked != null) setState(() => images = picked);
  }

  Future pickVoiceFiles() async {
    FilePickerResult? res = await FilePicker.platform.pickFiles(
      type: FileType.custom, allowedExtensions: ['mp3','wav','m4a','ogg'], allowMultiple: true);
    if (res != null) setState(() => voiceFiles = res.files);
  }

  Future pickBgMusic() async {
    FilePickerResult? res = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['mp3','wav','m4a','ogg']);
    if (res != null && res.files.single.path != null) setState(() => bgMusic = File(res.files.single.path!));
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
      req.fields['template'] = _template;
      req.fields['quality'] = _quality;
      req.fields['lang'] = _lang;
      req.fields['length_type'] = _lengthType;

      for (var f in images) {
        var bytes = await f.readAsBytes();
        req.files.add(http.MultipartFile.fromBytes('characters', bytes, filename: p.basename(f.path)));
      }
      for (var vf in voiceFiles) {
        if (vf.path != null) req.files.add(await http.MultipartFile.fromPath('character_voice_files', vf.path!));
      }
      if (bgMusic != null) req.files.add(await http.MultipartFile.fromPath('bg_music_file', bgMusic!.path));

      final streamed = await req.send().timeout(Duration(minutes: 10));
      final resp = await http.Response.fromStream(streamed);
      if (resp.statusCode == 200) {
        final data = json.decode(resp.body);
        final download = data['download_url'];
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Render finished.')));
        if (download != null) {
          showDialog(context: context, builder: (_) => AlertDialog(title: Text('Done'), content: SelectableText(download), actions: [TextButton(onPressed: ()=>Navigator.pop(context), child: Text('OK'))]));
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Render failed ${resp.statusCode}')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      setState(() => rendering = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(14),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        TextField(controller: _titleCtrl, decoration: InputDecoration(labelText: 'Title', filled: true, fillColor: Color(0xFF111214))),
        SizedBox(height: 8),
        TextField(controller: _scriptCtrl, maxLines: 6, decoration: InputDecoration(labelText: 'Script', filled: true, fillColor: Color(0xFF111214))),
        SizedBox(height: 8),
        Row(children: [
          Expanded(child: DropdownButtonFormField<String>(value: _template, items: ['Motivation','Promo','Explainer','Cinematic'].map((e)=>DropdownMenuItem(child: Text(e),value:e)).toList(), onChanged: (v)=>setState(()=>_template=v!), decoration: InputDecoration(labelText: 'Template', filled: true, fillColor: Color(0xFF111214)))),
          SizedBox(width: 10),
          Expanded(child: DropdownButtonFormField<String>(value: _quality, items: ['HD','FULLHD','4K'].map((e)=>DropdownMenuItem(child: Text(e),value:e)).toList(), onChanged: (v)=>setState(()=>_quality=v!), decoration: InputDecoration(labelText: 'Quality', filled: true, fillColor: Color(0xFF111214)))),
        ]),
        SizedBox(height: 8),
        Row(children: [
          Expanded(child: DropdownButtonFormField<String>(value: _lang, items: ['hi','en','bn','ta'].map((e)=>DropdownMenuItem(child: Text(e),value:e)).toList(), onChanged: (v)=>setState(()=>_lang=v!), decoration: InputDecoration(labelText: 'Language', filled: true, fillColor: Color(0xFF111214)))),
          SizedBox(width: 10),
          Expanded(child: DropdownButtonFormField<String>(value: _lengthType, items: ['short','long'].map((e)=>DropdownMenuItem(child: Text(e),value:e)).toList(), onChanged: (v)=>setState(()=>_lengthType=v!), decoration: InputDecoration(labelText: 'Video Length', filled: true, fillColor: Color(0xFF111214)))),
        ]),
        SizedBox(height: 8),
        ElevatedButton(onPressed: pickImages, child: Text('Upload Characters')),
        Text('Selected: ${images.length} images'),
        SizedBox(height: 8),
        Row(children: [
          ElevatedButton(onPressed: pickVoiceFiles, child: Text('Upload Voices')),
          SizedBox(width: 10),
          ElevatedButton(onPressed: pickBgMusic, child: Text('Upload BG Music')),
        ]),
        Text('Voices: ${voiceFiles.length}  BG: ${bgMusic != null ? p.basename(bgMusic!.path) : "none"}'),
        SizedBox(height: 14),
        Center(child: ElevatedButton.icon(onPressed: rendering?null:submitRender, icon: Icon(Icons.movie), label: Text(rendering ? 'Rendering...' : 'Render'), style: ElevatedButton.styleFrom(backgroundColor: Colors.amber))),
      ]),
    );
  }
}

/* ---------------- Gallery ---------------- */
class GalleryPage extends StatefulWidget {
  @override
  State<GalleryPage> createState() => _GalleryPageState();
}

class _GalleryPageState extends State<GalleryPage> {
  List items = [];
  bool loading = false;

  Future fetchGallery() async {
    setState(() => loading = true);
    try {
      final res = await http.get(Uri.parse('$BASE_URL/gallery?user_email=demo@visora.com'));
      if (res.statusCode == 200) {
        setState(() => items = json.decode(res.body));
      }
    } catch (_) {}
    setState(() => loading = false);
  }

  @override
  void initState() {
    super.initState();
    fetchGallery();
  }

  @override
  Widget build(BuildContext context) {
    return loading ? Center(child: CircularProgressIndicator()) :
    ListView(padding: EdgeInsets.all(14), children: [
      if (items.isEmpty) Center(child: Text('No videos yet', style: TextStyle(color: Colors.grey))),
      ...items.map((v) => ListTile(
        title: Text(v['title'] ?? 'Untitled'),
        subtitle: Text(v['status'] ?? ''),
        trailing: ElevatedButton(
          child: Text('Edit'),
          onPressed: () => Navigator.push(context, MaterialPageRoute(
            builder: (_) => EditVideoPage(videoId: v['id'], title: v['title'] ?? 'Video')
          )),
        ),
      ))
    ]);
  }
}

/* ---------------- Edit Video Page ---------------- */
class EditVideoPage extends StatefulWidget {
  final int videoId;
  final String title;
  EditVideoPage({required this.videoId, required this.title});
  @override
  State<EditVideoPage> createState() => _EditVideoPageState();
}

class _EditVideoPageState extends State<EditVideoPage> {
  File? bgMusic;
  List<PlatformFile> replaceVoiceFiles = [];
  bool cinematic = false;
  bool subtitles = false;
  bool rendering = false;

  Future pickBg() async {
    var res = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['mp3','wav','m4a','ogg']);
    if (res != null && res.files.single.path != null) setState(() => bgMusic = File(res.files.single.path!));
  }

  Future pickVoices() async {
    var res = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['mp3','wav'], allowMultiple: true);
    if (res != null) setState(() => replaceVoiceFiles = res.files);
  }

  Future submitEdit() async {
    setState(() => rendering = true);
    try {
      var uri = Uri.parse('$BASE_URL/video/edit/${widget.videoId}');
      var req = http.MultipartRequest('POST', uri);
      req.fields['apply_cinematic'] = cinematic ? 'true' : 'false';
      req.fields['apply_subtitles'] = subtitles ? 'true' : 'false';
      if (bgMusic != null) req.files.add(await http.MultipartFile.fromPath('change_bg_music_file', bgMusic!.path));
      for (var vf in replaceVoiceFiles) {
        if (vf.path != null) req.files.add(await http.MultipartFile.fromPath('replace_voice_files', vf.path!));
      }
      final streamed = await req.send();
      final resp = await

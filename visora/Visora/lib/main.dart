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

const String BASE_URL = "https://aivideoapp-kzp6.onrender.com"; // Backend URL

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

/* ---------------- Main Shell ---------------- */
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
            onPressed: () => Navigator.push(
                context, MaterialPageRoute(builder: (_) => AssistantPage())),
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
                  CircleAvatar(
                      radius: 28,
                      backgroundColor: Colors.grey[800],
                      child: Icon(Icons.person)),
                  SizedBox(width: 12),
                  Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Demo User',
                            style: TextStyle(
                                fontSize: 16, fontWeight: FontWeight.bold)),
                        Text('demo@visora.com',
                            style: TextStyle(
                                fontSize: 12, color: Colors.grey[400])),
                      ])
                ],
              ),
            ),
            ListTile(
                leading: Icon(Icons.dashboard),
                title: Text('Dashboard'),
                onTap: () => Navigator.pop(context)),
            ListTile(
                leading: Icon(Icons.settings),
                title: Text('Settings'),
                onTap: () {}),
            ListTile(
                leading: Icon(Icons.logout),
                title: Text('Sign out'),
                onTap: () {}),
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
      final res =
          await http.get(Uri.parse('$BASE_URL/gallery?user_email=demo@visora.com'));
      if (res.statusCode == 200) {
        setState(() {
          videos = json.decode(res.body);
          loading = false;
        });
      } else {
        setState(() {
          videos = [];
          loading = false;
        });
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
          decoration: BoxDecoration(
              color: Color(0xFF21222A), borderRadius: BorderRadius.circular(8)),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Credits', style: TextStyle(color: Colors.grey[400])),
              SizedBox(height: 6),
              Text('5',
                  style: TextStyle(
                      color: Colors.greenAccent,
                      fontSize: 20,
                      fontWeight: FontWeight.bold)),
            ]),
            ElevatedButton(
              onPressed: () => Navigator.push(
                  context, MaterialPageRoute(builder: () => PaymentsPage())),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.amber),
              child: Text('Upgrade'),
            )
          ]),
        ),
        SizedBox(height: 16),
        Text('Quick Actions',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(
                child: QuickCard(
                    icon: Icons.image, label: 'Image Gen', onTap: () {})),
            SizedBox(width: 10),
            Expanded(
                child: QuickCard(
                    icon: Icons.movie,
                    label: 'Video Gen',
                    onTap: () => Navigator.push(context,
                        MaterialPageRoute(builder: () => CreateVideoPage())))),
          ],
        ),
        SizedBox(height: 18),
        Text('Recent Videos',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        SizedBox(height: 8),
        loading
            ? Center(child: CircularProgressIndicator())
            : videos.isEmpty
                ? Center(child: Text('No videos yet', style: TextStyle(color: Colors.grey)))
                : Column(
                    children: videos
                        .map((v) => ListTile(
                              title: Text(v['title'] ?? 'Untitled'),
                              subtitle: Text(v['status'] ?? 'ready'),
                              trailing: ElevatedButton(
                                child: Text('Edit'),
                                onPressed: () => Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                        builder: (_) => EditVideoPage(
                                            videoId: v['id'],
                                            title: v['title'] ?? 'Untitled'))),
                              ),
                            ))
                        .toList())
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
        decoration: BoxDecoration(
            color: Color(0xFF222227), borderRadius: BorderRadius.circular(10)),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(icon, size: 34, color: Colors.amber),
          SizedBox(height: 8),
          Text(label, style: TextStyle(fontWeight: FontWeight.bold))
        ]),
      ),
    );
  }
}

/* ---------------- Create Video Page ---------------- */
class CreateVideoPage extends StatefulWidget {
  @override
  State<CreateVideoPage> createState() => _CreateVideoPageState();
}

class _CreateVideoPageState extends State<CreateVideoPage> {
  final _titleCtrl = TextEditingController();
  final _scriptCtrl = TextEditingController();
  bool rendering = false;

  Future<void> submitRender() async {
    if (rendering) return;
    setState(() => rendering = true);
    try {
      var uri = Uri.parse('$BASE_URL/generate_video');
      var req = http.MultipartRequest('POST', uri);
      req.fields['user_email'] = 'demo@visora.com';
      req.fields['title'] = _titleCtrl.text;
      req.fields['script'] = _scriptCtrl.text;

      final streamed = await req.send();
      final resp = await http.Response.fromStream(streamed);
      if (resp.statusCode == 200) {
        final data = json.decode(resp.body);
        final download = data['download_url'];
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Render finished.')));
        if (download != null) {
          showDialog(
              context: context,
              builder: (_) => AlertDialog(
                    title: Text('Done'),
                    content: SelectableText(download),
                    actions: [
                      TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: Text('OK'))
                    ],
                  ));
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Render failed ${resp.statusCode}')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      setState(() => rendering = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
        padding: EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(controller: _titleCtrl, decoration: InputDecoration(labelText: 'Title')),
            SizedBox(height: 8),
            TextField(controller: _scriptCtrl, maxLines: 6, decoration: InputDecoration(labelText: 'Script')),
            SizedBox(height: 14),
            Center(
                child: ElevatedButton.icon(
                    onPressed: rendering ? null : submitRender,
                    icon: Icon(Icons.movie),
                    label: Text(rendering ? 'Rendering...' : 'Render'),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.amber))),
          ],
        ));
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
      final res =
          await http.get(Uri.parse('$BASE_URL/gallery?user_email=demo@visora.com'));
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
    return loading
        ? Center(child: CircularProgressIndicator())
        : ListView(padding: EdgeInsets.all(14), children: [
            if (items.isEmpty)
              Center(child: Text('No videos yet', style: TextStyle(color: Colors.grey))),
            ...items.map((v) => ListTile(
                  title: Text(v['title'] ?? 'Untitled'),
                  subtitle: Text(v['status'] ?? ''),
                  trailing: ElevatedButton(
                    child: Text('Edit'),
                    onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) =>
                                EditVideoPage(videoId: v['id'], title: v['title'] ?? 'Video'))),
                  ),
                ))
          ]);
  }
}

/* ---------------- Edit Video Page ---------------- */
class EditVideoPage extends StatelessWidget {
  final int videoId;
  final String title;
  EditVideoPage({required this.videoId, required this.title});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Edit Video")),
      body: Center(child: Text("Edit features for $title")),
    );
  }
}

/* ---------------- Other Pages ---------------- */
class AssetsPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(child: Text("Assets Page"));
  }
}

class ProfilePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(child: Text("Profile Page"));
  }
}

class PaymentsPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Payments")),
      body: Center(child: Text("Payments Page")),
    );
  }
}

class AssistantPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Assistant")),
      body: Center(child: Text("Assistant Page")),
    );
  }
}

import 'package:flutter/material.dart';

void main() {
  runApp(VisoraApp());
}

class VisoraApp extends StatefulWidget {
  @override
  _VisoraAppState createState() => _VisoraAppState();
}

class _VisoraAppState extends State<VisoraApp> {
  bool darkMode = false;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Visora - AI Video Maker",
      theme: darkMode ? ThemeData.dark() : ThemeData(primarySwatch: Colors.deepPurple),
      home: LoginScreen(toggleTheme: () {
        setState(() {
          darkMode = !darkMode;
        });
      }),
    );
  }
}

// ---------------- LOGIN ----------------
class LoginScreen extends StatelessWidget {
  final VoidCallback toggleTheme;
  LoginScreen({required this.toggleTheme});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Visora Login")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.movie_filter, size: 80, color: Colors.deepPurple),
            SizedBox(height: 20),
            Text("Login to Visora", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (_) => DashboardScreen(toggleTheme: toggleTheme)),
                );
              },
              child: Text("Continue with Google/OTP (Demo)"),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------- DASHBOARD ----------------
class DashboardScreen extends StatelessWidget {
  final VoidCallback toggleTheme;
  DashboardScreen({required this.toggleTheme});

  final List<Map<String, dynamic>> features = [
    {"title": "Create Script", "icon": Icons.edit, "screen": ScriptInputScreen()},
    {"title": "Generate Video", "icon": Icons.movie_creation, "screen": GenerateVideoScreen()},
    {"title": "My Videos", "icon": Icons.video_library, "screen": MyVideosScreen()},
    {"title": "Credits & Plans", "icon": Icons.monetization_on, "screen": PlansScreen()},
    {"title": "Voice Assistant", "icon": Icons.mic, "screen": VoiceAssistantScreen()},
    {"title": "Settings", "icon": Icons.settings, "screen": SettingsScreen()},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Visora Dashboard")),
      body: ListView.builder(
        itemCount: features.length,
        itemBuilder: (context, index) {
          return Card(
            margin: EdgeInsets.all(10),
            child: ListTile(
              leading: Icon(features[index]["icon"], color: Colors.deepPurple),
              title: Text(features[index]["title"]),
              trailing: Icon(Icons.arrow_forward_ios),
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => features[index]["screen"]));
              },
            ),
          );
        },
      ),
    );
  }
}

// ---------------- SCRIPT INPUT ----------------
class ScriptInputScreen extends StatelessWidget {
  final TextEditingController _controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Write Your Script")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _controller,
              maxLines: 8,
              decoration: InputDecoration(border: OutlineInputBorder(), hintText: "Paste your script here..."),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => GenerateVideoScreen()));
              },
              child: Text("Generate Video"),
            )
          ],
        ),
      ),
    );
  }
}

// ---------------- VIDEO GENERATE ----------------
class GenerateVideoScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Video Generation")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.movie, size: 100, color: Colors.deepPurple),
            SizedBox(height: 20),
            Text("Generating Video with AI...", style: TextStyle(fontSize: 18)),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => MyVideosScreen()));
              },
              child: Text("Go to My Videos"),
            )
          ],
        ),
      ),
    );
  }
}

// ---------------- MY VIDEOS ----------------
class MyVideosScreen extends StatelessWidget {
  final List<String> videos = ["video1.mp4", "video2.mp4", "video3.mp4"]; // demo list

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("My Videos")),
      body: ListView.builder(
        itemCount: videos.length,
        itemBuilder: (context, index) {
          return Card(
            child: ListTile(
              leading: Icon(Icons.play_circle_fill, color: Colors.deepPurple),
              title: Text(videos[index]),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(onPressed: () {}, icon: Icon(Icons.download, color: Colors.green)),
                  IconButton(onPressed: () {}, icon: Icon(Icons.delete, color: Colors.red)),
                ],
              ),
              onTap: () {},
            ),
          );
        },
      ),
    );
  }
}

// ---------------- PLANS ----------------
class PlansScreen extends StatelessWidget {
  final List<Map<String, String>> plans = [
    {"name": "Free Plan", "desc": "2 free videos"},
    {"name": "Pro Plan", "desc": "₹299/month - Unlimited HD Videos"},
    {"name": "Ultra Plan", "desc": "₹999/month - Ultra HD + Fast Processing"},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Credits & Plans")),
      body: ListView.builder(
        itemCount: plans.length,
        itemBuilder: (context, index) {
          return Card(
            margin: EdgeInsets.all(10),
            child: ListTile(
              leading: Icon(Icons.star, color: Colors.amber),
              title: Text(plans[index]["name"]!),
              subtitle: Text(plans[index]["desc"]!),
              trailing: ElevatedButton(onPressed: () {}, child: Text("Buy")),
            ),
          );
        },
      ),
    );
  }
}

// ---------------- VOICE ASSISTANT ----------------
class VoiceAssistantScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Voice Assistant")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.mic, size: 100, color: Colors.deepPurple),
            SizedBox(height: 20),
            Text("Say your script and we will convert it to video!", style: TextStyle(fontSize: 18), textAlign: TextAlign.center),
            SizedBox(height: 20),
            ElevatedButton(onPressed: () {}, child: Text("Start Listening")),
          ],
        ),
      ),
    );
  }
}

// ---------------- SETTINGS ----------------
class SettingsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Settings")),
      body: ListView(
        children: [
          ListTile(leading: Icon(Icons.person), title: Text("Profile")),
          ListTile(leading: Icon(Icons.logout), title: Text("Logout")),
          ListTile(leading: Icon(Icons.brightness_6), title: Text("Toggle Dark Mode (App-level)")),
        ],
      ),
    );
  }
}

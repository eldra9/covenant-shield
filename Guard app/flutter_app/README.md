# AegisGuard (Covenant Shield) - Flutter Edition

This is the complete, high-fidelity Flutter implementation of the **AegisGuard / Covenant Shield** Security Guard Attendance and Operations Management platform.

It faithfully matches the exact design system, tokens, mathematical Guilloche seals, 240° shift progress arcs, hold-to-seal interactions, and full operational modules (Check-In, Check-Out, Shift Roster, Incident Reporting, Leave Requests, Peer Shift Swaps, Attendance History, and Dispatch Alerts).

---

## 🎨 Visual Design System

- **Brand Tokens**:
  - Emerald (`#003C35`): Authoritative primary daytime tone
  - Gold (`#C9A04A`): Cryptographic seal and highlight accents
  - Forest (`#092824`): Deep night watch background
  - Mist (`#F4F6F4`): High-sunlight readable ivory page
  - Ink (`#24332F`): High-contrast typography
- **Flat Layout Style**:
  - `elevation: 0` across all cards, app bars, and dialogs
  - Crisp `1.0px` structural outline borders
  - Mathematical Rosette Guilloche seals generated in code via `CustomPainter`

---

## 🚀 Running the Flutter App

Ensure you have the Flutter SDK installed on your workstation.

```bash
cd flutter_app
flutter pub get
flutter run
```

### Platforms Supported
- **Android**: `flutter run -d android`
- **iOS**: `flutter run -d ios`
- **Web**: `flutter run -d chrome`
- **macOS / Windows / Linux**: `flutter run -d <os>`

---

## 📂 Architecture Overview

```
flutter_app/
├── pubspec.yaml
├── README.md
└── lib/
    ├── main.dart                  # App entry point & main navigator
    ├── models/
    │   └── models.dart            # User, Shift, AttendanceRecord, Report, Leave, Swap models
    ├── services/
    │   └── guard_state.dart       # State management (ChangeNotifier) for guard operations
    ├── theme/
    │   └── app_theme.dart         # Covenant Shield light & dark themes, color tokens
    ├── widgets/
    │   ├── guilloche_seal.dart    # Mathematical rosette custom painter
    │   ├── shift_arc.dart         # 240-degree duty progress arc with pulsing dot
    │   ├── seal_button.dart       # 168dp interactive hold-to-seal button
    │   ├── status_badge.dart      # Flat status indicator pills
    │   └── network_banner.dart    # Offline simulation & pending sync queue
    └── screens/
        ├── login_screen.dart
        ├── dashboard_screen.dart
        ├── check_in_screen.dart
        ├── check_out_screen.dart
        ├── shifts_screen.dart
        ├── attendance_history_screen.dart
        ├── reports_screen.dart
        ├── leave_screen.dart
        ├── shift_swap_screen.dart
        ├── notifications_screen.dart
        └── profile_screen.dart
```

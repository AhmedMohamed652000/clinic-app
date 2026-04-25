import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AppRouter {
  static final router = GoRouter(
    initialLocation: '/login',
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const Scaffold(
          body: Center(child: Text('Login Screen (Placeholder)')),
        ),
      ),
      GoRoute(
        path: '/patient/register',
        builder: (context, state) => const Scaffold(
          body: Center(child: Text('Patient Register Screen (Placeholder)')),
        ),
      ),
      GoRoute(
        path: '/doctor/register',
        builder: (context, state) => const Scaffold(
          body: Center(child: Text('Doctor Register Screen (Placeholder)')),
        ),
      ),
      GoRoute(
        path: '/clinic/register',
        builder: (context, state) => const Scaffold(
          body: Center(child: Text('Clinic Register Screen (Placeholder)')),
        ),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const Scaffold(
          body: Center(child: Text('Home Screen (Placeholder)')),
        ),
      ),
    ],
    // Redirect logic for auth will be added in Phase 3
  );
}

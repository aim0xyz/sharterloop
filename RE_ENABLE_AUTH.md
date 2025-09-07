# Re-enabling Authentication System

## Overview
The authentication system has been temporarily disabled for testing purposes. All authentication code has been preserved and commented out with clear markers.

## Steps to Re-enable Authentication

### 1. Restore Authentication Initialization
In `script.js`, find the `initGame()` function and:
- Uncomment the authentication code block (lines ~228-246)
- Comment out the bypass code (lines ~248-251)

### 2. Restore Authentication Checks
In the following functions, uncomment the authentication checks:
- `startGame()` - lines ~1170-1173
- `showShop()` - lines ~1191-1195
- `showLeaderboard()` - lines ~1208-1212
- `showDailyCheckIn()` - lines ~1225-1229
- `showReferral()` - lines ~1242-1246
- `showProfileScreen()` - lines ~1259-1263

### 3. Restore Firebase Functions
- `saveUserData()` - uncomment lines ~989-1006
- `updateLeaderboard()` - uncomment the Firebase code block (lines ~1065-1119)

### 4. Test Authentication
After re-enabling:
1. Test sign up functionality
2. Test sign in functionality
3. Test Google authentication
4. Verify user data persistence
5. Test all authenticated features

## Search Terms for Quick Location
Search for these terms to quickly find the commented sections:
- "TEMPORARILY DISABLED AUTHENTICATION"
- "TODO: Re-enable authentication"
- "FOR TESTING:"

## Notes
- All original authentication code is preserved
- Mock data is used for leaderboard during testing
- User data is logged to console instead of saved to Firebase during testing
- The test user object is: `{ uid: 'test-user', displayName: 'Test Player', email: 'test@example.com' }`

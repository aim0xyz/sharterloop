    // Firebase configuration - Replace with your own Firebase project config
    // You can find this in your Firebase project settings -> Project settings -> General -> Your apps
    const firebaseConfig = {
    apiKey: "AIzaSyAqHDZHG626E_U9swnvAbobNxbznWYjByo",
    authDomain: "shatterloop-a7640.firebaseapp.com",
    projectId: "shatterloop-a7640",
    storageBucket: "shatterloop-a7640.firebasestorage.app",
    messagingSenderId: "568996461864",
    appId: "1:568996461864:web:92fc542d589667491f241d",
    measurementId: "G-HRZ1HHS754"
  };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    let currentUser = null;

    // Game constants
    const GAME_WIDTH = 400;
    const GAME_HEIGHT = 800;
    const PLAYER_SIZE = 30;
    
    // Mobile haptic feedback
    function triggerHapticFeedback(type = 'light') {
      if ('vibrate' in navigator) {
        switch(type) {
          case 'light':
            navigator.vibrate(10);
            break;
          case 'medium':
            navigator.vibrate(50);
            break;
          case 'heavy':
            navigator.vibrate([50, 30, 50]);
            break;
          case 'success':
            navigator.vibrate([50, 30, 50, 30, 50]);
            break;
        }
      }
    }
    
    // Game state
    let gameState = {
      score: 0,
      totalShards: 0,
      mode: 'safe',
      player: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, targetX: GAME_WIDTH / 2, targetY: GAME_HEIGHT - 100, size: PLAYER_SIZE, isAlive: true, trail: [] },
      touchPosition: null,
      obstacles: [],
      shardsCollectible: [],
      particles: [],
      timeBend: { maxUses: 1, currentUses: 1, cooldown: 0, maxCooldown: 5000, duration: 2000, active: false },
      upgrades: { timeBendLevel: 1, shardMagnetLevel: 0, phantomPhaseLevel: 0 },
      relics: { phantomPhase: false, phantomPhaseUsed: 0 },
      gameActive: false,
      currentRunShards: 0,
      timeBonusShards: 0,
      timeRewardsGiven: 0,
      path: { lastX: GAME_WIDTH / 2, nextY: GAME_HEIGHT - 200 },
      highScore: 0,
      totalShardsCollected: 0,
      speedMultiplier: 1.0,
      gameStartTime: 0,
      dailyCheckIn: {
        lastCheckIn: null,
        streak: 0,
        week: 1,
        maxStreak: 0
      },
      referral: {
        code: '',
        friendCode: '',
        referred: 0,
        shardsEarned: 0
      }
    };
    
    // DOM Elements
		
		// Loading screen functions
const loadingScreen = document.getElementById('loadingScreen');
const loadingText = document.getElementById('loadingText');

const loadingMessages = [
  "Initializing quantum matrix...",
  "Calibrating time-bend mechanics...",
  "Loading fractal dimensions...",
  "Synchronizing with the void...",
  "Preparing aether drifter...",
  "Establishing neural link..."
];

let messageIndex = 0;

function showLoadingScreen(message) {
  loadingScreen.style.display = 'flex';
  loadingScreen.style.opacity = '1';
  if (message) {
    loadingText.textContent = message;
  } else {
    // Cycle through messages
    messageIndex = 0;
    loadingText.textContent = loadingMessages[messageIndex];
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      loadingText.textContent = loadingMessages[messageIndex];
    }, 2000);
    loadingScreen.messageInterval = messageInterval;
  }
}

function hideLoadingScreen() {
  if (loadingScreen.messageInterval) {
    clearInterval(loadingScreen.messageInterval);
  }
  loadingScreen.style.opacity = '0';
  setTimeout(() => {
    loadingScreen.style.display = 'none';
  }, 500);
}
		
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreValue = document.getElementById('scoreValue');
    const shardValue = document.getElementById('shardValue');
    const timeBendBtn = document.getElementById('timeBendBtn');
    const timeBendCounter = document.getElementById('timeBendCounter');
    const timeBendCooldown = document.getElementById('timeBendCooldown');
    const timeBendEffect = document.getElementById('timeBendEffect');
    const phantomRelicBtn = document.getElementById('phantomRelicBtn');
    const phantomRelicCounter = document.getElementById('phantomRelicCounter');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const finalScore = document.getElementById('finalScore');
    const shardsCollected = document.getElementById('shardsCollected');
    const timeBonusShards = document.getElementById('timeBonusShards');
    const timeSurvived = document.getElementById('timeSurvived');
    const totalShardsEl = document.getElementById('totalShards');
    
    const menuScreen = document.getElementById('menuScreen');
    const safeModeBtn = document.getElementById('safeModeBtn');
    const fractureModeBtn = document.getElementById('fractureModeBtn');
    const shopBtn = document.getElementById('shopBtn');
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    const dailyCheckInBtn = document.getElementById('dailyCheckInBtn');
    const referralBtn = document.getElementById('referralBtn');
    const userBadge = document.getElementById('userBadge');
    const retryBtn = document.getElementById('retryBtn');
    const fractureRetryBtn = document.getElementById('fractureRetryBtn');
    const menuBtn = document.getElementById('menuBtn');
    
    const shopScreen = document.getElementById('shopScreen');
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    
    const leaderboardScreen = document.getElementById('leaderboardScreen');
    const leaderboardList = document.getElementById('leaderboardList');
    const leaderboardTabs = document.querySelectorAll('.leaderboard-tab');
    const leaderboardBackBtn = document.getElementById('leaderboardBackBtn');
    
    const dailyCheckInScreen = document.getElementById('dailyCheckInScreen');
    const calendarDays = document.getElementById('calendarDays');
    const streakCount = document.getElementById('streakCount');
    const claimDailyBtn = document.getElementById('claimDailyBtn');
    const dailyCheckInBackBtn = document.getElementById('dailyCheckInBackBtn');
    
    const referralScreen = document.getElementById('referralScreen');
    const myReferralCode = document.getElementById('myReferralCode');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const friendsReferred = document.getElementById('friendsReferred');
    const referralShards = document.getElementById('referralShards');
    const friendReferralSection = document.getElementById('friendReferralSection');
    const friendCodeInput = document.getElementById('friendCodeInput');
    const submitCodeBtn = document.getElementById('submitCodeBtn');
    const referralStatus = document.getElementById('referralStatus');
    const referralBackBtn = document.getElementById('referralBackBtn');
    
    const profileScreen = document.getElementById('profileScreen');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const usernameInput = document.getElementById('usernameInput');
    const saveUsernameBtn = document.getElementById('saveUsernameBtn');
    const usernameError = document.getElementById('usernameError');
    const usernameSuccess = document.getElementById('usernameSuccess');
    const currentPasswordInput = document.getElementById('currentPasswordInput');
    const newPasswordInput = document.getElementById('newPasswordInput');
    const confirmNewPasswordInput = document.getElementById('confirmNewPasswordInput');
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    const passwordError = document.getElementById('passwordError');
    const passwordSuccess = document.getElementById('passwordSuccess');
    const profileLogoutBtn = document.getElementById('profileLogoutBtn');
    const profileBackBtn = document.getElementById('profileBackBtn');
    
    const authScreen = document.getElementById('authScreen');
    const authTitle = document.getElementById('authTitle');
    const signInContainer = document.getElementById('signInContainer');
    const signUpContainer = document.getElementById('signUpContainer');
    
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const signInBtn = document.getElementById('signInBtn');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const switchToSignUpBtn = document.getElementById('switchToSignUpBtn');
    
    const usernameSignUpInput = document.getElementById('usernameSignUpInput');
    const signUpEmailInput = document.getElementById('signUpEmailInput');
    const signUpPasswordInput = document.getElementById('signUpPasswordInput');
    const confirmPasswordInput = document.getElementById('confirmPasswordInput');
    const signUpBtn = document.getElementById('signUpBtn');
    const switchToSignInBtn = document.getElementById('switchToSignInBtn');
    
    const authError = document.getElementById('authError');
    const signUpError = document.getElementById('signUpError');
    
    const timeBendCostEl = document.getElementById('timeBendCost');
    const timeBendLevelEl = document.getElementById('timeBendLevel');
    const magnetCostEl = document.getElementById('magnetCost');
    const magnetLevelEl = document.getElementById('magnetLevel');
    const phantomCostEl = document.getElementById('phantomCost');
    const phantomLevelEl = document.getElementById('phantomLevel');
    const upgradeTimeBendBtn = document.getElementById('upgradeTimeBendBtn');
    const upgradeMagnetBtn = document.getElementById('upgradeMagnetBtn');
    const buyRelicBtn = document.getElementById('buyRelicBtn');
    
function initGame() {
  // Show loading screen immediately
  showLoadingScreen();
  
  // Set up dynamic canvas sizing
  setupCanvasSize();
  window.addEventListener('resize', setupCanvasSize);
  
  // Monitor network status
  window.addEventListener('online', () => {
    console.log('Network connection restored');
  });

  window.addEventListener('offline', () => {
    console.log('Network connection lost');
    if (gameState.gameActive) {
      endGame();
    }
    alert('Network connection lost. Please check your internet connection.');
  });
			
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
  setupEventListeners();
  setupAuthListeners();
  gameLoop();
  
  showAuthScreen();
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      loadUserData();
      updateUserProfile();
      if (authScreen.style.display === 'flex') {
        showMenu();
      }
      hideLoadingScreen(); // Hide when authenticated
    } else {
      currentUser = null;
      hideLoadingScreen(); // Hide when showing auth screen
      if (authScreen.style.display !== 'flex') {
        showAuthScreen();
      }
    }
    updateAuthUI();
  });
}
    
function setupCanvasSize() {
  const container = document.getElementById('gameContainer');
  const canvas = document.getElementById('gameCanvas');
  
  if (!canvas || !container) return;
  
  // Mobile-first approach - use full screen
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // For mobile, use full screen
  let width = screenWidth;
  let height = screenHeight;
  
  // For larger screens, maintain aspect ratio
  if (screenWidth > 768) {
    const maxWidth = 500;
    const maxHeight = 800;
    width = Math.min(screenWidth, maxWidth);
    height = Math.min(screenHeight, maxHeight);
    
    const aspectRatio = maxWidth / maxHeight;
    if (width / height > aspectRatio) {
      width = height * aspectRatio;
    } else {
      height = width / aspectRatio;
    }
  }
  
  // Update canvas actual size (internal resolution)
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
  
  // Update canvas display size (CSS size)
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  
  // Center the canvas
  canvas.style.position = 'absolute';
  canvas.style.left = '50%';
  canvas.style.top = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';
}
		
function setupAuthListeners() {
  // Sign In
  signInBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    
    if (!email || !password) {
      showAuthError('Please enter both email and password');
      return;
    }
    
    showLoadingScreen('Signing in...');
    
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        hideLoadingScreen();
        authScreen.style.display = 'none';
        menuScreen.style.display = 'flex';
      })
      .catch(error => {
        hideLoadingScreen();
        showAuthError(error.message);
      });
  });
      
  // Google Sign In
  googleSignInBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    showLoadingScreen('Connecting to Google...');
    
    auth.signInWithPopup(provider)
      .then((result) => {
        // Check if this is a new user
        const isNewUser = result.additionalUserInfo.isNewUser;
        if (isNewUser) {
          // Generate username from email or name
          let username = '';
          if (result.user.displayName) {
            username = result.user.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
          } else if (result.user.email) {
            username = result.user.email.split('@')[0] + Math.floor(Math.random() * 1000);
          } else {
            username = 'user' + Math.floor(Math.random() * 10000);
          }
          
          // Generate referral code
          const referralCode = generateReferralCode();
          
          // Create user document
          createNewUserDocument(result.user.uid, {
            displayName: result.user.displayName || 'Anonymous',
            email: result.user.email,
            username: username,
            referralCode: referralCode,
            totalShards: 0,
            highScore: 0
          }).then(() => {
            hideLoadingScreen();
            authScreen.style.display = 'none';
            menuScreen.style.display = 'flex';
          }).catch(error => {
            hideLoadingScreen();
            showAuthError(error.message);
          });
        } else {
          hideLoadingScreen();
          authScreen.style.display = 'none';
          menuScreen.style.display = 'flex';
        }
      })
      .catch(error => {
        hideLoadingScreen();
        showAuthError(error.message);
      });
  });
      
  // Sign Up
  signUpBtn.addEventListener('click', () => {
    const username = usernameSignUpInput.value;
    const email = signUpEmailInput.value;
    const password = signUpPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (!username || !email || !password || !confirmPassword) {
      showSignUpError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      showSignUpError('Passwords do not match');
      return;
    }
				
    // Add password strength check
    if (password.length < 6) {
      showSignUpError('Password must be at least 6 characters long');
      return;
    }
    
    // Check if username is available
    checkUsernameAvailability(username)
      .then(isAvailable => {
        if (!isAvailable) {
          showSignUpError('Username is already taken');
          return;
        }
        
        // Create user
        auth.createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
            // Generate referral code
            const referralCode = generateReferralCode();
            
            // Create user document
            return createNewUserDocument(userCredential.user.uid, {
              displayName: username,
              email: email,
              username: username,
              referralCode: referralCode,
              totalShards: 0,
              highScore: 0
            }).then(() => {
              // Update display name
              return userCredential.user.updateProfile({
                displayName: username
              });
            });
          }).then(() => {
            authScreen.style.display = 'none';
            menuScreen.style.display = 'flex';
          })
          .catch(error => {
            showSignUpError(error.message);
          });
      })
      .catch(error => {
        showSignUpError('Error checking username: ' + error.message);
      });
  });
  
  // Logout
  profileLogoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
      profileScreen.style.display = 'none';
      showAuthScreen();
    }).catch((error) => {
      console.error('Logout error:', error);
    });
  });
  
  // Switch between sign in and sign up
  switchToSignUpBtn.addEventListener('click', () => {
    signInContainer.style.display = 'none';
    signUpContainer.style.display = 'block';
    authTitle.textContent = 'Sign Up';
  });
  
  switchToSignInBtn.addEventListener('click', () => {
    signUpContainer.style.display = 'none';
    signInContainer.style.display = 'block';
    authTitle.textContent = 'Sign In';
  });
  
  // User badge click
  userBadge.addEventListener('click', () => {
    showProfileScreen();
  });
  
  // Profile buttons
  saveUsernameBtn.addEventListener('click', updateUsername);
  savePasswordBtn.addEventListener('click', updatePassword);
  profileBackBtn.addEventListener('click', showMenu);
  
  // Referral buttons
  copyCodeBtn.addEventListener('click', copyReferralCode);
  submitCodeBtn.addEventListener('click', submitReferralCode);
  referralBackBtn.addEventListener('click', showMenu);
  
  // Daily check-in buttons
  claimDailyBtn.addEventListener('click', claimDailyReward);
  dailyCheckInBackBtn.addEventListener('click', showMenu);
}
    
function createNewUserDocument(uid, userData) {
  return db.collection('users').doc(uid).set({
    displayName: userData.displayName,
    email: userData.email,
    username: userData.username,
    referralCode: userData.referralCode, // Keep for backward compatibility
    totalShards: 0,
    totalShardsCollected: 0,
    highScore: 0,
    upgrades: {
      timeBendLevel: 1,
      shardMagnetLevel: 0,
      phantomPhaseLevel: 0
    },
    dailyCheckIn: {
      lastCheckIn: null,
      streak: 0,
      week: 1,
      maxStreak: 0
    },
    referral: {
      code: userData.referralCode,
      friendCode: '',
      referred: 0,
      shardsEarned: 0
    },
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}
    
function checkUsernameAvailability(username) {
  return db.collection('users')
    .where('username', '==', username)
    .get()
    .then(snapshot => {
      return snapshot.empty;
    });
}

function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Function to generate a unique referral code that doesn't already exist
async function generateUniqueReferralCode() {
  let attempts = 0;
  const maxAttempts = 10;
  
  try {
    while (attempts < maxAttempts) {
      const code = generateReferralCode();
      
      // Check if this code already exists in the database
      const existingUser = await db.collection('users')
        .where('referralCode', '==', code)
        .limit(1)
        .get();
      
      if (existingUser.empty) {
        // Also check the new referral.code field
        const existingUserNew = await db.collection('users')
          .where('referral.code', '==', code)
          .limit(1)
          .get();
        
        if (existingUserNew.empty) {
          return code; // Code is unique
        }
      }
      
      attempts++;
    }
    
    // If we can't find a unique code after max attempts, add timestamp to make it unique
    const baseCode = generateReferralCode();
    const timestamp = Date.now().toString(36).slice(-4);
    return baseCode.slice(0, 4) + timestamp;
  } catch (error) {
    console.error('Error checking referral code uniqueness:', error);
    // Fallback to timestamp-based unique code if database check fails
    const baseCode = generateReferralCode();
    const timestamp = Date.now().toString(36).slice(-4);
    return baseCode.slice(0, 4) + timestamp;
  }
}
    
function updateUsername() {
  const newUsername = usernameInput.value.trim();
  
  if (!newUsername) {
    showProfileError(usernameError, 'Username cannot be empty');
    return;
  }
  
  // Validate username length and characters
  if (newUsername.length < 3 || newUsername.length > 20) {
    showProfileError(usernameError, 'Username must be 3-20 characters long');
    return;
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
    showProfileError(usernameError, 'Username can only contain letters, numbers, and underscores');
    return;
  }
  
  // Check if username is available
  checkUsernameAvailability(newUsername)
    .then(isAvailable => {
      if (!isAvailable && newUsername !== currentUser.displayName) {
        showProfileError(usernameError, 'Username is already taken');
        return;
      }
      
      // Update username in Firestore
      db.collection('users').doc(currentUser.uid).update({
        username: newUsername,
        displayName: newUsername
      })
      .then(() => {
        // Update display name in Firebase Auth
        return currentUser.updateProfile({
          displayName: newUsername
        }).then(() => {
          updateUserProfile();
          showProfileSuccess(usernameSuccess, 'Username updated successfully');
          usernameInput.value = '';
        });
      })
      .catch(error => {
        showProfileError(usernameError, 'Error updating username: ' + error.message);
      });
    })
    .catch(error => {
      showProfileError(usernameError, 'Error checking username: ' + error.message);
    });
}
    
function updatePassword() {
  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmNewPassword = confirmNewPasswordInput.value;
  
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    showProfileError(passwordError, 'Please fill in all password fields');
    return;
  }
  
  if (newPassword !== confirmNewPassword) {
    showProfileError(passwordError, 'New passwords do not match');
    return;
  }
  
  // Reauthenticate user
  const credential = firebase.auth.EmailAuthProvider.credential(
    currentUser.email,
    currentPassword
  );
  
  currentUser.reauthenticateWithCredential(credential)
    .then(() => {
      // Update password
      return currentUser.updatePassword(newPassword)
        .then(() => {
          showProfileSuccess(passwordSuccess, 'Password updated successfully');
          currentPasswordInput.value = '';
          newPasswordInput.value = '';
          confirmNewPasswordInput.value = '';
        })
        .catch(error => {
          showProfileError(passwordError, 'Error updating password: ' + error.message);
        });
    })
    .catch(error => {
      showProfileError(passwordError, 'Current password is incorrect');
    });
}
    
function copyReferralCode() {
  const code = myReferralCode.textContent;
  navigator.clipboard.writeText(code)
    .then(() => {
      copyCodeBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyCodeBtn.textContent = 'Copy';
      }, 2000);
    })
    .catch(err => {
      console.error('Could not copy text: ', err);
    });
}
    
// [FIXED] Corrected the referral code submission logic
function submitReferralCode() {
    if (!currentUser) return;

    const code = friendCodeInput.value.trim().toUpperCase();

    if (!code) {
        updateReferralStatus('Please enter a referral code', 'error');
        return;
    }

    db.collection('users').doc(currentUser.uid).get()
    .then(doc => {
        if (!doc.exists) {
            throw new Error("Current user not found in database.");
        }
        const userData = doc.data();

        if (userData.referral && userData.referral.friendCode) {
            updateReferralStatus('You have already used a referral code', 'error');
            return Promise.reject();
        }

        if (userData.referral && code === userData.referral.code) {
            updateReferralStatus('You cannot use your own referral code', 'error');
            return Promise.reject();
        }

        // Find the referrer - check both fields for backward compatibility
        return db.collection('users')
            .where('referralCode', '==', code)
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    // Try the nested field
                    return db.collection('users')
                        .where('referral.code', '==', code)
                        .get();
                }
                return snapshot;
            });
    })
    .then(snapshot => {
        if (!snapshot) return;

        if (snapshot.empty) {
            updateReferralStatus('Invalid referral code', 'error');
            return Promise.reject();
        }

        const referrerDoc = snapshot.docs[0];

        const userUpdatePromise = db.collection('users').doc(currentUser.uid).update({
            'referral.friendCode': code,
            'totalShards': firebase.firestore.FieldValue.increment(50),
            'totalShardsCollected': firebase.firestore.FieldValue.increment(50)
        });

        const referrerUpdatePromise = referrerDoc.ref.update({
            'referral.referred': firebase.firestore.FieldValue.increment(1),
            'referral.shardsEarned': firebase.firestore.FieldValue.increment(50),
            'totalShards': firebase.firestore.FieldValue.increment(50),
            'totalShardsCollected': firebase.firestore.FieldValue.increment(50)
        });

        return Promise.all([userUpdatePromise, referrerUpdatePromise]);
    })
    .then((result) => {
        if (!result) return;

        gameState.totalShards += 50;
        gameState.totalShardsCollected += 50;
        updateReferralStatus('Success! You received 50 shards', 'success');
        friendCodeInput.value = '';
        friendReferralSection.innerHTML = `<div class="referral-status">You have used the referral code: ${code}</div>`;
        loadUserData();
    })
    .catch(error => {
        if (error && error.message) {
            console.error('Error submitting referral code:', error);
            updateReferralStatus('Error: ' + error.message, 'error');
        }
    });
}

    
function updateReferralStatus(message, type) {
  referralStatus.textContent = message;
  referralStatus.style.color = type === 'error' ? '#ff4d4d' : '#00ff7f';
  referralStatus.style.display = 'block';
  
  setTimeout(() => {
    referralStatus.style.display = 'none';
  }, 5000);
}
    
    //-- REPLACEMENT FOR: claimDailyReward() --//
function claimDailyReward() {
    if (!currentUser) return;

    claimDailyBtn.disabled = true;
    claimDailyBtn.textContent = 'Claiming...';

    const userDocRef = db.collection('users').doc(currentUser.uid);

    userDocRef.get()
    .then(doc => {
        if (!doc.exists) {
            throw new Error("User data not found. Please reload.");
        }

        const userData = doc.data();
        const checkInData = userData.dailyCheckIn || { lastCheckIn: null, streak: 0, maxStreak: 0 };
        
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const lastCheckInStart = checkInData.lastCheckIn ? new Date(checkInData.lastCheckIn.toDate().setHours(0, 0, 0, 0)).getTime() : 0;

        if (lastCheckInStart === todayStart) {
            throw new Error("Reward already claimed for today.");
        }

        let newStreak = 1;
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);

        if (lastCheckInStart === yesterdayStart.getTime()) {
            newStreak = (checkInData.streak || 0) + 1;
        }

        const rewards = [30, 25, 25, 35, 40, 60, 80];
        // Calculate reward based on day in current week (1-7)
        const dayInWeek = ((newStreak - 1) % 7) + 1;
        const rewardIndex = dayInWeek - 1; // 0-6 index
        const reward = rewards[rewardIndex];
        
        // Calculate current week number
        const currentWeek = Math.floor((newStreak - 1) / 7) + 1;

        const updatePayload = {
            'dailyCheckIn.lastCheckIn': firebase.firestore.FieldValue.serverTimestamp(),
            'dailyCheckIn.streak': newStreak,
            'dailyCheckIn.week': currentWeek,
            'dailyCheckIn.maxStreak': Math.max(newStreak, checkInData.maxStreak || 0),
            'totalShards': firebase.firestore.FieldValue.increment(reward),
            'totalShardsCollected': firebase.firestore.FieldValue.increment(reward)
        };
        
        return userDocRef.update(updatePayload).then(() => {
            // Update local state
            gameState.totalShards += reward;
            gameState.totalShardsCollected += reward;
            gameState.dailyCheckIn.streak = newStreak;
            gameState.dailyCheckIn.week = currentWeek;
            gameState.dailyCheckIn.lastCheckIn = new Date();
            return reward;
        });
    })
    .then((claimedReward) => {
        claimDailyBtn.textContent = `Claimed ${claimedReward} Shards!`;
        updateDailyCheckInUI();
        loadUserData(); // Reload user data to sync
    })
    .catch(error => {
        console.error('Error claiming daily reward:', error.message);
        claimDailyBtn.textContent = 'Error! Try Again';
        claimDailyBtn.style.background = 'linear-gradient(to right, #ff4d4d, #c60000)';

        setTimeout(() => {
            claimDailyBtn.disabled = false;
            claimDailyBtn.textContent = 'Claim Today\'s Reward';
            claimDailyBtn.style.background = '';
        }, 3000);
    });
}
    
    //-- REPLACEMENT FOR: updateDailyCheckInUI() --//
function updateDailyCheckInUI() {
    if (!currentUser) return;

    db.collection('users').doc(currentUser.uid).get()
    .then(doc => {
        if (!doc.exists) {
            console.error("User document not found for UI update.");
            return;
        }

        const userData = doc.data();
        const checkInData = userData.dailyCheckIn || { lastCheckIn: null, streak: 0, week: 1 };
        const userStreak = checkInData.streak || 0;
        const currentWeek = checkInData.week || 1;

        // Calculate current day in the week (1-7)
        const currentDayInWeek = ((userStreak - 1) % 7) + 1;
        
        // Update streak display to show week and day
        if (userStreak === 0) {
            streakCount.textContent = "Start your streak!";
        } else if (userStreak <= 7) {
            streakCount.textContent = `Day ${userStreak}`;
        } else {
            const weekNumber = Math.floor((userStreak - 1) / 7) + 1;
            streakCount.textContent = `Week ${weekNumber} - Day ${currentDayInWeek}`;
        }

        const now = new Date();
        const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const lastCheckIn = checkInData.lastCheckIn ? checkInData.lastCheckIn.toDate() : null;
        const lastCheckInDay = lastCheckIn ? new Date(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate()).getTime() : 0;
        const hasClaimedToday = lastCheckInDay === todayDate;

        calendarDays.innerHTML = '';
        const rewards = [30, 25, 25, 35, 40, 60, 80]; 

        for (let i = 1; i <= 7; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';

            // Calculate if this day is completed in the current week
            const dayInCurrentWeek = ((userStreak - 1) % 7) + 1;
            const isCompleted = i <= dayInCurrentWeek && userStreak > 0;
            const isCurrent = i === dayInCurrentWeek + 1 && !hasClaimedToday && userStreak > 0;

            if (isCompleted) {
                dayDiv.classList.add('completed');
                dayDiv.innerHTML += '<div class="check-icon">✓</div>';
            } 
            else if (isCurrent) {
                dayDiv.classList.add('current');
            }

            // Show week number for days beyond week 1
            const weekNumber = Math.floor((userStreak - 1) / 7) + 1;
            const dayLabel = weekNumber > 1 ? `W${weekNumber}D${i}` : `Day ${i}`;

            dayDiv.innerHTML += `
              <div class="day-number">${dayLabel}</div>
              <div class="day-reward">${rewards[i - 1]} ✦</div>
            `;
            calendarDays.appendChild(dayDiv);
        }
        
        if (hasClaimedToday) {
            claimDailyBtn.disabled = true;
            let claimedRewardText = "Already Claimed Today";
            if(userStreak > 0) {
                 const rewardIndex = Math.min(userStreak - 1, 6);
                 const reward = rewards[rewardIndex];
                 claimedRewardText = `Claimed ${reward} Shards Today!`;
            }
            claimDailyBtn.textContent = claimedRewardText;

        } else {
            claimDailyBtn.textContent = "Claim Today's Reward";
            claimDailyBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Error updating daily check-in UI:', error);
    });
}
    
function showAuthError(message) {
  authError.textContent = message;
  authError.style.display = 'block';
  setTimeout(() => {
    authError.style.display = 'none';
  }, 5000);
}
    
function showSignUpError(message) {
  signUpError.textContent = message;
  signUpError.style.display = 'block';
  setTimeout(() => {
    signUpError.style.display = 'none';
  }, 5000);
}
    
function showProfileError(element, message) {
  element.textContent = message;
  element.style.display = 'block';
  setTimeout(() => {
    element.style.display = 'none';
  }, 5000);
}
    
function showProfileSuccess(element, message) {
  element.textContent = message;
  element.style.display = 'block';
  setTimeout(() => {
    element.style.display = 'none';
  }, 5000);
}
    
function updateAuthUI() {
  if (currentUser) {
    // User is signed in
    signInContainer.style.display = 'none';
    signUpContainer.style.display = 'none';
    
    // Update user badge in menu
    userBadge.innerHTML = currentUser.photoURL ? 
      `<img src="${currentUser.photoURL}" alt="${currentUser.displayName}" style="width: 100%; height: 100%; border-radius: 50%;">` : 
      (currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : '👤');
  } else {
    // User is signed out
    signInContainer.style.display = 'block';
    signUpContainer.style.display = 'none';
    userBadge.textContent = '👤';
    authTitle.textContent = 'Sign In';
  }
}
    
function loadUserData() {
  if (!currentUser) return;
  
  db.collection('users').doc(currentUser.uid).get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        gameState.totalShards = userData.totalShards || 0;
        gameState.upgrades.timeBendLevel = userData.upgrades?.timeBendLevel || 1;
        gameState.upgrades.shardMagnetLevel = userData.upgrades?.shardMagnetLevel || 0;
        gameState.upgrades.phantomPhaseLevel = userData.upgrades?.phantomPhaseLevel || 0;
        gameState.relics.phantomPhase = userData.upgrades?.phantomPhaseLevel > 0;
        gameState.highScore = userData.highScore || 0;
        gameState.dailyCheckIn = userData.dailyCheckIn || { lastCheckIn: null, streak: 0, maxStreak: 0 };
        // Ensure referral code is preserved - use existing or generate new only if none exists
        if (userData.referral && userData.referral.code) {
          gameState.referral = userData.referral;
        } else if (userData.referralCode) {
          // Backward compatibility - use old referralCode field
          gameState.referral = {
            code: userData.referralCode,
            friendCode: userData.referral?.friendCode || '',
            referred: userData.referral?.referred || 0,
            shardsEarned: userData.referral?.shardsEarned || 0
          };
        } else {
          // Only generate new code if absolutely no referral code exists
          const fallbackCode = generateReferralCode();
          gameState.referral = { code: fallbackCode, friendCode: '', referred: 0, shardsEarned: 0 };
          
          // Try to update the user document with the new referral code
          db.collection('users').doc(currentUser.uid).update({
            referral: gameState.referral,
            referralCode: fallbackCode // Keep for backward compatibility
          }).then(() => {
            updateReferralUI();
          }).catch(error => {
            console.error('Error updating referral code:', error);
            // Still update UI even if database update fails
            updateReferralUI();
          });
        }
        
        updateShopUI();
        updateUserProfile();
        updateReferralUI();
      } else {
        // Create user document if it doesn't exist
        const referralCode = generateReferralCode();
        createNewUserDocument(currentUser.uid, {
          displayName: currentUser.displayName || 'Anonymous',
          email: currentUser.email,
          username: currentUser.displayName || 'Anonymous',
          referralCode: referralCode,
          totalShards: 0,
          highScore: 0
        }).then(() => {
          // Update local state with the generated code
          gameState.referral = { code: referralCode, friendCode: '', referred: 0, shardsEarned: 0 };
          updateReferralUI();
        }).catch(error => {
          console.error('Error creating user document:', error);
          // Fallback to regular generation
          gameState.referral = { code: referralCode, friendCode: '', referred: 0, shardsEarned: 0 };
          updateReferralUI();
        });
      }
    })
    .catch((error) => {
      console.error("Error loading user data:", error);
    });
}
    
function updateUserProfile() {
  if (!currentUser) return;
  
  // Update profile screen
  profileName.textContent = currentUser.displayName || 'Anonymous';
  profileEmail.textContent = currentUser.email || '';
  
  if (currentUser.photoURL) {
    profileAvatar.innerHTML = `<img src="${currentUser.photoURL}" alt="${currentUser.displayName}" style="width: 100%; height: 100%; border-radius: 50%;">`;
  } else {
    profileAvatar.textContent = currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : '👤';
  }
  
  // Update placeholder in username input
  usernameInput.placeholder = currentUser.displayName || 'Enter new username';
}
    
function updateReferralUI() {
  if (!currentUser) return;
  
  myReferralCode.textContent = gameState.referral.code || 'LOADING...';
  friendsReferred.textContent = gameState.referral.referred || '0';
  referralShards.textContent = gameState.referral.shardsEarned || '0';

  if (gameState.referral.friendCode) {
    friendReferralSection.innerHTML = '<div class="referral-status">You have used the referral code: ' + gameState.referral.friendCode + '</div>';
  } else {
    // Check if we need to recreate the input section
    const existingInput = document.getElementById('friendCodeInput');
    if (!existingInput) {
      friendReferralSection.innerHTML = `
        <div class="friend-referral-title">Enter Friend's Code</div>
        <input type="text" class="friend-code-input" id="friendCodeInput" placeholder="Enter code" maxlength="8">
        <button class="submit-code-btn" id="submitCodeBtn">Submit</button>
        <div class="referral-status" id="referralStatus"></div>
      `;
      
      // Remove any existing event listener and add new one
      const newSubmitBtn = document.getElementById('submitCodeBtn');
      if (newSubmitBtn) {
        newSubmitBtn.removeEventListener('click', submitReferralCode);
        newSubmitBtn.addEventListener('click', submitReferralCode);
      }
    }
  }
}
    
function saveUserData() {
  if (!currentUser) return;
  
  const updates = {
    totalShards: gameState.totalShards,
    highScore: gameState.highScore,
    totalShardsCollected: gameState.totalShardsCollected || gameState.totalShards,
    upgrades: {
      timeBendLevel: gameState.upgrades.timeBendLevel,
      shardMagnetLevel: gameState.upgrades.shardMagnetLevel,
      phantomPhaseLevel: gameState.upgrades.phantomPhaseLevel
    },
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  db.collection('users').doc(currentUser.uid).update(updates)
    .catch((error) => {
      console.error("Error saving user data:", error);
    });
}
    
function formatScore(milliseconds) {
  const seconds = milliseconds / 1000;
  return `${seconds.toFixed(3)}s`;
}

// [FIXED] Leaderboard now formats the time-based score and handles missing data
function updateLeaderboard(type = 'score') {
    leaderboardList.innerHTML = '<div class="spinner"></div>';
    
    let field, collection;
    if (type === 'referrals') {
        collection = 'users';
        field = 'referral.referred';
    } else {
        collection = 'users';
        field = type === 'score' ? 'highScore' : 'totalShardsCollected';
    }
    
    // First, try to get users with the specific field
    db.collection(collection)
        .orderBy(field, 'desc')
        .limit(10)
        .get()
        .then((snapshot) => {
            leaderboardList.innerHTML = '';
            
            if (snapshot.empty) {
                // If no data with the specific field, try to get any users and sort manually
                return db.collection('users').limit(50).get();
            }
            
            return snapshot;
        })
        .then((snapshot) => {
            if (!snapshot) return;
            
            let users = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                const isCurrentUser = currentUser && doc.id === currentUser.uid;
                const displayName = data.username || data.displayName || 'Anonymous';
                
                let scoreValue = 0;
                if (type === 'score') {
                    scoreValue = data.highScore || 0;
                } else if (type === 'shards') {
                    scoreValue = data.totalShardsCollected || data.totalShards || 0;
                } else if (type === 'referrals') {
                    scoreValue = data.referral?.referred || 0;
                }
                
                users.push({
                    id: doc.id,
                    data: data,
                    displayName: displayName,
                    scoreValue: scoreValue,
                    isCurrentUser: isCurrentUser
                });
            });
            
            // Sort users by score value
            users.sort((a, b) => b.scoreValue - a.scoreValue);
            
            if (users.length === 0) {
                leaderboardList.innerHTML = '<p style="text-align: center; color: #aaa;">No data available</p>';
                return;
            }
            
            // Display top 10 users
            users.slice(0, 10).forEach((user, index) => {
                let scoreDisplay;
                if (type === 'score') {
                    scoreDisplay = formatScore(user.scoreValue);
                } else if (type === 'shards') {
                    scoreDisplay = '✦ ' + user.scoreValue;
                } else if (type === 'referrals') {
                    scoreDisplay = user.scoreValue + ' referrals';
                }
                
                const itemHTML = `
                    <div class="leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}">
                        <div class="leaderboard-rank ${index < 3 ? 'top-' + (index + 1) : ''}">${index + 1}</div>
                        <div class="leaderboard-player">
                            <div class="leaderboard-name">${user.displayName}</div>
                            <div class="leaderboard-score ${type === 'shards' ? 'shards' : ''}">
                                ${scoreDisplay}
                            </div>
                        </div>
                    </div>
                `;
                
                leaderboardList.innerHTML += itemHTML;
            });
        })
        .catch((error) => {
            console.error("Error getting leaderboard:", error);
            leaderboardList.innerHTML = '<p style="text-align: center; color: #ff4d4d;">Error loading leaderboard</p>';
        });
}
    
// [FIXED] Game start time is now recorded for fair scoring
function resetGameState() {
  gameState.score = 0;
  gameState.currentRunShards = 0;
  gameState.timeBonusShards = 0;
  gameState.timeRewardsGiven = 0;
  gameState.gameStartTime = Date.now();
  gameState.speedMultiplier = 1.0;
  gameState.player = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, targetX: GAME_WIDTH / 2, targetY: GAME_HEIGHT - 100, size: PLAYER_SIZE, isAlive: true, trail: [] };
  gameState.obstacles = [];
  gameState.shardsCollectible = [];
  gameState.particles = [];
  gameState.touchPosition = null; // Clear touch indicator
  gameState.timeBend.maxUses = gameState.upgrades.timeBendLevel;
  gameState.timeBend.currentUses = gameState.timeBend.maxUses;
  gameState.timeBend.cooldown = 0;
  gameState.timeBend.active = false;
  gameState.relics.phantomPhaseUsed = 0;
  gameState.path = { lastX: GAME_WIDTH / 2, nextY: GAME_HEIGHT - 200 };
  gameState.gameActive = true;
  
  // Show movement hint for new players
  const movementHint = document.getElementById('movementHint');
  if (movementHint) {
    movementHint.style.animation = 'fadeInOut 3s ease-in-out';
    setTimeout(() => {
      movementHint.style.animation = '';
    }, 3000);
  }
  
  scoreValue.textContent = '0';
  shardValue.textContent = '0';
  if (timeBonusShards) timeBonusShards.textContent = '0';
  timeBendCounter.textContent = gameState.timeBend.currentUses;
  if (phantomRelicCounter) phantomRelicCounter.textContent = gameState.relics.phantomPhase ? '1' : '0';
  gameOverScreen.style.display = 'none';
  gameOverScreen.style.opacity = '0';
  
  // Properly reset the cooldown animation
  timeBendCooldown.style.animation = '';
  timeBendCooldown.offsetHeight; // Force reflow
  timeBendCooldown.style.animation = 'none';
}

function setupEventListeners() {
  let isTouching = false;
  let touchStartTime = 0;
  
  const handleMove = (clientX, clientY) => {
    if (!isTouching || !gameState.gameActive) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touchX = (clientX - rect.left) * scaleX;
    const touchY = (clientY - rect.top) * scaleY;
    
    // Offset the spirit above the touch point to avoid finger occlusion
    const offsetY = -80; // Move spirit 80 pixels above touch point
    const targetY = touchY + offsetY;
    
    // Store touch position for visual feedback
    gameState.touchPosition = { x: touchX, y: touchY };
    
    // Clamp to canvas bounds for both X and Y
    gameState.player.targetX = Math.max(PLAYER_SIZE / 2, Math.min(GAME_WIDTH - PLAYER_SIZE / 2, touchX));
    gameState.player.targetY = Math.max(PLAYER_SIZE / 2, Math.min(GAME_HEIGHT - PLAYER_SIZE / 2, targetY));
  };
  
  // Enhanced touch controls for mobile
  canvas.addEventListener('touchstart', (e) => { 
    e.preventDefault(); 
    isTouching = true; 
    touchStartTime = Date.now();
    handleMove(e.touches[0].clientX, e.touches[0].clientY); 
  }, { passive: false });
  
  canvas.addEventListener('touchmove', (e) => { 
    e.preventDefault(); 
    handleMove(e.touches[0].clientX, e.touches[0].clientY); 
  }, { passive: false });
  
  canvas.addEventListener('touchend', (e) => { 
    e.preventDefault(); 
    isTouching = false;
    gameState.touchPosition = null; // Clear touch indicator
    
    // Quick tap detection for time bend
    const touchDuration = Date.now() - touchStartTime;
    if (touchDuration < 200 && gameState.gameActive) {
      // Quick tap - could be used for time bend or other quick actions
      // For now, just ensure smooth movement
    }
  }, { passive: false });
  
  // Game control buttons
  timeBendBtn.addEventListener('click', activateTimeBend);
  timeBendBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    activateTimeBend();
  }, { passive: false });
  
  phantomRelicBtn.addEventListener('click', activatePhantomRelic);
  phantomRelicBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    activatePhantomRelic();
  }, { passive: false });
  
  safeModeBtn.addEventListener('click', () => startGame('safe'));
  fractureModeBtn.addEventListener('click', () => startGame('fracture'));
  shopBtn.addEventListener('click', showShop);
  leaderboardBtn.addEventListener('click', showLeaderboard);
  dailyCheckInBtn.addEventListener('click', showDailyCheckIn);
  referralBtn.addEventListener('click', showReferral);
  retryBtn.addEventListener('click', () => startGame(gameState.mode));
  fractureRetryBtn.addEventListener('click', () => startGame('fracture'));
  menuBtn.addEventListener('click', () => showMenu());
  backToMenuBtn.addEventListener('click', () => showMenu());
  leaderboardBackBtn.addEventListener('click', () => showMenu());
  upgradeTimeBendBtn.addEventListener('click', purchaseTimeBend);
  upgradeMagnetBtn.addEventListener('click', purchaseMagnet);
  buyRelicBtn.addEventListener('click', purchasePhantomRelic);
			
  // Mouse controls for desktop
  canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isTouching = true;
    handleMove(e.clientX, e.clientY);
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isTouching) return;
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  });

  canvas.addEventListener('mouseup', (e) => {
    e.preventDefault();
    isTouching = false;
  });

  canvas.addEventListener('mouseleave', (e) => {
    e.preventDefault();
    isTouching = false;
  });
      
      // Leaderboard tabs
      leaderboardTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          leaderboardTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          updateLeaderboard(tab.dataset.type);
        });
      });
    }

// Add class to body when game is active for styling
function startGame(mode) {
  if (!currentUser) {
    showAuthScreen();
    return;
  }
  
  document.body.classList.add('game-active');
      
  gameState.mode = mode;
  resetGameState();
  menuScreen.style.display = 'none';
  shopScreen.style.display = 'none';
  leaderboardScreen.style.display = 'none';
  authScreen.style.display = 'none';
  profileScreen.style.display = 'none';
  dailyCheckInScreen.style.display = 'none';
  referralScreen.style.display = 'none';
}

function showMenu() {
  document.body.classList.remove('game-active');
      menuScreen.style.display = 'flex';
      shopScreen.style.display = 'none';
      gameOverScreen.style.display = 'none';
      leaderboardScreen.style.display = 'none';
      authScreen.style.display = 'none';
      profileScreen.style.display = 'none';
      dailyCheckInScreen.style.display = 'none';
      referralScreen.style.display = 'none';
      gameState.gameActive = false;
    }

function showShop() {
      if (!currentUser) {
        showAuthScreen();
        return;
      }
      
      menuScreen.style.display = 'none';
      shopScreen.style.display = 'flex';
      leaderboardScreen.style.display = 'none';
      authScreen.style.display = 'none';
      profileScreen.style.display = 'none';
      dailyCheckInScreen.style.display = 'none';
      referralScreen.style.display = 'none';
      updateShopUI();
    }
    
function showLeaderboard() {
      if (!currentUser) {
        showAuthScreen();
        return;
      }
      
      menuScreen.style.display = 'none';
      shopScreen.style.display = 'none';
      leaderboardScreen.style.display = 'flex';
      authScreen.style.display = 'none';
      profileScreen.style.display = 'none';
      dailyCheckInScreen.style.display = 'none';
      referralScreen.style.display = 'none';
      updateLeaderboard('score');
    }
    
function showDailyCheckIn() {
      if (!currentUser) {
        showAuthScreen();
        return;
      }
      
      menuScreen.style.display = 'none';
      shopScreen.style.display = 'none';
      leaderboardScreen.style.display = 'none';
      authScreen.style.display = 'none';
      profileScreen.style.display = 'none';
      dailyCheckInScreen.style.display = 'flex';
      referralScreen.style.display = 'none';
      updateDailyCheckInUI();
    }
    
function showReferral() {
      if (!currentUser) {
        showAuthScreen();
        return;
      }
      
      menuScreen.style.display = 'none';
      shopScreen.style.display = 'none';
      leaderboardScreen.style.display = 'none';
      authScreen.style.display = 'none';
      profileScreen.style.display = 'none';
      dailyCheckInScreen.style.display = 'none';
      referralScreen.style.display = 'flex';
      updateReferralUI();
    }
    
function showProfileScreen() {
      if (!currentUser) {
        showAuthScreen();
        return;
      }
      
      menuScreen.style.display = 'none';
      shopScreen.style.display = 'none';
      leaderboardScreen.style.display = 'none';
      authScreen.style.display = 'none';
      profileScreen.style.display = 'flex';
      dailyCheckInScreen.style.display = 'none';
      referralScreen.style.display = 'none';
      updateUserProfile();
    }
    
function showAuthScreen() {
      menuScreen.style.display = 'none';
      shopScreen.style.display = 'none';
      leaderboardScreen.style.display = 'none';
      authScreen.style.display = 'flex';
      profileScreen.style.display = 'none';
      dailyCheckInScreen.style.display = 'none';
      referralScreen.style.display = 'none';
      updateAuthUI();
      
      // Clear input fields
      emailInput.value = '';
      passwordInput.value = '';
      usernameSignUpInput.value = '';
      signUpEmailInput.value = '';
      signUpPasswordInput.value = '';
      confirmPasswordInput.value = '';
      
      // Hide error messages
      authError.style.display = 'none';
      signUpError.style.display = 'none';
    }
    
function getUpgradeCost(baseCost, level) {
        return Math.floor(baseCost * Math.pow(1.5, level));
    }

function updateShopUI() {
        totalShardsEl.textContent = gameState.totalShards;
        
        // Time Bend
        const timeBendLevel = gameState.upgrades.timeBendLevel;
        const timeBendCost = getUpgradeCost(50, timeBendLevel - 1);
        timeBendLevelEl.textContent = timeBendLevel;
        timeBendCostEl.textContent = `${timeBendCost} ✦`;
        upgradeTimeBendBtn.disabled = gameState.totalShards < timeBendCost;
        
        // Shard Magnet
        const magnetLevel = gameState.upgrades.shardMagnetLevel;
        const magnetCost = getUpgradeCost(30, magnetLevel);
        magnetLevelEl.textContent = magnetLevel;
        magnetCostEl.textContent = `${magnetCost} ✦`;
        upgradeMagnetBtn.disabled = gameState.totalShards < magnetCost;
        
        // Phantom Relic
        const phantomLevel = gameState.upgrades.phantomPhaseLevel;
        const phantomCost = getUpgradeCost(120, phantomLevel);
        phantomLevelEl.textContent = phantomLevel;
        phantomCostEl.textContent = `${phantomCost} ✦`;
        buyRelicBtn.disabled = gameState.totalShards < phantomCost;
        buyRelicBtn.textContent = phantomLevel > 0 ? "Upgrade" : "Purchase";
    }

function purchaseTimeBend() {
        const level = gameState.upgrades.timeBendLevel;
        const cost = getUpgradeCost(50, level - 1);
        if (gameState.totalShards >= cost) {
            gameState.totalShards -= cost;
            gameState.upgrades.timeBendLevel++;
            updateShopUI();
            
            if (currentUser) {
                saveUserData();
            }
        }
    }

function purchaseMagnet() {
        const level = gameState.upgrades.shardMagnetLevel;
        const cost = getUpgradeCost(30, level);
        if (gameState.totalShards >= cost) {
            gameState.totalShards -= cost;
            gameState.upgrades.shardMagnetLevel++;
            updateShopUI();
            
            if (currentUser) {
                saveUserData();
            }
        }
    }

function purchasePhantomRelic() {
        const level = gameState.upgrades.phantomPhaseLevel;
        const cost = getUpgradeCost(120, level);
        if (gameState.totalShards >= cost) {
            gameState.totalShards -= cost;
            gameState.upgrades.phantomPhaseLevel++;
            gameState.relics.phantomPhase = true;
            updateShopUI();
            
            if (currentUser) {
                saveUserData();
            }
        }
    }

function endGame() {
  document.body.classList.remove('game-active');
        if (!gameState.player.isAlive) return;
        gameState.gameActive = false;
        gameState.player.isAlive = false;
        createParticleExplosion(gameState.player.x, gameState.player.y, 40, '#00f3ff');
        
        setTimeout(() => {
            const time = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
            timeSurvived.textContent = `${Math.floor(time/60)}:${(time%60).toString().padStart(2, '0')}`;
            //-- REPLACEMENT --//
const finalScoreInSeconds = (gameState.score / 1000).toFixed(3);
finalScore.textContent = formatScore(gameState.score);
            
            // Calculate collected shards (excluding time bonus)
            const collectedShards = gameState.currentRunShards - gameState.timeBonusShards;
            shardsCollected.textContent = collectedShards;
            
            // Display time bonus shards separately
            if (timeBonusShards) {
                timeBonusShards.textContent = gameState.timeBonusShards;
            }
            
            // Update totals
            gameState.totalShards += gameState.currentRunShards;
            gameState.totalShardsCollected += gameState.currentRunShards;
            
            // Update high score if needed
            if (gameState.score > gameState.highScore) {
                gameState.highScore = gameState.score;
            }
            
            // Save game data if user is logged in
            if (currentUser) {
                saveUserData();
            }
            
            gameOverScreen.style.display = 'flex';
            setTimeout(() => gameOverScreen.style.opacity = '1', 50);
        }, 800);
    }
    
function activateTimeBend() {
      if (gameState.timeBend.currentUses > 0 && !gameState.timeBend.active && gameState.timeBend.cooldown <= 0) {
        gameState.timeBend.currentUses--;
        gameState.timeBend.active = true;
        gameState.timeBend.cooldown = gameState.timeBend.maxCooldown;
        
        // Haptic feedback for time bend activation
        triggerHapticFeedback('medium');
        
        // Update counter display
        timeBendCounter.textContent = gameState.timeBend.currentUses;
        
        // Show time bend effect
        timeBendEffect.style.opacity = '1';
        
        setTimeout(() => { 
          gameState.timeBend.active = false;
          timeBendEffect.style.opacity = '0';
        }, gameState.timeBend.duration);
        
        timeBendCooldown.style.animation = `cooldown ${gameState.timeBend.maxCooldown/1000}s linear forwards`;
        setTimeout(() => { timeBendCooldown.style.animation = ''; }, gameState.timeBend.maxCooldown);
      }
    }

function activatePhantomRelic() {
  if (gameState.relics.phantomPhase && gameState.relics.phantomPhaseUsed < 1) {
    gameState.relics.phantomPhaseUsed = 1;
    gameState.relics.phantomPhase = false;
    
    // Haptic feedback for phantom relic activation
    triggerHapticFeedback('heavy');
    
    // Update counter display
    if (phantomRelicCounter) {
      phantomRelicCounter.textContent = '0';
    }
    
    // Visual feedback - could add a phantom effect here
    createParticleExplosion(gameState.player.x, gameState.player.y, 30, '#f300ff');
  }
}
    
function createParticleExplosion(x, y, count, color) {
        // Limit particle count for performance
        const maxParticles = Math.min(count, 20);
        for (let i = 0; i < maxParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            gameState.particles.push({ 
                x, y, 
                vx: Math.cos(angle) * speed, 
                vy: Math.sin(angle) * speed, 
                alpha: 1, 
                size: 1 + Math.random() * 2, 
                color: color,
                colorR: parseInt(color.slice(1, 3), 16),
                colorG: parseInt(color.slice(3, 5), 16),
                colorB: parseInt(color.slice(5, 7), 16)
            });
        }
    }

// [FIXED] Game logic updated for time-based scoring and speed
function updateGame() {
    if (!gameState.gameActive) return;

    const currentTime = Date.now();
    const timeFactor = gameState.timeBend.active ? 0.4 : 1.0;
    const isFracture = gameState.mode === 'fracture';

    // Calculate elapsed time in seconds for consistent speed scaling
    const elapsedSecondsForSpeed = (currentTime - gameState.gameStartTime) / 1000;
    
    // Update speed multiplier based on time, not score (0.1% increase per second)
    gameState.speedMultiplier = 1.0 + (elapsedSecondsForSpeed * 0.001);

    // Update score based on elapsed milliseconds for fairness
    gameState.score = currentTime - gameState.gameStartTime;
    
    // Throttle DOM updates for better performance (update every 100ms instead of every frame)
    if (!gameState.lastScoreUpdate || currentTime - gameState.lastScoreUpdate > 100) {
        scoreValue.textContent = formatScore(gameState.score);
        gameState.lastScoreUpdate = currentTime;
    }

    // Time-based shard rewards every 60 seconds
    const elapsedSeconds = (currentTime - gameState.gameStartTime) / 1000;
    const timeRewardInterval = 60; // 60 seconds
    const timeRewardShards = isFracture ? 25 : 15; // 25 for fracture, 15 for secure
    
    // Check if we should award time-based shards
    const timeRewardsEarned = Math.floor(elapsedSeconds / timeRewardInterval);
    if (timeRewardsEarned > gameState.timeRewardsGiven) {
        const newRewards = timeRewardsEarned - gameState.timeRewardsGiven;
        const totalTimeShards = newRewards * timeRewardShards;
        
        // Track time bonus shards separately
        gameState.timeBonusShards += totalTimeShards;
        gameState.currentRunShards += totalTimeShards;
        gameState.timeRewardsGiven = timeRewardsEarned;
        
        // Update shard display
        shardValue.textContent = gameState.currentRunShards;
    }

    const basePathSpeed = isFracture ? 4 : 2;
    const pathSpeed = basePathSpeed * gameState.speedMultiplier;

    // Update Player with improved mobile responsiveness and 2D movement
    const lerpSpeed = gameState.mode === 'fracture' ? 0.2 : 0.15; // Faster response in fracture mode
    
    // Horizontal movement
    gameState.player.x += (gameState.player.targetX - gameState.player.x) * lerpSpeed;
    gameState.player.x = Math.max(PLAYER_SIZE / 2, Math.min(GAME_WIDTH - PLAYER_SIZE / 2, gameState.player.x));
    
    // Vertical movement
    gameState.player.y += (gameState.player.targetY - gameState.player.y) * lerpSpeed;
    gameState.player.y = Math.max(PLAYER_SIZE / 2, Math.min(GAME_HEIGHT - PLAYER_SIZE / 2, gameState.player.y));

    gameState.player.trail.push({ x: gameState.player.x, y: gameState.player.y, alpha: 1 });
    if (gameState.player.trail.length > 20) gameState.player.trail.shift();
    gameState.player.trail.forEach(p => p.alpha -= 0.05);

    // Update Game World
    gameState.path.nextY -= pathSpeed * timeFactor;
    if (gameState.path.nextY <= 0) {
        createObstacleLayer(-30);
        const baseDistance = isFracture ? 80 : 120;
        gameState.path.nextY = baseDistance + Math.random() * 40;
    }

    const shardSpawnRate = isFracture ? 0.03 : 0.015;
    if (Math.random() < shardSpawnRate * timeFactor) createShard();

    // Update Obstacles
    gameState.obstacles.forEach((obs, i) => {
        obs.y += (obs.speed * gameState.speedMultiplier + elapsedSecondsForSpeed * 0.005) * timeFactor;
        if (obs.y > GAME_HEIGHT + 30) gameState.obstacles.splice(i, 1);
    });

    // Update Shards with improved collection mechanics
    gameState.shardsCollectible.forEach((shard, i) => {
        shard.y += (isFracture ? 3 : 2) * gameState.speedMultiplier * timeFactor;
        const dx = shard.x - gameState.player.x;
        const dy = shard.y - gameState.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const magnetRadius = 20 + (gameState.upgrades.shardMagnetLevel * 20); // Increased base magnet radius
        
        // Enhanced collection with visual feedback
        if (distance < PLAYER_SIZE / 2 + magnetRadius) {
            gameState.currentRunShards++;
            shardValue.textContent = gameState.currentRunShards;
            
            // Reduced particle effect for better performance
            createParticleExplosion(shard.x, shard.y, 8, '#f300ff');
            
            // Haptic feedback for shard collection
            triggerHapticFeedback('light');
            
            // Add screen shake effect for better feedback
            if (gameState.currentRunShards % 5 === 0) {
                // Every 5th shard gives extra feedback
                createParticleExplosion(shard.x, shard.y, 12, '#ffffff');
                triggerHapticFeedback('success');
            }
            
            gameState.shardsCollectible.splice(i, 1);
        } else if (shard.y > GAME_HEIGHT + 20) {
            gameState.shardsCollectible.splice(i, 1);
        }
    });

    checkCollisions();
}

// Show notification when player earns time-based shards
function showTimeRewardNotification(totalShards, shardsPerInterval) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #00f3ff, #f300ff);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-size: 18px;
        font-weight: bold;
        text-align: center;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(0, 243, 255, 0.5);
        animation: slideInDown 0.5s ease-out;
    `;
    
    const intervals = totalShards / shardsPerInterval;
    const timeText = intervals === 1 ? '1 minute' : `${intervals} minutes`;
    notification.textContent = `⏰ +${totalShards} Shards for ${timeText} survival!`;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutUp 0.5s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
    
    // Add CSS animations if not already present
    if (!document.getElementById('timeRewardAnimations')) {
        const style = document.createElement('style');
        style.id = 'timeRewardAnimations';
        style.textContent = `
            @keyframes slideInDown {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            @keyframes slideOutUp {
                from { transform: translateX(-50%) translateY(0); opacity: 1; }
                to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}
    
function checkCollisions() {
  if (!gameState.player.isAlive) return;
  
  // Cache player bounds for performance
  const hitboxWidth = PLAYER_SIZE * 0.5;
  const hitboxHeight = PLAYER_SIZE * 0.9;
  const pL = gameState.player.x - hitboxWidth / 2;
  const pR = gameState.player.x + hitboxWidth / 2;
  const pT = gameState.player.y - hitboxHeight / 2;
  const pB = gameState.player.y + hitboxHeight / 2;

  // Only check obstacles that are near the player (performance optimization)
  for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
    const obs = gameState.obstacles[i];
    
    // Skip obstacles that are too far away
    if (obs.y > gameState.player.y + 100 || obs.y < gameState.player.y - 100) {
      continue;
    }
    
    const oL = obs.x;
    const oR = obs.x + obs.width;
    const oT = obs.y;
    const oB = obs.y + obs.height;

    if (pR > oL && pL < oR && pB > oT && pT < oB) {
      // Check if phantom phase relic can be used
      if (gameState.relics.phantomPhase && gameState.relics.phantomPhaseUsed < gameState.upgrades.phantomPhaseLevel) {
        gameState.relics.phantomPhaseUsed++;
        createParticleExplosion(obs.x + obs.width/2, obs.y + obs.height/2, 15, '#ffffff');
        triggerHapticFeedback('heavy'); // Strong feedback for phase through
        gameState.obstacles.splice(i, 1);
        return;
      } else {
        triggerHapticFeedback('heavy'); // Strong feedback for collision
        endGame();
        return;
      }
    }
  }
}
    
function drawPlayerCharacter(ctx, x, y, size, time) {
  ctx.save();
  ctx.translate(x, y);
  
  // Calculate tilt based on both horizontal and vertical movement
  const horizontalTilt = (gameState.player.targetX - x) * 0.005;
  const verticalTilt = (gameState.player.targetY - y) * 0.003;
  const totalTilt = horizontalTilt + verticalTilt;
  ctx.rotate(totalTilt);
  
  const breath = Math.sin(time * 5) * 0.05 + 1;
  
  // Add movement direction indicator
  const moveX = gameState.player.targetX - x;
  const moveY = gameState.player.targetY - y;
  const moveDistance = Math.sqrt(moveX * moveX + moveY * moveY);
  
  if (moveDistance > 2) {
    // Draw movement trail effect
    ctx.strokeStyle = `rgba(0, 243, 255, ${Math.min(moveDistance / 20, 0.6)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-moveX * 0.3, -moveY * 0.3);
    ctx.stroke();
  }
  if (gameState.timeBend.active) {
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2.5);
    grad.addColorStop(0, 'rgba(0, 243, 255, 0.4)');
    grad.addColorStop(1, 'rgba(0, 243, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); 
    ctx.arc(0, 0, size * 2.5, 0, Math.PI * 2); 
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.8 * breath);
  ctx.bezierCurveTo(size * 0.7, -size * 0.4, size * 0.6, size * 0.6, 0, size * breath);
  ctx.bezierCurveTo(-size * 0.6, size * 0.6, -size * 0.7, -size * 0.4, 0, -size * 0.8 * breath);
  ctx.closePath();
  const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  bodyGrad.addColorStop(0, 'white');
  bodyGrad.addColorStop(0.4, '#00f3ff');
  bodyGrad.addColorStop(1, '#f300ff');
  ctx.fillStyle = bodyGrad;
  ctx.shadowColor = '#00f3ff';
  ctx.shadowBlur = 12; // Reduced shadow blur for performance
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -size * 0.3, size * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.shadowColor = 'white';
  ctx.shadowBlur = 8; // Reduced shadow blur for performance
  ctx.fill();
  ctx.restore();
}

function drawPlayerTrail(ctx) {
  gameState.player.trail.forEach((p, i) => {
    ctx.beginPath();
    const alpha = p.alpha * (i / gameState.player.trail.length);
    ctx.fillStyle = `rgba(0, 243, 255, ${alpha * 0.5})`;
    ctx.arc(p.x, p.y + 10, i / 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawTouchIndicator(ctx) {
  if (!gameState.touchPosition) return;
  
  const touchX = gameState.touchPosition.x;
  const touchY = gameState.touchPosition.y;
  const spiritX = gameState.player.x;
  const spiritY = gameState.player.y;
  
  // Draw connection line from touch point to spirit
  ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(touchX, touchY);
  ctx.lineTo(spiritX, spiritY);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Draw touch point indicator
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(touchX, touchY, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw touch point ring
  ctx.strokeStyle = 'rgba(0, 243, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(touchX, touchY, 12, 0, Math.PI * 2);
  ctx.stroke();
}

function drawGame() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  if (gameState.player.isAlive) {
    drawPlayerTrail(ctx);
    drawPlayerCharacter(ctx, gameState.player.x, gameState.player.y, gameState.player.size, Date.now() / 1000);
  }
  // Draw obstacles with reduced shadow effects for better performance
  gameState.obstacles.forEach(obs => {
    const color = obs.isFracture ? '#00a2ff' : '#ff007a';
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8; // Reduced shadow blur
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  });
  
  // Draw shards with reduced shadow effects
  gameState.shardsCollectible.forEach(shard => {
    ctx.fillStyle = '#f300ff';
    ctx.shadowColor = '#f300ff';
    ctx.shadowBlur = 8; // Reduced shadow blur
    ctx.beginPath(); 
    ctx.arc(shard.x, shard.y, 10, 0, Math.PI * 2); 
    ctx.fill();
  });
  
  // Draw and update particles with proper cleanup
  for (let i = gameState.particles.length - 1; i >= 0; i--) {
    const p = gameState.particles[i];
    p.alpha -= 0.03; // Faster fade for better performance
    if (p.alpha <= 0) {
      gameState.particles.splice(i, 1);
      continue;
    }
    p.x += p.vx;
    p.y += p.vy;
    
    // Use rgba for better performance than string concatenation
    const alpha = Math.floor(p.alpha * 255);
    ctx.fillStyle = `rgba(${p.colorR}, ${p.colorG}, ${p.colorB}, ${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Limit particle array size to prevent memory issues
  if (gameState.particles.length > 100) {
    gameState.particles = gameState.particles.slice(-80);
  }

  ctx.shadowBlur = 0;
  
  // Draw touch indicator if touching
  if (gameState.touchPosition) {
    drawTouchIndicator(ctx);
  }
}
    
function createObstacleLayer(baseY) {
  const isFracture = gameState.mode === 'fracture';
  const speed = isFracture ? 4 : 2;
  const obsDefaults = { y: baseY, height: 20, speed: speed, passed: true, isFracture: isFracture };
  
  // Ensure at least one guaranteed clear path with generous spacing
  const playerSize = PLAYER_SIZE + 20; // Add larger buffer for easier navigation
  const gapSize = playerSize + (isFracture ? 80 : 100); // Much larger gaps for easier navigation
  const maxDrift = 100; // Allow more horizontal variation
  
  // Create a guaranteed main path
  let mainGapX = gameState.path.lastX + (Math.random() - 0.5) * maxDrift;
  mainGapX = Math.max(gapSize / 2, Math.min(GAME_WIDTH - gapSize / 2, mainGapX));
  
  // Add more vertical variation to the main gap for easier 2D navigation
  const mainGapY = baseY + (Math.random() - 0.5) * 80;
  
  const guaranteedGap = {
    x: mainGapX,
    y: mainGapY,
    width: gapSize,
    height: gapSize
  };
  
  gameState.path.lastX = mainGapX; // Update path tracking
  gameState.path.guaranteedGap = guaranteedGap; // Store for potential visual debugging
  
  // Try to create additional gaps (but don't guarantee them)
  const additionalGaps = [];
  const numAdditionalGaps = isFracture ? 1 : 2;
  
  for (let g = 0; g < numAdditionalGaps; g++) {
    if (Math.random() < 0.8) { // 80% chance for additional gaps (increased)
      let gapX = mainGapX + (Math.random() - 0.5) * (GAME_WIDTH * 0.7); // Wider spread
      gapX = Math.max(gapSize / 2, Math.min(GAME_WIDTH - gapSize / 2, gapX));
      
      const gapY = baseY + (Math.random() - 0.5) * 80; // More vertical variation
      
      // Check if this gap is far enough from the main gap
      const distanceFromMain = Math.abs(gapX - mainGapX);
      if (distanceFromMain > gapSize * 1.2) { // Reduced distance requirement
        additionalGaps.push({
          x: gapX,
          y: gapY,
          width: gapSize * 0.9, // Larger additional gaps
          height: gapSize * 0.9
        });
      }
    }
  }
  
  const allGaps = [guaranteedGap, ...additionalGaps];
  
  // Create obstacles while ensuring the guaranteed gap remains clear
  const density = isFracture ? 0.55 : 0.45; // Reduced density for easier navigation
  const numObstacles = isFracture ? 8 : 6; // Fewer obstacles for more open paths
  
  for (let i = 0; i < numObstacles; i++) {
    const fragX = Math.random() * GAME_WIDTH;
    const fragY = baseY + (Math.random() - 0.5) * 100; // Increased vertical spread
    const fragWidth = 15 + Math.random() * 30; // Slightly smaller obstacles
    const fragHeight = 15 + Math.random() * 20; // Slightly smaller obstacles
    
    // Check if obstacle overlaps with any gap
    let overlapsGap = false;
    for (const gap of allGaps) {
      if (fragX + fragWidth > gap.x - gap.width/2 && 
          fragX < gap.x + gap.width/2 &&
          fragY + fragHeight > gap.y - gap.height/2 && 
          fragY < gap.y + gap.height/2) {
        overlapsGap = true;
        break;
      }
    }
    
    // Always respect the guaranteed gap, but allow some overlap with additional gaps
    const isInGuaranteedGap = fragX + fragWidth > guaranteedGap.x - guaranteedGap.width/2 && 
                             fragX < guaranteedGap.x + guaranteedGap.width/2 &&
                             fragY + fragHeight > guaranteedGap.y - guaranteedGap.height/2 && 
                             fragY < guaranteedGap.y + guaranteedGap.height/2;
    
    if (!isInGuaranteedGap && !overlapsGap && Math.random() < density) {
      gameState.obstacles.push({
        ...obsDefaults,
        x: fragX,
        y: fragY,
        width: fragWidth,
        height: fragHeight
      });
    }
  }
  
  // If we have too few obstacles, add some more in safe areas
  const currentObstacles = gameState.obstacles.filter(obs => obs.y === baseY).length;
  const minObstacles = isFracture ? 4 : 3; // Reduced minimum for more open gameplay
  
  if (currentObstacles < minObstacles) {
    for (let i = currentObstacles; i < minObstacles; i++) {
      let attempts = 0;
      let placed = false;
      
      while (!placed && attempts < 20) {
        const fragX = Math.random() * GAME_WIDTH;
        const fragY = baseY + (Math.random() - 0.5) * 80; // More vertical spread
        const fragWidth = 15 + Math.random() * 25; // Smaller fallback obstacles
        const fragHeight = 15 + Math.random() * 15; // Smaller fallback obstacles
        
        // Only check against guaranteed gap
        const isInGuaranteedGap = fragX + fragWidth > guaranteedGap.x - guaranteedGap.width/2 && 
                                 fragX < guaranteedGap.x + guaranteedGap.width/2 &&
                                 fragY + fragHeight > guaranteedGap.y - guaranteedGap.height/2 && 
                                 fragY < guaranteedGap.y + guaranteedGap.height/2;
        
        if (!isInGuaranteedGap) {
          gameState.obstacles.push({
            ...obsDefaults,
            x: fragX,
            y: fragY,
            width: fragWidth,
            height: fragHeight
          });
          placed = true;
        }
        attempts++;
      }
    }
  }
}

function createShard() {
  // Create shards at various vertical positions for 2D gameplay
  const startY = -15 - Math.random() * 50; // Vary the starting Y position
  
  // Try to place shards in accessible areas (near guaranteed gaps if possible)
  let shardX = Math.random() * (GAME_WIDTH - 20) + 10;
  
  // If there's a guaranteed gap nearby, bias shard placement toward it
  if (gameState.path.guaranteedGap) {
    const gap = gameState.path.guaranteedGap;
    const distanceFromGap = Math.abs(shardX - gap.x);
    
    // 30% chance to place shard near the guaranteed gap
    if (Math.random() < 0.3 && distanceFromGap > gap.width) {
      const bias = (Math.random() - 0.5) * gap.width * 2;
      shardX = Math.max(10, Math.min(GAME_WIDTH - 10, gap.x + bias));
    }
  }
  
  gameState.shardsCollectible.push({ 
    x: shardX, 
    y: startY 
  });
}
    
// Frame rate limiting for better performance
let lastFrameTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

function gameLoop(currentTime) {
  if (currentTime - lastFrameTime >= frameInterval) {
    if (gameState.gameActive) {
      updateGame();
    }
    drawGame();
    lastFrameTime = currentTime;
  }
  requestAnimationFrame(gameLoop);
}
    
window.addEventListener('load', initGame);

// Prevent right-click context menu
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false;
});

// Prevent text selection with mouse
document.addEventListener('selectstart', (e) => {
  e.preventDefault();
  return false;
});

// Prevent drag
document.addEventListener('dragstart', (e) => {
  e.preventDefault();
  return false;
});

// Prevent keyboard shortcuts for copying
document.addEventListener('keydown', (e) => {
  // Prevent Ctrl+A, Ctrl+C, Ctrl+X, Ctrl+S
  if (e.ctrlKey && (e.keyCode === 65 || e.keyCode === 67 || e.keyCode === 88 || e.keyCode === 83)) {
    e.preventDefault();
    return false;
  }
  // Prevent F12 (Developer Tools)
  if (e.keyCode === 123) {
    e.preventDefault();
    return false;
  }
});

// Prevent zoom with keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Prevent Ctrl + Plus/Minus/0 (zoom shortcuts)
  if (e.ctrlKey && (e.keyCode === 187 || e.keyCode === 189 || e.keyCode === 48)) {
    e.preventDefault();
    return false;
  }
});

// Prevent zoom with mouse wheel + Ctrl
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
    return false;
  }
}, { passive: false });

// Prevent double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// Prevent pinch zoom
document.addEventListener('gesturestart', (e) => {
  e.preventDefault();
}, false);

document.addEventListener('gesturechange', (e) => {
  e.preventDefault();
}, false);

document.addEventListener('gestureend', (e) => {
  e.preventDefault();
}, false);
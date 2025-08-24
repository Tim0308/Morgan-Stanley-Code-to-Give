import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'EN' | 'ZH';

interface Translations {
  // Header translations
  loading: string;
  noSchool: string;
  notifications: string;
  
  // Navigation
  home: string;
  learn: string;
  community: string;
  games: string;
  analytics: string;
  tokens: string;
  
  // Auth screens
  welcomeBack: string;
  signInToAccount: string;
  emailOrPhone: string;
  password: string;
  signIn: string;
  dontHaveAccount: string;
  signUp: string;
  error: string;
  loginFailed: string;
  invalidCredentials: string;
  enterEmailPassword: string;
  
  // Home page content
  weeklyGoal: string;
  activities: string;
  completed: string;
  progress: string;
  level: string;
  failed: string;
  noActivitiesThisWeek: string;
  
  // Booklet Progress
  modules: string;
  modulesCompleted: string;
  currentModule: string;
  bookletProgress: string;
  noBooklets: string;
  startReading: string;
  
  // Certificates
  certificatesEarned: string;
  certificateOfAchievement: string;
  alphabetMaster: string;
  loadMore: string;
  more: string;
  
  // VocabVenture Game
  welcomeToVocabVenture: string;
  todaysWordIs: string;
  openCamera: string;
  takePicture: string;
  lookAroundFind: string;
  inYourSurroundings: string;
  cameraPreview: string;
  tapButtonsBelow: string;
  pickFromGallery: string;
  back: string;
  greatJob: string;
  tryAgain: string;
  continue: string;
  gameOver: string;
  maxAttemptsReached: string;
  permissionNeeded: string;
  cameraPermissionRequired: string;
  failedToTakePicture: string;
  failedToPickImage: string;
  failedToProcessImage: string;
  
  // Learn page
  homework: string;
  materials: string;
  homeworkCalendar: string;
  currentWork: string;
  completedWork: string;
  allCaughtUp: string;
  noPendingHomework: string;
  showMoreAssignments: string;
  showMoreMaterials: string;
  materialsWillAppearHere: string;
  noMaterialsAvailable: string;
  pending: string;
  overdue: string;
  submitted: string;
  noHomework: string;
  proofAlreadyUploaded: string;
  proofAlreadyUploadedMsg: string;
  viewImage: string;
  deleteUploadNew: string;
  uploadProofOfWork: string;
  uploadProofMsg: string;
  takePhoto: string;
  chooseFromGallery: string;
  permissionRequired: string;
  cameraAccessNeeded: string;
  photoLibraryAccessNeeded: string;
  couldNotProcessRequest: string;
  
  // Community page
  childrenAchievements: string;
  photoAttached: string;
  videoAttached: string;
  showComments: string;
  forums: string;
  chats: string;
  experts: string;
  posts: string;
  messages: string;
  
  // Games page
  weeklyChallenge: string;
  extraGames: string;
  playNow: string;
  comingSoon: string;
  gamesCompleted: string;
  days: string;
  
  // Analytics page
  performance: string;
  skillProgression: string;
  superAppProgress: string;
  mathProgress: string;
  readingProgress: string;
  gradeAnalytics: string;
  performanceMetrics: string;
  readingSpeed: string;
  comprehensionAccuracy: string;
  weeklyEngagementTime: string;
  wpm: string;
  loadingMetrics: string;
  metricsUnavailable: string;
  connected: string;
  openSuperapp: string;
  scienceProgress: string;
  yourChildPosition: string;
  yourChildScore: string;
  reading: string;
  writing: string;
  
  // Tokens page
  tokenBalance: string;
  earnTokens: string;
  spendTokens: string;
  transactionHistory: string;
  shop: string;
  history: string;
  currentBalance: string;
  thisWeek: string;
  totalEarned: string;
  noItemsAvailable: string;
  checkBackLater: string;
  
  // Common UI elements
  retry: string;
  viewAll: string;
  seeMore: string;
  close: string;
  save: string;
  
  // Settings menu
  editProfile: string;
  settings: string;
  privacySecurity: string;
  helpSupport: string;
  about: string;
  logOut: string;
  logOutConfirmTitle: string;
  logOutConfirmMessage: string;
  cancel: string;
  
  // Common words
  grade: string;
  of: string;
}

const translations: Record<Language, Translations> = {
  EN: {
    loading: 'Loading...',
    noSchool: 'No School',
    notifications: 'Notifications',
    
    // Navigation
    home: 'Home',
    learn: 'Learn',
    community: 'Community',
    games: 'Games',
    analytics: 'Analytics',
    tokens: 'Tokens',
    
    // Auth screens
    welcomeBack: 'Welcome back!',
    signInToAccount: 'Sign in to your account',
    emailOrPhone: 'Email address or phone number',
    password: 'Password',
    signIn: 'Sign In',
    dontHaveAccount: "Don't have an account?",
    signUp: 'Sign Up',
    error: 'Error',
    loginFailed: 'Login Failed',
    invalidCredentials: 'Invalid email or password. Please try again.',
    enterEmailPassword: 'Please enter both email and password',
    
    // Home page content
    weeklyGoal: 'Weekly Goal',
    activities: 'activities',
    completed: 'completed',
    progress: 'Progress',
    level: 'Level',
    failed: 'Failed to load',
    noActivitiesThisWeek: 'No activities this week',
    
    // Booklet Progress
    modules: 'modules',
    modulesCompleted: 'modules completed',
    currentModule: 'Current Module',
    bookletProgress: 'Booklet Progress',
    noBooklets: 'No booklets available',
    startReading: 'Start Reading',
    
    // Certificates
    certificatesEarned: 'Certificates Earned',
    certificateOfAchievement: 'Certificate of Achievement',
    alphabetMaster: 'Alphabet Master',
    loadMore: 'Load More',
    more: 'more',
    
    // VocabVenture Game
    welcomeToVocabVenture: 'Welcome to VocabVenture!',
    todaysWordIs: 'Today\'s word is:',
    openCamera: 'Open Camera',
    takePicture: 'Take a Picture',
        lookAroundFind: 'Look around you and find a {word} in your surroundings!',
    inYourSurroundings: 'in your surroundings!',
    cameraPreview: 'Camera Preview',
    tapButtonsBelow: 'Tap the buttons below to take a picture or pick from gallery',
    pickFromGallery: 'Pick from Gallery',
    back: 'Back',
    greatJob: 'Great Job!',
    tryAgain: 'Try Again',
    continue: 'Continue',
    gameOver: 'Game Over',
    maxAttemptsReached: 'You have reached the maximum number of attempts.',
    permissionNeeded: 'Permission needed',
    cameraPermissionRequired: 'Camera permission is required to play this game.',
    failedToTakePicture: 'Failed to take picture. Please try again.',
    failedToPickImage: 'Failed to pick image. Please try again.',
    failedToProcessImage: 'Failed to process image. Please try again.',
    
    // Learn page
    homework: 'Homework',
    materials: 'Materials',
    homeworkCalendar: 'Homework Calendar',
    currentWork: 'Current Work',
    completedWork: 'Completed Work',
    allCaughtUp: 'All caught up!',
    noPendingHomework: 'No pending homework at the moment',
    showMoreAssignments: 'Show More Assignments',
    showMoreMaterials: 'Show More Materials',
    noMaterialsAvailable: 'No materials available',
    materialsWillAppearHere: 'Learning materials will appear here.',
    pending: 'Pending',
    overdue: 'Overdue',
    submitted: 'Submitted',
    noHomework: 'No homework assigned',
    proofAlreadyUploaded: 'Proof Already Uploaded',
    proofAlreadyUploadedMsg: 'You have already uploaded proof for this activity. What would you like to do?',
    viewImage: 'View Image',
    deleteUploadNew: 'Delete & Upload New',
    uploadProofOfWork: 'Upload Proof of Work',
    uploadProofMsg: 'Take a photo of your completed pen & paper work to submit proof.',
    takePhoto: 'Take Photo',
    chooseFromGallery: 'Choose from Gallery',
    permissionRequired: 'Permission Required',
    cameraAccessNeeded: 'Camera access is needed to take photos of your completed work.',
    photoLibraryAccessNeeded: 'Photo library access is needed to select images.',
    couldNotProcessRequest: 'Could not process request. Please try again.',
    
    // Community page
    childrenAchievements: 'Children Achievements',
    photoAttached: 'Photo attached',
    videoAttached: 'Video attached',
    showComments: 'Show Comments',
    forums: 'Forums',
    chats: 'Chats',
    experts: 'Expert Parents',
    posts: 'Posts',
    messages: 'Messages',
    
    // Games page
    weeklyChallenge: 'Weekly Challenge',
    extraGames: 'Extra Games',
    playNow: 'Play Now',
    comingSoon: 'Coming Soon',
    gamesCompleted: 'games completed',
    days: 'days',
    
    // Analytics page
    performance: 'Performance',
    skillProgression: 'Skill Progression',
    superAppProgress: 'SuperAPP Progress',
    mathProgress: 'Math Progress',
    readingProgress: 'Reading Progress',
    gradeAnalytics: 'Grade Analytics',
    performanceMetrics: 'Performance Metrics',
    readingSpeed: 'Reading Speed',
    comprehensionAccuracy: 'Comprehension Accuracy',
    weeklyEngagementTime: 'Weekly Engagement Time',
    wpm: 'WPM',
    loadingMetrics: 'Loading metrics...',
    metricsUnavailable: 'Metrics unavailable',
    connected: 'Connected',
    openSuperapp: 'Open SuperAPP',
    scienceProgress: 'Science Progress',
    yourChildPosition: "Your Child's Position",
    yourChildScore: 'Your Child (Score',
    reading: 'Reading',
    writing: 'Writing',
    
    // Tokens page
    tokenBalance: 'Token Balance',
    earnTokens: 'Earn Tokens',
    spendTokens: 'Spend Tokens',
    transactionHistory: 'Transaction History',
    shop: 'Shop',
    history: 'History',
    currentBalance: 'Current Balance',
    thisWeek: 'This Week',
    totalEarned: 'Total Earned',
    noItemsAvailable: 'No items available',
    checkBackLater: 'Check back later for new rewards!',
    
    // Common UI elements
    retry: 'Retry',
    viewAll: 'View All',
    seeMore: 'See More',
    close: 'Close',
    save: 'Save',
    
    editProfile: 'Edit Profile',
    settings: 'Settings',
    privacySecurity: 'Privacy & Security',
    helpSupport: 'Help & Support',
    about: 'About',
    logOut: 'Log Out',
    logOutConfirmTitle: 'Log Out',
    logOutConfirmMessage: 'Are you sure you want to log out?',
    cancel: 'Cancel',
    grade: 'Grade',
    of: 'of',
  },
  ZH: {
    loading: '載入中...',
    noSchool: '無學校',
    notifications: '通知',
    
    // Navigation
    home: '首頁',
    learn: '學習',
    community: '社群',
    games: '遊戲',
    analytics: '分析',
    tokens: '代幣',
    
    // Auth screens
    welcomeBack: '歡迎回來！',
    signInToAccount: '登入您的帳戶',
    emailOrPhone: '電子郵件或電話號碼',
    password: '密碼',
    signIn: '登入',
    dontHaveAccount: '還沒有帳戶？',
    signUp: '註冊',
    error: '錯誤',
    loginFailed: '登入失敗',
    invalidCredentials: '電子郵件或密碼無效。請再試一次。',
    enterEmailPassword: '請輸入電子郵件和密碼',
    
    // Home page content
    weeklyGoal: '每週目標',
    activities: '項活動',
    completed: '已完成',
    progress: '進度',
    level: '等級',
    failed: '載入失敗',
    noActivitiesThisWeek: '本週沒有活動',
    
    // Booklet Progress
    modules: '個模組',
    modulesCompleted: '個模組已完成',
    currentModule: '目前模組',
    bookletProgress: '小冊子進度',
    noBooklets: '沒有可用的小冊子',
    startReading: '開始閱讀',
    
    // Certificates
    certificatesEarned: '獲得的證書',
    certificateOfAchievement: '成就證書',
    alphabetMaster: '字母大師',
    loadMore: '載入更多',
    more: '更多',
    
    // VocabVenture Game
    welcomeToVocabVenture: '歡迎來到詞彙冒險！',
    todaysWordIs: '今日單字是：',
    openCamera: '打開相機',
    takePicture: '拍照',
    lookAroundFind: '在你周圍尋找一個 {word}！',
    inYourSurroundings: '在你的環境中！',
    cameraPreview: '相機預覽',
    tapButtonsBelow: '點擊下方按鈕拍照或從圖庫選擇',
    pickFromGallery: '從圖庫選擇',
    back: '返回',
    greatJob: '做得很好！',
    tryAgain: '再試一次',
    continue: '繼續',
    gameOver: '遊戲結束',
    maxAttemptsReached: '您已達到最大嘗試次數。',
    permissionNeeded: '需要權限',
    cameraPermissionRequired: '需要相機權限才能玩此遊戲。',
    failedToTakePicture: '拍照失敗。請重試。',
    failedToPickImage: '選擇圖片失敗。請重試。',
    failedToProcessImage: '處理圖片失敗。請重試。',
    
    // Learn page
    homework: '作業',
    materials: '教材',
    homeworkCalendar: '作業日曆',
    currentWork: '目前作業',
    completedWork: '已完成作業',
    allCaughtUp: '全部完成！',
    noPendingHomework: '目前沒有待處理的作業',
    showMoreAssignments: '顯示更多作業',
    showMoreMaterials: '顯示更多教材',
    noMaterialsAvailable: '沒有可用的教材',
    materialsWillAppearHere: '相關教材將顯示在此處。',
    pending: '待處理',
    overdue: '逾期',
    submitted: '已提交',
    noHomework: '沒有指派作業',
    proofAlreadyUploaded: '證明已上傳',
    proofAlreadyUploadedMsg: '您已經為此活動上傳了證明。您想要做什麼？',
    viewImage: '查看圖片',
    deleteUploadNew: '刪除並上傳新的',
    uploadProofOfWork: '上傳作業證明',
    uploadProofMsg: '為您完成的紙筆作業拍照以提交證明。',
    takePhoto: '拍照',
    chooseFromGallery: '從圖庫選擇',
    permissionRequired: '需要權限',
    cameraAccessNeeded: '需要相機權限來拍攝您的已完成作業照片。',
    photoLibraryAccessNeeded: '需要照片庫權限來選擇圖片。',
    couldNotProcessRequest: '無法處理請求。請重試。',
    
    // Community page
    childrenAchievements: '孩子成就',
    photoAttached: '已附加照片',
    videoAttached: '已附加影片',
    showComments: '顯示留言',
    forums: '論壇',
    chats: '聊天',
    experts: '專家家長',
    posts: '貼文',
    messages: '消息',
    
    // Games page
    weeklyChallenge: '每週挑戰',
    extraGames: '額外遊戲',
    playNow: '立即遊玩',
    comingSoon: '即將推出',
    gamesCompleted: '個遊戲已完成',
    days: '天',
    
    // Analytics page
    performance: '表現',
    skillProgression: '技能進展',
    superAppProgress: 'SuperAPP 進度',
    mathProgress: '數學進度',
    readingProgress: '閱讀進度',
    gradeAnalytics: '成績分析',
    performanceMetrics: '表現指標',
    readingSpeed: '閱讀速度',
    comprehensionAccuracy: '理解準確度',
    weeklyEngagementTime: '每週參與時間',
    wpm: '每分鐘字數',
    loadingMetrics: '載入指標中...',
    metricsUnavailable: '指標不可用',
    connected: '已連接',
    openSuperapp: '打開超級應用程式',
    scienceProgress: '科學進度',
    yourChildPosition: '您孩子的位置',
    yourChildScore: '您的孩子（分數',
    reading: '閱讀',
    writing: '寫作',
    
    // Tokens page
    tokenBalance: '代幣餘額',
    earnTokens: '賺取代幣',
    spendTokens: '花費代幣',
    transactionHistory: '交易記錄',
    shop: '商店',
    history: '歷史記錄',
    currentBalance: '目前餘額',
    thisWeek: '本週',
    totalEarned: '總共賺取',
    noItemsAvailable: '沒有可用項目',
    checkBackLater: '稍後回來查看新獎勵！',
    
    // Common UI elements
    retry: '重試',
    viewAll: '查看全部',
    seeMore: '查看更多',
    close: '關閉',
    save: '保存',
    
    editProfile: '編輯資料',
    settings: '設定',
    privacySecurity: '隱私與安全',
    helpSupport: '幫助與支援',
    about: '關於',
    logOut: '登出',
    logOutConfirmTitle: '登出',
    logOutConfirmMessage: '您確定要登出嗎？',
    cancel: '取消',
    grade: '年級',
    of: '共',
  },
};

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: Translations;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@app_language';

interface TranslationProviderProps {
  children: ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [language, setLanguageState] = useState<Language>('EN');

  React.useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage === 'EN' || savedLanguage === 'ZH') {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const value: TranslationContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation(): TranslationContextType {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

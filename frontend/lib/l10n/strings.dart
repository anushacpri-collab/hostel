class L10n {
  static const en = {
    'title': 'Hostel Entry Authorization',
    'student': 'Student',
    'parent': 'Parent',
    'authority': 'Deputy Warden / Principal',
    'watchman': 'Watchman',
    'language': 'Language',
  };

  static const ta = {
    'title': 'விடுதி நுழைவு அங்கீகாரம்',
    'student': 'மாணவர்',
    'parent': 'பெற்றோர்',
    'authority': 'துணை வார்டன் / முதல்வர்',
    'watchman': 'காவலர்',
    'language': 'மொழி',
  };

  static String t(String lang, String key) => (lang == 'ta' ? ta : en)[key] ?? key;
}

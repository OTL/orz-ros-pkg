package com.ogutti.ros.android.console;

/**
 * Utility class for rosgraph_msgs/Log message
 *
 * @author Takashi Ogura <t.ogura@gmail.com
 */
class LogUtil {

  public static final CharSequence[] LEVELS_STRING = {"Debug", "Info", "Warn", "Error", "Fatal"};
  public static final byte[] LEVELS = {
              rosgraph_msgs.Log.DEBUG,
              rosgraph_msgs.Log.INFO,
              rosgraph_msgs.Log.WARN,
              rosgraph_msgs.Log.ERROR,
              rosgraph_msgs.Log.FATAL
            };

  public static CharSequence[] getLevelStrings() {
    return LEVELS_STRING;
  }

  public static byte[] getLevels() {
    return LEVELS;
  }

  public static String levelToString(byte level) {
    if (level >= rosgraph_msgs.Log.FATAL) {
      return "Fatal";
    } else if (level >= rosgraph_msgs.Log.ERROR) {
      return "Error";
    } else if (level >= rosgraph_msgs.Log.WARN) {
      return "Warn";
    } else if (level >= rosgraph_msgs.Log.INFO) {
      return "Info";
    } else if (level >= rosgraph_msgs.Log.DEBUG) {
      return "Debug";
    }
    return "Unknown";
  }

  public static byte StringToLevel(String level_string) {
        String upper_string = new String(level_string).toUpperCase();
    if (upper_string == "Fatal") {
      return rosgraph_msgs.Log.FATAL;
    } else if (upper_string == "Error") {
      return rosgraph_msgs.Log.ERROR;
    } else if (upper_string == "Warn") {
      return rosgraph_msgs.Log.WARN;
    } else if (upper_string == "Info") {
      return rosgraph_msgs.Log.INFO;
    } else if (upper_string == "Debug") {
      return rosgraph_msgs.Log.DEBUG;
    }
    return 0;
  }

  public static int levelToColor(byte level) {
    if (level >= rosgraph_msgs.Log.ERROR) {
      // red
      return 0xFFFF0000;
    } else if (level >= rosgraph_msgs.Log.WARN) {
      // yellow
      return 0xFFFFFF00;
    }
    // white
    return 0xFFFFFFFF;
  }
}

package com.ogutti.ros.android.rxconsole;

/**
 * Utility class for rosgraph_msgs/Log message
 *
 * @author Takashi Ogura <t.ogura@gmail.com
 */
class LogUtil {

  /** Level String array. */
  public static final CharSequence[] LEVELS_STRING = {"Debug", "Info", "Warn", "Error", "Fatal"};

  /** level byte array */
  public static final byte[] LEVELS = {
              rosgraph_msgs.Log.DEBUG,
              rosgraph_msgs.Log.INFO,
              rosgraph_msgs.Log.WARN,
              rosgraph_msgs.Log.ERROR,
              rosgraph_msgs.Log.FATAL
            };

  /**
   * function version of get level strings.
   *
   * @return array of level id
   */
  public static CharSequence[] getLevelStrings() {
    return LEVELS_STRING;
  }

  /**
   * function version of get level strings
   *
   * @return array of level id
   */
  public static byte[] getLevels() {
    return LEVELS;
  }

  /** convert level byte to string
   *
   * @param level level byte which stand for error level
   * @return string expression which you can read (like "Error")
   */
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

  /**
   * convert error string expression to level byte
   *
   * @param level_string (Debug, Info, Warn, Error or Fatal)
   * @return level byte which is defined in ROS message file
   */
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

  /**
   * decide string color by log level
   * @param level level to check
   * @return color string like 0xFFFF0000 (red)
   */
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

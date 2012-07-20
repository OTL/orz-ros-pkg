package com.ogutti.ros.android.console;

/**
 * utility class for rosgraph_msgs/Log message
 */
class LogUtil {

  static String levelToString(long level) {
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

  static int levelToColor(long level) {
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

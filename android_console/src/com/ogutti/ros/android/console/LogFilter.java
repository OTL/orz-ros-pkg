package com.ogutti.ros.android.console;

/**
 *  Interface class for filtering log messages
 *  @author Takashi Ogura <t.ogura@gmail.com>
 */
public interface LogFilter {

  /**
   * @param log log message for testing
   * @return if this is true, use this log for display
   */
  boolean UseLog(rosgraph_msgs.Log log);
}
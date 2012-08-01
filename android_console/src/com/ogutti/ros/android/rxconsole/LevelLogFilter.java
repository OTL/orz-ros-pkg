package com.ogutti.ros.android.rxconsole;

import java.util.HashMap;

/**
 * LogFilter by log.level
 * 
 * @author Takashi Ogura <t.ogura@gmail.com>
 *
 */
public class LevelLogFilter implements LogFilter {
  private HashMap<Byte , Boolean> level_enable_map_;

  /**
   * initialize hashmap and set all levels are true
   */
  public LevelLogFilter() {
	level_enable_map_ = new HashMap<Byte , Boolean>();
	byte[] levels = LogUtil.getLevels();
	for (int i = 0; i < levels.length; ++i) {
		level_enable_map_.put((Byte)levels[i], true);
	}
  }

  /**
   * Enable/Disable log level
   * @param level level for set
   * @param enable true: use for display, false: not displayed.
   */
  public void setLevel(byte level, boolean enable) {
    level_enable_map_.put((Byte)level, enable);
  }

  /**
   * set hash map directly.
   * 
   * @param map hashmap
   */
  public void setMap(HashMap<Byte , Boolean> map) {
    level_enable_map_ = map;
  }

  /**
   * get enable/disable information by boolean array.
   * @return array values (from DEBUG to FATAL)
   */
  public boolean[] getBooleanArray() {
	  byte[] levels = LogUtil.getLevels();
	  boolean[] bools = new boolean[5];
	  for (int i = 0; i < levels.length; ++i) {
		  bools[i] = level_enable_map_.get((Byte)levels[i]);
	  }
    return bools;
  }

  /**
   * set enable/disable information by boolean array.
   * 
   * @param bools from DEBUG to FATAL.
   */
  public void setBooleanArray(boolean[] bools) {
    byte[] levels = LogUtil.getLevels();
    for (int i = 0; i < levels.length; ++i) {
      level_enable_map_.put((Byte)levels[i], bools[i]);
    }
  }

  /**
   * decide if the log is used for display by its level. 
   * @return true means use this log for display
   */
  @Override
  public boolean UseLog(rosgraph_msgs.Log log) {
	  if (level_enable_map_.containsKey((Byte)log.getLevel())) {
		  boolean is_used = level_enable_map_.get((Byte)log.getLevel());
		  return is_used;
	  }
	  return true;
  }
}

package com.ogutti.ros.android.console;

import java.util.List;

import com.ogutti.ros.android.console.LogUtil;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

/**
 * ListAdapter of rosgraph_msgs.Log
 * 
 * @author Takashi Ogura <t.ogura@gmail.com>
 *
 */
public class LogAdapter extends ArrayAdapter<rosgraph_msgs.Log> {
  private LayoutInflater layoutInflater_;
  private LogFilter filter_;

  public LogAdapter(Context context,
                    int textViewResourceId,
                    List<rosgraph_msgs.Log> objects) {
    super(context, textViewResourceId, objects);
    layoutInflater_ = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
  }

  public void setFilter(LogFilter filter) {
    this.filter_ = filter;
  }

  @Override
  public void clear() {
    super.clear();
    ((MainActivity)getContext()).clearNotification();
  }

  @Override
  public void add(rosgraph_msgs.Log log) {
    if (this.filter_ == null ||
        this.filter_.UseLog(log)) {
      super.add(log);
      if (log.getLevel() >= rosgraph_msgs.Log.ERROR) {
        ((MainActivity)getContext()).sendNotification(log);
      }
    }
  }

  @Override
  public View getView(int position, View convertView, ViewGroup parent) {
    rosgraph_msgs.Log item = (rosgraph_msgs.Log)getItem(position);

    // create if it is null
    if (null == convertView) {
      convertView = layoutInflater_.inflate(R.layout.list, null);
    }

    // set message text
    TextView messageTextView = (TextView)convertView.findViewById(R.id.console_message_text);
    messageTextView.setText(item.getMsg());
    messageTextView.setTextColor(LogUtil.levelToColor(item.getLevel()));
    
    // set level text
    TextView levelTextView = (TextView)convertView.findViewById(R.id.console_level_text);
    levelTextView.setText(LogUtil.levelToString(item.getLevel()));

    // set node text
    TextView nodeTextView = (TextView)convertView.findViewById(R.id.console_node_text);
    nodeTextView.setText(item.getName());

    return convertView;
  }

}
